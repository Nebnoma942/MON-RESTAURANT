import http from "node:http";
import { URL } from "node:url";

const PORT=Number(process.env.PORT||10000), SB=process.env.SUPABASE_URL, KEY=process.env.SUPABASE_ANON_KEY;
const ORIGINS=(process.env.CORS_ORIGINS||"").split(",").map(x=>x.trim()).filter(Boolean);
if(!SB||!KEY) throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required");

async function sb(path,opts={},token){
  const h=new Headers(opts.headers||{}); h.set("apikey",KEY); h.set("content-type","application/json");
  if(token) h.set("authorization","Bearer "+token);
  const r=await fetch(SB+path,{...opts,headers:h}); const t=await r.text(); let d=null;
  try{d=t?JSON.parse(t):null}catch{d=t}
  if(!r.ok) throw new Error(d?.message||d?.error_description||d?.error||`Supabase HTTP ${r.status}`);
  return d;
}
const enc=encodeURIComponent;
function send(res,status,data){res.writeHead(status,{"content-type":"application/json; charset=utf-8","access-control-allow-origin":ORIGINS[0]||"*","access-control-allow-headers":"authorization,content-type","access-control-allow-methods":"GET,POST,PATCH,OPTIONS"});res.end(JSON.stringify(data));}
function read(req){return new Promise((ok,bad)=>{let s="";req.on("data",c=>s+=c);req.on("end",()=>{try{ok(s?JSON.parse(s):{})}catch(e){bad(e)}})})}
function tok(req){return (req.headers.authorization||"").replace(/^Bearer\s+/i,"")||null}
async function me(req){const t=tok(req);if(!t)return null;const u=await sb("/auth/v1/user",{},t);const p=await sb("/rest/v1/profiles?id=eq."+enc(u.id)+"&select=*&limit=1",{},t);return p?.[0]?{id:u.id,role:p[0].role,profile:p[0],token:t}:null}
const synthetic=p=>p.replace(/[^0-9+]/g,"")+"@auth.mon-restaurant.local";

