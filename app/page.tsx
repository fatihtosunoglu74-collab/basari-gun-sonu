"use client";
import { useState, useRef, useEffect } from "react";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SB_URL = "https://dqoreukmpkxmdputjigy.supabase.co";
const SB_KEY = "sb_publishable_gKwtDDLun7O0UybI4R71cA_xMDT2DX8";
const TABLE  = "gun_sonu_raporlar";

async function sbSave(p:object):Promise<string|null>{
  try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}`,{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,Prefer:"return=representation"},body:JSON.stringify(p)});const d=await r.json();return d[0]?.id??null;}catch{return null;}
}
async function sbUpdate(id:string,p:object):Promise<void>{
  try{await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}`,{method:"PATCH",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`},body:JSON.stringify(p)});}catch{}
}
async function sbLoad(id:string):Promise<any>{
  try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}&select=*`,{headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}});const d=await r.json();return d[0]??null;}catch{return null;}
}

// ─── Tipler & Yardımcılar ─────────────────────────────────────────────────────
interface YIRow{id:string;musteri:string;sebep:string;sku:string;adet:string;}
interface IHRow{id:string;musteri:string;ulke:string;ilkTarih:string;cikisTarih:string;sebep:string;sku:string;adet:string;}
interface MKRow{id:string;firma:string;depo:string;belgeNo:string;belgeNo2:string;tarih:string;adet:string;cesit:string;durum:string;}
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
function calcStatus(row:Partial<IHRow>){const{ilkTarih,cikisTarih,sebep="",sku}=row;if(!ilkTarih||!sku)return null;const g=calcTermin(sku,sebep);const ilk=new Date(ilkTarih),son=new Date(ilk);son.setDate(ilk.getDate()+g);const today=new Date();today.setHours(0,0,0,0);const isG=sebep==="GÖNDERİLDİ"||!!cikisTarih;const cikis=cikisTarih?new Date(cikisTarih):today;if(isG)return cikis<=son?{d:"ZAMANINDA ÇIKTI",c:"#16a34a"}:{d:"GEÇ ÇIKTI",c:"#dc2626"};return today<=son?{d:"TERMİN İÇİNDE",c:"#d97706"}:{d:"TERMİN AŞTI — ACİL",c:"#dc2626"};}

// ─── Renkler ──────────────────────────────────────────────────────────────────
const C={navy:"#0B2F78",navyDk:"#082A5B",blue50:"#EAF3FF",pageBg:"#F8FAFD",white:"#FFFFFF",border:"#E3EAF3",green:"#22C55E",greenDk:"#16A34A",text:"#102A43",sub:"#6B7C93",amber:"#D68A1F",shadow:"0 10px 30px rgba(16,42,67,0.08)",shadowMd:"0 16px 40px rgba(16,42,67,0.11)"};

// ─── Upload Kutusu ────────────────────────────────────────────────────────────
function UpBox({icon,title,st,msg,onPick}:{icon:string;title:string;st:US;msg:string;onPick:()=>void}){
  const ok=st==="ok",err=st==="err",loading=st==="loading";
  const btn:React.CSSProperties={height:38,padding:"0 24px",border:`1px solid ${C.border}`,borderRadius:12,background:C.white,color:C.navy,fontSize:14,fontWeight:800,display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontFamily:"inherit"};
  return(
    <div onClick={onPick} style={{border:`2px dashed ${ok?"#86efac":err?"#fca5a5":loading?"#e2e8f0":C.border}`,borderRadius:16,padding:"36px 24px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.blue50,cursor:"pointer",gap:4,textAlign:"center",transition:"border-color 0.2s"}}>
      <div style={{fontSize:42,lineHeight:1,marginBottom:12,color:ok?"#16a34a":err?"#dc2626":"#B97D0F"}}>{ok?"✅":err?"❌":loading?"⏳":icon}</div>
      <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:4}}>{ok||err?msg:title}</div>
      {!ok&&!err&&<div style={{fontSize:13,fontWeight:600,color:C.sub,marginBottom:16}}>.xlsx / .xls</div>}
      {!ok&&!err&&!loading&&<button style={btn} onClick={e=>{e.stopPropagation();onPick();}}>☁️ Dosya Seç</button>}
    </div>
  );
}

