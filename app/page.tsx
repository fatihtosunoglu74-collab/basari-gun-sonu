// v20260703-1930
"use client";
import { useState, useRef, useEffect } from "react";

const SB_URL="https://dqoreukmpkxmdputjigy.supabase.co";
const SB_KEY="sb_publishable_gKwtDDLun7O0UybI4R71cA_xMDT2DX8";
const TABLE="gun_sonu_raporlar";

async function sbSave(p:object):Promise<string|null>{try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}`,{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,Prefer:"return=representation"},body:JSON.stringify(p)});const d=await r.json();return d[0]?.id??null;}catch{return null;}}
async function sbUpdate(id:string,p:object):Promise<void>{try{await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}`,{method:"PATCH",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`},body:JSON.stringify(p)});}catch{}}
async function sbLoad(id:string):Promise<any>{try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}&select=*`,{headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}});const d=await r.json();return d[0]??null;}catch{return null;}}

interface YIRow{id:string;musteri:string;il:string;adet:string;cesit:string;kulvar:string;sevkSekli:string;karsilanmaOran:string;}
interface IHRow{id:string;musteri:string;ulke:string;ilkTarih:string;cikisTarih:string;sebep:string;sku:string;adet:string;}
interface MKRow{id:string;firma:string;depo:string;belgeNo:string;tarih:string;adet:string;cesit:string;durum:string;}
type Tab="yurtici"|"ihracat"|"malkabul";
type US="idle"|"loading"|"ok"|"err";

