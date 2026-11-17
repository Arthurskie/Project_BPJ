import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sqlPath = new URL('../migrations/202611170001_bpj.sql', import.meta.url);
test('privileged RPC and private guest data boundaries are explicit',()=>{
 const sql=readFileSync(sqlPath,'utf8');
 for(const table of ['submissions','staff_roles','audit_logs','upload_capabilities','rate_limits']) assert.match(sql,new RegExp(`alter table public.${table} enable row level security`));
 assert.match(sql,/revoke all on function public.bpj_guest_internal/);
 assert.match(sql,/grant execute on function public.bpj_guest_internal\(text,jsonb\) to service_role/);
 assert.match(sql,/for update/);
 assert.match(sql,/letter_number_normalized.*unique/s);
 assert.match(sql,/terminal submission is immutable/);
});

test('gateway fails closed without explicit trusted proxy attestation',()=>{
 const edge=readFileSync(new URL('../functions/bpj-guest/index.ts',import.meta.url),'utf8');
 assert.match(edge,/BPJ_TRUST_PROXY_MODE/);
 assert.match(edge,/salt.length < 32 \|\| !trustedProxy/);
 assert.match(edge,/total > MAX_BODY/);
 assert.match(edge,/upsert: false/);
 assert.match(edge,/\.at\(-1\)/);
});

test('literal regex contracts accept real NIK and normalize whitespace',()=>{
 const edge=readFileSync(new URL('../functions/bpj-guest/index.ts',import.meta.url),'utf8');
 const nikRegex = edge.match(/!\/(\^\[0-9\]\{16\}\$)\//)?.[1];
 assert.ok(nikRegex);
 assert.equal(new RegExp(nikRegex).test('3271010101900001'),true);
 assert.equal(new RegExp(nikRegex).test('327101010190000'),false);
 const sql=readFileSync(sqlPath,'utf8');
 assert.equal(sql.includes("regexp_replace(letter_number,'[[:space:]]','','g')"),true);
 assert.equal(sql.includes('[.][^[:space:]@]+$'),true);
});
