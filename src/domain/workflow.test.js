import test from 'node:test';
import assert from 'node:assert/strict';
import { applicantErrors, querySubmissions } from './workflow.js';
test('applicant errors identify fields without throwing', () => {
 assert.deepEqual(Object.keys(applicantErrors({nik:'1', nama:'', alamat:'', keperluan:'', jenisSurat:'X'}, ['Y'])), ['nik','nama','alamat','keperluan','jenisSurat']);
});
test('queue filters inclusive dates, type, sorts and paginates', () => {
 const rows = [{id:'a',jenisSurat:'A',createdAt:'2026-01-01T12:00:00Z'},{id:'b',jenisSurat:'A',createdAt:'2026-01-02T12:00:00Z'},{id:'c',jenisSurat:'B',createdAt:'2026-01-02T12:00:00Z'}];
 assert.deepEqual(querySubmissions(rows,{type:'A',from:'2026-01-01',to:'2026-01-02',pageSize:1,page:1}).data.map(x=>x.id),['b']);
 assert.equal(querySubmissions(rows,{type:'A',pageSize:1,page:2}).total,2);
});
import { demoServiceNote } from './demoTemplates.js';
test('demo templates distinguish sensitive services without claiming verification', () => {
 assert.match(demoServiceNote('Surat Pengantar SKCK'), /bukan SKCK/);
 assert.match(demoServiceNote('Surat Keterangan Kematian'), /belum dinyatakan sah/);
 assert.notEqual(demoServiceNote('Surat Keterangan Usaha'),demoServiceNote('Surat Keterangan Domisili'));
});
test('queue clamps stale pages and includes final date', () => {
 const result = querySubmissions([{createdAt:new Date(2026,0,31,23,59,59).toISOString(),jenisSurat:'A'}], {to:'2026-01-31',page:99});
 assert.equal(result.page,1); assert.equal(result.total,1);
});
test('queue dates use local calendar rather than UTC date prefix', () => {
 const instant = new Date(2026,0,2,0,30);
 const row = {createdAt:instant.toISOString(),jenisSurat:'A'};
 assert.equal(querySubmissions([row],{from:'2026-01-02',to:'2026-01-02'}).total,1);
});
import { commitSubmissionAudit } from './localCommit.js';
function fakeStorage(initial, fail) { const values = {...initial}; return {values,getItem:key=>values[key] ?? null,setItem(key,value){if(fail?.(key,value)) throw new Error('quota'); values[key]=value;},removeItem:key=>delete values[key]}; }
test('audit failure never commits submission', () => { const storage=fakeStorage({sub:'[]',audit:'[]'},key=>key==='audit'); assert.throws(()=>commitSubmissionAudit(storage,{submissionsKey:'sub',auditKey:'audit',submissions:[{id:1}],entry:{id:1}})); assert.equal(storage.values.sub,'[]'); });
test('submission failure restores previous audit', () => { const storage=fakeStorage({sub:'[]',audit:'[]'},key=>key==='sub'); assert.throws(()=>commitSubmissionAudit(storage,{submissionsKey:'sub',auditKey:'audit',submissions:[{id:1}],entry:{id:1}})); assert.equal(storage.values.audit,'[]'); });
test('corrupt audit remains untouched', () => { const storage=fakeStorage({sub:'[]',audit:'broken'}); assert.throws(()=>commitSubmissionAudit(storage,{submissionsKey:'sub',auditKey:'audit',submissions:[],entry:{id:1}})); assert.equal(storage.values.audit,'broken'); assert.equal(storage.values.sub,'[]'); });
test('paired commit explicitly reports failed audit rollback', () => { let audits=0; const storage=fakeStorage({sub:'[]',audit:'[]'},key=>key==='sub' || (key==='audit' && ++audits > 1)); assert.throws(()=>commitSubmissionAudit(storage,{submissionsKey:'sub',auditKey:'audit',submissions:[],entry:{id:1}}),/pemulihan audit gagal/); });
test('paired commit validates malformed submissions before writing audit', () => { const storage=fakeStorage({sub:'{}',audit:'[]'}); assert.throws(()=>commitSubmissionAudit(storage,{submissionsKey:'sub',auditKey:'audit',submissions:[],entry:{id:1}})); assert.equal(storage.values.audit,'[]'); });
