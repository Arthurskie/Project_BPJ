import { createClient } from 'npm:@supabase/supabase-js@2';
export class Failure extends Error { constructor(public code: string, public status = 400) { super(code); } }
export const env = (key: string) => { const value = Deno.env.get(key); if (!value) throw new Failure('FEATURE_UNAVAILABLE',503); return value; };
export const service = () => createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
export async function hash(value: string) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join(''); }
export function canonical(value: unknown): string {
 if (value === null || typeof value !== 'object') return JSON.stringify(value);
 if (Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
 return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical((value as Record<string,unknown>)[k])).join(',')+'}';
}
export async function limited(req: Request, route: string) {
 // The operator must configure a platform-overwritten header; arbitrary client headers are unsafe.
 const identity = req.headers.get(env('TRUSTED_CLIENT_IP_HEADER'));
 if (!identity || identity.length>200) throw new Failure('FEATURE_UNAVAILABLE',503);
 const key='bpj:'+route+':'+await hash(env('RATE_LIMIT_HASH_SALT')+identity);
 const response=await fetch(env('UPSTASH_REDIS_REST_URL'),{method:'POST',headers:{Authorization:'Bearer '+env('UPSTASH_REDIS_REST_TOKEN'),'Content-Type':'application/json'},body:JSON.stringify(['EVAL',"local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",'1',key,'60']),signal:AbortSignal.timeout(5000)});
 if(!response.ok) throw new Failure('FEATURE_UNAVAILABLE',503);
 const data=await response.json(); if(!Number.isInteger(data.result)||data.error) throw new Failure('FEATURE_UNAVAILABLE',503);
 if(data.result>10) throw new Failure('RATE_LIMITED',429);
}
export async function human(token: unknown, action: string) {
 if(typeof token!=='string'||token.length<1||token.length>2048) throw new Failure('HUMAN_VERIFICATION_REQUIRED');
 const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env('TURNSTILE_SECRET_KEY'),response:token}),signal:AbortSignal.timeout(5000)});
 if(!response.ok) throw new Failure('FEATURE_UNAVAILABLE',503);
 const data=await response.json();
 if(!data.success||data.action!==action||!env('TURNSTILE_HOSTNAMES').split(',').includes(data.hostname)) throw new Failure('HUMAN_VERIFICATION_REQUIRED');
}
export async function admin(req: Request) {
 const authorization=req.headers.get('Authorization'); if(!authorization?.startsWith('Bearer ')) throw new Failure('UNAUTHORIZED',401);
 const client=service(); const {data,error}=await client.auth.getUser(authorization.slice(7)); if(error||!data.user) throw new Failure('UNAUTHORIZED',401);
 const {data:profile,error:pe}=await client.from('profiles').select('role,is_active').eq('id',data.user.id).single();
 if(pe||profile?.role!=='admin'||!profile.is_active) throw new Failure('FORBIDDEN',403);
 return client;
}
export function serve(route: string, handler: (req:Request,body:Record<string,unknown>)=>Promise<unknown>) {
 Deno.serve(async req=>{
 let headers:Record<string,string>={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
 try {
 const origin=req.headers.get('Origin'); const allowed=env('ALLOWED_ORIGINS').split(',');
 if(origin&&!allowed.includes(origin)) throw new Failure('FORBIDDEN',403);
 if(origin) headers={...headers,'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
 if(req.method==='OPTIONS') return new Response(null,{status:204,headers});
 if(req.method!=='POST') throw new Failure('METHOD_NOT_ALLOWED',405);
 if(!req.headers.get('Content-Type')?.startsWith('application/json')) throw new Failure('INVALID_REQUEST');
 const reader=req.body?.getReader(); if(!reader) throw new Failure('INVALID_REQUEST');
 const chunks:Uint8Array[]=[];let length=0;
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>65536){await reader.cancel();throw new Failure('INVALID_REQUEST',413);}chunks.push(value);}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}const text=new TextDecoder().decode(bytes);
 let body; try {body=JSON.parse(text);} catch {throw new Failure('INVALID_REQUEST');}
 if(!body||typeof body!=='object'||Array.isArray(body)) throw new Failure('INVALID_REQUEST');
 await limited(req,route);
 return new Response(JSON.stringify({data:await handler(req,body)}),{headers});
 } catch(error) { const e=error instanceof Failure?error:new Failure('FEATURE_UNAVAILABLE',503); return new Response(JSON.stringify({error:{code:e.code}}),{status:e.status,headers}); }
 });
}
export function secret(value:unknown) { if(typeof value!=='string'||! /^[A-Za-z0-9_-]{22,128}$/.test(value)) throw new Failure('INVALID_REQUEST'); return value; }

