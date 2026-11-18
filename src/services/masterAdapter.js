import {unwrap} from './adapterUtils.js';
export async function saveTypeWithFields(client,input){
 return unwrap(client.rpc('admin_save_letter_type',{
  p_id:input.id||null,p_kode:(input.kode??input.code).trim().toUpperCase(),p_nama:(input.nama??input.name).trim(),p_deskripsi:input.deskripsi||null,p_is_active:input.is_active??input.active??false,
  p_fields:input.fields.map((f,index)=>({field_key:f.field_key??f.key,label:f.label,tipe_input:f.tipe_input??f.type,placeholder:f.placeholder||null,wajib:f.wajib??f.required??false,opsi:f.opsi??f.options??[],panjang_maksimum:f.panjang_maksimum??255,urutan:f.urutan??index}))
 }));
}
