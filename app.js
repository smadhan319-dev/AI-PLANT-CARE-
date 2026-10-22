const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const MODEL="gemini-3.8-flash";
const DEFAULT_KEY="AQ.Ab8RN6LXExdN2M3ZqsPtLyqlFpxTWd5ZPLxYsX8hlO66EGf-lQ";
const DIS=[
["Late blight","Tomato, Potato","Dark water-soaked patches on leaves, white mould underneath in humid weather.","Remove infected leaves; spray copper-based fungicide or mancozeb as per label.","Use resistant varieties, avoid overhead watering, rotate crops."],
["Early blight","Tomato, Potato","Brown spots with concentric rings, starting on older leaves.","Remove affected leaves; apply a protective fungicide such as chlorothalonil.","Mulch soil, space plants, rotate for 2–3 years."],
["Powdery mildew","Grapes, Chilli, Cucurbits","White powdery coating on leaf surface.","Spray sulphur or neem oil; improve airflow.","Avoid crowding; water at the base."],
["Rice blast","Rice","Diamond-shaped grey lesions with brown borders on leaves.","Apply tricyclazole as per label.","Balanced nitrogen, resistant varieties, clean seed."],
["Leaf rust","Wheat","Orange-brown pustules on leaves.","Apply a triazole fungicide early.","Resistant cultivars and timely sowing."],
["Cotton leaf curl virus","Cotton, Chilli","Upward curling, thickened veins, stunted growth. Spread by whiteflies.","Remove infected plants; control whiteflies with neem or yellow sticky traps.","Use tolerant varieties, remove weeds."],
["Bacterial wilt","Tomato, Banana","Sudden wilting while leaves stay green; brown vascular tissue.","No cure: uproot and destroy plants.","Rotate crops, use clean soil and tools."],
["Nitrogen deficiency","Most crops","Yellowing of older leaves first, slow growth.","Apply urea, compost or vermicompost.","Soil test before each season."],
["Downy mildew","Grapes, Maize","Yellow patches above, grey-purple fuzz underneath leaves in cool, wet weather.","Spray metalaxyl or copper fungicide as per label.","Prune for airflow, avoid wet foliage."],
["Bacterial leaf blight","Rice","Yellow to white streaks from leaf tips, wilting of seedlings.","Spray copper oxychloride; drain field.","Clean seed, balanced nitrogen, resistant varieties."],
["Whitefly","Tomato, Cotton, Chilli","Tiny white insects under leaves, sticky honeydew, yellowing.","Yellow sticky traps, neem oil 5 ml/L, spray imidacloprid only if severe.","Remove weeds, use reflective mulch."],
["Aphids","Most crops","Clusters of small insects on shoots, curled leaves, sticky residue.","Strong water jet, neem or soap spray; encourage ladybirds.","Avoid excess nitrogen, monitor weekly."],
["Anthracnose","Mango, Chilli, Banana","Sunken dark spots on fruit and leaves.","Copper or mancozeb spray as per label; remove infected fruit.","Prune canopy, harvest on time."],
["Fall armyworm","Maize","Ragged leaf holes and sawdust-like frass in the whorl.","Spray neem seed extract or Bt; spinosad if severe.","Scout early, intercrop, destroy egg masses."]];
const TIPS=["Water early in the morning at the base of the plant.","Inspect leaves weekly, including the underside.","Rotate crops each season to break disease cycles.","Use clean tools and remove diseased material from the field.","Test soil every year before applying fertiliser.","Use neem-based sprays first; chemicals as a last resort."];
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function lib(f){f=(f||"").toLowerCase();$("#lib").innerHTML=DIS.filter(d=>d.join(" ").toLowerCase().includes(f)).map(d=>`<details class="card"><summary>${d[0]} <span class="tag">${d[1]}</span></summary><h3>Symptoms</h3>${d[2]}<h3>Treatment</h3>${d[3]}<h3>Prevention</h3>${d[4]}</details>`).join("")||'<p class="mu">No match.</p>'}
lib();$("#q").oninput=e=>lib(e.target.value);
$("#tips").innerHTML=TIPS.map(t=>`<li>${t}</li>`).join("");
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button,.tab").forEach(e=>e.classList.remove("on"));b.classList.add("on");$("#t-"+b.dataset.t).classList.add("on");scrollTo(0,0)});
$("#key").value=store("apc_key")||"";
$("#lang").value=store("apc_lang")||"English";
const LANG=()=>$("#lang").value;
$("#save").onclick=()=>{store("apc_key",$("#key").value.trim());store("apc_lang",LANG());$("#saved").textContent="Saved in this browser."};
let img64=null;
function pickFile(e){const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{const im=new Image();im.onload=()=>{const m=1280,k=Math.min(1,m/Math.max(im.width,im.height));const c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);const u=c.toDataURL("image/jpeg",.85);img64=u.split(",")[1];$("#drop").innerHTML="";const p=new Image();p.src=u;p.alt="Selected plant photo";$("#drop").appendChild(p);$("#go").disabled=false};im.onerror=()=>{$("#drop").textContent="Could not read this image. Try a JPG or PNG."};im.src=r.result};
 r.readAsDataURL(f)}
