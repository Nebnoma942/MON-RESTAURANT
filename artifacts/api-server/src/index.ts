import express from "express";
import { randomUUID } from "node:crypto";
import cors from "cors";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PORT = Number(process.env.PORT ?? 10000);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? "").split(",").map(s=>s.trim()).filter(Boolean);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required");

type User = { id:string; full_name:string; phone:string|null; role:"client"|"restaurant_owner"|"driver"|"admin"; status:string; created_at:string };
type ReqUser = { id:string; role:string; profile:User };
type Req = express.Request & { user?:ReqUser; sb?:SupabaseClient };

function sbFor(req: express.Request) {
  const auth = req.header("authorization");
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global:{headers: auth ? {Authorization:auth} : {}},
    auth:{persistSession:false,autoRefreshToken:false}
  });
}
async function loadUser(req:Req,res:express.Response,next:express.NextFunction){
  req.sb=sbFor(req);
  const token=req.header("authorization")?.replace(/^Bearer\s+/i,"");
  if(!token){res.status(401).json({error:"Authentication required"});return;}
  const {data,error}=await req.sb.auth.getUser(token);
  if(error||!data.user){res.status(401).json({error:"Invalid session"});return;}
  const {data:profile,error:pe}=await req.sb.from("profiles").select("*").eq("id",data.user.id).single();
  if(pe||!profile){res.status(403).json({error:"Profile not found"});return;}
  req.user={id:data.user.id,role:profile.role,profile}; next();
}
function optionalUser(req:Req,_res:express.Response,next:express.NextFunction){req.sb=sbFor(req); next();}
function admin(req:Req,res:express.Response,next:express.NextFunction){if(req.user?.role!=="admin"){res.status(403).json({error:"Admin access required"});return;}next();}
function restaurantManager(req:Req,res:express.Response,next:express.NextFunction){if(!["admin","restaurant_owner"].includes(req.user?.role??"")){res.status(403).json({error:"Restaurant access required"});return;}next();}
function syntheticEmail(phone:string){return `${phone.replace(/[^0-9+]/g,"")}@auth.mon-restaurant.local`;}

const app=express();
app.use(cors({origin:CORS_ORIGINS.length?CORS_ORIGINS:true,credentials:true}));
app.use(express.json({limit:"2mb"}));
app.get("/health",(_req,res)=>res.json({ok:true,service:"mon-restaurant-api",database:"supabase"}));

app.post("/api/auth/register", async(req,res)=>{
  const {name,phone,email,password,role}=req.body??{};
  if(typeof name!=="string"||typeof phone!=="string"||typeof password!=="string"||!["client","restaurant_owner"].includes(role)){res.status(400).json({error:"Invalid registration payload"});return;}
  if(password.length<6){res.status(400).json({error:"Password must be at least 6 characters"});return;}
  const sb=createClient(SUPABASE_URL!,SUPABASE_ANON_KEY!,{auth:{persistSession:false}});
  const {data:existing}=await sb.from("profiles").select("id").eq("phone",phone.trim()).maybeSingle();
  if(existing){res.status(409).json({error:"Phone number already registered"});return;}
  const {data,error}=await sb.auth.signUp({email:typeof email==="string"&&email.trim()?email.trim():syntheticEmail(phone.trim()),password,options:{data:{full_name:name.trim(),phone:phone.trim(),role}}});
  if(error||!data.user){res.status(400).json({error:error?.message??"Registration failed"});return;}
  if(data.session){await sb.from("profiles").upsert({id:data.user.id,full_name:name.trim(),phone:phone.trim(),role,status:"active"});res.status(201).json({token:data.session.access_token,user:{id:data.user.id,name:name.trim(),phone:phone.trim(),email:data.user.email??null,role,loyaltyPoints:0,createdAt:data.user.created_at}});return;}
  res.status(201).json({requiresConfirmation:true,user:{id:data.user.id,name:name.trim(),phone:phone.trim(),email:data.user.email??null,role}});
});

app.post("/api/auth/login", async(req,res)=>{
  const {phone,password}=req.body??{};
  if(typeof phone!=="string"||typeof password!=="string"){res.status(400).json({error:"Missing phone or password"});return;}
  const lookup=createClient(SUPABASE_URL!,SUPABASE_ANON_KEY!,{auth:{persistSession:false}});
  const {data:p}=await lookup.from("profiles").select("id,full_name,phone,role,status").eq("phone",phone.trim()).maybeSingle();
  if(!p){res.status(401).json({error:"Invalid credentials"});return;}
  const {data,error}=await lookup.auth.signInWithPassword({email:syntheticEmail(phone.trim()),password});
  if(error||!data.session){res.status(401).json({error:"Invalid credentials"});return;}
  res.json({token:data.session.access_token,user:{id:p.id,name:p.full_name,phone:p.phone,email:data.user.email,role:p.role,loyaltyPoints:0,createdAt:data.user.created_at}});
});

