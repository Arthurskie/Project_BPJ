import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mapSubmission, toSubmissionPayload } from '../services/submissionContract.js';
test('live submission maps historical snapshot, completion and minimal tracking fields', () => {
  const row = mapSubmission({ status:'selesai', tracking_code:'A'.repeat(32), letter_type_snapshot:{name:'Historical'}, completed_at:'2026-11-17', created_at:'2026-11-16', letter_number:'470/1', form_data:{alamat:'Example'} });
  assert.equal(row.trackingCode, 'A'.repeat(32));
  assert.equal(row.jenisSurat, 'Historical');
  assert.equal(row.verifiedAt, '2026-11-17');
  assert.equal(row.tahap, 4);
  assert.equal(row.alamat, 'Example');
  assert.equal(row.nama, undefined);
});
test('intake payload excludes role and document paths while server validates walk-in status', () => {
  const payload = toSubmissionPayload({nik:'1'.repeat(16),nama:'Test',alamat:'Example',keperluan:'Example',role:'super_admin',status:'selesai',files:[{path:'foreign'}]}, {id:'type-id'});
  assert.equal(payload.letter_type_id, 'type-id');
  assert.equal(payload.role, undefined);
  assert.equal(payload.status, 'selesai');
  assert.equal(payload.files, undefined);
});
test('live gateway never sends tracking credentials through query strings or falls back', () => {
  const client = readFileSync(new URL('../services/supabaseClient.js', import.meta.url),'utf8');
  assert.match(client, /functions.invoke\('bpj-guest', \{ body: \{ action, payload \} \}\)/);
  assert.match(client, /VITE_APP_MODE === 'demo'/);
  assert.doesNotMatch(client, /service_role|SERVICE_ROLE|localDB/);
  const documents = readFileSync(new URL('../services/documentStorage.js', import.meta.url),'utf8');
  assert.match(documents, /uploadToSignedUrl\(data.path, data.upload_token/);
  assert.match(documents, /createSignedUrl\(path, 60\)/);
});

test('walk-in issuance options and UUID audit target match server contract', () => {
  const adapter = readFileSync(new URL('../services/submissionContract.js', import.meta.url),'utf8');
  const input = {status:'selesai',nomorSurat:'470/1',pejabatTTD:'Verified Official',catatanPetugas:'Reviewed'};
  const payload = toSubmissionPayload(input, {id:'type-id'});
  assert.equal(payload.status,input.status);
  assert.equal(payload.nomorSurat,input.nomorSurat);
  assert.equal(payload.pejabatTTD,input.pejabatTTD);
  assert.equal(payload.catatanVerifikasi,input.catatanPetugas);
  for (const name of ['status', 'nomorSurat', 'pejabatTTD']) assert.ok(adapter.includes(name + ': data.' + name));
  assert.match(adapter, /catatanVerifikasi: data.catatanVerifikasi \|\| data.catatanPetugas/);
  const detail = readFileSync(new URL('../pages/admin/SubmissionDetail.jsx', import.meta.url),'utf8');
  assert.match(detail, /getLogsByTarget\(isDemoMode \? res.data.trackingCode : res.data.id\)/);
});
