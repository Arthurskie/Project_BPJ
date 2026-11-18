import {safeError} from './adapterUtils.js';
export function createUploadLifecycle({prepare,upload,finalize}){
 const pending=new WeakMap();
 return async(file,context)=>{
  let sessions=pending.get(file);if(!sessions){sessions=new Map();pending.set(file,sessions);}
  const key=context.session_id;let state=sessions.get(key);
  if(state&&state.accessSecret!==context.access_secret)throw new Error('Identitas sesi lampiran berubah. Mulai pengajuan baru.');
  if(!state){const prepared=await prepare({...context,name:file.name,size:file.size,mime:file.type});
   if(!prepared?.id||!prepared.capability||!prepared.path||!prepared.token||prepared.bucket!=='application-attachments')throw new Error('Persiapan lampiran tidak valid.');
   state={prepared,accessSecret:context.access_secret,attempted:false,result:null};sessions.set(key,state);
  }
  if(state.result)return state.result;
  const body={id:state.prepared.id,capability:state.prepared.capability,access_secret:context.access_secret,session_id:context.session_id};
  if(state.attempted){try{state.result=await finalize(body);return state.result;}catch(error){if(error.code!=='UPLOAD_NOT_RECEIVED')throw error;}}
  state.attempted=true;
  const {error}=await upload(state.prepared,file);if(error)throw safeError(error);
  state.result=await finalize(body);return state.result;
 };
}
