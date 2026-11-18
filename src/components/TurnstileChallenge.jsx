import { useEffect, useRef, useState } from 'react';
let scriptPromise;
function loadTurnstile() {
 if(window.turnstile) return Promise.resolve(window.turnstile);
 if(!scriptPromise) scriptPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async=true;
  script.onload=()=>window.turnstile?resolve(window.turnstile):reject(new Error('unavailable'));
  script.onerror=()=>reject(new Error('unavailable'));
  document.head.appendChild(script);
 });
 return scriptPromise;
}
export default function TurnstileChallenge({ onToken, resetKey=0, action }) {
 const host=useRef(null), callback=useRef(onToken);
 const [error,setError]=useState('');
 const siteKey=import.meta.env.VITE_TURNSTILE_SITE_KEY;
 useEffect(()=>{callback.current=onToken;},[onToken]);
 useEffect(()=>{
  let disposed=false, widget;
  callback.current('');
  if(!siteKey) return;
  loadTurnstile().then(api=>{
   if(disposed) return;
   widget=api.render(host.current,{sitekey:siteKey,action,callback:token=>callback.current(token),'expired-callback':()=>callback.current(''),'error-callback':()=>{callback.current('');setError('Verifikasi tidak tersedia. Muat ulang halaman untuk mencoba kembali.');}});
  }).catch(()=>{if(!disposed)setError('Verifikasi tidak tersedia. Muat ulang halaman untuk mencoba kembali.');});
  return ()=>{disposed=true;if(widget!==undefined)window.turnstile?.remove(widget);};
 },[siteKey,resetKey,action]);
 return <div><div ref={host} />{(!siteKey || error) && <p role="alert">{error || 'Verifikasi manusia belum dikonfigurasi. Layanan publik belum tersedia.'}</p>}</div>;
}
