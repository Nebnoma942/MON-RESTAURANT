import express from "express";
import cors from "cors";

const PORT = Number(process.env.PORT ?? 10000);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const origins = (process.env.CORS_ORIGINS ?? "").split(",").map(s=>s.trim()).filter(Boolean);
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required");

type Req = express.Request & { user?: { id:string; role:string; profile:any }; sbToken?: string };

async function sb(path:string, init:RequestInit={}, token?:string) {
  const headers = new Headers(init.headers);
  headers.set("apikey", SUPABASE_ANON_KEY!);
  headers.set("content-type","application/json");
  if(token) headers.set("authorization", `Bearer ${token}`);
  const response=await fetch(`${SUPABASE_URL}${path}`,{...init,headers});
  const text=await response.text();
  let data:any=null; try{data=text?JSON.parse(text):null;}catch{data=text;}
  if(!response.ok) throw new Error(data?.message||data?.error_description||data?.error||data?.hint||`Supabase HTTP ${response.status}`);
  return data;
}
async function userFrom(req:Req) {
  const token=req.header("authorization")?.replace(/^Bearer\s+/i,"");
  if(!token) return null;
  const u=await sb("/auth/v1/user",{},token);
  const profiles=await sb(`/rest/v1/profiles?id=eq.${encodeURIComponent(u.id)}&select=*`,{},token);
  return profiles?.[0]?{id:u.id,role:profiles[0].role,profile:profiles[0],token}:null;
}
function auth(required=true){return async(req:Req,res:express.Response,next:express.NextFunction)=>{try{const u=await userFrom(req);if(!u&&required){res.status(401).json({error:"Authentication required"});return;}req.user=u??undefined;req.sbToken=u?.token;next();}catch(e){res.status(401).json({error:e instanceof Error?e.message:"Invalid session"});}}}
function role(...roles:string[]){return (req:Req,res:express.Response,next:express.NextFunction)=>{if(!req.user||!roles.includes(req.user.role)){res.status(403).json({error:"Forbidden"});return;}next();}}
function syntheticEmail(phone:string){return `${phone.replace(/[^0-9+]/g,"")}@auth.mon-restaurant.local`;}
function q(v:string){return encodeURIComponent(v);}
function restPath(table:string, query:string){return `/rest/v1/${table}${query}`;}

const app=express();
app.use(cors({origin:origins.length?origins:true,credentials:false}));
app.use(express.json({limit:"2mb"}));
app.get("/health",(_req,res)=>res.json({ok:true,service:"mon-restaurant-api",database:"supabase"}));

