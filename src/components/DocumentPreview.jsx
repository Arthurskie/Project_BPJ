import React, { useEffect, useRef, useState } from 'react';
import { readDocument } from '../services/documentStorage';

export default function DocumentPreview({ file, onClose }) {
  const dialog = useRef(null);
  const [document, setDocument] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const previous = window.document.activeElement;
    const modal = dialog.current;
    modal.showModal();
    let cancelled = false;
    let objectUrl;
    async function load() {
      try {
        let blob;
        if (file.storageId || file.path) blob = await readDocument(file.storageId || file.path);
        else if (file.url || file.path) {
          const url = new URL(file.url || file.path, window.location.origin);
          if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Alamat dokumen tidak didukung.');
          const response = await fetch(url.href, { credentials: url.origin === location.origin ? 'same-origin' : 'omit' });
          if (!response.ok) throw new Error('Dokumen gagal dimuat.');
          blob = await response.blob();
        }
        if (!blob) throw new Error('Berkas tidak tersedia. Lampiran lama mungkin hanya menyimpan nama dokumen.');
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setDocument({ url: objectUrl, type: blob.type });
      } catch (err) { if (!cancelled) setError(err.message); }
    }
    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      modal.close();
      previous?.focus();
    };
  }, [file]);
  const supported = document && ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(document.type);
  return (
    <dialog ref={dialog} onCancel={onClose} aria-labelledby="document-preview-title" className="m-auto w-[95vw] max-w-6xl rounded-xl border border-slate-300 bg-white p-0 text-slate-900 backdrop:bg-black/50 dark:bg-neutral-900 dark:text-white">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-4 dark:border-neutral-700">
        <h2 id="document-preview-title" className="truncate text-sm font-semibold">Pratinjau Dokumen — {file.name || 'Lampiran'}</h2>
        <button autoFocus onClick={onClose} className="rounded border px-3 py-1.5 text-sm">Tutup</button>
      </header>
      <div className="flex h-[72vh] items-center justify-center overflow-auto bg-slate-100 dark:bg-neutral-950">
        {error ? <p role="alert" className="p-6 text-center text-sm">{error}</p> : !document ? <p role="status">Memuat dokumen…</p> : document.type === 'application/pdf' ? <iframe title={file.name || 'Dokumen PDF'} src={document.url} className="h-full w-full border-0" /> : supported ? <img src={document.url} alt={file.name || 'Lampiran'} className="max-h-full max-w-full object-contain" /> : <p className="p-6 text-sm">Format ini tidak mendukung pratinjau inline. Unduh berkas untuk membukanya.</p>}
      </div>
      {document && <footer className="border-t p-3 text-right"><a href={document.url} download={file.name || 'lampiran'} className="text-sm font-medium underline">Unduh dokumen</a></footer>}
    </dialog>
  );
}