const uid=()=>Math.random().toString(36).slice(2,10);
const sv=(v:any)=>String(v??"").trim();
const ns=(v:any)=>{const n=parseFloat(sv(v));return isNaN(n)?"":String(Math.round(n));};
const fmtDate=(d:string)=>d?new Date(d).toLocaleDateString("tr-TR"):"—";
const fmtN=(v:string|number)=>{const n=parseInt(String(v));return isNaN(n)?"0":n.toLocaleString("tr-TR");};
const todayStr=()=>new Date().toISOString().split("T")[0];
function xlDate(v:any):string{if(!v&&v!==0)return"";const s=Math.floor(typeof v==="number"?v:parseFloat(sv(v)));if(isNaN(s)||s<1)return"";const d=new Date(Math.round((s-25569)*86400*1000));return`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;}
function parseTrDate(v:string):string{const m=v?.match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:todayStr();}
function calcTermin(sku:string,sebep=""):number{if(sebep.toUpperCase().includes("ELLEÇLEME"))return 7;const n=parseInt(sku)||0;if(n<=50)return 1;if(n<=100)return 2;if(n<=250)return 4;return 7;}
function calcStatus(row:Partial<IHRow>){
  const{ilkTarih,cikisTarih,sebep="",sku}=row;
  if(!ilkTarih||!sku)return null;
  const g=calcTermin(sku,sebep);
  const ilk=new Date(ilkTarih),son=new Date(ilk);son.setDate(ilk.getDate()+g);
  const today=new Date();today.setHours(0,0,0,0);
  const isG=sebep==="GÖNDERİLDİ"||!!cikisTarih;
  const cikis=cikisTarih?new Date(cikisTarih):today;
  if(isG)return cikis<=son?{d:"✅ ZAMANINDA ÇIKTI",c:"#16a34a"}:{d:"🔴 GEÇ ÇIKTI",c:"#dc2626"};
  return today<=son?{d:"🟡 TERMİN İÇİNDE",c:"#ca8a04"}:{d:"🔴 TERMİN AŞTI — ACİL",c:"#dc2626"};
}

const C={navy:"#0B2F78",navyDk:"#082A5B",pageBg:"#F8FAFD",white:"#FFFFFF",border:"#E3EAF3",green:"#22C55E",greenDk:"#16A34A",text:"#102A43",sub:"#6B7C93",amber:"#D68A1F",sh:"0 4px 20px rgba(16,42,67,0.07)"};

// Durum badge
function StatusBadge({label,color}:{label:string;color:string}){
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 12px",borderRadius:20,fontSize:13,fontWeight:800,background:color+"20",color:color,border:`1px solid ${color}40`}}>
      {label}
    </span>
  );
}

// Küçük etiket
function Tag({l,bg,c}:{l:string;bg:string;c:string}){
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:5,fontSize:12,fontWeight:700,background:bg,color:c,marginRight:4,marginBottom:3}}>{l}</span>;
}

// Upload şeridi — yüklenmeden önce dosya seç, yüklendikten sonra tek ince satır
function UploadBar({icon,label,st,msg,onPick}:{icon:string;label:string;st:US;msg:string;onPick:()=>void}){
  if(st==="ok"){
    return(
      <div onClick={onPick} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:9,cursor:"pointer"}}>
        <span style={{fontSize:15}}>✅</span>
        <span style={{fontSize:13,fontWeight:700,color:"#15803d",flex:1}}>{msg} yüklendi</span>
        <span style={{fontSize:12,color:C.sub}}>Değiştir →</span>
      </div>
    );
  }
  if(st==="err"){
    return(
      <div onClick={onPick} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#fef2f2",border:"1.5px solid #fca5a5",borderRadius:9,cursor:"pointer"}}>
        <span style={{fontSize:15}}>❌</span>
        <span style={{fontSize:13,fontWeight:700,color:"#dc2626",flex:1}}>{msg}</span>
        <span style={{fontSize:12,color:C.sub}}>Tekrar dene →</span>
      </div>
    );
  }
  if(st==="loading"){
    return(
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#f8fafd",border:`1.5px dashed ${C.border}`,borderRadius:9}}>
        <span style={{fontSize:15}}>⏳</span>
        <span style={{fontSize:13,fontWeight:700,color:C.sub}}>Yükleniyor...</span>
      </div>
    );
  }
  return(
    <div onClick={onPick} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#f8fafd",border:`1.5px dashed ${C.border}`,borderRadius:9,cursor:"pointer",transition:"border-color .15s"}}>
      <span style={{fontSize:20}}>{icon}</span>
      <div style={{flex:1}}>
        <span style={{fontSize:14,fontWeight:700,color:C.text}}>{label}</span>
        <span style={{fontSize:12,color:C.sub,marginLeft:8}}>.xlsx / .xls</span>
      </div>
      <button onClick={e=>{e.stopPropagation();onPick();}} style={{height:30,padding:"0 14px",border:`1px solid ${C.border}`,borderRadius:7,background:C.white,color:C.navy,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
        ☁️ Dosya Seç
      </button>
    </div>
  );
}

// Bildirimler
const NOTIFS=[
  {id:1,icon:"📋",text:"Yurtiçi İş Talepleri bekleniyor",time:"Bugün",unread:true},
  {id:2,icon:"✈️",text:"İhracat: 3 sipariş termin yaklaşıyor",time:"Bugün",unread:true},
  {id:3,icon:"📦",text:"Mal Kabul: 2 belge işlemde",time:"Dün",unread:false},
];

export default function App(){
  const [tab,setTab]=useState<Tab>("yurtici");
  const [yiSiparis,setYiSiparis]=useState("");
  const [yiFatura,setYiFatura]=useState("");
  const [yiRows,setYiRows]=useState<YIRow[]>([]);
  const [ihRows,setIhRows]=useState<IHRow[]>([]);
  const [mkRows,setMkRows]=useState<MKRow[]>([]);
  const [stYi,setStYi]=useState<US>("idle");const [msgYi,setMsgYi]=useState("");
  const [stIh,setStIh]=useState<US>("idle");const [msgIh,setMsgIh]=useState("");
  const [stIr,setStIr]=useState<US>("idle");const [msgIr,setMsgIr]=useState("");
  const refYi=useRef<HTMLInputElement>(null);
  const refIh=useRef<HTMLInputElement>(null);
  const refIr=useRef<HTMLInputElement>(null);
  const [raporId,setRaporId]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const [shareUrl,setShareUrl]=useState("");
  const [copied,setCopied]=useState(false);
  const [isView,setIsView]=useState(false);
  const [lastRefresh,setLastRefresh]=useState<Date|null>(null);
  const [showNotif,setShowNotif]=useState(false);
  const notifRef=useRef<HTMLDivElement>(null);

  const yiKalan=(parseInt(yiSiparis)||0)-(parseInt(yiFatura)||0);
  const longDate=new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});

  useEffect(()=>{
    function h(e:MouseEvent){if(notifRef.current&&!notifRef.current.contains(e.target as Node))setShowNotif(false);}
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);

  useEffect(()=>{
    const id=new URLSearchParams(window.location.search).get("rapor");
    if(id){setRaporId(id);setIsView(true);loadReport(id);const iv=setInterval(()=>loadReport(id).then(()=>setLastRefresh(new Date())),30000);return()=>clearInterval(iv);}
  // eslint-disable-next-line
  },[]);

  async function loadReport(id:string){const d=await sbLoad(id);if(d){setYiSiparis(String(d.yurtici_siparis??0));setYiFatura(String(d.yurtici_fatura??0));setYiRows(d.yurtici_rows??[]);setIhRows(d.ihracat_rows??[]);setMkRows(d.malkabul_rows??[]);setLastRefresh(new Date());}}

  async function handleSave(){
    setSaving(true);
    const p={tarih:todayStr(),yurtici_siparis:parseInt(yiSiparis)||0,yurtici_fatura:parseInt(yiFatura)||0,yurtici_rows:yiRows,ihracat_rows:ihRows,malkabul_rows:mkRows};
    let id=raporId;
    if(id){await sbUpdate(id,p);}
    else{id=await sbSave(p);if(id){setRaporId(id);const u=`${window.location.origin}?rapor=${id}`;setShareUrl(u);window.history.pushState({},"",`?rapor=${id}`);}}
    setSaving(false);
    if(id){const u=shareUrl||`${window.location.origin}?rapor=${id}`;window.open(`https://wa.me/?text=${encodeURIComponent(`📋 *GÜN SONU RAPORU — ${new Date().toLocaleDateString("tr-TR")}*\n\nCanlı rapor:\n${u}`)}`,"_blank");}
  }

  async function parseExcel(file:File,mode:"yi"|"ih"|"ir"){
    const setS=mode==="yi"?setStYi:mode==="ih"?setStIh:setStIr;
    const setM=mode==="yi"?setMsgYi:mode==="ih"?setMsgIh:setMsgIr;
    setS("loading");
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer());
      const ws=wb.Sheets["data"]??wb.Sheets[wb.SheetNames[0]];
      const raw:any[][]=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi=raw.findIndex(r=>r.some((c:any)=>sv(c)==="Müşteri"||sv(c)==="Firma"||sv(c)==="FİRMA"||sv(c).includes("MÜŞTERİ")));
      const hRow=hi>=0?raw[hi]:raw[0];
      const col=(k:string,k2=""):number=>hRow.findIndex((c:any)=>sv(c)===k||sv(c).includes(k)||(k2&&sv(c).includes(k2)));
      if(mode==="ir"){
        const iCnm=col("Cari İsmi"),iDep=col("Depo"),iBno=col("BelgeNo"),iTar=col("Tarih"),iAdt=col("Adet"),iCes=col("Çeşit"),iDur=col("Durum");
        const rows:MKRow[]=[];
        for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
          const r=raw[i];const fir=sv(iCnm>=0?r[iCnm]:r[6]);if(!fir)continue;
          const raw2=sv(iDur>=0?r[iDur]:r[9]);
          rows.push({id:uid(),firma:fir,depo:sv(iDep>=0?r[iDep]:r[1])||"TEM.34",belgeNo:sv(iBno>=0?r[iBno]:r[2]),tarih:xlDate(iTar>=0?r[iTar]:r[4])||todayStr(),adet:ns(iAdt>=0?r[iAdt]:r[7]),cesit:ns(iCes>=0?r[iCes]:r[8]),durum:raw2==="Başlamadı"?"BAŞLAMADI":raw2==="İşlemde"?"İŞLEMDE":raw2==="Tamamlandı"?"TAMAMLANDI":raw2||"BAŞLAMADI"});
        }
        setMkRows(rows);const tot=rows.reduce((s,r)=>s+(parseInt(r.adet)||0),0);setM(`${rows.length} belge · ${tot.toLocaleString("tr-TR")} adet`);setTab("malkabul");
      } else if(mode==="yi"){
        const iMus=col("Müşteri","MÜŞTERİ"),iIl=col("İl"),iAdt=col("Adet","ADET"),iCes=col("Çeşit","SKU"),iKul=col("Kulvar"),iSev=col("Sevk"),iKar=col("Karşılan");
        const rows:YIRow[]=[];
        for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
          const r=raw[i];const mus=sv(iMus>=0?r[iMus]:r[3]);if(!mus)continue;
          rows.push({id:uid(),musteri:mus,il:sv(iIl>=0?r[iIl]:r[4]),adet:ns(iAdt>=0?r[iAdt]:r[6]),cesit:ns(iCes>=0?r[iCes]:r[7]),kulvar:sv(iKul>=0?r[iKul]:r[8]),sevkSekli:sv(iSev>=0?r[iSev]:r[9]),karsilanmaOran:sv(iKar>=0?r[iKar]:r[10])});
        }
        setYiRows(rows);setYiFatura(String(rows.length));setM(`${rows.length} sipariş`);setTab("yurtici");
      } else {
        const iMus=col("Müşteri","MÜŞTERİ"),iIl=col("İl","ÜLKE"),iTar=col("Tarih","TARİH"),iAdt=col("Adet","ADET"),iCes=col("Çeşit","SKU");
        const rows:IHRow[]=[];
        for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
          const r=raw[i];const mus=sv(iMus>=0?r[iMus]:r[3]);if(!mus)continue;
          rows.push({id:uid(),musteri:mus,ulke:sv(iIl>=0?r[iIl]:r[4]),ilkTarih:parseTrDate(sv(iTar>=0?r[iTar]:r[2])),cikisTarih:"",sebep:"",sku:ns(iCes>=0?r[iCes]:r[7]),adet:ns(iAdt>=0?r[iAdt]:r[6])});
        }
        setIhRows(r=>[...r,...rows]);setM(`${rows.length} sipariş`);setTab("ihracat");
      }
      setS("ok");
    }catch(e){setM("Dosya okunamadı");setS("err");}
  }

  // ─── LAYOUT ───────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:C.pageBg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif",color:C.text,overflowX:"hidden",position:"relative"}}>
      {/* Arka plan */}
      <div style={{position:"fixed",inset:0,zIndex:0,backgroundImage:"url('/background-logistics.jpg')",backgroundSize:"cover",backgroundPosition:"center",opacity:0.04}}/>
      <div style={{position:"fixed",inset:0,zIndex:1,background:"linear-gradient(135deg,rgba(248,250,253,0.98),rgba(234,243,255,0.95),rgba(248,250,253,0.97))"}}/>

      {/* HEADER */}
      <header style={{height:88,background:"rgba(255,255,255,0.98)",borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 12px rgba(11,47,120,0.05)",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1320,margin:"0 auto",height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px",boxSizing:"border-box"}}>
          <div style={{display:"flex",alignItems:"center",gap:22}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full-color.png" alt="Başarı Otomotiv" style={{height:50,width:"auto",objectFit:"contain"}}/>
            <div style={{width:1,height:40,background:C.border}}/>
            <div style={{display:"flex",alignItems:"center",gap:9,fontSize:19,fontWeight:700}}>
              <span>📅</span><span>Gün Sonu İzleme</span>
              <span style={{color:C.border}}>•</span>
              <span style={{color:C.amber,fontWeight:800}}>{longDate}</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {raporId&&<span style={{fontSize:12,fontWeight:700,color:C.greenDk,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:20,padding:"4px 12px"}}>🟢 Canlı</span>}
            {/* Çan */}
            <div ref={notifRef} style={{position:"relative"}}>
              <div onClick={()=>setShowNotif(v=>!v)} style={{width:42,height:42,borderRadius:"50%",border:`1px solid ${C.border}`,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",position:"relative"}}>
                🔔
                <span style={{position:"absolute",top:-5,right:-4,width:19,height:19,borderRadius:"50%",background:"#F59E0B",color:C.white,fontSize:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>2</span>
              </div>
              {showNotif&&(
                <div style={{position:"absolute",top:52,right:0,width:300,background:C.white,border:`1px solid ${C.border}`,borderRadius:14,boxShadow:"0 20px 50px rgba(16,42,67,0.14)",zIndex:200,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:800,fontSize:14}}>Bildirimler</span>
                    <span style={{fontSize:12,color:C.sub}}>2 yeni</span>
                  </div>
                  {NOTIFS.map(n=>(
                    <div key={n.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,background:n.unread?"#FAFBFF":C.white,display:"flex",gap:10,alignItems:"flex-start"}}>
                      <span style={{fontSize:18}}>{n.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:n.unread?700:500,color:C.text}}>{n.text}</div>
                        <div style={{fontSize:11,color:C.sub,marginTop:2}}>{n.time}</div>
                      </div>
                      {n.unread&&<span style={{width:7,height:7,borderRadius:"50%",background:C.navy,marginTop:4,flexShrink:0,display:"block"}}/>}
                    </div>
                  ))}
                  <div style={{padding:"8px 16px",textAlign:"center"}}>
                    <button onClick={()=>setShowNotif(false)} style={{border:"none",background:"none",color:C.navy,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Kapat</button>
                  </div>
                </div>
              )}
            </div>
            <div style={{width:42,height:42,borderRadius:"50%",border:`1px solid ${C.border}`,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",color:C.text}}>?</div>
            <div style={{width:44,height:44,borderRadius:"50%",border:`1px solid ${C.border}`,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,cursor:"pointer",color:C.text}}>BO</div>
            <span style={{color:C.sub,fontWeight:900,fontSize:15,cursor:"pointer"}}>⌄</span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main style={{position:"relative",zIndex:2,paddingTop:28,paddingBottom:80}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 40px",boxSizing:"border-box"}}>

          {/* Canlı / Paylaşım */}
          {isView&&(
            <div style={{maxWidth:820,margin:"0 auto 16px",background:"#f0fdf4",border:"1px solid #c6f6d5",borderRadius:10,padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13,fontWeight:700,color:C.greenDk}}>🔄 Otomatik güncelleniyor{lastRefresh&&` · ${lastRefresh.toLocaleTimeString("tr-TR")}`}</span>
              <button onClick={()=>raporId&&loadReport(raporId)} style={{border:"1px solid #86efac",borderRadius:7,background:C.white,color:C.greenDk,padding:"3px 10px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>↺ Yenile</button>
            </div>
          )}
          {shareUrl&&(
            <div style={{maxWidth:820,margin:"0 auto 16px",background:"#eff9ff",border:"1px solid #bae0fc",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span>🔗</span>
              <span style={{fontSize:12,color:C.sub,flex:1,fontFamily:"monospace",wordBreak:"break-all"}}>{shareUrl}</span>
              <button onClick={async()=>{await navigator.clipboard.writeText(shareUrl);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{border:"1px solid #bae0fc",borderRadius:7,background:C.white,color:C.navy,padding:"4px 10px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{copied?"✅ Kopyalandı":"📋 Kopyala"}</button>
            </div>
          )}

          {/* SEKMELER */}
          <div style={{maxWidth:1160,margin:"0 auto 20px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 175px",gap:16,height:66}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:C.white,border:`1px solid ${C.border}`,borderRadius:15,boxShadow:C.sh,overflow:"hidden",height:66}}>
                {([["yurtici","🚚","Yurtiçi"],["ihracat","🌐","İhracat"],["malkabul","📦","Mal Kabul"]] as const).map(([k,ic,lb])=>(
                  <button key={k} onClick={()=>setTab(k as Tab)}
                    style={{border:"none",background:tab===k?C.navyDk:"transparent",fontSize:15,fontWeight:700,color:tab===k?C.white:C.sub,display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",position:"relative",fontFamily:"inherit",height:"100%"}}>
                    <span style={{fontSize:19}}>{ic}</span>{lb}
                    {tab===k&&<span style={{position:"absolute",bottom:-8,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:`8px solid ${C.navyDk}`}}/>}
                  </button>
                ))}
              </div>
              <button onClick={handleSave} disabled={saving} style={{height:66,border:"none",borderRadius:15,background:`linear-gradient(135deg,${C.green},${C.greenDk})`,color:C.white,fontSize:15,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 10px 20px rgba(22,163,74,0.22)",cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{fontSize:18}}>{saving?"⏳":"💾"}</span>{saving?"Kaydediliyor...":"Kaydet ve Paylaş"}
              </button>
            </div>
          </div>

          {/* UPLOAD — ince şerit */}
          {tab==="yurtici"&&(
            <div style={{maxWidth:820,margin:"0 auto 16px",background:C.white,border:`1px solid ${C.border}`,borderRadius:13,boxShadow:C.sh,padding:"14px 18px"}}>
              <div style={{fontSize:12,fontWeight:800,color:C.navy,letterSpacing:.5,marginBottom:10,textTransform:"uppercase"}}>☁️ Yurtiçi — Zeus Excel Yükleme</div>
              <UploadBar icon="📋" label="Yurtiçi İş Talepleri" st={stYi} msg={msgYi} onPick={()=>refYi.current?.click()}/>
            </div>
          )}
          {tab==="ihracat"&&(
            <div style={{maxWidth:820,margin:"0 auto 16px",background:C.white,border:`1px solid ${C.border}`,borderRadius:13,boxShadow:C.sh,padding:"14px 18px"}}>
              <div style={{fontSize:12,fontWeight:800,color:C.navy,letterSpacing:.5,marginBottom:10,textTransform:"uppercase"}}>☁️ İhracat — Zeus Excel Yükleme</div>
              <UploadBar icon="🌐" label="İhracat İş Talepleri" st={stIh} msg={msgIh} onPick={()=>refIh.current?.click()}/>
            </div>
          )}
          {tab==="malkabul"&&(
            <div style={{maxWidth:820,margin:"0 auto 16px",background:C.white,border:`1px solid ${C.border}`,borderRadius:13,boxShadow:C.sh,padding:"14px 18px"}}>
              <div style={{fontSize:12,fontWeight:800,color:C.navy,letterSpacing:.5,marginBottom:10,textTransform:"uppercase"}}>☁️ Mal Kabul — Zeus Excel Yükleme</div>
              <UploadBar icon="📦" label="Mal Kabul Exceli" st={stIr} msg={msgIr} onPick={()=>refIr.current?.click()}/>
            </div>
          )}

          {/* ─── YURTİÇİ ─── */}
          {tab==="yurtici"&&<>
            {/* Sayaçlar */}
            <div style={{maxWidth:820,margin:"0 auto 16px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:13,boxShadow:C.sh,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:12,background:"#EAF3FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📋</div>
                <div>
                  <div style={{fontSize:12,color:C.sub,fontWeight:600,marginBottom:2}}>Sipariş Sayısı</div>
                  <input type="number" value={yiSiparis} onChange={e=>setYiSiparis(e.target.value)} placeholder="0"
                    style={{fontSize:34,fontWeight:900,color:C.text,border:"none",outline:"none",background:"transparent",width:80,fontFamily:"inherit"}}/>
                </div>
              </div>
              <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:13,boxShadow:C.sh,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:12,background:"#F3EEFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🧾</div>
                <div>
                  <div style={{fontSize:12,color:C.sub,fontWeight:600,marginBottom:2}}>Faturalanan</div>
                  <input type="number" value={yiFatura} onChange={e=>setYiFatura(e.target.value)} placeholder="0"
                    style={{fontSize:34,fontWeight:900,color:C.text,border:"none",outline:"none",background:"transparent",width:80,fontFamily:"inherit"}}/>
                </div>
              </div>
              <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:13,boxShadow:C.sh,padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:12,background:"#EDFAF2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:C.greenDk}}>✓</div>
                <div>
                  <div style={{fontSize:12,color:C.sub,fontWeight:600,marginBottom:2}}>Kalan</div>
                  <div style={{fontSize:34,fontWeight:900,color:yiKalan>0?"#dc2626":C.greenDk,lineHeight:1}}>{yiKalan}</div>
                </div>
              </div>
            </div>

            {/* Sipariş listesi */}
            {yiRows.length===0?(
              <div style={{maxWidth:820,margin:"0 auto",background:C.white,border:`1px solid ${C.border}`,borderRadius:13,padding:"24px",textAlign:"center",color:C.sub,fontSize:14}}>
                Excel yüklendikten sonra siparişler burada listelenir
              </div>
            ):<>
              <div style={{maxWidth:820,margin:"0 auto 10px",background:"#EAF3FF",border:`1px solid #C8DFF8`,borderRadius:10,padding:"8px 16px",display:"flex",gap:20}}>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>📊 {yiRows.length} sipariş</span>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>📦 {yiRows.reduce((s,r)=>s+(parseInt(r.adet)||0),0).toLocaleString("tr-TR")} adet</span>
              </div>
              {yiRows.map(r=>(
                <div key={r.id} style={{maxWidth:820,margin:"0 auto 8px",background:C.white,border:`1px solid ${C.border}`,borderRadius:11,boxShadow:C.sh,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:15,color:C.text,marginBottom:5}}>{r.musteri}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:0}}>
                      {r.il&&<Tag l={r.il} bg="#EAF3FF" c={C.navy}/>}
                      {r.kulvar&&<Tag l={r.kulvar} bg="#FEF3C7" c="#92400E"/>}
                      {r.adet&&<Tag l={`${fmtN(r.adet)} Adet`} bg="#EDFAF2" c={C.greenDk}/>}
                      {r.cesit&&<Tag l={`${r.cesit} Çeşit`} bg="#EDFAF2" c={C.greenDk}/>}
                      {r.sevkSekli&&<Tag l={r.sevkSekli} bg="#F3EEFF" c="#7C3AED"/>}
                      {r.karsilanmaOran&&<Tag l={`%${r.karsilanmaOran}`} bg={parseFloat(r.karsilanmaOran)>=100?"#EDFAF2":"#FEF9EC"} c={parseFloat(r.karsilanmaOran)>=100?C.greenDk:"#B45309"}/>}
                    </div>
                  </div>
                  <button onClick={()=>setYiRows(rs=>rs.filter(x=>x.id!==r.id))} style={{width:26,height:26,border:"none",borderRadius:6,background:"#FEF2F2",color:"#ef4444",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
                </div>
              ))}
            </>}
          </>}

          {/* ─── İHRACAT ─── */}
          {tab==="ihracat"&&<>
            {ihRows.length===0?(
              <div style={{maxWidth:820,margin:"0 auto",background:C.white,border:`1px solid ${C.border}`,borderRadius:13,padding:"24px",textAlign:"center",color:C.sub,fontSize:14}}>
                Excel yüklendikten sonra ihracat siparişleri burada listelenir
              </div>
            ):<>
              <div style={{maxWidth:820,margin:"0 auto 10px",background:"#EAF3FF",border:`1px solid #C8DFF8`,borderRadius:10,padding:"8px 16px",display:"flex",gap:20}}>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>✈️ {ihRows.length} sipariş</span>
                <span style={{fontSize:13,fontWeight:700,color:"#dc2626"}}>🔴 Acil: {ihRows.filter(r=>{const s=calcStatus(r);return s?.d.includes("ACİL");}).length}</span>
              </div>
              {ihRows.map(r=>{
                const s=calcStatus(r);
                return(
                  <div key={r.id} style={{maxWidth:820,margin:"0 auto 8px",background:C.white,border:`1px solid ${C.border}`,borderLeft:`3px solid ${s?.c||C.border}`,borderRadius:11,boxShadow:C.sh,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{fontWeight:800,fontSize:15,color:C.text}}>{r.musteri}</span>
                        {r.ulke&&<Tag l={r.ulke} bg="#F1F5F9" c="#475569"/>}
                      </div>
                      {/* Termin durumu — yeşil/sarı/kırmızı belirgin badge */}
                      {s&&<StatusBadge label={s.d} color={s.c}/>}
                      <div style={{display:"flex",flexWrap:"wrap",gap:0,marginTop:6}}>
                        {r.sku&&<Tag l={`${r.sku} SKU`} bg="#EAF3FF" c={C.navy}/>}
                        {r.adet&&<Tag l={`${fmtN(r.adet)} Adet`} bg="#EAF3FF" c={C.navy}/>}
                        {r.ilkTarih&&<Tag l={`Sipariş: ${fmtDate(r.ilkTarih)}`} bg="#F8FAFD" c={C.sub}/>}
                      </div>
                      {!r.cikisTarih&&(
                        <button onClick={()=>setIhRows(rs=>rs.map(x=>x.id===r.id?{...x,sebep:"GÖNDERİLDİ",cikisTarih:todayStr()}:x))}
                          style={{marginTop:6,border:"none",background:"none",color:C.greenDk,fontSize:12,fontWeight:800,cursor:"pointer",padding:0,fontFamily:"inherit"}}>
                          ✓ Gönderildi olarak işaretle
                        </button>
                      )}
                    </div>
                    <button onClick={()=>setIhRows(rs=>rs.filter(x=>x.id!==r.id))} style={{width:26,height:26,border:"none",borderRadius:6,background:"#FEF2F2",color:"#ef4444",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
                  </div>
                );
              })}
            </>}
          </>}

          {/* ─── MAL KABUL ─── */}
          {tab==="malkabul"&&<>
            {mkRows.length===0?(
              <div style={{maxWidth:820,margin:"0 auto",background:C.white,border:`1px solid ${C.border}`,borderRadius:13,padding:"24px",textAlign:"center",color:C.sub,fontSize:14}}>
                Excel yüklendikten sonra mal kabul kayıtları burada listelenir
              </div>
            ):<>
              <div style={{maxWidth:820,margin:"0 auto 10px",background:"#EAF3FF",border:`1px solid #C8DFF8`,borderRadius:10,padding:"8px 16px",display:"flex",gap:20}}>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>📦 {mkRows.length} belge</span>
                <span style={{fontSize:13,fontWeight:700,color:C.greenDk}}>✓ Tamamlanan: {mkRows.filter(r=>r.durum==="TAMAMLANDI").length}</span>
                <span style={{fontSize:13,fontWeight:700,color:"#ca8a04"}}>⏳ İşlemde: {mkRows.filter(r=>r.durum==="İŞLEMDE").length}</span>
                <span style={{fontSize:13,fontWeight:700,color:"#dc2626"}}>🔴 Başlamadı: {mkRows.filter(r=>r.durum==="BAŞLAMADI").length}</span>
              </div>
              {mkRows.map(r=>{
                // BAŞLAMADI → kırmızı, İŞLEMDE → sarı, TAMAMLANDI → yeşil
                const dc=r.durum==="TAMAMLANDI"?C.greenDk:r.durum==="İŞLEMDE"?"#ca8a04":"#dc2626";
                return(
                  <div key={r.id} style={{maxWidth:820,margin:"0 auto 8px",background:C.white,border:`1px solid ${C.border}`,borderLeft:`3px solid ${dc}`,borderRadius:11,boxShadow:C.sh,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,fontSize:15,color:C.text,marginBottom:6}}>{r.firma}</div>
                      {/* Durum badge — belirgin */}
                      <StatusBadge label={r.durum} color={dc}/>
                      <div style={{display:"flex",flexWrap:"wrap",gap:0,marginTop:6}}>
                        <Tag l={r.depo} bg="#F1F5F9" c="#475569"/>
                        {r.adet&&<Tag l={`${fmtN(r.adet)} Adet`} bg="#EAF3FF" c={C.navy}/>}
                        {r.cesit&&<Tag l={`${r.cesit} Çeşit`} bg="#EAF3FF" c={C.navy}/>}
                        {r.tarih&&<Tag l={fmtDate(r.tarih)} bg="#F8FAFD" c={C.sub}/>}
                        {r.belgeNo&&<Tag l={r.belgeNo} bg="#F8FAFD" c={C.sub}/>}
                      </div>
                    </div>
                    <button onClick={()=>setMkRows(rs=>rs.filter(x=>x.id!==r.id))} style={{width:26,height:26,border:"none",borderRadius:6,background:"#FEF2F2",color:"#ef4444",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
                  </div>
                );
              })}
            </>}
          </>}

        </div>
      </main>

      <input ref={refYi} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"yi");e.target.value="";}}/>
      <input ref={refIh} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"ih");e.target.value="";}}/>
      <input ref={refIr} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"ir");e.target.value="";}}/>
    </div>
  );
}