app.post("/api/auth/register",async(req,res)=>{
  const {name,phone,email,password,role}=req.body??{};
  if(typeof name!=="string"||typeof phone!=="string"||typeof password!=="string"||!["client","restaurant_owner"].includes(role)){res.status(400).json({error:"Invalid registration payload"});return;}
  if(password.length<6){res.status(400).json({error:"Password must be at least 6 characters"});return;}
  try{
    const existing=await sb(restPath("profiles",`?phone=eq.${q(phone.trim())}&select=id&limit=1`));
    if(existing?.length){res.status(409).json({error:"Phone number already registered"});return;}
    const authData=await sb("/auth/v1/signup",{method:"POST",body:JSON.stringify({email:typeof email==="string"&&email.trim()?email.trim():syntheticEmail(phone.trim()),password,data:{full_name:name.trim(),phone:phone.trim(),role}})});
    if(!authData?.access_token){res.status(201).json({requiresConfirmation:true,user:{id:authData?.user?.id,name:name.trim(),phone:phone.trim(),role}});return;}
    await sb("/rest/v1/profiles",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates"},body:JSON.stringify({id:authData.user.id,full_name:name.trim(),phone:phone.trim(),role,status:"active"})},authData.access_token);
    res.status(201).json({token:authData.access_token,user:{id:authData.user.id,name:name.trim(),phone:phone.trim(),email:authData.user.email??null,role,loyaltyPoints:0,createdAt:authData.user.created_at}});
  }catch(e){res.status(400).json({error:e instanceof Error?e.message:"Registration failed"});}
});
app.post("/api/auth/login",async(req,res)=>{
  const {phone,password}=req.body??{}; if(typeof phone!=="string"||typeof password!=="string"){res.status(400).json({error:"Missing phone or password"});return;}
  try{
    const profiles=await sb(restPath("profiles",`?phone=eq.${q(phone.trim())}&select=*&limit=1`)); const p=profiles?.[0]; if(!p){res.status(401).json({error:"Invalid credentials"});return;}
    const data=await sb("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email:syntheticEmail(phone.trim()),password})});
    res.json({token:data.access_token,user:{id:p.id,name:p.full_name,phone:p.phone,email:data.user?.email??null,role:p.role,loyaltyPoints:0,createdAt:p.created_at}});
  }catch{res.status(401).json({error:"Invalid credentials"});}
});
app.get("/api/auth/me",auth(),async(req:Req,res)=>res.json({id:req.user!.id,name:req.user!.profile.full_name,phone:req.user!.profile.phone,email:null,role:req.user!.role,loyaltyPoints:0,createdAt:req.user!.profile.created_at}));

app.get("/api/restaurants",async(_req,res)=>{try{const data=await sb(restPath("restaurants","?status=eq.approved&order=created_at.desc&select=*"));res.json((data??[]).map((r:any)=>({...r,address:r.address_text,rating:r.rating_average,reviewCount:r.rating_count})));}catch(e){res.status(500).json({error:String(e)});}});
app.get("/api/restaurants/:id",async(req,res)=>{try{const rs=await sb(restPath("restaurants",`?id=eq.${q(req.params.id)}&status=eq.approved&select=*&limit=1`));if(!rs?.[0]){res.status(404).json({error:"Restaurant not found"});return;}const r=rs[0];const dishes=await sb(restPath("dishes",`?restaurant_id=eq.${q(r.id)}&select=*&order=created_at`));res.json({...r,address:r.address_text,rating:r.rating_average,reviewCount:r.rating_count,dishes:(dishes??[]).map((d:any)=>({id:d.id,restaurantId:d.restaurant_id,name:d.name,description:d.description,price:d.price_fcfa,available:d.is_available,imageUrl:d.image_path,hasPromotion:false,promotionPrice:null}))});}catch(e){res.status(500).json({error:String(e)});}});
app.get("/api/restaurants/mine",auth(),role("restaurant_owner","admin"),async(req:Req,res)=>{try{const ms=await sb(restPath("restaurant_members",`?user_id=eq.${q(req.user!.id)}&member_role=eq.owner&select=restaurant_id&limit=1`),{},req.sbToken);if(!ms?.[0]){res.status(404).json({error:"Restaurant not found"});return;}const rs=await sb(restPath("restaurants",`?id=eq.${q(ms[0].restaurant_id)}&select=*&limit=1`),{},req.sbToken);const ds=await sb(restPath("dishes",`?restaurant_id=eq.${q(ms[0].restaurant_id)}&select=*`),{},req.sbToken);res.json({...rs[0],address:rs[0].address_text,dishes:ds??[]});}catch(e){res.status(500).json({error:String(e)});}});
app.post("/api/restaurants",auth(),role("restaurant_owner","admin"),async(req:Req,res)=>{try{const b=req.body??{};const rows=await sb("/rest/v1/restaurants",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify({name:b.name,description:b.description??null,phone:b.phone??null,email:b.email??null,address_text:b.address??null,city:b.city,neighborhood:b.neighborhood??null,status:"pending"})},req.sbToken);const r=rows[0];if(req.user!.role==="restaurant_owner")await sb("/rest/v1/restaurant_members",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify({restaurant_id:r.id,user_id:req.user!.id,member_role:"owner"})},req.sbToken);res.status(201).json(r);}catch(e){res.status(400).json({error:String(e)});}});

