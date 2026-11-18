import {getSupabase} from '../lib/supabase.js';
import {unwrap} from './adapterUtils.js';
import {saveTypeWithFields} from './masterAdapter.js';
const mapField=f=>({...f,key:f.field_key,type:f.tipe_input,required:f.wajib,options:f.opsi});
const mapType=r=>({...r,name:r.nama,code:r.kode,active:r.is_active,fields:(r.form_surat_fields||r.fields||[]).sort((a,b)=>a.urutan-b.urutan).map(mapField)});
async function list(active){let q=getSupabase().from('jenis_surat').select('*,form_surat_fields(*)').order('nama');if(active)q=q.eq('is_active',true);return (await unwrap(q)).map(mapType);}
const letterTypeAPI={getAll:()=>list(false),getActive:()=>list(true),
 async save(input){if(Array.isArray(input.fields)){const id=await saveTypeWithFields(getSupabase(),input);return mapType(await unwrap(getSupabase().from('jenis_surat').select('*,form_surat_fields(*)').eq('id',id).single()));}const row={kode:(input.kode??input.code).trim().toUpperCase(),nama:(input.nama??input.name).trim(),deskripsi:input.deskripsi||null,is_active:input.is_active??input.active??false};let q=getSupabase().from('jenis_surat');q=input.id?q.update(row).eq('id',input.id):q.insert(row);return mapType(await unwrap(q.select().single()));},
 async remove(id){await unwrap(getSupabase().from('jenis_surat').delete().eq('id',id));},
 async saveField(typeId,input){const row={jenis_surat_id:typeId,field_key:input.field_key??input.key,label:input.label,tipe_input:input.tipe_input??input.type,placeholder:input.placeholder||null,wajib:input.wajib??input.required??false,opsi:input.opsi??input.options??[],panjang_maksimum:input.panjang_maksimum??255,urutan:input.urutan??0};let q=getSupabase().from('form_surat_fields');q=input.id?q.update(row).eq('id',input.id).eq('jenis_surat_id',typeId):q.insert(row);return mapField(await unwrap(q.select().single()));},
 async removeField(id){await unwrap(getSupabase().from('form_surat_fields').delete().eq('id',id));}
};
export default letterTypeAPI;
