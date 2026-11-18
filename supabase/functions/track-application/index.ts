import {serve,human,secret,hash,service,Failure} from '../_shared/security.ts';
serve('track',async (_req,b)=>{
 await human(b.turnstile_token,'track');
 if(typeof b.kode_permohonan!=='string'||!/^SUR-[A-F0-9]{16}$/.test(b.kode_permohonan)) throw new Failure('TRACKING_REFUSED',404);
 let access; try {access=secret(b.access_secret);}catch {throw new Failure('TRACKING_REFUSED',404);}
 const {data,error}=await service().rpc('secure_track_application',{p_code:b.kode_permohonan,p_access_hash:await hash(access)});
 if(error||!data) throw new Failure('TRACKING_REFUSED',404);
 return {...data,catatan_publik:data.public_note};
});