app.get("/api/orders",auth(),async(req:Req,res)=>{try{let query="?select=*,order_items(*)&order=created_at.desc";if(req.user!.role==="client")query+=`&customer_id=eq.${q(req.user!.id)}`;const data=await sb(restPath("orders",query),{},req.sbToken);res.json((data??[]).map((o:any)=>({...o,subtotal:o.subtotal_fcfa,deliveryFee:o.delivery_fee_fcfa,discount:o.discount_fcfa,total:o.total_fcfa,items:(o.order_items??[]).map((i:any)=>({dishId:i.dish_id,dishName:i.dish_name_snapshot,quantity:Number(i.quantity),unitPrice:i.unit_price_fcfa,totalPrice:i.line_total_fcfa}))})));}catch(e){res.status(500).json({error:String(e)});}});
app.get("/api/orders/:id",async(req,res)=>{try{const data=await sb(restPath("orders",`?id=eq.${q(req.params.id)}&select=*,order_items(*)&limit=1`));if(!data?.[0]){res.status(404).json({error:"Order not found"});return;}const o=data[0];res.json({...o,subtotal:o.subtotal_fcfa,deliveryFee:o.delivery_fee_fcfa,discount:o.discount_fcfa,total:o.total_fcfa,items:o.order_items??[]});}catch(e){res.status(404).json({error:String(e)});}});
app.post("/api/orders",async(req,res)=>{const token=req.header("authorization")?.replace(/^Bearer\s+/i,"");try{let customerId=null;if(token){const u=await sb("/auth/v1/user",{},token);customerId=u?.id??null;}const b=req.body??{};if(!customerId&&(!b.guestName||!b.guestPhone)){res.status(400).json({error:"Guest name and phone are required when not logged in"});return;}const data=await sb("/rest/v1/rpc/create_order",{method:"POST",body:JSON.stringify({p_customer_id:customerId,p_guest_name:b.guestName??null,p_guest_phone:b.guestPhone??null,p_restaurant_id:b.restaurantId,p_delivery_zone_id:b.deliveryZoneId??null,p_delivery_address_snapshot:{address_text:b.deliveryAddress,city:b.deliveryCity,guest_name:b.guestName??null,guest_phone:b.guestPhone??null},p_delivery_location:null,p_items:(b.items??[]).map((i:any)=>({dish_id:i.dishId,quantity:i.quantity})),p_payment_method:b.paymentMethod,p_idempotency_key:b.idempotencyKey??`v7-${Date.now()}-${Math.random().toString(36).slice(2)}`,p_use_loyalty:b.useLoyaltyDiscount===true})},token);res.status(201).json(Array.isArray(data)?data[0]:data);}catch(e){res.status(400).json({error:String(e)});}});
app.patch("/api/orders/:id/status",auth(),role("restaurant_owner","admin"),async(req:Req,res)=>{try{const statusMap:any={pending:"received",confirmed:"confirmed",preparing:"preparing",ready:"ready",delivering:"out_for_delivery",delivered:"delivered",cancelled:"cancelled"};const data=await sb("/rest/v1/rpc/change_order_status",{method:"POST",body:JSON.stringify({p_order_id:req.params.id,p_new_status:statusMap[req.body?.status]??req.body?.status,p_reason:req.body?.reason??null})},req.sbToken);res.json(data);}catch(e){res.status(400).json({error:String(e)});}});
app.patch("/api/orders/:id/payment",auth(),role("restaurant_owner","admin"),async(req:Req,res)=>{try{const data=await sb(restPath("orders",`?id=eq.${q(req.params.id)}`),{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({payment_status:req.body?.paymentStatus})},req.sbToken);res.json(data?.[0]??data);}catch(e){res.status(400).json({error:String(e)});}});

app.get("/api/delivery/quote",async(req,res)=>{try{const city=String(req.query.city??"");const z=await sb(restPath("delivery_zones",`?city=eq.${q(city)}&is_active=eq.true&order=base_fee_fcfa&limit=1`));const fee=z?.[0]?.base_fee_fcfa??1000;res.json({fee,baseFee:fee,distanceKm:null,zoneId:z?.[0]?.id??null,currency:"FCFA",minimumFee:1000});}catch(e){res.status(500).json({error:String(e)});}});
app.get("/api/admin/stats",auth(),role("admin"),async(req:Req,res)=>{try{const [u,r,o]=await Promise.all([sb(restPath("profiles","?select=id"),{},req.sbToken),sb(restPath("restaurants","?select=id,status"),{},req.sbToken),sb(restPath("orders","?select=id,total_fcfa,status"),{},req.sbToken)]);res.json({users:{total:u?.length??0},restaurants:{total:r?.length??0,pending:(r??[]).filter((x:any)=>x.status==="pending").length,approved:(r??[]).filter((x:any)=>x.status==="approved").length},orders:{total:o?.length??0},revenue:{total:(o??[]).filter((x:any)=>x.status==="delivered").reduce((s:number,x:any)=>s+Number(x.total_fcfa??0),0),today:0,commission:0}});}catch(e){res.status(500).json({error:String(e)});}});
app.get("/api/admin/restaurants",auth(),role("admin"),async(req:Req,res)=>{try{res.json(await sb(restPath("restaurants","?order=created_at.desc&select=*"),{},req.sbToken));}catch(e){res.status(500).json({error:String(e)});}});
app.patch("/api/admin/restaurants/:id/status",auth(),role("admin"),async(req:Req,res)=>{try{const d=await sb(restPath("restaurants",`?id=eq.${q(req.params.id)}`),{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({status:req.body?.status})},req.sbToken);res.json(d?.[0]??d);}catch(e){res.status(400).json({error:String(e)});}});
app.get("/api/admin/users",auth(),role("admin"),async(req:Req,res)=>{try{const d=await sb(restPath("profiles","?order=created_at.desc&select=id,full_name,phone,role,status,created_at"),{},req.sbToken);res.json((d??[]).map((u:any)=>({...u,name:u.full_name,loyaltyPoints:0,createdAt:u.created_at})));}catch(e){res.status(500).json({error:String(e)});}});

app.use((_req,res)=>res.status(404).json({error:"Route not found"}));
app.listen(PORT,"0.0.0.0",()=>console.log(`MON-RESTAURANT API listening on ${PORT}`));
