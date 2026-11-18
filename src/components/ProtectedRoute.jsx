import React from 'react';
import {Navigate,Outlet,useLocation} from 'react-router-dom';
import {useAuth} from '../contexts/useAuth';
import {PageLoader} from './Loading';
export default function ProtectedRoute({allowedRoles}){
 const {user,loading}=useAuth();const location=useLocation();
 if(loading)return <PageLoader text="Memuat halaman..."/>;
 if(!user)return <Navigate to="/login" state={{from:location}} replace/>;
 if(user.role!=='admin'||user.is_active!==true||(allowedRoles&&!allowedRoles.includes('admin')))return <Navigate to="/403" replace/>;
 return <Outlet/>;
}