app.get("/api/auth/me",loadUser,(req:Req,res)=>res.json({id:req.user!.id,name:req.user!.profile.full_name,phone:req.user!.profile.phone,email:null,role:req.user!.role,loyaltyPoints:0,createdAt:req.user!.profile.created_at}));

app.get("/api/restaurants",optionalUser,async(req:Req,res)=>{
  const {data,error}=await req.sb!.from("restaurants").select("*").eq("status","approved").order("created_at",{ascending:false});
  if(error){res.status(500).json({error:error.message});return;}
  res.json((data??[]).map(r=>({...r,address:r.address_text,rating:r.rating_average,reviewCount:r.rating_count,ownerId:null,imageUrl:null,openingHours:null})));
});
app.get("/api/restaurants/:id",optionalUser,async(req:Req,res)=>{
  const {data:r,error}=await req.sb!.from("restaurants").select("*").eq("id",req.params.id).eq("status","approved").maybeSingle();
  if(error||!r){res.status(404).json({error:"Restaurant not found"});return;}
  const {data:dishes}=await req.sb!.from("dishes").select("*").eq("restaurant_id",r.id).order("created_at");
  res.json({...r,address:r.address_text,rating:r.rating_average,reviewCount:r.rating_count,ownerId:null,imageUrl:null,openingHours:null,dishes:(dishes??[]).map(d=>({id:d.id,restaurantId:d.restaurant_id,name:d.name,description:d.description,price:d.price_fcfa,available:d.is_available,imageUrl:d.image_path,hasPromotion:false,promotionPrice:null}))});
});
app.post("/api/restaurants",loadUser,restaurantManager,async(req:Req,res)=>{
  const b=req.body??{};
  const {data:r,error}=await req.sb!.from("restaurants").insert({name:b.name,description:b.description??null,phone:b.phone??null,email:b.email??null,address_text:b.address??null,city:b.city,neighborhood:b.neighborhood??null,status:"pending"}).select().single();
  if(error){res.status(400).json({error:error.message});return;}
  if(req.user!.role!=="admin") await req.sb!.from("restaurant_members").insert({restaurant_id:r.id,user_id:req.user!.id,member_role:"owner"});
  res.status(201).json(r);
});
app.get("/api/restaurants/mine",loadUser,async(req:Req,res)=>{
  const {data:m}=await req.sb!.from("restaurant_members").select("restaurant_id").eq("user_id",req.user!.id).eq("member_role","owner").limit(1).maybeSingle();
  if(!m){res.status(404).json({error:"Restaurant not found"});return;}
  const {data:r}=await req.sb!.from("restaurants").select("*").eq("id",m.restaurant_id).single();
  const {data:d}=await req.sb!.from("dishes").select("*").eq("restaurant_id",m.restaurant_id);
  res.json({...r,address:r.address_text,rating:r.rating_average,reviewCount:r.rating_count,dishes:d??[]});
});

app.get("/api/orders",loadUser,async(req:Req,res)=>{
  let q=req.sb!.from("orders").select("*,order_items(*)").order("created_at",{ascending:false});
  if(req.user!.role==="client") q=q.eq("customer_id",req.user!.id);
  const {data,error}=await q;
  if(error){res.status(500).json({error:error.message});return;}
  res.json((data??[]).map(o=>({...o,subtotal:o.subtotal_fcfa,deliveryFee:o.delivery_fee_fcfa,discount:o.discount_fcfa,total:o.total_fcfa,restaurantName:null,items:(o.order_items??[]).map((i:any)=>({dishId:i.dish_id,dishName:i.dish_name_snapshot,quantity:Number(i.quantity),unitPrice:i.unit_price_fcfa,totalPrice:i.line_total_fcfa}))})));
});

app.get("/api/orders/:id",optionalUser,async(req:Req,res)=>{
  const {data:o,error}=await req.sb!.from("orders").select("*,order_items(*)").eq("id",req.params.id).maybeSingle();
  if(error||!o){res.status(404).json({error:"Order not found"});return;}
  res.json({...o,subtotal:o.subtotal_fcfa,deliveryFee:o.delivery_fee_fcfa,discount:o.discount_fcfa,total:o.total_fcfa,items:(o.order_items??[]).map((i:any)=>({dishId:i.dish_id,dishName:i.dish_name_snapshot,quantity:Number(i.quantity),unitPrice:i.unit_price_fcfa,totalPrice:i.line_total_fcfa}))});
});

