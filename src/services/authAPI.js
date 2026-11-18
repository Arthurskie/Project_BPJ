import {getSupabase} from '../lib/supabase.js';
import {invokeEdge} from './edgeAPI.js';
import {safeError,requireAdminProfile,unwrap} from './adapterUtils.js';
async function profileFor(user) {
 if(!user) return null;
 const profile=await unwrap(getSupabase().from('profiles').select('*').eq('id',user.id).single());
 return requireAdminProfile(profile);
}
const authAPI={
 async login(email,password) {
  const client=getSupabase();
  const {data,error}=await client.auth.signInWithPassword({email:email.trim(),password});
  if(error) throw Object.assign(new Error('Email atau kata sandi tidak valid.'),{code:'INVALID_CREDENTIALS'});
  try {return {success:true,user:await profileFor(data.user)};} catch(error) {await client.auth.signOut();throw error;}
 },
 async getMe(){const {data,error}=await getSupabase().auth.getUser();if(error) return {success:true,user:null};return {success:true,user:await profileFor(data.user)};},
 async logout(){const {error}=await getSupabase().auth.signOut();if(error) throw safeError(error);return {success:true};},
 async forgotPassword(email){
  const {error}=await getSupabase().auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/reset-password`});
  if(error) throw safeError(error);
  return {success:true,message:'Jika email terdaftar, instruksi pemulihan akan dikirim.'};
 },
 async updatePassword(password){await authAPI.getMe().then(r=>requireAdminProfile(r.user));const {error}=await getSupabase().auth.updateUser({password});if(error)throw safeError(error);return {success:true};},
 async inviteAdmin({email,nama}){return {success:true,data:await invokeEdge('invite-admin',{email,nama})};},
 async getProfiles(){return {success:true,data:await unwrap(getSupabase().from('profiles').select('*').order('created_at',{ascending:false}))};},
 async updateProfile({nama}){await authAPI.getMe();await unwrap(getSupabase().rpc('admin_update_own_profile',{p_nama:nama}));return authAPI.getMe();},
 async setRole(id,role){await unwrap(getSupabase().rpc('admin_set_role',{p_user_id:id,p_role:role}));return {success:true};},
 onAuthStateChange(callback){return getSupabase().auth.onAuthStateChange(callback);}
};
export default authAPI;

authAPI.listAdmins=authAPI.getProfiles;
authAPI.recoverPassword=authAPI.forgotPassword;
