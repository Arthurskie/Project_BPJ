import {getSupabase} from '../lib/supabase.js';
import {safeError} from './adapterUtils.js';
const map=r=>({...r,action:r.aksi,targetType:r.entitas,targetId:r.entitas_id,details:r.detail,timestamp:r.created_at,adminId:r.actor_id});
export const auditLogAPI={
 async getAuditLogs(filter={}){
  const page=Math.max(1,Number(filter.page)||1),pageSize=Math.min(100,Math.max(1,Number(filter.pageSize||filter.limit)||50));
  let q=getSupabase().from('log_aktivitas').select('*',{count:'exact'}).order('created_at',{ascending:false});
  if(filter.action&&filter.action!=='all')q=q.eq('aksi',filter.action);
  if(filter.adminId&&filter.adminId!=='all')q=q.eq('actor_id',filter.adminId);
  if(filter.targetId)q=q.eq('entitas_id',filter.targetId);
  if(filter.search){const term=String(filter.search).replace(/[^\p{L}\p{N} @._-]/gu,'').slice(0,100);if(term)q=q.or(`aksi.ilike.%${term}%,entitas.ilike.%${term}%,entitas_id.ilike.%${term}%`);}
  const {data,error,count}=await q.range((page-1)*pageSize,page*pageSize-1);if(error)throw safeError(error);
  return {success:true,data:data.map(map),pagination:{page,pageSize,total:count,totalPages:Math.ceil(count/pageSize)}};
 },
 getLogsByTarget(targetId){return this.getAuditLogs({targetId});}
};
export default auditLogAPI;
