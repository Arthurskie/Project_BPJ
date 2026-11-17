const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open('bpj_documents', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('files');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(new Error('Penyimpanan dokumen tidak tersedia.'));
});

export async function storeDocument(file) {
  if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran berkas maksimal 10 MB.');
  const db = await openDB();
  const storageId = crypto.randomUUID();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').put(file, storageId);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(new Error('Dokumen gagal disimpan. Periksa kapasitas penyimpanan browser.'));
      tx.onabort = tx.onerror;
    });
    return { storageId, name: file.name, size: file.size, type: file.type };
  } finally { db.close(); }
}

export async function readDocument(storageId) {
  const db = await openDB();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('files').objectStore('files').get(storageId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Dokumen gagal dibaca.'));
    });
  } finally { db.close(); }
}

export async function removeDocuments(ids) {
 if (!ids.length) return;
 const db = await openDB();
 try { await new Promise((resolve,reject) => {
  const tx = db.transaction('files','readwrite');
  ids.forEach(id => tx.objectStore('files').delete(id));
  tx.oncomplete = resolve;
  tx.onerror = () => reject(new Error('Pembersihan dokumen gagal.'));
  tx.onabort = tx.onerror;
 }); } finally { db.close(); }
}