app.post("/api/orders",optionalUser,async(req:Req,res)=>{
  const b=req.body??{}; const user=req.header("authorization")? (await req.sb!.auth.getUser(req.header("authorization")!.replace(/^Bearer\s+/i,""))).data.user:null;
  if(!user && (!b.guestName||!b.guestPhone)){res.status(400).json({error:"Guest name and phone are required when not logged in"});return;}
  const items=(b.items??[]).map((i:any)=>({dish_id:i.dishId,quantity:i.quantity}));
  const deliveryAddress={address_text:b.deliveryAddress,city:b.deliveryCity,guest_name:b.guestName??null,guest_phone:b.guestPhone??null,latitude:b.deliveryLat??null,longitude:b.deliveryLng??null};
  const {data,error}=await req.sb!.rpc("create_order",{p_customer_id:user?.id??null,p_guest_name:b.guestName??null,p_guest_phone:b.guestPhone??null,p_restaurant_id:b.restaurantId,p_delivery_zone_id:b.deliveryZoneId??null,p_delivery_address_snapshot:deliveryAddress,p_delivery_location:null,p_items:items,p_payment_method:b.paymentMethod,p_idempotency_key:b.idempotencyKey??randomUUID(),p_use_loyalty:b.useLoyaltyDiscount===true});
  if(error){res.status(400).json({error:error.message});return;}
  const order=Array.isArray(data)?data[0]:data;
  res.status(201).json(order);
});

app.patch("/api/orders/:id/status",loadUser,restaurantManager,async(req:Req,res)=>{
  const statusMap:any={pending:"received",confirmed:"confirmed",preparing:"preparing",ready:"ready",delivering:"out_for_delivery",delivered:"delivered",cancelled:"cancelled"};
  const next=statusMap[req.body?.status]??req.body?.status;
  const {data,error}=await req.sb!.rpc("change_order_status",{p_order_id:req.params.id,p_new_status:next,p_reason:req.body?.reason??null});
  if(error){res.status(400).json({error:error.message});return;} res.json(data);
});
app.patch("/api/orders/:id/payment",loadUser,restaurantManager,async(req:Req,res)=>{
  const {data,error}=await req.sb!.from("orders").update({payment_status:req.body?.paymentStatus}).eq("id",req.params.id).select().single();
  if(error){res.status(400).json({error:error.message});return;} res.json(data);
});

app.get("/api/delivery/quote",optionalUser,async(req:Req,res)=>{
  const restaurantId=String(req.query.restaurantId??""); const city=String(req.query.city??"");
  const {data:z}=await req.sb!.from("delivery_zones").select("*").eq("city",city).eq("is_active",true).order("base_fee_fcfa",{ascending:true}).limit(1).maybeSingle();
  res.json({fee:z?.base_fee_fcfa??1000,baseFee:z?.base_fee_fcfa??1000,distanceKm:null,zoneId:z?.id??null,currency:"FCFA",minimumFee:1000});
});

app.get("/api/admin/stats",loadUser,admin,async(req:Req,res)=>{
  const [{count:users},{count:restaurants},{count:orders}]=await Promise.all([
    req.sb!.from("profiles").select("*",{count:"exact",head:true}),
    req.sb!.from("restaurants").select("*",{count:"exact",head:true}),
    req.sb!.from("orders").select("*",{count:"exact",head:true})
  ]);
  res.json({users:{total:users??0},restaurants:{total:restaurants??0},orders:{total:orders??0},revenue:{total:0,today:0,commission:0}});
});
app.get("/api/admin/restaurants",loadUser,admin,async(req:Req,res)=>{const {data,error}=await req.sb!.from("restaurants").select("*").order("created_at",{ascending:false});if(error){res.status(500).json({error:error.message});return;}res.json(data??[]);});
app.patch("/api/admin/restaurants/:id/status",loadUser,admin,async(req:Req,res)=>{const {data,error}=await req.sb!.from("restaurants").update({status:req.body?.status}).eq("id",req.params.id).select("id,status").single();if(error){res.status(400).json({error:error.message});return;}res.json(data);});
app.get("/api/admin/users",loadUser,admin,async(req:Req,res)=>{const {data,error}=await req.sb!.from("profiles").select("id,full_name,phone,role,status,created_at").order("created_at",{ascending:false});if(error){res.status(500).json({error:error.message});return;}res.json((data??[]).map(u=>({...u,name:u.full_name,loyaltyPoints:0,createdAt:u.created_at})));});

app.use((_req,res)=>res.status(404).json({error:"Route not found"}));
app.listen(PORT,"0.0.0.0",()=>console.log(`MON-RESTAURANT API listening on ${PORT}`));
