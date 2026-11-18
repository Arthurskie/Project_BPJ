import {getSupabase} from '../lib/supabase.js';
import {safeError} from './adapterUtils.js';
import auditLogAPI from './auditLogAPI.js';
const dashboardAPI={
 async getStats(){const statuses=['menunggu','diproses','disetujui','ditolak','selesai'];const counts=await Promise.all(statuses.map(async status=>{const {count,error}=await getSupabase().from('permohonan_surat').select('id',{count:'exact',head:true}).eq('status',status);if(error)throw safeError(error);return count;}));const data=Object.fromEntries(statuses.map((s,i)=>[s,counts[i]]));return {success:true,data:{...data,total:counts.reduce((a,b)=>a+b,0),totalSubmissions:counts.reduce((a,b)=>a+b,0),pending:counts[0],processing:counts[1],completed:counts[4],rejected:counts[3]}};},
 async getRecentActivity(){const {data}=await auditLogAPI.getAuditLogs({limit:5});return {success:true,data:data.map(r=>({...r,title:r.aksi,description:r.entitas,time:new Date(r.created_at).toLocaleString('id-ID'),type:r.aksi}))};}
};
export default dashboardAPI;
