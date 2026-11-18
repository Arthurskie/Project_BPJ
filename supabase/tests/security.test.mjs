import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql = () => fs.readFileSync(new URL('../migrations/202611180001_secure_intake.sql', import.meta.url),'utf8');
test('tracking secrets and idempotency remain private',()=>{const s=sql(); assert.match(s,/CREATE TABLE app_private.application_receipts/);assert.match(s,/FOR UPDATE/);assert.match(s,/payload_hash/);assert.match(s,/REVOKE ALL/);});
test('source and public note are constrained',()=>{const s=sql(); assert.match(s,/source IN \('online','loket'\)/); assert.match(s,/admin_set_public_note/); assert.match(s,/admin_submit_walkin/);});

const edge = name => fs.readFileSync(new URL(`../functions/${name}/index.ts`,import.meta.url),'utf8');
const security=()=>fs.readFileSync(new URL('../functions/_shared/security.ts',import.meta.url),'utf8');
test('upload verifies bytes before issuing immutable verified object',()=>{const s=edge('upload-attachment');assert.match(s,/mime\(bytes\)!==r.expected_type/);assert.match(s,/verdict.verdict!=='clean'/);assert.match(s,/verdict.sha256!==sha256/);assert.match(s,/upsert:false/);assert.match(s,/verified\//);});
test('provider boundaries are real network calls and fail closed',()=>{const s=security();assert.match(s,/challenges.cloudflare.com\/turnstile\/v0\/siteverify/);assert.match(s,/data.action!==action/);assert.match(s,/TURNSTILE_HOSTNAMES/);assert.match(s,/UPSTASH_REDIS_REST_URL/);assert.match(s,/EVAL/);assert.match(s,/FEATURE_UNAVAILABLE/);assert.match(s,/TRUSTED_CLIENT_IP_HEADER/);});
test('tracking selects an explicit non-PII allowlist',()=>{const body=sql().split('CREATE FUNCTION public.secure_track_application')[1].split('CREATE FUNCTION public.admin_submit_walkin')[0];assert.doesNotMatch(body,/nama_pemohon|no_hp|email|jawaban|catatan_admin|snapshot_form/);assert.match(body,/r.access_hash=p_access_hash/);});
test('all added definer functions pin search path and revoke public',()=>{const s=sql();assert.equal((s.match(/SECURITY DEFINER SET search_path = ''/g)||[]).length,4);assert.equal((s.match(/REVOKE ALL ON FUNCTION/g)||[]).length,4);});
test('admin invitation verifies current active role, not token metadata',()=>{assert.match(edge('invite-admin'),/await admin\(req\)/);assert.match(security(),/profile\?\.role!=='admin'\|\|!profile.is_active/);assert.match(security(),/auth.getUser/);});


// Pure canonicalization assertions run without Deno or third-party packages.
test('canonical payload binding includes access hash and manifest',()=>{const s=edge('submit-application');assert.match(s,/hash\(canonical\(/);assert.match(s,/hash\(secret\(b.access_secret\)\)/);assert.doesNotMatch(s,/console\.|localStorage/);});

test('attachment finalization and consumption use row locks and private metadata',()=>{const s=fs.readFileSync(new URL('../migrations/202611180002_attachments.sql',import.meta.url),'utf8');assert.match(s,/FOR UPDATE/);assert.match(s,/consumed_at/);assert.match(s,/signed_until/);assert.match(s,/access_hash/);assert.match(s,/ENABLE ROW LEVEL SECURITY/);});


test('master updates reject null fields and use unambiguous variables',()=>{const s=fs.readFileSync(new URL('../migrations/202611180003_admin_operations.sql',import.meta.url),'utf8');assert.match(s,/p_fields IS NULL/);assert.doesNotMatch(s,/INTO id\b|jenis_surat_id=id\b/);});
test('bucket migration refuses unsafe existing configuration',()=>{const s=fs.readFileSync(new URL('../migrations/202611180002_attachments.sql',import.meta.url),'utf8');assert.match(s,/public=false AND file_size_limit=10485760/);assert.match(s,/operator review required/);});

test('walkin binds canonical server content actor and source, ignoring client hash',()=>{const s=fs.readFileSync(new URL('../migrations/202611180004_walkin_files.sql',import.meta.url),'utf8');assert.match(s,/pg_catalog.sha256/);assert.match(s,/'source','loket','actor',auth.uid\(\)/);assert.match(s,/IF v_existing IS NOT NULL THEN RETURN result/);assert.doesNotMatch(s,/p_access_hash,p_payload_hash/);});


test('null session and null capability identity cannot bypass SQL guards',()=>{const s=fs.readFileSync(new URL('../migrations/202611180002_attachments.sql',import.meta.url),'utf8');assert.match(s,/c.session_id IS DISTINCT FROM p_session_id/);assert.match(s,/r.capability_hash IS DISTINCT FROM p_capability_hash/);assert.match(s,/cardinality\(p_files\)>0 AND p_session_id IS NULL/);assert.match(s,/array_position\(p_files,NULL\) IS NOT NULL/);assert.match(sql(),/p_key IS NULL OR p_access_hash IS NULL/);});

test('ambiguous finalize commit never deletes potentially referenced verified bytes',()=>{assert.doesNotMatch(edge('upload-attachment'),/if\(fe\)\{await client.storage/);assert.match(edge('upload-attachment'),/UPLOAD_NOT_RECEIVED/);});

test('only explicit object not found permits retransmission',()=>{const s=edge('upload-attachment');assert.match(s,/if\(status==='404'\)throw new Failure\('UPLOAD_NOT_RECEIVED',409\)/);assert.match(s,/if\(!blob\)throw new Failure\('UPLOAD_UNAVAILABLE',503\)/);});
