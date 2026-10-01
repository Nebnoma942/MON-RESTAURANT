import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Location from "expo-location";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

type Delivery={id:number;orderId:number;status:string;driverId:number|null;assignedAt?:string|null;acceptedAt?:string|null;pickedUpAt?:string|null;deliveredAt?:string|null};

export default function DriverHome(){
 const {user,token,loading:authLoading,login,register,logout}=useAuth();
 const [mode,setMode]=useState<'login'|'register'>('login'); const [name,setName]=useState(''); const [phone,setPhone]=useState(''); const [password,setPassword]=useState('');
 const [online,setOnline]=useState(false); const [locationStatus,setLocationStatus]=useState('GPS non partagé'); const [deliveries,setDeliveries]=useState<Delivery[]>([]); const [busy,setBusy]=useState(false);
 async function refresh(){if(!token)return;try{const d=await api<Delivery[]>('/drivers/me/deliveries',token);setDeliveries(d);}catch(e){Alert.alert('Erreur',e instanceof Error?e.message:'Erreur');}}
 useEffect(()=>{if(token)refresh();},[token]);
 useEffect(()=>{
   if(!online || !token) return;
   let sub: Location.LocationSubscription | null = null;
   (async()=>{
     try {
       sub = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 50 }, async ({ coords }) => {
         try { await api('/drivers/me/location', token, { method:'PATCH', body:JSON.stringify({lat:coords.latitude,lng:coords.longitude}) }); setLocationStatus(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`); } catch {}
       });
     } catch {}
   })();
   return ()=>{ sub?.remove(); };
 },[online,token]);
 async function submitAuth(){try{setBusy(true); if(mode==='login') await login(phone,password); else await register(name,phone,password);}catch(e){Alert.alert('Connexion',e instanceof Error?e.message:'Erreur');}finally{setBusy(false);}}
 async function setAvailability(next:boolean){if(!token)return;try{setBusy(true); if(next){const p=await Location.requestForegroundPermissionsAsync();if(p.status!=='granted'){Alert.alert('GPS','La permission de localisation est nécessaire pour être disponible.');return;} const pos=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced}); await api('/drivers/me/location',token,{method:'PATCH',body:JSON.stringify({lat:pos.coords.latitude,lng:pos.coords.longitude})});} await api('/drivers/me/status',token,{method:'PATCH',body:JSON.stringify({isOnline:next,isAvailable:next})}); setOnline(next); if(next){setLocationStatus('Position envoyée au serveur');}else setLocationStatus('GPS non partagé'); await refresh();}catch(e){Alert.alert('Disponibilité',e instanceof Error?e.message:'Erreur');}finally{setBusy(false);}}
 async function updateDelivery(id:number,status:'accepted'|'picked_up'|'delivering'|'delivered'|'cancelled'){if(!token)return;try{setBusy(true);await api(`/drivers/me/deliveries/${id}/status`,token,{method:'PATCH',body:JSON.stringify({status})});await refresh();}catch(e){Alert.alert('Course',e instanceof Error?e.message:'Erreur');}finally{setBusy(false);}}
 if(authLoading)return <SafeAreaView style={s.safe}><ActivityIndicator/></SafeAreaView>;
 if(!user||!token)return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container}><Text style={s.title}>Espace Livreur</Text><Text style={s.subtitle}>{mode==='login'?'Connexion livreur':'Créer un compte livreur'}</Text>{mode==='register'&&<TextInput style={s.input} placeholder="Nom complet" value={name} onChangeText={setName}/>}<TextInput style={s.input} placeholder="Téléphone" keyboardType="phone-pad" value={phone} onChangeText={setPhone}/><TextInput style={s.input} placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword}/><Button title={busy?'...':mode==='login'?'Se connecter':'Créer le compte'} onPress={submitAuth} disabled={busy}/><Button title={mode==='login'?'Créer un compte':'J’ai déjà un compte'} onPress={()=>setMode(mode==='login'?'register':'login')}/></ScrollView></SafeAreaView>;
 return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container}><View style={s.row}><View><Text style={s.title}>Bonjour {user.name}</Text><Text style={s.subtitle}>Espace Livreur</Text></View><Button title="Déconnexion" onPress={logout}/></View><View style={s.card}><Text style={s.label}>Disponibilité</Text><Text style={s.status}>{online?'🟢 En ligne':'⚪ Hors ligne'}</Text><Button title={busy?'...':online?'Passer hors ligne':'Se rendre disponible'} onPress={()=>setAvailability(!online)} disabled={busy}/><Text style={s.location}>GPS : {locationStatus}</Text></View><View style={s.card}><View style={s.row}><Text style={s.section}>Mes courses</Text><Button title="Actualiser" onPress={refresh}/></View>{deliveries.length===0?<Text>Aucune course affectée.</Text>:deliveries.map(d=><View key={d.id} style={s.delivery}><View><Text style={s.order}>Commande #{d.orderId}</Text><Text>{d.status}</Text></View><View>{d.status==='assigned'&&<Button title="Accepter" onPress={()=>updateDelivery(d.id,'accepted')} disabled={busy}/>} {d.status==='accepted'&&<Button title="Récupérée" onPress={()=>updateDelivery(d.id,'picked_up')} disabled={busy}/>} {d.status==='picked_up'&&<Button title="En livraison" onPress={()=>updateDelivery(d.id,'delivering')} disabled={busy}/>} {d.status==='delivering'&&<Button title="Livrée" onPress={()=>updateDelivery(d.id,'delivered')} disabled={busy}/>}</View></View>)}</View></ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#f7f7f7'},container:{padding:20,gap:16},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},title:{fontSize:27,fontWeight:'700'},subtitle:{fontSize:16,color:'#666'},section:{fontSize:20,fontWeight:'700'},card:{backgroundColor:'#fff',padding:18,borderRadius:14,gap:12},label:{fontSize:13,color:'#777',textTransform:'uppercase'},status:{fontSize:20,fontWeight:'600'},location:{fontSize:13,color:'#555'},delivery:{paddingVertical:14,borderTopWidth:1,borderTopColor:'#eee',gap:8},order:{fontSize:16,fontWeight:'600'},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#ddd',borderRadius:10,padding:13,fontSize:16}});
