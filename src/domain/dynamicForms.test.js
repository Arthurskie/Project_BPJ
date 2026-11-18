import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDynamicAnswers, validateApplicant, validateFiles, createReceiptIdentity, submissionFingerprint } from './dynamicForms.js';
const fields = [{field_key:'age',tipe_input:'number',wajib:true},{field_key:'choice',tipe_input:'select',opsi:['A'],wajib:true},{field_key:'date',tipe_input:'date',wajib:false}];
test('validates dynamic answers and rejects unknown keys', () => {
 assert.deepEqual(validateDynamicAnswers(fields,{age:0,choice:'A'}),{});
 assert.ok(validateDynamicAnswers(fields,{age:'abc',choice:'B',extra:'x'}).age);
 assert.ok(validateDynamicAnswers(fields,{age:1,choice:'A',date:'2026-02-30'}).date);
 assert.ok(validateDynamicAnswers(fields,{age:1,choice:'A',extra:1}).extra);
});
test('validates required applicant without invented NIK field',()=>{
 assert.deepEqual(validateApplicant({nama_pemohon:'Nama Warga',no_hp:'081234567890',email:''}),{});
 assert.ok(validateApplicant({nama_pemohon:'x',no_hp:'bad',email:'bad'}).email);
});
test('limits files to five PDF JPEG PNG files of 10 MiB each',()=>{
 assert.equal(validateFiles([{name:'a.pdf',type:'application/pdf',size:10*1024*1024}]),'');
 assert.ok(validateFiles([{name:'a.doc',type:'application/msword',size:1}]));
 assert.ok(validateFiles(Array(6).fill({name:'a.pdf',type:'application/pdf',size:1})));
});
test('receipt secrets require browser cryptography and use 256 bits',()=>{
 const identity=createReceiptIdentity({getRandomValues:a=>{a.fill(9);return a;}});
 assert.equal(identity.access_secret.length,64);
 assert.notEqual(identity.idempotency_key,'');
 assert.throws(()=>createReceiptIdentity(null));
});
test('retry fingerprint is canonical and includes file manifest',()=>{
 assert.equal(submissionFingerprint({b:2,a:1},[]),submissionFingerprint({a:1,b:2},[]));
 assert.notEqual(submissionFingerprint({a:1},[]),submissionFingerprint({a:1},[{name:'x.pdf',size:1,type:'application/pdf',lastModified:1}]));
});
test('required dynamic text rejects whitespace-only values',()=>{
 assert.ok(validateDynamicAnswers([{field_key:'reason',tipe_input:'textarea',wajib:true}],{reason:'   '}).reason);
});
test('idempotency key is an RFC 4122 UUID',()=>{
 assert.match(createReceiptIdentity({getRandomValues:a=>{a.fill(7);return a;}}).idempotency_key,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
import { readFileSync } from 'node:fs';
test('Turnstile actions match server submit and track contracts',()=>{
 const widget=readFileSync(new URL('../components/TurnstileChallenge.jsx',import.meta.url),'utf8');
 assert.match(widget,/sitekey:siteKey,action/);
 assert.match(readFileSync(new URL('../components/DynamicSubmissionForm.jsx',import.meta.url),'utf8'),/action="submit"/);
 assert.match(readFileSync(new URL('../pages/guest/TrackStatus.jsx',import.meta.url),'utf8'),/action="track"/);
});
test('ambiguous submission preserves finalized attachment references for retry',()=>{
 const source=readFileSync(new URL('../components/DynamicSubmissionForm.jsx',import.meta.url),'utf8');
 assert.match(source,/files:uploaded,session_id:retry.current.idempotency_key/);
 assert.match(source,/disabled=\{busy \|\| uploaded.length>0 \|\| attempted\}/);
 const catchBlock=source.slice(source.indexOf('} catch(failure)'),source.indexOf('if(receipt)'));
 assert.doesNotMatch(catchBlock,/setUploaded|setFiles|retry.current\s*=/);
});
test('dynamic controls expose configured placeholder text',()=>{
 const source=readFileSync(new URL('../components/DynamicFields.jsx',import.meta.url),'utf8');
 assert.match(source,/placeholder:field.placeholder/);
});
