import test from 'node:test';
import assert from 'node:assert/strict';
import { requireAdminProfile, safeError, mapSubmission } from './adapterUtils.js';
test('only active admin profile grants access', () => {
 for (const profile of [null, {role:'guest',is_active:true},{role:'admin',is_active:false}]) assert.throws(() => requireAdminProfile(profile));
 assert.equal(requireAdminProfile({id:'1',role:'admin',is_active:true}).id,'1');
});
test('provider internals never leak', () => {
 const error=safeError({message:'secret SQL JWT key',code:'XX000'});
 assert.ok(!error.message.includes('secret'));
 assert.equal(safeError({code:'23503'}).code,'IN_USE');
});
test('submission mapping preserves snapshot and server status', () => {
 const row=mapSubmission({id:'1',kode_permohonan:'SUR-1',status:'menunggu',snapshot_form:[{label:'Original'}],jawaban:{x:'answer'}});
 assert.equal(row.trackingCode,'SUR-1'); assert.equal(row.snapshot_form[0].label,'Original'); assert.equal(row.status,'menunggu');
});
import {invokeEdge} from './edgeAPI.js';
test('Edge envelope exposes actual receipt with POST body', async()=>{
 let seen;
 const client={functions:{invoke:async(name,options)=>{seen={name,options};return {data:{data:{kode_permohonan:'SUR-OK'}},error:null};}}};
 const payload={access_secret:'private-secret',kode_permohonan:'SUR-OK'};
 const result=await invokeEdge('track-application',payload,client);
 assert.equal(result.kode_permohonan,'SUR-OK'); assert.deepEqual(seen,{name:'track-application',options:{body:payload}});
});
test('Edge provider errors are sanitized', async()=>{
 const client={functions:{invoke:async()=>({error:{message:'SQL token=secret',context:new Response(JSON.stringify({error:{code:'UPLOAD_UNAVAILABLE'}}))}})}};
 await assert.rejects(()=>invokeEdge('upload-attachment',{},client),e=>e.code==='UPLOAD_UNAVAILABLE'&&!e.message.includes('secret'));
});
import {createRequestGate} from './requestGate.js';
import {saveTypeWithFields} from './masterAdapter.js';
test('stale profile requests cannot restore admin after logout or a new auth event',()=>{
 const gate=createRequestGate();const first=gate.next();assert.equal(gate.isCurrent(first),true);gate.invalidate();assert.equal(gate.isCurrent(first),false);const second=gate.next();assert.equal(gate.isCurrent(second),true);assert.equal(gate.isCurrent(first),false);
});
test('master and fields use one atomic RPC with schema names',async()=>{
 let calls=[];const client={rpc:async(name,body)=>{calls.push({name,body});return {data:{id:'ok'},error:null};}};
 const result=await saveTypeWithFields(client,{kode:'sku',nama:'Usaha',is_active:true,fields:[{field_key:'alamat',label:'Alamat',tipe_input:'text',wajib:true}]});
 assert.equal(result.id,'ok');assert.equal(calls.length,1);assert.equal(calls[0].name,'admin_save_letter_type');assert.equal(calls[0].body.p_fields[0].field_key,'alamat');assert.equal(calls[0].body.p_is_active,true);
});
test('atomic master failure never reports save success',async()=>{
 const client={rpc:async()=>({error:{code:'23505',message:'SQL secret'}})};
 await assert.rejects(()=>saveTypeWithFields(client,{kode:'SKU',nama:'Usaha',fields:[]}),e=>e.code==='CONFLICT'&&!e.message.includes('SQL'));
});
test('public submit sends UUID retry identity and secret only in request body',async()=>{
 const key='8ded4501-8256-4dc3-9d4c-fdb7b2b2ba46';let seen;
 const client={functions:{invoke:async(name,options)=>{seen={name,options};return {data:{data:{kode_permohonan:'SUR-X'}},error:null};}}};
 await invokeEdge('submit-application',{idempotency_key:key,access_secret:'abcdefghijklmnopqrstuvwxyz',files:[]},client);
 assert.match(seen.options.body.idempotency_key,/^[0-9a-f-]{36}$/);assert.equal(seen.name,'submit-application');assert.ok(!seen.name.includes('abcdefghijklmnopqrstuvwxyz'));
});
import {submitWalkIn,canonical} from './walkInAdapter.js';
test('loket files bind secret hash and canonical manifest without sending plaintext',async()=>{
 let seen;const client={rpc:async(name,body)=>{seen={name,body};return {data:{id:'1'},error:null};}};
 await submitWalkIn(client,{jenis_surat_id:'type',nama_pemohon:'Nama',no_hp:'08123456789',jawaban:{b:2,a:1},files:['file-b','file-a'],session_id:'session',idempotency_key:'retry',access_secret:'abcdefghijklmnopqrstuvwxyz'});
 assert.equal(seen.name,'admin_submit_walkin_with_files');assert.match(seen.body.p_access_hash,/^[a-f0-9]{64}$/);assert.match(seen.body.p_payload_hash,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(seen).includes('abcdefghijklmnopqrstuvwxyz'));assert.equal(canonical({b:2,a:1}),'{"a":1,"b":2}');
});
test('loket without files uses dedicated baseline RPC',async()=>{
 let name;await submitWalkIn({rpc:async(n)=>{name=n;return {data:{id:'1'},error:null};}},{jenis_surat_id:'type',nama_pemohon:'Nama',no_hp:'08123456789',jawaban:{},files:[]});assert.equal(name,'admin_submit_walkin');
});
test('loket empty manifest still uses idempotent RPC when receipt identity exists',async()=>{
 let name;await submitWalkIn({rpc:async(n)=>{name=n;return {data:{id:'1'},error:null};}},{jenis_surat_id:'type',nama_pemohon:'Nama',no_hp:'08123456789',jawaban:{},files:[],session_id:'session',idempotency_key:'retry',access_secret:'abcdefghijklmnopqrstuvwxyz'});assert.equal(name,'admin_submit_walkin_with_files');
});
import {createUploadLifecycle} from './uploadLifecycle.js';
test('lost finalize response retries same capability without consuming new upload slot',async()=>{
 let prepares=0,uploads=0,finalizes=[];const file={name:'a.pdf',size:5,type:'application/pdf'};
 const run=createUploadLifecycle({prepare:async()=>{prepares++;return {id:'same-id',capability:'same-cap',bucket:'application-attachments',path:'temp/path',token:'signed'};},upload:async()=>{uploads++;return {};},finalize:async body=>{finalizes.push(body);if(finalizes.length===1)throw new Error('Lost response');return {id:body.id};}});
 const context={session_id:'session',access_secret:'secret'};await assert.rejects(()=>run(file,context),/Lost response/);const result=await run(file,context);
 assert.equal(result.id,'same-id');assert.equal(prepares,1);assert.equal(uploads,1);assert.equal(finalizes.length,2);assert.deepEqual(finalizes[0],finalizes[1]);
});
test('lost signed-upload response finalizes before retrying transfer',async()=>{
 let uploads=0,finalizes=0;const run=createUploadLifecycle({prepare:async()=>({id:'id',capability:'cap',bucket:'application-attachments',path:'p',token:'t'}),upload:async()=>{uploads++;return {error:{message:'response lost'}};},finalize:async()=>{finalizes++;return {id:'id'};}});
 const file={name:'a',size:1,type:'application/pdf'},context={session_id:'s',access_secret:'secret'};await assert.rejects(()=>run(file,context));assert.equal((await run(file,context)).id,'id');assert.equal(uploads,1);assert.equal(finalizes,1);
});