// ─── Veri Satırı ─────────────────────────────────────────────────────────────
function DataRow({left,right,onDel}:{left:React.ReactNode;right?:React.ReactNode;onDel:()=>void}){
  return(
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,boxShadow:C.shadow,padding:"14px 20px",marginBottom:10,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
      <div style={{flex:1}}>{left}</div>
      {right}
      <button onClick={onDel} style={{width:30,height:30,border:"none",borderRadius:6,background:"#FEF2F2",color:"#ef4444",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
    </div>
  );
}

function Tag({label,bg,color}:{label:string;bg:string;color:string}){
  return <span style={{borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700,display:"inline-block",background:bg,color}}>{label}</span>;
}

// ─── ANA SAYFA ────────────────────────────────────────────────────────────────
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

  const yiKalan=(parseInt(yiSiparis)||0)-(parseInt(yiFatura)||0);
  const longDate=new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});

  useEffect(()=>{
    const id=new URLSearchParams(window.location.search).get("rapor");
    if(id){setRaporId(id);setIsView(true);loadReport(id);const iv=setInterval(()=>loadReport(id).then(()=>setLastRefresh(new Date())),30000);return()=>clearInterval(iv);}
  // eslint-disable-next-line
  },[]);

  async function loadReport(id:string){
    const d=await sbLoad(id);
    if(d){setYiSiparis(String(d.yurtici_siparis??0));setYiFatura(String(d.yurtici_fatura??0));setYiRows(d.yurtici_rows??[]);setIhRows(d.ihracat_rows??[]);setMkRows(d.malkabul_rows??[]);setLastRefresh(new Date());}
  }

  function buildPayload(){return{tarih:todayStr(),yurtici_siparis:parseInt(yiSiparis)||0,yurtici_fatura:parseInt(yiFatura)||0,yurtici_rows:yiRows,ihracat_rows:ihRows,malkabul_rows:mkRows};}

  async function handleSave(){
    setSaving(true);
    let id=raporId;
    if(id){await sbUpdate(id,buildPayload());}
    else{id=await sbSave(buildPayload());if(id){setRaporId(id);const u=`${window.location.origin}?rapor=${id}`;setShareUrl(u);window.history.pushState({},"",`?rapor=${id}`);}}
    setSaving(false);
    if(id){const u=shareUrl||`${window.location.origin}?rapor=${id}`;const d=new Date().toLocaleDateString("tr-TR");window.open(`https://wa.me/?text=${encodeURIComponent(`📋 *GÜN SONU RAPORU — ${d}*\n\nCanlı rapor:\n${u}`)}`,"_blank");}
  }

  async function copyLink(){if(shareUrl){await navigator.clipboard.writeText(shareUrl);setCopied(true);setTimeout(()=>setCopied(false),2000);}}

  async function parseExcel(file:File,mode:"yi"|"ih"|"ir"){
    const setS=mode==="yi"?setStYi:mode==="ih"?setStIh:setStIr;
    const setM=mode==="yi"?setMsgYi:mode==="ih"?setMsgIh:setMsgIr;
    setS("loading");
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer());
      const ws=wb.Sheets["data"]??wb.Sheets[wb.SheetNames[0]];
      const data:any[][]=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      if(mode==="ir"){
        const hi=data.findIndex(r=>r.some((c:any)=>sv(c)==="Firma"||sv(c)==="FİRMA"));
        const hRow=hi>=0?data[hi]:data[0];
        const iDep=hRow.findIndex((c:any)=>sv(c)==="Depo");const iBno=hRow.findIndex((c:any)=>sv(c)==="BelgeNo");const iBn2=hRow.findIndex((c:any)=>sv(c)==="BelgeNo2");const iTar=hRow.findIndex((c:any)=>sv(c)==="Tarih");const iCnm=hRow.findIndex((c:any)=>sv(c).includes("Cari İsmi"));const iAdt=hRow.findIndex((c:any)=>sv(c)==="Adet");const iCes=hRow.findIndex((c:any)=>sv(c)==="Çeşit");const iDur=hRow.findIndex((c:any)=>sv(c)==="Durum");
        const rows:MKRow[]=[];
        for(let i=(hi>=0?hi+1:1);i<data.length;i++){const r=data[i];const fir=sv(iCnm>=0?r[iCnm]:r[6]);if(!fir)continue;const raw=sv(iDur>=0?r[iDur]:r[9]);rows.push({id:uid(),firma:fir,depo:sv(iDep>=0?r[iDep]:r[1])||"TEM.34",belgeNo:sv(iBno>=0?r[iBno]:r[2]),belgeNo2:sv(iBn2>=0?r[iBn2]:r[3]),tarih:xlDate(iTar>=0?r[iTar]:r[4])||todayStr(),adet:ns(iAdt>=0?r[iAdt]:r[7]),cesit:ns(iCes>=0?r[iCes]:r[8]),durum:raw==="Başlamadı"?"BAŞLAMADI":raw==="İşlemde"?"İŞLEMDE":raw==="Tamamlandı"?"TAMAMLANDI":raw||"BAŞLAMADI"});}
        setMkRows(rows);const tot=rows.reduce((s,r)=>s+(parseInt(r.adet)||0),0);setM(`${rows.length} belge · ${tot.toLocaleString("tr-TR")} adet`);setTab("malkabul");
      } else {
        const hi=data.findIndex(r=>r.some((c:any)=>sv(c)==="Müşteri"||sv(c).includes("MÜŞTERİ")));
        const hRow=hi>=0?data[hi]:data[0];
        const iMus=hRow.findIndex((c:any)=>sv(c)==="Müşteri"||sv(c).includes("MÜŞTERİ"));const iIl=hRow.findIndex((c:any)=>sv(c)==="İl"||sv(c)==="ÜLKE");const iTar=hRow.findIndex((c:any)=>sv(c).includes("Tarih")||sv(c).includes("TARİH"));const iAdt=hRow.findIndex((c:any)=>sv(c)==="Adet"||sv(c)==="ADET");const iCes=hRow.findIndex((c:any)=>sv(c)==="Çeşit"||sv(c)==="SKU");
        if(mode==="yi"){
          let count=0;
          for(let i=(hi>=0?hi+1:1);i<data.length;i++){const r=data[i];const mus=sv(iMus>=0?r[iMus]:r[3]);if(!mus)continue;count++;}
          setYiFatura(String(count));setM(`${count} fatura`);setTab("yurtici");
        } else {
          const rows:IHRow[]=[];
          for(let i=(hi>=0?hi+1:1);i<data.length;i++){const r=data[i];const mus=sv(iMus>=0?r[iMus]:r[3]);if(!mus)continue;rows.push({id:uid(),musteri:mus,ulke:sv(iIl>=0?r[iIl]:r[4]),ilkTarih:parseTrDate(sv(iTar>=0?r[iTar]:r[2])),cikisTarih:"",sebep:"",sku:ns(iCes>=0?r[iCes]:r[7]),adet:ns(iAdt>=0?r[iAdt]:r[6])});}
          setIhRows(r=>[...r,...rows]);setM(`${rows.length} sipariş`);setTab("ihracat");
        }
      }
      setS("ok");
    }catch(e){setM("Dosya okunamadı");setS("err");}
  }

  // ─── Stiller ─────────────────────────────────────────────────────────────
  const S:Record<string,React.CSSProperties>={
    page:{minHeight:"100vh",width:"100%",background:C.pageBg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif",color:C.text,overflowX:"hidden"},
    bgImg:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:0,backgroundImage:"url('/background-logistics.jpg')",backgroundSize:"cover",backgroundPosition:"center",opacity:0.05},
    bgOvl:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:1,background:"linear-gradient(135deg,rgba(248,250,253,0.97) 0%,rgba(234,243,255,0.94) 50%,rgba(248,250,253,0.96) 100%)"},
    header:{height:90,background:"rgba(255,255,255,0.98)",borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 12px rgba(11,47,120,0.05)",position:"sticky",top:0,zIndex:100},
    hInner:{maxWidth:1320,margin:"0 auto",height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px",boxSizing:"border-box"},
    hLeft:{display:"flex",alignItems:"center",gap:24},
    logo:{height:52,width:"auto",objectFit:"contain"},
    hDiv:{width:1,height:44,background:C.border,flexShrink:0},
    hTitle:{display:"flex",alignItems:"center",gap:10,fontSize:20,fontWeight:700,color:C.text},
    hDate:{color:C.amber,fontWeight:800},
    hRight:{display:"flex",alignItems:"center",gap:12},
    ico:{width:44,height:44,borderRadius:"50%",border:`1px solid ${C.border}`,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,cursor:"pointer",position:"relative",color:C.text,fontWeight:700},
    badge:{position:"absolute",top:-6,right:-4,width:20,height:20,borderRadius:"50%",background:"#F59E0B",color:C.white,fontSize:11,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"},
    main:{position:"relative",zIndex:2,paddingTop:36,paddingBottom:80},
    cont:{maxWidth:1320,margin:"0 auto",padding:"0 40px",boxSizing:"border-box"},
    tabWrap:{maxWidth:1160,margin:"0 auto 32px"},
    tabRow:{display:"grid",gridTemplateColumns:"1fr 180px",gap:20,alignItems:"stretch",height:72},
    tabsCard:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:C.white,border:`1px solid ${C.border}`,borderRadius:18,boxShadow:C.shadow,overflow:"hidden",height:72},
    tab:{border:"none",background:"transparent",fontSize:16,fontWeight:700,color:C.sub,display:"flex",alignItems:"center",justifyContent:"center",gap:9,cursor:"pointer",position:"relative",fontFamily:"inherit",height:"100%",transition:"all 0.18s"},
    tabAct:{background:C.navyDk,color:C.white},
    tabTri:{position:"absolute",bottom:-10,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:`10px solid ${C.navyDk}`},
    saveBtn:{height:72,width:"100%",border:"none",borderRadius:18,background:`linear-gradient(135deg,${C.green} 0%,${C.greenDk} 100%)`,color:C.white,fontSize:16,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 14px 28px rgba(22,163,74,0.25)",cursor:"pointer",fontFamily:"inherit"},
    card:{maxWidth:820,margin:"0 auto 22px",background:C.white,border:`1px solid ${C.border}`,borderRadius:18,boxShadow:C.shadow,padding:"26px 30px 20px",boxSizing:"border-box"},
    cardTitle:{display:"flex",alignItems:"center",gap:10,fontSize:14,fontWeight:800,color:C.navy,letterSpacing:0.5,marginBottom:20},
    statsRow:{maxWidth:820,margin:"0 auto 22px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16},
    statCard:{background:C.white,border:`1px solid ${C.border}`,borderRadius:18,boxShadow:C.shadow,padding:"20px 24px",boxSizing:"border-box",display:"flex",alignItems:"center",gap:18},
    statIco:{width:56,height:56,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0},
    statLabel:{fontSize:13,fontWeight:600,color:C.sub,marginBottom:4},
    statNum:{fontSize:38,fontWeight:900,color:C.text,lineHeight:1},
    shareBanner:{maxWidth:820,margin:"-12px auto 22px",background:"#EFF9FF",border:"1px solid #BAE0FC",borderRadius:18,padding:"14px 22px",boxSizing:"border-box",display:"flex",alignItems:"center",gap:12},
    liveBanner:{maxWidth:820,margin:"-12px auto 22px",background:"#F0FDF4",border:"1px solid #C6F6D5",borderRadius:14,padding:"10px 18px",boxSizing:"border-box",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12},
  };

  const uploadInfo:Record<Tab,{title:string;icon:string;name:string;st:US;msg:string;onPick:()=>void}> = {
    yurtici: {title:"YURTİÇİ — ZEUS'TAN EXCEL YÜKLEME",icon:"📋",name:"Yurtiçi İş Talepleri",st:stYi,msg:msgYi,onPick:()=>refYi.current?.click()},
    ihracat: {title:"İHRACAT — ZEUS'TAN EXCEL YÜKLEME",icon:"🌐",name:"İhracat İş Talepleri",st:stIh,msg:msgIh,onPick:()=>refIh.current?.click()},
    malkabul:{title:"MAL KABUL — ZEUS'TAN EXCEL YÜKLEME",icon:"📦",name:"Mal Kabul Exceli",st:stIr,msg:msgIr,onPick:()=>refIr.current?.click()},
  };
  const ui=uploadInfo[tab];

  return(
    <div style={S.page}>
      <div style={S.bgImg}/><div style={S.bgOvl}/>

      {/* HEADER */}
      <header style={S.header}>
        <div style={S.hInner}>
          <div style={S.hLeft}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full-color.png" alt="Başarı Otomotiv" style={S.logo}/>
            <div style={S.hDiv}/>
            <div style={S.hTitle}>
              <span>📅</span><span>Gün Sonu İzleme</span>
              <span style={{color:C.border}}>•</span>
              <span style={S.hDate}>{longDate}</span>
            </div>
          </div>
          <div style={S.hRight}>
            {raporId&&<span style={{fontSize:12,fontWeight:700,color:C.greenDk,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:20,padding:"4px 12px"}}>🟢 Canlı</span>}
            <div style={S.ico}>🔔<span style={S.badge}>1</span></div>
            <div style={S.ico}>?</div>
            <div style={{...S.ico,fontSize:14,fontWeight:900,width:48,height:48}}>BO</div>
            <span style={{color:C.sub,fontWeight:900,fontSize:16,cursor:"pointer"}}>⌄</span>
          </div>
        </div>
      </header>

      <main style={S.main}>
        <div style={S.cont}>

          {/* Canlı görüntüleme */}
          {isView&&(
            <div style={S.liveBanner}>
              <span style={{fontSize:13,fontWeight:700,color:C.greenDk}}>🔄 Otomatik güncelleniyor (30 sn){lastRefresh&&` · Son: ${lastRefresh.toLocaleTimeString("tr-TR")}`}</span>
              <button onClick={()=>raporId&&loadReport(raporId)} style={{border:`1px solid #86efac`,borderRadius:8,background:C.white,color:C.greenDk,padding:"4px 12px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>↺ Yenile</button>
            </div>
          )}

          {/* Paylaşım linki */}
          {shareUrl&&(
            <div style={S.shareBanner}>
              <span style={{fontSize:20}}>🔗</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,color:C.navy,marginBottom:4}}>Paylaşım Linki</div>
                <div style={{fontSize:12,color:C.sub,fontFamily:"monospace",wordBreak:"break-all"}}>{shareUrl}</div>
              </div>
              <button onClick={copyLink} style={{border:`1px solid #BAE0FC`,borderRadius:8,background:C.white,color:C.navy,padding:"6px 14px",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{copied?"✅ Kopyalandı":"📋 Kopyala"}</button>
            </div>
          )}

          {/* SEKMELER */}
          <div style={S.tabWrap}>
            <div style={S.tabRow}>
              <div style={S.tabsCard}>
                {([["yurtici","🚚","Yurtiçi"],["ihracat","🌐","İhracat"],["malkabul","📦","Mal Kabul"]] as const).map(([k,ic,lb])=>(
                  <button key={k} onClick={()=>setTab(k as Tab)}
                    style={tab===k?{...S.tab,...S.tabAct}:S.tab}>
                    <span style={{fontSize:22}}>{ic}</span>{lb}
                    {tab===k&&<span style={S.tabTri}/>}
                  </button>
                ))}
              </div>
              <button style={S.saveBtn} onClick={handleSave} disabled={saving}>
                <span style={{fontSize:20}}>{saving?"⏳":"💾"}</span>
                {saving?"Kaydediliyor...":"Kaydet ve Paylaş"}
              </button>
            </div>
          </div>

          {/* UPLOAD — Sekmeye göre 1 kutu */}
          <div style={S.card}>
            <div style={S.cardTitle}><span>☁️</span>{ui.title}</div>
            <UpBox icon={ui.icon} title={ui.name} st={ui.st} msg={ui.msg} onPick={ui.onPick}/>
            <div style={{marginTop:14,textAlign:"center",color:C.sub,fontSize:13,fontWeight:600}}>
              ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle
            </div>
          </div>

          {/* ─── YURTİÇİ ─── */}
          {tab==="yurtici"&&<>
            <div style={S.statsRow}>
              <div style={S.statCard}>
                <div style={{...S.statIco,background:"#EAF3FF",color:"#1A6FD4"}}>📋</div>
                <div>
                  <div style={S.statLabel}>Sipariş Sayısı</div>
                  <input type="number" inputMode="numeric" placeholder="0" value={yiSiparis}
                    onChange={e=>setYiSiparis(e.target.value)}
                    style={{...S.statNum,border:"none",outline:"none",background:"transparent",width:100,fontFamily:"inherit"}}/>
                </div>
              </div>
              <div style={S.statCard}>
                <div style={{...S.statIco,background:"#F3EEFF",color:"#7C3AED"}}>🧾</div>
                <div>
                  <div style={S.statLabel}>Faturalanan</div>
                  <input type="number" inputMode="numeric" placeholder="0" value={yiFatura}
                    onChange={e=>setYiFatura(e.target.value)}
                    style={{...S.statNum,border:"none",outline:"none",background:"transparent",width:100,fontFamily:"inherit"}}/>
                </div>
              </div>
              <div style={S.statCard}>
                <div style={{...S.statIco,background:"#EDFAF2",color:C.greenDk,fontSize:24,fontWeight:900}}>✓</div>
                <div>
                  <div style={S.statLabel}>Kalan</div>
                  <div style={{...S.statNum,color:yiKalan>0?"#dc2626":C.greenDk}}>{yiKalan}</div>
                </div>
              </div>
            </div>

            {yiRows.length===0?(
              <div style={{maxWidth:820,margin:"0 auto",background:C.white,border:`1px solid ${C.border}`,borderRadius:18,boxShadow:C.shadow,padding:"28px 24px",textAlign:"center",color:C.sub,fontSize:16,fontWeight:600}}>
                <div style={{fontSize:32,marginBottom:10}}>✅</div>
                Yurtiçi İş Talepleri yüklendiğinde siparişler burada görünecek
              </div>
            ):yiRows.map(r=>(
              <div style={{maxWidth:820,margin:"0 auto 10px"}} key={r.id}>
                <DataRow
                  left={<>
                    <div style={{fontWeight:800,fontSize:16,color:C.text,marginBottom:6}}>{r.musteri}</div>
                    {r.sebep&&<Tag label={r.sebep} bg="#FEF3C7" color="#92400E"/>}
                    <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                      {r.sku&&<Tag label={`${r.sku} SKU`} bg="#EAF3FF" color={C.navy}/>}
                      {r.adet&&<Tag label={`${fmtN(r.adet)} Adet`} bg="#EAF3FF" color={C.navy}/>}
                    </div>
                  </>}
                  onDel={()=>setYiRows(rs=>rs.filter(x=>x.id!==r.id))}
                />
              </div>
            ))}
          </>}

          {/* ─── İHRACAT ─── */}
          {tab==="ihracat"&&<>
            {ihRows.length===0?(
              <div style={{maxWidth:820,margin:"0 auto",background:C.white,border:`1px solid ${C.border}`,borderRadius:18,boxShadow:C.shadow,padding:"28px 24px",textAlign:"center",color:C.sub,fontSize:16,fontWeight:600}}>
                <div style={{fontSize:32,marginBottom:10}}>✈️</div>
                İhracat İş Talepleri yüklendiğinde siparişler burada görünecek
              </div>
            ):ihRows.map(r=>{
              const s=calcStatus(r);
              return(
                <div style={{maxWidth:820,margin:"0 auto 10px"}} key={r.id}>
                  <DataRow
                    left={<>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{fontWeight:800,fontSize:16,color:C.text}}>{r.musteri}</span>
                        {r.ulke&&<Tag label={r.ulke} bg="#F1F5F9" color="#475569"/>}
                      </div>
                      {s&&<Tag label={s.d} bg={s.c+"18"} color={s.c}/>}
                      <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                        {r.sku&&<Tag label={`${r.sku} SKU`} bg="#EAF3FF" color={C.navy}/>}
                        {r.adet&&<Tag label={`${fmtN(r.adet)} Adet`} bg="#EAF3FF" color={C.navy}/>}
                      </div>
                      {!r.cikisTarih&&<button onClick={()=>setIhRows(rs=>rs.map(x=>x.id===r.id?{...x,sebep:"GÖNDERİLDİ",cikisTarih:todayStr()}:x))} style={{marginTop:8,border:"none",background:"none",color:C.greenDk,fontSize:13,fontWeight:800,cursor:"pointer",padding:0,fontFamily:"inherit"}}>✓ Gönderildi</button>}
                    </>}
                    onDel={()=>setIhRows(rs=>rs.filter(x=>x.id!==r.id))}
                  />
                </div>
              );
            })}
          </>}

          {/* ─── MAL KABUL ─── */}
          {tab==="malkabul"&&<>
            {mkRows.length===0?(
              <div style={{maxWidth:820,margin:"0 auto",background:C.white,border:`1px solid ${C.border}`,borderRadius:18,boxShadow:C.shadow,padding:"28px 24px",textAlign:"center",color:C.sub,fontSize:16,fontWeight:600}}>
                <div style={{fontSize:32,marginBottom:10}}>📦</div>
                İrsaliye yüklendiğinde mal kabul kayıtları burada görünecek
              </div>
            ):mkRows.map(r=>{
              const dc=r.durum==="TAMAMLANDI"?C.greenDk:r.durum==="İŞLEMDE"?"#d97706":"#94a3b8";
              return(
                <div style={{maxWidth:820,margin:"0 auto 10px"}} key={r.id}>
                  <DataRow
                    left={<>
                      <div style={{fontWeight:800,fontSize:16,color:C.text,marginBottom:6}}>{r.firma}</div>
                      <Tag label={r.durum} bg={dc+"18"} color={dc}/>
                      <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                        <Tag label={r.depo} bg="#F1F5F9" color="#475569"/>
                        {r.adet&&<Tag label={`${fmtN(r.adet)} Adet`} bg="#EAF3FF" color={C.navy}/>}
                        {r.cesit&&<Tag label={`${r.cesit} Çeşit`} bg="#EAF3FF" color={C.navy}/>}
                        <Tag label={fmtDate(r.tarih)} bg="#F1F5F9" color="#475569"/>
                      </div>
                      {(r.belgeNo||r.belgeNo2)&&<div style={{color:"#94a3b8",fontSize:12,marginTop:6,fontFamily:"monospace"}}>{r.belgeNo}{r.belgeNo2?" / "+r.belgeNo2:""}</div>}
                    </>}
                    onDel={()=>setMkRows(rs=>rs.filter(x=>x.id!==r.id))}
                  />
                </div>
              );
            })}
          </>}

        </div>
      </main>

      <input ref={refYi} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"yi");e.target.value="";}}/>
      <input ref={refIh} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"ih");e.target.value="";}}/>
      <input ref={refIr} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"ir");e.target.value="";}}/>
    </div>
  );
}
