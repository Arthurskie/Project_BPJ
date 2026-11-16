export function commitSubmissionAudit(storage, { submissionsKey, auditKey, submissions, entry }) {
 const previousAudit = storage.getItem(auditKey);
 const previousSubmissions = storage.getItem(submissionsKey);
 let logs;
 try {
  logs = previousAudit === null ? [] : JSON.parse(previousAudit);
  const current = previousSubmissions === null ? [] : JSON.parse(previousSubmissions);
  if (!Array.isArray(logs) || !Array.isArray(current) || !Array.isArray(submissions)) throw new Error();
 } catch { throw new Error('Data permohonan atau audit tidak dapat dibaca. Data tidak diubah.'); }
 const auditJSON = JSON.stringify([entry,...logs]);
 const submissionsJSON = JSON.stringify(submissions);
 try { storage.setItem(auditKey,auditJSON); }
 catch { throw new Error('Catatan audit gagal disimpan. Permohonan tidak diubah.'); }
 try { storage.setItem(submissionsKey,submissionsJSON); }
 catch {
  try { if (previousAudit === null) storage.removeItem(auditKey); else storage.setItem(auditKey,previousAudit); }
  catch { throw new Error('Permohonan gagal disimpan dan pemulihan audit gagal. Jangan ulangi sebelum administrator memeriksa data.'); }
  throw new Error('Permohonan gagal disimpan. Catatan audit telah dipulihkan.');
 }
}
