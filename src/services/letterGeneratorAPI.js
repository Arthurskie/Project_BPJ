const unavailable=()=>{throw new Error('Penerbitan dokumen resmi tidak tersedia pada aplikasi ini.');};
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const letterGeneratorAPI={generateLetterHTML:unavailable,printLetter:unavailable,downloadWordDocument:unavailable};
export default letterGeneratorAPI;