$("#file").onchange=pickFile;$("#cam").onchange=pickFile;
$("#pick").onclick=()=>$("#file").click();$("#snap").onclick=()=>$("#cam").click();$("#drop").onclick=()=>$("#file").click();
async function claude(content,max){
 const key=store("apc_key")||DEFAULT_KEY;if(!key)throw new Error("Add your Gemini API key in Settings first.");
 const parts=typeof content==="string"?[{text:content}]:content.map(x=>x.type==="image"?{inline_data:{mime_type:"image/jpeg",data:x.source.data}}:{text:x.text});
 let r;try{r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{method:"POST",headers:{"content-type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{parts}],generationConfig:{maxOutputTokens:Math.max(max,2000)}})})}catch(e){throw new Error("No internet connection or request blocked.")}
 const d=await r.json().catch(()=>({}));
 if(!r.ok){const m=d.error&&d.error.message||"";throw new Error(r.status===400&&/key/i.test(m)?"Invalid API key. Check Settings.":r.status===429?"Free limit reached. Wait a minute and try again.":m||"Request failed ("+r.status+").")}
 const t=(d.candidates&&d.candidates[0]&&d.candidates[0].content&&d.candidates[0].content.parts||[]).map(x=>x.text||"").join("");
 if(!t)throw new Error("No answer came back. Please try again.");return t}
const li=a=>"<ul>"+(a||[]).map(x=>`<li>${esc(x)}</li>`).join("")+"</ul>";
let H=[];try{H=JSON.parse(store("apc_h")||"[]")}catch(e){}
function hist(){if(H.length)$("#hist").innerHTML=H.map(h=>`<div style="padding:6px 0;border-bottom:1px solid var(--bd)"><b>${esc(h.n)}</b> <span class="mu">· ${esc(h.c||"Unknown crop")} · ${esc(h.d)}</span></div>`).join("")}hist();
$("#go").onclick=async()=>{
 const o=$("#out"),b=$("#go"),crop=$("#crop").value;b.disabled=true;b.textContent="Analysing…";
 o.innerHTML='<div class="card mu">Analysing your photo… this can take a few seconds.</div>';
 try{
  const t=await claude([{type:"image",source:{type:"base64",media_type:"image/jpeg",data:img64}},{type:"text",text:`You are an expert plant pathologist. Examine this plant photo${crop?` (crop: ${crop})`:""}. Reply ONLY with JSON, no markdown: {"healthy":boolean,"crop":string,"problem":string,"type":"disease|pest|deficiency|stress|healthy|unclear","confidence":number 0-100,"symptoms":string,"causes":string,"organic":[string],"chemical":[string],"prevention":[string]}. If not a plant or unclear, set type "unclear" and explain in symptoms. Max 3 items per list. Write all string values in ${LANG()}. Chemical items must say to follow local label rules.`}],1000);
  const m=t.match(/\{[\s\S]*\}/);if(!m)throw new Error("The AI reply was unclear. Please try again.");
  const r=JSON.parse(m[0]);const bad=!r.healthy&&r.type!=="unclear";
  o.innerHTML=`<div class="card"><span class="tag ${bad?"bad":""}">${esc(r.type)}</span><h2 style="margin-top:8px">${esc(r.problem)}</h2><div class="mu">${esc(r.crop||"")}</div><div class="bar" style="margin:8px 0 2px"><i style="width:${+r.confidence||0}%"></i></div><div class="mu">Confidence ${+r.confidence||0}%</div><h3>Symptoms</h3>${esc(r.symptoms)}<h3>Cause</h3>${esc(r.causes)}<h3>Organic treatment</h3>${li(r.organic)}<h3>Chemical treatment</h3>${li(r.chemical)}<h3>Prevention</h3>${li(r.prevention)}</div>`;
  H.unshift({n:r.problem,c:r.crop||crop,d:new Date().toLocaleDateString()});H=H.slice(0,8);store("apc_h",JSON.stringify(H));hist();
 }catch(e){o.innerHTML=`<div class="card err">Could not diagnose. ${esc(e.message)}</div>`}
 b.disabled=false;b.textContent="Diagnose now"};
$("#ask").onclick=async()=>{
 const q=$("#qs").value.trim(),a=$("#ans");if(!q)return;a.classList.remove("err");a.textContent="Thinking…";
 try{a.textContent=await claude(`You are AI PLANT CARE, a friendly agronomist. Answer in under 180 words with practical steps in simple language. Suggest organic options first and remind to follow pesticide labels. Reply in ${LANG()}. Question: ${q}`,600)}
 catch(e){a.textContent="Could not answer. "+e.message;a.classList.add("err")}};

// ---- My crops
const STAGES=[[20,"Seedling","Keep soil moist, protect from pests, light weeding."],[60,"Vegetative growth","Top-dress nitrogen, weed, scout for pests every week."],[100,"Flowering / fruiting","Reduce nitrogen, ensure steady water, watch for fungal disease."],[999,"Maturity / harvest","Stop irrigation as advised, plan harvest and storage."]];
let MY=[];try{MY=JSON.parse(store("apc_my")||"[]")}catch(e){}
$("#md").valueAsDate=new Date();
function myc(){$("#mylist").innerHTML=MY.map((c,i)=>{const d=Math.max(0,Math.floor((Date.now()-new Date(c.d))/864e5)),s=STAGES.find(x=>d<=x[0]);return `<div class="card"><b>${esc(c.n)}</b> <span class="tag">Day ${d}</span><h3>${s[1]}</h3>${s[2]}<div class="row" style="margin:10px 0 0"><button class="btn sec" data-plan="${i}">AI crop plan</button><button class="btn sec" data-del="${i}">Remove</button></div><div class="msg" id="pl${i}"></div></div>`}).join("")||'<p class="mu">No crops yet. Add one above.</p>'}
myc();
$("#madd").onclick=()=>{MY.push({n:$("#mc").value,d:$("#md").value||new Date().toISOString().slice(0,10)});store("apc_my",JSON.stringify(MY));myc()};
$("#mylist").onclick=async e=>{const t=e.target;if(t.dataset.del!==undefined){MY.splice(+t.dataset.del,1);store("apc_my",JSON.stringify(MY));myc()}
 if(t.dataset.plan!==undefined){const i=+t.dataset.plan,c=MY[i],el=$("#pl"+i),d=Math.floor((Date.now()-new Date(c.d))/864e5);el.textContent="Thinking…";
 try{el.textContent=await claude(`Give a short care plan for the next 2 weeks for ${c.n} that is ${d} days after sowing: watering, fertiliser, pest and disease watch. Max 120 words. Reply in ${LANG()}.`,500)}catch(x){el.textContent="Could not create plan. "+x.message}}};
// ---- Weather
const WC={0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Cloudy",45:"Fog",51:"Drizzle",61:"Rain",63:"Rain",65:"Heavy rain",80:"Showers",95:"Thunderstorm"};
$("#wgo").onclick=()=>{const o=$("#wout");o.textContent="Finding your location…";
 if(!navigator.geolocation){o.textContent="Location is not supported on this device.";return}
 navigator.geolocation.getCurrentPosition(async p=>{try{
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=3&timezone=auto`;
  const w=await (await fetch(u)).json(),c=w.current,d=w.daily;let adv=[];
  if(c.wind_speed_10m>15)adv.push("Too windy to spray today.");if(d.precipitation_probability_max[0]>50)adv.push("Rain likely: delay spraying and fertiliser.");
  if(c.relative_humidity_2m>80&&c.temperature_2m>14&&c.temperature_2m<27)adv.push("High fungal disease risk (blight, mildew). Inspect crops.");
  if(c.temperature_2m>32)adv.push("Hot: irrigate in the evening, avoid midday spraying.");if(!adv.length)adv.push("Good conditions for field work and spraying (early morning is best).");
  o.innerHTML=`<b>Now:</b> ${c.temperature_2m}°C, ${WC[c.weather_code]||"—"}, humidity ${c.relative_humidity_2m}%, wind ${c.wind_speed_10m} km/h<br><br>`+d.time.map((t,i)=>`<b>${t}</b>: ${d.temperature_2m_min[i]}–${d.temperature_2m_max[i]}°C, ${WC[d.weather_code[i]]||"—"}, rain ${d.precipitation_probability_max[i]}%`).join("<br>")+`<h3>Farm advice</h3>`+adv.map(esc).join("<br>")}
  catch(e){o.textContent="Could not load weather. Check your internet connection."}},()=>{o.textContent="Location permission denied. Allow location access and try again."})};
// ---- Community
let CP=[];try{CP=JSON.parse(store("apc_cp")||"[]")}catch(e){}
function feed(){$("#cfeed").innerHTML=CP.map((p,i)=>`<div class="card"><b>${esc(p.q)}</b><div class="mu">${esc(p.d)}</div><div class="msg">${p.a?esc(p.a):""}</div><div class="row" style="margin:8px 0 0">${p.a?"":`<button class="btn sec" data-ans="${i}">Get expert answer</button>`}<button class="btn sec" data-cdel="${i}">Delete</button></div></div>`).join("")||'<p class="mu">No posts yet.</p>'}
feed();
$("#cpost").onclick=()=>{const q=$("#cq").value.trim();if(!q)return;CP.unshift({q,d:new Date().toLocaleString(),a:""});$("#cq").value="";store("apc_cp",JSON.stringify(CP));feed()};
$("#cfeed").onclick=async e=>{const t=e.target;if(t.dataset.cdel!==undefined){CP.splice(+t.dataset.cdel,1);store("apc_cp",JSON.stringify(CP));feed()}
 if(t.dataset.ans!==undefined){const p=CP[+t.dataset.ans];t.textContent="Thinking…";t.disabled=true;try{p.a=await claude(`You are an agronomist answering a farmer's community question. Under 150 words, practical, organic options first. Reply in ${LANG()}. Question: ${p.q}`,500);store("apc_cp",JSON.stringify(CP))}catch(x){p.a="Could not answer. "+x.message}feed()}};
// ---- Tools
const NPK={Tomato:[48,24,24],Potato:[50,25,40],Rice:[50,25,25],Wheat:[50,25,12],Maize:[48,24,16],Cotton:[40,20,20]};
$("#fgo").onclick=()=>{const a=parseFloat($("#fa").value);if(!(a>0)){$("#fout").textContent="Enter the area in acres.";return}
 const [n,p,k]=NPK[$("#fc").value],N=n*a,P=p*a,K=k*a,dap=P/.46,urea=Math.max(0,(N-dap*.18)/.46),mop=K/.6,f=x=>x.toFixed(1);
 $("#fout").innerHTML=`<b>Typical need for ${a} acre(s):</b> N ${f(N)} kg, P₂O₅ ${f(P)} kg, K₂O ${f(K)} kg<br><b>DAP:</b> ${f(dap)} kg<br><b>Urea:</b> ${f(urea)} kg<br><b>MOP:</b> ${f(mop)} kg<br><span class="mu">General guide only. Do a soil test and follow local recommendations. Split urea into 2–3 doses.</span>`};
$("#sgo").onclick=()=>{const d=parseFloat($("#sd").value),t=parseFloat($("#st").value);$("#sout").textContent=d>0&&t>0?`Add ${(d*t).toFixed(1)} ml or g of product to ${t} L of water. Always follow the label.`:"Enter dose and tank size."};
