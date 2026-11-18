import {getSupabase} from '../lib/supabase.js';
import {unwrap,mapSubmission} from './adapterUtils.js';
import {invokeEdge} from './edgeAPI.js';
import {readDocument} from './documentStorage.js';
import {submitWalkIn} from './walkInAdapter.js';
const invoke=async(name,body)=>({success:true,data:await invokeEdge(name,body)});
const submissionAPI={readDocument,
 submitLetter:body=>invoke('submit-application',body),
 trackStatus:(body,access_secret,turnstile_token)=>invoke('track-application',typeof body==='object'?body:{kode_permohonan:body,access_secret,turnstile_token}),
 async getAllSubmissions(filter={}){
  const page=Math.max(1,Number(filter.page)||1),pageSize=Math.min(100,Math.max(1,Number(filter.pageSize)||20));
  let q=getSupabase().from('permohonan_surat').select('*,jenis_surat(nama)',{count:'exact'}).order('created_at',{ascending:false});
  if(filter.status && filter.status!=='all')q=q.eq('status',filter.status);
  if(filter.jenis_surat_id)q=q.eq('jenis_surat_id',filter.jenis_surat_id);
  if(filter.search){const term=String(filter.search).replace(/[^\p{L}\p{N} @._-]/gu,'').slice(0,100);if(term)q=q.or(`kode_permohonan.ilike.%${term}%,nama_pemohon.ilike.%${term}%`);}
  const {data,error,count}=await q.range((page-1)*pageSize,page*pageSize-1);
  if(error){const {safeError}=await import('./adapterUtils.js');throw safeError(error);}
  return {success:true,data:data.map(mapSubmission),pagination:{page,pageSize,total:count,totalPages:Math.ceil(count/pageSize)}};
 },
 async getSubmissionById(id){const data=await unwrap(getSupabase().from('permohonan_surat').select('*,jenis_surat(nama),permohonan_status_history(*)').eq('id',id).single());const attachments=await unwrap(getSupabase().from('application_attachments').select('id,application_id,original_name,size,mime,created_at').eq('application_id',id).order('created_at'));return {success:true,data:mapSubmission({...data,attachments,history:data.permohonan_status_history})};},
 async updateStatus(id,status,notes=''){await unwrap(getSupabase().rpc('admin_change_status',{p_permohonan_id:id,p_status_baru:status,p_catatan:notes}));return {success:true};},
 async setPublicNote(id,note){await unwrap(getSupabase().rpc('admin_set_public_note',{p_permohonan_id:id,p_note:note}));return {success:true};},
 async createWalkInSubmission(body){const data=await submitWalkIn(getSupabase(),body);return {success:true,data:Array.isArray(data)?mapSubmission(data[0]):typeof data==='object'?mapSubmission(data):data};}
};
submissionAPI.submitPublic=submissionAPI.submitLetter;
submissionAPI.trackPublic=submissionAPI.trackStatus;
submissionAPI.createWalkIn=submissionAPI.createWalkInSubmission;
export const submissionService=submissionAPI;
export default submissionAPI;