async function route(req,res){
  if(req.method==="OPTIONS"){res.writeHead(204,{"access-control-allow-origin":ORIGINS[0]||"*","access-control-allow-headers":"authorization,content-type","access-control-allow-methods":"GET,POST,PATCH,OPTIONS"});return res.end();}
  const u=new URL(req.url,"http://localhost"), p=u.pathname;
  try{
    if(p==="/health") return send(res,200,{ok:true,service:"mon-restaurant-api",database:"supabase"});
    if(p==="/api/auth/register"&&req.method==="POST"){const b=await read(req);if(typeof b.name!=="string"||typeof b.phone!=="string"||typeof b.password!=="string"||!["client","restaurant_owner"].includes(b.role))return send(res,400,{error:"Invalid registration payload"});const ex=await sb("/rest/v1/profiles?phone=eq."+enc(b.phone.trim())+"&select=id&limit=1");if(ex?.length)return send(res,409,{error:"Phone number already registered"});const a=await sb("/auth/v1/signup",{method:"POST",body:JSON.stringify({email:b.email?.trim()||synthetic(b.phone),password:b.password,data:{full_name:b.name.trim(),phone:b.phone.trim(),role:b.role}})});if(!a.access_token)return send(res,201,{requiresConfirmation:true,user:{id:a.user?.id,name:b.name,phone:b.phone,role:b.role}});await sb("/rest/v1/profiles",{method:"POST",headers:{Prefer:"resolution=merge-duplicates"},body:JSON.stringify({id:a.user.id,full_name:b.name.trim(),phone:b.phone.trim(),role:b.role,status:"active"})},a.access_token);return send(res,201,{token:a.access_token,user:{id:a.user.id,name:b.name,phone:b.phone,email:a.user.email,role:b.role,loyaltyPoints:0,createdAt:a.user.created_at}});}
    if(p==="/api/auth/login"&&req.method==="POST"){const b=await read(req),ps=await sb("/rest/v1/profiles?phone=eq."+enc((b.phone||"").trim())+"&select=*&limit=1");if(!ps?.[0])return send(res,401,{error:"Invalid credentials"});const a=await sb("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email:synthetic(b.phone.trim()),password:b.password})});return send(res,200,{token:a.access_token,user:{id:ps[0].id,name:ps[0].full_name,phone:ps[0].phone,email:a.user?.email,role:ps[0].role,loyaltyPoints:0,createdAt:ps[0].created_at}});}
    if(p==="/api/auth/me"){const m=await me(req);if(!m)return send(res,401,{error:"Authentication required"});return send(res,200,{id:m.id,name:m.profile.full_name,phone:m.profile.phone,email:null,role:m.role,loyaltyPoints:0,createdAt:m.profile.created_at});}
    if(p==="/api/restaurants"&&req.method==="GET"){const d=await sb("/rest/v1/restaurants?status=eq.approved&order=created_at.desc&select=*");return send(res,200,(d||[]).map(r=>({...r,address:r.address_text,rating:r.rating_average,reviewCount:r.rating_count})));}
    if(/^\/api\/restaurants\/[^/]+$/.test(p)&&req.method==="GET"){const id=p.split("/").pop(),rs=await sb("/rest/v1/restaurants?id=eq."+enc(id)+"&status=eq.approved&select=*&limit=1");if(!rs?.[0])return send(res,404,{error:"Restaurant not found"});const d=await sb("/rest/v1/dishes?restaurant_id=eq."+enc(id)+"&select=*&order=created_at");return send(res,200,{...rs[0],address:rs[0].address_text,rating:rs[0].rating_average,reviewCount:rs[0].rating_count,dishes:d||[]});}
    if(p==="/api/orders"&&req.method==="GET"){const m=await me(req);if(!m)return send(res,401,{error:"Authentication required"});let q="?select=*,order_items(*)&order=created_at.desc";if(m.role==="client")q+="&customer_id=eq."+enc(m.id);return send(res,200,await sb("/rest/v1/orders"+q,{},m.token));}
    if(p==="/api/orders"&&req.method==="POST"){const b=await read(req),t=tok(req);let cid=null;if(t){const a=await sb("/auth/v1/user",{},t);cid=a?.id||null}if(!cid&&(!b.guestName||!b.guestPhone))return send(res,400,{error:"Guest name and phone are required when not logged in"});const d=await sb("/rest/v1/rpc/create_order",{method:"POST",body:JSON.stringify({p_customer_id:cid,p_guest_name:b.guestName||null,p_guest_phone:b.guestPhone||null,p_restaurant_id:b.restaurantId,p_delivery_zone_id:b.deliveryZoneId||null,p_delivery_address_snapshot:{address_text:b.deliveryAddress,city:b.deliveryCity},p_delivery_location:null,p_items:(b.items||[]).map(i=>({dish_id:i.dishId,quantity:i.quantity})),p_payment_method:b.paymentMethod,p_idempotency_key:b.idempotencyKey||("v7-"+Date.now()),p_use_loyalty:b.useLoyaltyDiscount===true})},t);return send(res,201,Array.isArray(d)?d[0]:d);}
    if(p==="/api/delivery/quote"&&req.method==="GET"){const city=u.searchParams.get("city")||"",z=await sb("/rest/v1/delivery_zones?city=eq."+enc(city)+"&is_active=eq.true&order=base_fee_fcfa&limit=1"),fee=z?.[0]?.base_fee_fcfa||1000;return send(res,200,{fee,baseFee:fee,distanceKm:null,zoneId:z?.[0]?.id||null,currency:"FCFA",minimumFee:1000});}
    if(p==="/api/admin/stats"){const m=await me(req);if(!m||m.role!=="admin")return send(res,403,{error:"Admin access required"});const [a,b,c]=await Promise.all([sb("/rest/v1/profiles?select=id",{},m.token),sb("/rest/v1/restaurants?select=id,status",{},m.token),sb("/rest/v1/orders?select=id,total_fcfa,status",{},m.token)]);return send(res,200,{users:{total:a?.length||0},restaurants:{total:b?.length||0},orders:{total:c?.length||0},revenue:{total:(c||[]).filter(x=>x.status==="delivered").reduce((s,x)=>s+Number(x.total_fcfa||0),0),today:0,commission:0}});}
    if(p==="/api/admin/restaurants"&&req.method==="GET"){const m=await me(req);if(!m||m.role!=="admin")return send(res,403,{error:"Admin access required"});return send(res,200,await sb("/rest/v1/restaurants?order=created_at.desc&select=*",{},m.token));}
    if(p==="/api/admin/users"&&req.method==="GET"){const m=await me(req);if(!m||m.role!=="admin")return send(res,403,{error:"Admin access required"});const d=await sb("/rest/v1/profiles?order=created_at.desc&select=id,full_name,phone,role,status,created_at",{},m.token);return send(res,200,(d||[]).map(x=>({...x,name:x.full_name,createdAt:x.created_at,loyaltyPoints:0})));}
    return send(res,404,{error:"Route not found"});
  }catch(e){return send(res,400,{error:e?.message||String(e)});}
}
http.createServer(route).listen(PORT,"0.0.0.0",()=>console.log("MON-RESTAURANT API listening on "+PORT));