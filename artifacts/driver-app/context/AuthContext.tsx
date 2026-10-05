import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type DriverUser = { id:number; name:string; phone:string; email?:string|null; role:string; loyaltyPoints:number; createdAt:string };
type AuthValue = { user:DriverUser|null; token:string|null; loading:boolean; login:(phone:string,password:string)=>Promise<void>; loginWithGoogle:(credential:string)=>Promise<void>; register:(name:string,phone:string,password:string)=>Promise<void>; logout:()=>Promise<void> };
const C=createContext<AuthValue|null>(null);
const TOKEN_KEY="eatbf_driver_token"; const USER_KEY="eatbf_driver_user";
const API=(process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api").replace(/\/$/,"");
async function request(path:string, init:RequestInit={}, token?:string){ const r=await fetch(`${API}${path}`,{...init,headers:{"Content-Type":"application/json",...(init.headers||{}),...(token?{Authorization:`Bearer ${token}`}:{})}}); const data=await r.json().catch(()=>({})); if(!r.ok) throw new Error(data.error||"Erreur réseau"); return data; }
export function AuthProvider({children}:{children:React.ReactNode}){
 const [user,setUser]=useState<DriverUser|null>(null); const [token,setToken]=useState<string|null>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{try{const [t,u]=await Promise.all([AsyncStorage.getItem(TOKEN_KEY),AsyncStorage.getItem(USER_KEY)]); if(t&&u){const parsed=JSON.parse(u); if(parsed.role!=="driver"){await AsyncStorage.multiRemove([TOKEN_KEY,USER_KEY]);} else {setToken(t);setUser(parsed);}}}finally{setLoading(false);}})();},[]);
 const login=async(phone:string,password:string)=>{const d=await request('/auth/login',{method:'POST',body:JSON.stringify({phone,password})}); if(d.user?.role!=="driver") throw new Error("Ce compte n'est pas un compte livreur"); await AsyncStorage.multiSet([[TOKEN_KEY,d.token],[USER_KEY,JSON.stringify(d.user)]]);setToken(d.token);setUser(d.user);};
 const loginWithGoogle=useCallback(async(credential:string)=>{const d=await request('/auth/google',{method:'POST',body:JSON.stringify({credential})}); if(d.user?.role!=="driver") throw new Error("Cette adresse Google n'est pas autorisée comme compte livreur"); await AsyncStorage.multiSet([[TOKEN_KEY,d.token],[USER_KEY,JSON.stringify(d.user)]]);setToken(d.token);setUser(d.user);},[]);
 const register=async(name:string,phone:string,password:string)=>{const d=await request('/auth/register',{method:'POST',body:JSON.stringify({name,phone,password,role:'driver'})}); await AsyncStorage.multiSet([[TOKEN_KEY,d.token],[USER_KEY,JSON.stringify(d.user)]]);setToken(d.token);setUser(d.user);};
 const logout=async()=>{await AsyncStorage.multiRemove([TOKEN_KEY,USER_KEY]);setToken(null);setUser(null);};
 return <C.Provider value={{user,token,loading,login,loginWithGoogle,register,logout}}>{children}</C.Provider>;
}
export function useAuth(){const v=useContext(C);if(!v)throw new Error('useAuth must be used within AuthProvider');return v;}
