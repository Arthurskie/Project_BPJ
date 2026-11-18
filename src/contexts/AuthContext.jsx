import React,{useState,useEffect,useCallback,useRef} from 'react';
import authAPI from '../services/authAPI';
import {supabaseConfigured} from '../lib/supabase.js';
import {AuthContext} from './useAuth.js';
import {createRequestGate} from '../services/requestGate.js';
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(supabaseConfigured),[error,setError]=useState(null);
 const [gate]=useState(createRequestGate);const mounted=useRef(true);
 const refresh=useCallback(async()=>{
  const request=gate.next();setLoading(true);
  try{const response=await authAPI.getMe();if(mounted.current&&gate.isCurrent(request))setUser(response.user);return response.user;}
  catch{if(mounted.current&&gate.isCurrent(request))setUser(null);return null;}
  finally{if(mounted.current&&gate.isCurrent(request))setLoading(false);}
 },[gate]);
 useEffect(()=>{
  mounted.current=true;
  if(!supabaseConfigured)return;
  queueMicrotask(()=>{if(mounted.current)refresh();});
  const {data:{subscription}}=authAPI.onAuthStateChange((event)=>{
   gate.next();
   if(event==='SIGNED_OUT'){setUser(null);setLoading(false);return;}
   setUser(null);setLoading(true);
   queueMicrotask(()=>{if(mounted.current)refresh();});
  });
  return()=>{mounted.current=false;gate.next();subscription.unsubscribe();};
 },[refresh,gate]);
 const login=async(email,password)=>{
  setError(null);const request=gate.next();
  try{const result=await authAPI.login(email,password);if(mounted.current&&gate.isCurrent(request))setUser(result.user);return result;}
  catch(err){if(mounted.current&&gate.isCurrent(request)){setUser(null);setError(err.message);}throw err;}
 };
 const logout=async()=>{gate.next();setUser(null);setLoading(true);try{await authAPI.logout();}finally{if(mounted.current)setLoading(false);}};
 const value={user,loading,error,login,logout,refresh,forgotPassword:authAPI.forgotPassword,isAuthenticated:user?.role==='admin'&&user?.is_active===true,isSuperAdmin:user?.role==='admin',isVerifikator:user?.role==='admin'};
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
