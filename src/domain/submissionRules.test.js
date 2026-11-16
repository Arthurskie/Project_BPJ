import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateApplicant, validateIssuance, proposeLetterNumber } from './submissionRules.js';
const valid = { nik: '3201010101010001', nama: 'Warga', alamat: 'Jl. Mawar', keperluan: 'Administrasi', jenisSurat: 'Domisili' };
test('both flows reject non-numeric NIK and missing address', () => {
  assert.throws(() => validateApplicant({ ...valid, nik: 'abcdefghijklmnop' }, ['Domisili']), /NIK/);
  assert.throws(() => validateApplicant({ ...valid, alamat: '' }, ['Domisili']), /alamat/i);
});
test('inactive letter type is rejected', () => assert.throws(() => validateApplicant(valid, ['SKU']), /aktif/));
test('valid applicant passes', () => assert.doesNotThrow(() => validateApplicant(valid, ['Domisili'])));
test('issuance requires signer and rejects normalized duplicate', () => {
  assert.throws(() => validateIssuance({ status: 'selesai', nomorSurat: '470 / 001', pejabatTTD: '' }, []), /pejabat/i);
  assert.throws(() => validateIssuance({ status: 'selesai', nomorSurat: '470 / 001', pejabatTTD: 'Lurah' }, [{ id: 'a', nomorSurat: '470/001' }]), /digunakan/);
});
test('unsupported walk-in status is rejected', () => assert.throws(() => validateIssuance({ status: 'unknown' }, []), /Status/));
test('number proposal uses highest issued sequence and does not mutate input', () => {
  const rows = [{ status: 'selesai', nomorSurat: '470 / 009 / KEL.CKR / I / 2026' }, { status: 'selesai', nomorSurat: '470 / 080 / KEL.CKR / I / 2025' }];
  const before = JSON.stringify(rows);
  assert.equal(proposeLetterNumber(rows, 'KEL.CKR', new Date(2026, 10, 14)).nomorSurat, '470 / 010 / KEL.CKR / XI / 2026');
  assert.equal(JSON.stringify(rows), before);
});
