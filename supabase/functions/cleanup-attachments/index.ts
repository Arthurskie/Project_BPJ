import {env,service} from '../_shared/security.ts';
Deno.serve(async req=>{
 try{
 if(req.method!=='POST'||req.headers.get('Authorization')!=='Bearer '+env('ATTACHMENT_CLEANUP_SECRET'))return new Response(null,{status:403});
 const client=service();const {data, error}=await client.rpc('claim_expired_attachments');if(error)throw error;
 let removed=0;for(const row of data??[]){const paths=[row.object_path,...(row.verified_path?[row.verified_path]:[])];const {error:e}=await client.storage.from('application-attachments').remove(paths);if(e)throw e;removed++;}
 return Response.json({removed},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:{code:'CLEANUP_UNAVAILABLE'}},{status:503});}
});
