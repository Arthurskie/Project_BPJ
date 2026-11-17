import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const MAX_BODY = 80 * 1024;
const allowedOrigins = (Deno.env.get('BPJ_ALLOWED_ORIGINS') ?? '').split(',').map(s => s.trim()).filter(Boolean);
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const salt = Deno.env.get('BPJ_RATE_LIMIT_SALT');
// Explicit operator attestation after verifying the deployed proxy behavior.
const trustedProxy = Deno.env.get('BPJ_TRUST_PROXY_MODE') === 'supabase-append-rightmost-verified';
const url = Deno.env.get('SUPABASE_URL');
const client = url && secret ? createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

async function jsonBody(req: Request) {
  if (!req.headers.get('content-type')?.startsWith('application/json')) throw new Error('Use application/json');
  if (Number(req.headers.get('content-length')) > MAX_BODY) throw new Error('Request too large');
  const reader = req.body?.getReader();
  if (!reader) throw new Error('Body required');
  let total = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_BODY) { await reader.cancel(); throw new Error('Request too large'); }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  const parsed = JSON.parse(new TextDecoder().decode(body));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid body');
  return parsed;
}
async function digest(value: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(salt!), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))).map(x => x.toString(16).padStart(2, '0')).join('');
}
Deno.serve(async req => {
  const origin = req.headers.get('origin');
  const cors = { 'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : 'null', 'Vary': 'Origin', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store' };
  const respond = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (!origin || !allowedOrigins.includes(origin)) return respond(403, { success: false, message: 'Origin not allowed' });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return respond(405, { success: false, message: 'POST required' });
  if (!client || !salt || salt.length < 32 || !trustedProxy) return respond(503, { success: false, message: 'Service not configured' });
  try {
    const body = await jsonBody(req);
    const action = body.action;
    if (!['submit', 'track', 'upload', 'remove'].includes(action)) return respond(400, { success: false, message: 'Invalid action' });
    const payload = body.payload ?? body;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid payload');
    // Trust only the proxy-appended rightmost hop, never client-selected first XFF.
    // Deployment must verify the gateway appends the actual peer; fail closed if absent.
    const peer = req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
    if (!peer || !/^[0-9a-fA-F:.]+$/.test(peer)) return respond(503, { success: false, message: 'Trusted proxy address unavailable' });
    const { data: rate, error: rateError } = await client.rpc('bpj_guest_internal', { p_action: 'rate', p_payload: { key: await digest(`${action}:${peer}`), kind: action } });
    if (rateError) return respond(503, { success: false, message: 'Service unavailable' });
    if (!rate.allowed) return respond(429, { success: false, message: 'Too many requests. Try later.' });
    if (action === 'track' && (!/^[0-9]{16}$/.test(payload.nik ?? '') || !/^[A-Fa-f0-9]{32}$/.test(payload.tracking_code ?? ''))) return respond(404, { success: false, message: 'Permohonan tidak ditemukan.' });
    const { data, error } = await client.rpc('bpj_guest_internal', { p_action: action, p_payload: payload });
    if (error) return respond(action === 'track' ? 404 : 400, { success: false, message: action === 'track' ? 'Permohonan tidak ditemukan.' : 'Data tidak valid atau lampiran belum lengkap.' });
    if (action === 'upload') {
      const { data: signed, error: signError } = await client.storage.from('bpj-documents').createSignedUploadUrl(data.path, { upsert: false });
      if (signError) return respond(503, { success: false, message: 'Upload unavailable' });
      return respond(200, { success: true, data: { token: data.token, path: data.path, signed_url: signed.signedUrl, upload_token: signed.token, expires_at: data.expires_at } });
    }
    if (action === 'remove') return respond(200, { success: true });
    return respond(200, { success: true, data });
  } catch {
    // Never log request bodies, NIKs, tracking codes, or bearer upload capabilities.
    return respond(400, { success: false, message: 'Invalid request' });
  }
});



