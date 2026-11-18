import {serve,admin,env,Failure} from '../_shared/security.ts';
serve('invite',async(req,b)=>{
 const client=await admin(req);const {data:actor}=await client.auth.getUser(req.headers.get('Authorization')!.slice(7));
 if(typeof b.email!=='string'||b.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) throw new Failure('INVALID_REQUEST');
 const started=new Date().toISOString();
 const {data,error}=await client.auth.admin.inviteUserByEmail(b.email,{redirectTo:env('ADMIN_INVITE_REDIRECT_URL'),data:{nama:typeof b.nama==='string'?b.nama.slice(0,120):''}});
 if(error||!data.user) throw new Failure('INVITE_FAILED',400);
 const {error:pe}=await client.rpc('promote_invited_admin',{p_inviter:actor.user!.id,p_user_id:data.user.id,p_email:b.email,p_started_at:started});
 if(pe)throw new Failure('INVITE_FAILED',400);
 return {invited:true};
});
