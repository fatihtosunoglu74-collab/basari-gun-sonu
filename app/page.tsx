"use client";
import { useState, useRef, useEffect } from "react";

const SB_URL="https://dqoreukmpkxmdputjigy.supabase.co";
const SB_KEY="sb_publishable_gKwtDDLun7O0UybI4R71cA_xMDT2DX8";
const TABLE="gun_sonu_raporlar";

async function sbSave(p:object):Promise<string|null>{try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}`,{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,Prefer:"return=representation"},body:JSON.stringify(p)});const d=await r.json();return d[0]?.id??null;}catch{return null;}}
async function sbUpdate(id:string,p:object):Promise<void>{try{await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}`,{method:"PATCH",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`},body:JSON.stringify(p)});}catch{}}
async function sbLoad(id:string):Promise<any>{try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}&select=*`,{headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}});const d=await r.json();return d[0]??null;}catch{return null;}}

interface YIRow{id:string;musteri:string;il:string;adet:string;cesit:string;kulvar:string;sevkSekli:string;karsilanmaOran:string;not:string;}
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
function calcStatus(row:Partial<IHRow>){const{ilkTarih,cikisTarih,sebep="",sku}=row;if(!ilkTarih||!sku)return null;const g=calcTermin(sku,sebep);const ilk=new Date(ilkTarih),son=new Date(ilk);son.setDate(ilk.getDate()+g);const today=new Date();today.setHours(0,0,0,0);const isG=sebep==="GÖNDERİLDİ"||!!cikisTarih;const cikis=cikisTarih?new Date(cikisTarih):today;if(isG)return cikis<=son?{d:"ZAMANINDA ÇIKTI",c:"#16a34a"}:{d:"GEÇ ÇIKTI",c:"#dc2626"};return today<=son?{d:"TERMİN İÇİNDE",c:"#d97706"}:{d:"TERMİN AŞTI — ACİL",c:"#dc2626"};}

const C={navy:"#0B2F78",navyDk:"#082A5B",pageBg:"#F8FAFD",white:"#FFFFFF",border:"#E3EAF3",green:"#22C55E",greenDk:"#16A34A",text:"#102A43",sub:"#6B7C93",amber:"#D68A1F",sh:"0 10px 30px rgba(16,42,67,0.08)"};

function Tag({l,bg,c}:{l:string;bg:string;c:string}){return<span style={{borderRadius:6,padding:"2px 9px",fontSize:12,fontWeight:700,display:"inline-block",background:bg,color:c,marginRight:5,marginBottom:4}}>{l}</span>;}

// Kompakt upload şeridi — minimal
function UpStrip({icon,name,st,msg,onPick}:{icon:string;name:string;st:US;msg:string;onPick:()=>void}){
  const ok=st==="ok",err=st==="err",ld=st==="loading";
  return(
    <div onClick={onPick} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",border:`1.5px dashed ${ok?"#86efac":err?"#fca5a5":ld?"#e2e8f0":C.border}`,borderRadius:10,background:ok?"#f0fdf4":err?"#fef2f2":"#F8FAFD",cursor:"pointer",transition:"all 0.18s"}}>
      <span style={{fontSize:22,flexShrink:0}}>{ok?"✅":err?"❌":ld?"⏳":icon}</span>
      <div style={{flex:1,minWidth:0}}>
        <span style={{fontWeight:700,fontSize:14,color:C.text}}>{ok||err?msg:name}</span>
        {!ok&&!err&&<span style={{fontSize:12,color:C.sub,marginLeft:8}}>.xlsx / .xls</span>}
      </div>
      {!ok&&!err&&!ld&&(
        <button onClick={e=>{e.stopPropagation();onPick();}} style={{height:30,padding:"0 14px",border:`1px solid ${C.border}`,borderRadius:7,background:C.white,color:C.navy,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>
          ☁️ Dosya Seç
        </button>
      )}
      {ok&&<span style={{color:C.greenDk,fontWeight:800,fontSize:12,flexShrink:0}}>✓ Yüklendi</span>}
    </div>
  );
}

// Bildirim paneli
const NOTIFS=[
  {id:1,icon:"📋",text:"Yurtiçi İş Talepleri bekleniyor",time:"Bugün",unread:true},
  {id:2,icon:"✈️",text:"3 ihracat siparişi termin yaklaşıyor",time:"Bugün",unread:true},
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
  const unreadCount=NOTIFS.filter(n=>n.unread).length;

  // Dışarı tıklayınca bildirimi kapat
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
        const col=(k:string)=>hRow.findIndex((c:any)=>sv(c)===k||sv(c).includes(k));
        const iCnm=col("Cari İsmi"),iDep=col("Depo"),iBno=col("BelgeNo"),iTar=col("Tarih"),iAdt=col("Adet"),iCes=col("Çeşit"),iDur=col("Durum");
        const rows:MKRow[]=[];
        for(let i=(hi>=0?hi+1:1);i<data.length;i++){const r=data[i];const fir=sv(iCnm>=0?r[iCnm]:r[6]);if(!fir)continue;const raw=sv(iDur>=0?r[iDur]:r[9]);rows.push({id:uid(),firma:fir,depo:sv(iDep>=0?r[iDep]:r[1])||"TEM.34",belgeNo:sv(iBno>=0?r[iBno]:r[2]),tarih:xlDate(iTar>=0?r[iTar]:r[4])||todayStr(),adet:ns(iAdt>=0?r[iAdt]:r[7]),cesit:ns(iCes>=0?r[iCes]:r[8]),durum:raw==="Başlamadı"?"BAŞLAMADI":raw==="İşlemde"?"İŞLEMDE":raw==="Tamamlandı"?"TAMAMLANDI":raw||"BAŞLAMADI"});}
        setMkRows(rows);const tot=rows.reduce((s,r)=>s+(parseInt(r.adet)||0),0);setM(`${rows.length} belge · ${tot.toLocaleString("tr-TR")} adet`);setTab("malkabul");
      } else {
        const hi=data.findIndex(r=>r.some((c:any)=>sv(c)==="Müşteri"||sv(c).includes("MÜŞTERİ")));
        const hRow=hi>=0?data[hi]:data[0];
        const col=(k:string,k2="")=>hRow.findIndex((c:any)=>sv(c)===k||sv(c).includes(k)||(k2&&(sv(c)===k2||sv(c).includes(k2))));
        const iMus=col("Müşteri","MÜŞTERİ"),iIl=col("İl","ÜLKE"),iTar=col("Tarih","TARİH"),iAdt=col("Adet","ADET"),iCes=col("Çeşit","SKU"),iKul=col("Kulvar"),iSev=col("Sevk"),iKar=col("Karşılan"),iNot=col("Not");
        if(mode==="yi"){
          const rows:YIRow[]=[];
          for(let i=(hi>=0?hi+1:1);i<data.length;i++){const r=data[i];const mus=sv(iMus>=0?r[iMus]:r[3]);if(!mus)continue;rows.push({id:uid(),musteri:mus,il:sv(iIl>=0?r[iIl]:r[4]),adet:ns(iAdt>=0?r[iAdt]:r[6]),cesit:ns(iCes>=0?r[iCes]:r[7]),kulvar:sv(iKul>=0?r[iKul]:r[8]),sevkSekli:sv(iSev>=0?r[iSev]:r[9]),karsilanmaOran:sv(iKar>=0?r[iKar]:r[10]),not:sv(iNot>=0?r[iNot]:r[11])});}
          setYiRows(rows);setYiFatura(String(rows.length));setM(`${rows.length} sipariş`);setTab("yurtici");
        } else {
          const rows:IHRow[]=[];
          for(let i=(hi>=0?hi+1:1);i<data.length;i++){const r=data[i];const mus=sv(iMus>=0?r[iMus]:r[3]);if(!mus)continue;rows.push({id:uid(),musteri:mus,ulke:sv(iIl>=0?r[iIl]:r[4]),ilkTarih:parseTrDate(sv(iTar>=0?r[iTar]:r[2])),cikisTarih:"",sebep:"",sku:ns(iCes>=0?r[iCes]:r[7]),adet:ns(iAdt>=0?r[iAdt]:r[6])});}
          setIhRows(r=>[...r,...rows]);setM(`${rows.length} sipariş`);setTab("ihracat");
        }
      }
      setS("ok");
    }catch(e){setM("Dosya okunamadı");setS("err");}
  }

  const S:Record<string,React.CSSProperties>={
    page:{minHeight:"100vh",width:"100%",background:C.pageBg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif",color:C.text,overflowX:"hidden"},
    bg:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:0,backgroundImage:"url('/background-logistics.jpg')",backgroundSize:"cover",backgroundPosition:"center",opacity:0.04},
    bgOvl:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:1,background:"linear-gradient(135deg,rgba(248,250,253,0.98) 0%,rgba(234,243,255,0.95) 50%,rgba(248,250,253,0.97) 100%)"},
    header:{height:88,background:"rgba(255,255,255,0.98)",borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 12px rgba(11,47,120,0.05)",position:"sticky",top:0,zIndex:100},
    hIn:{maxWidth:1320,margin:"0 auto",height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px",boxSizing:"border-box"},
    hL:{display:"flex",alignItems:"center",gap:22},
    hR:{display:"flex",alignItems:"center",gap:10},
    logo:{height:50,width:"auto",objectFit:"contain"},
    hDiv:{width:1,height:40,background:C.border},
    hTitle:{display:"flex",alignItems:"center",gap:9,fontSize:19,fontWeight:700,color:C.text},
    hDate:{color:C.amber,fontWeight:800},
    ico:{width:42,height:42,borderRadius:"50%",border:`1px solid ${C.border}`,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",position:"relative",color:C.text,fontWeight:700,flexShrink:0},
    badge:{position:"absolute",top:-5,right:-4,width:19,height:19,borderRadius:"50%",background:"#F59E0B",color:C.white,fontSize:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"},
    notifPanel:{position:"absolute",top:54,right:0,width:320,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,boxShadow:"0 20px 50px rgba(16,42,67,0.14)",zIndex:200,overflow:"hidden"},
    main:{position:"relative",zIndex:2,paddingTop:32,paddingBottom:80},
    cont:{maxWidth:1280,margin:"0 auto",padding:"0 40px",boxSizing:"border-box"},
    tabWrap:{maxWidth:1160,margin:"0 auto 24px"},
    tabRow:{display:"grid",gridTemplateColumns:"1fr 185px",gap:18,height:68},
    tabsCard:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:C.white,border:`1px solid ${C.border}`,borderRadius:16,boxShadow:C.sh,overflow:"hidden",height:68},
    tab:{border:"none",background:"transparent",fontSize:15,fontWeight:700,color:C.sub,display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",position:"relative",fontFamily:"inherit",height:"100%"},
    tabAct:{background:C.navyDk,color:C.white},
    tabTri:{position:"absolute",bottom:-9,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"9px solid transparent",borderRight:"9px solid transparent",borderTop:`9px solid ${C.navyDk}`},
    saveBtn:{height:68,width:"100%",border:"none",borderRadius:16,background:`linear-gradient(135deg,${C.green} 0%,${C.greenDk} 100%)`,color:C.white,fontSize:15,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 12px 24px rgba(22,163,74,0.22)",cursor:"pointer",fontFamily:"inherit"},
    card:{maxWidth:820,margin:"0 auto 16px",background:C.white,border:`1px solid ${C.border}`,borderRadius:14,boxShadow:C.sh,padding:"14px 18px",boxSizing:"border-box"},
    cardTitle:{display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:800,color:C.navy,letterSpacing:0.5,marginBottom:16,textTransform:"uppercase" as const},
    statsRow:{maxWidth:820,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14},
    statCard:{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,boxShadow:C.sh,padding:"18px 22px",display:"flex",alignItems:"center",gap:16},
    stIco:{width:52,height:52,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0},
    stLbl:{fontSize:12,fontWeight:600,color:C.sub,marginBottom:3},
    stNum:{fontSize:36,fontWeight:900,color:C.text,lineHeight:1},
    dataCard:{maxWidth:820,margin:"0 auto 10px",background:C.white,border:`1px solid ${C.border}`,borderRadius:14,boxShadow:C.sh,padding:"14px 18px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12},
    delBtn:{width:28,height:28,border:"none",borderRadius:6,background:"#FEF2F2",color:"#ef4444",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:900},
    emptyCard:{maxWidth:820,margin:"0 auto",background:C.white,border:`1px solid ${C.border}`,borderRadius:16,boxShadow:C.sh,padding:"32px 24px",textAlign:"center",color:C.sub,fontSize:15,fontWeight:600},
    shareBanner:{maxWidth:820,margin:"-8px auto 18px",background:"#EFF9FF",border:"1px solid #BAE0FC",borderRadius:14,padding:"12px 20px",display:"flex",alignItems:"center",gap:12},
    liveBanner:{maxWidth:820,margin:"-8px auto 18px",background:"#F0FDF4",border:"1px solid #C6F6D5",borderRadius:12,padding:"9px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  };

  const uploadInfo:Record<Tab,{title:string;icon:string;name:string;st:US;msg:string;onPick:()=>void}>={
    yurtici:{title:"YURTİÇİ — ZEUS'TAN EXCEL YÜKLEME",icon:"📋",name:"Yurtiçi İş Talepleri",st:stYi,msg:msgYi,onPick:()=>refYi.current?.click()},
    ihracat:{title:"İHRACAT — ZEUS'TAN EXCEL YÜKLEME",icon:"🌐",name:"İhracat İş Talepleri",st:stIh,msg:msgIh,onPick:()=>refIh.current?.click()},
    malkabul:{title:"MAL KABUL — ZEUS'TAN EXCEL YÜKLEME",icon:"📦",name:"Mal Kabul Exceli",st:stIr,msg:msgIr,onPick:()=>refIr.current?.click()},
  };
  const ui=uploadInfo[tab];

  return(
    <div style={S.page}>
      <div style={S.bg}/><div style={S.bgOvl}/>

      {/* HEADER */}
      <header style={S.header}>
        <div style={S.hIn}>
          <div style={S.hL}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full-color.png" alt="Başarı Otomotiv" style={S.logo}/>
            <div style={S.hDiv}/>
            <div style={S.hTitle}>
              <span>📅</span><span>Gün Sonu İzleme</span>
              <span style={{color:C.border}}>•</span>
              <span style={S.hDate}>{longDate}</span>
            </div>
          </div>
          <div style={S.hR}>
            {raporId&&<span style={{fontSize:12,fontWeight:700,color:C.greenDk,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:20,padding:"4px 12px"}}>🟢 Canlı</span>}

            {/* Bildirim çanı */}
            <div ref={notifRef} style={{position:"relative"}}>
              <div style={S.ico} onClick={()=>setShowNotif(v=>!v)}>
                🔔<span style={S.badge}>{unreadCount}</span>
              </div>
              {showNotif&&(
                <div style={S.notifPanel}>
                  <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:800,fontSize:14,color:C.text}}>Bildirimler</span>
                    <span style={{fontSize:12,color:C.sub,fontWeight:600}}>{unreadCount} yeni</span>
                  </div>
                  {NOTIFS.map(n=>(
                    <div key={n.id} style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,background:n.unread?"#FAFBFF":C.white,display:"flex",gap:12,alignItems:"flex-start"}}>
                      <span style={{fontSize:20,flexShrink:0}}>{n.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:n.unread?700:600,color:C.text}}>{n.text}</div>
                        <div style={{fontSize:11,color:C.sub,marginTop:3}}>{n.time}</div>
                      </div>
                      {n.unread&&<span style={{width:8,height:8,borderRadius:"50%",background:C.navy,display:"block",marginTop:4,flexShrink:0}}/>}
                    </div>
                  ))}
                  <div style={{padding:"10px 18px",textAlign:"center"}}>
                    <button onClick={()=>setShowNotif(false)} style={{border:"none",background:"none",color:C.navy,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Kapat</button>
                  </div>
                </div>
              )}
            </div>

            <div style={S.ico}>?</div>
            <div style={{...S.ico,fontSize:13,fontWeight:900,width:46,height:46}}>BO</div>
            <span style={{color:C.sub,fontWeight:900,fontSize:15,cursor:"pointer"}}>⌄</span>
          </div>
        </div>
      </header>

      <main style={S.main}>
        <div style={S.cont}>

          {isView&&(
            <div style={S.liveBanner}>
              <span style={{fontSize:13,fontWeight:700,color:C.greenDk}}>🔄 Otomatik güncelleniyor (30 sn){lastRefresh&&` · ${lastRefresh.toLocaleTimeString("tr-TR")}`}</span>
              <button onClick={()=>raporId&&loadReport(raporId)} style={{border:"1px solid #86efac",borderRadius:7,background:C.white,color:C.greenDk,padding:"4px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>↺ Yenile</button>
            </div>
          )}
          {shareUrl&&(
            <div style={S.shareBanner}>
              <span style={{fontSize:18}}>🔗</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:800,color:C.navy,marginBottom:3}}>Paylaşım Linki</div>
                <div style={{fontSize:11,color:C.sub,fontFamily:"monospace",wordBreak:"break-all"}}>{shareUrl}</div>
              </div>
              <button onClick={copyLink} style={{border:"1px solid #BAE0FC",borderRadius:7,background:C.white,color:C.navy,padding:"5px 12px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{copied?"✅ Kopyalandı":"📋 Kopyala"}</button>
            </div>
          )}

          {/* SEKMELER */}
          <div style={S.tabWrap}>
            <div style={S.tabRow}>
              <div style={S.tabsCard}>
                {([["yurtici","🚚","Yurtiçi"],["ihracat","🌐","İhracat"],["malkabul","📦","Mal Kabul"]] as const).map(([k,ic,lb])=>(
                  <button key={k} onClick={()=>setTab(k as Tab)} style={tab===k?{...S.tab,...S.tabAct}:S.tab}>
                    <span style={{fontSize:20}}>{ic}</span>{lb}
                    {tab===k&&<span style={S.tabTri}/>}
                  </button>
                ))}
              </div>
              <button style={S.saveBtn} onClick={handleSave} disabled={saving}>
                <span style={{fontSize:18}}>{saving?"⏳":"💾"}</span>
                {saving?"Kaydediliyor...":"Kaydet ve Paylaş"}
              </button>
            </div>
          </div>

          {/* UPLOAD — kompakt şerit */}
          <div style={S.card}>
            <div style={S.cardTitle}><span>☁️</span>{ui.title}</div>
            <UpStrip icon={ui.icon} name={ui.name} st={ui.st} msg={ui.msg} onPick={ui.onPick}/>

          </div>

          {/* ─── YURTİÇİ ─── */}
          {tab==="yurtici"&&<>
            <div style={S.statsRow}>
              {[
                {icon:"📋",bg:"#EAF3FF",ic:"#1A6FD4",lbl:"Sipariş Sayısı",val:yiSiparis,set:setYiSiparis},
                {icon:"🧾",bg:"#F3EEFF",ic:"#7C3AED",lbl:"Faturalanan",val:yiFatura,set:setYiFatura},
              ].map(({icon,bg,ic,lbl,val,set})=>(
                <div key={lbl} style={S.statCard}>
                  <div style={{...S.stIco,background:bg,color:ic}}>{icon}</div>
                  <div>
                    <div style={S.stLbl}>{lbl}</div>
                    <input type="number" inputMode="numeric" placeholder="0" value={val}
                      onChange={e=>set(e.target.value)}
                      style={{...S.stNum,border:"none",outline:"none",background:"transparent",width:90,fontFamily:"inherit"}}/>
                  </div>
                </div>
              ))}
              <div style={S.statCard}>
                <div style={{...S.stIco,background:"#EDFAF2",color:C.greenDk,fontSize:22,fontWeight:900}}>✓</div>
                <div>
                  <div style={S.stLbl}>Kalan</div>
                  <div style={{...S.stNum,color:yiKalan>0?"#dc2626":C.greenDk}}>{yiKalan}</div>
                </div>
              </div>
            </div>

            {yiRows.length===0?(
              <div style={S.emptyCard}><div style={{fontSize:28,marginBottom:8}}>📋</div>Excel yüklendiğinde siparişler burada görünecek</div>
            ):(<>
              {/* Özet */}
              <div style={{maxWidth:820,margin:"0 auto 10px",background:"#F0F7FF",border:`1px solid #C8DFF8`,borderRadius:12,padding:"10px 18px",display:"flex",gap:20,alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>📊 Toplam: {yiRows.length} sipariş</span>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>📦 {yiRows.reduce((s,r)=>s+(parseInt(r.adet)||0),0).toLocaleString("tr-TR")} adet</span>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>🗺️ {[...new Set(yiRows.map(r=>r.il).filter(Boolean))].length} il</span>
              </div>
              {yiRows.map(r=>(
                <div key={r.id} style={S.dataCard}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:800,fontSize:15,color:C.text}}>{r.musteri}</span>
                      {r.il&&<Tag l={r.il} bg="#EAF3FF" c={C.navy}/>}
                      {r.kulvar&&<Tag l={r.kulvar} bg="#FEF3C7" c="#92400E"/>}
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {r.adet&&<Tag l={`${fmtN(r.adet)} Adet`} bg="#EDFAF2" c={C.greenDk}/>}
                      {r.cesit&&<Tag l={`${r.cesit} Çeşit`} bg="#EDFAF2" c={C.greenDk}/>}
                      {r.sevkSekli&&<Tag l={r.sevkSekli} bg="#F3EEFF" c="#7C3AED"/>}
                      {r.karsilanmaOran&&<Tag l={`%${r.karsilanmaOran} Karşılandı`} bg={parseFloat(r.karsilanmaOran)>=100?"#EDFAF2":"#FEF9EC"} c={parseFloat(r.karsilanmaOran)>=100?C.greenDk:"#B45309"}/>}
                      {r.not&&<Tag l={r.not} bg="#F8FAFD" c={C.sub}/>}
                    </div>
                  </div>
                  <button style={S.delBtn} onClick={()=>setYiRows(rs=>rs.filter(x=>x.id!==r.id))}>×</button>
                </div>
              ))}
            </>)}
          </>}

          {/* ─── İHRACAT ─── */}
          {tab==="ihracat"&&<>
            {ihRows.length===0?(
              <div style={S.emptyCard}><div style={{fontSize:28,marginBottom:8}}>✈️</div>Excel yüklendiğinde ihracat siparişleri burada görünecek</div>
            ):(<>
              <div style={{maxWidth:820,margin:"0 auto 10px",background:"#F0F7FF",border:`1px solid #C8DFF8`,borderRadius:12,padding:"10px 18px",display:"flex",gap:20,alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>📊 Toplam: {ihRows.length} sipariş</span>
                <span style={{fontSize:13,fontWeight:700,color:"#dc2626"}}>🔴 Acil: {ihRows.filter(r=>calcStatus(r)?.d.includes("ACİL")).length}</span>
                <span style={{fontSize:13,fontWeight:700,color:"#d97706"}}>🟡 Bekleyen: {ihRows.filter(r=>!r.cikisTarih).length}</span>
              </div>
              {ihRows.map(r=>{const s=calcStatus(r);return(
                <div key={r.id} style={{...S.dataCard,borderLeft:`3px solid ${s?.c||C.border}`}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:800,fontSize:15,color:C.text}}>{r.musteri}</span>
                      {r.ulke&&<Tag l={r.ulke} bg="#F1F5F9" c="#475569"/>}
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                      {s&&<Tag l={s.d} bg={s.c+"18"} c={s.c}/>}
                      {r.sku&&<Tag l={`${r.sku} SKU`} bg="#EAF3FF" c={C.navy}/>}
                      {r.adet&&<Tag l={`${fmtN(r.adet)} Adet`} bg="#EAF3FF" c={C.navy}/>}
                      {r.ilkTarih&&<Tag l={`Sipariş: ${fmtDate(r.ilkTarih)}`} bg="#F8FAFD" c={C.sub}/>}
                    </div>
                    {!r.cikisTarih&&(
                      <button onClick={()=>setIhRows(rs=>rs.map(x=>x.id===r.id?{...x,sebep:"GÖNDERİLDİ",cikisTarih:todayStr()}:x))}
                        style={{border:"none",background:"none",color:C.greenDk,fontSize:12,fontWeight:800,cursor:"pointer",padding:0,fontFamily:"inherit"}}>✓ Gönderildi olarak işaretle</button>
                    )}
                  </div>
                  <button style={S.delBtn} onClick={()=>setIhRows(rs=>rs.filter(x=>x.id!==r.id))}>×</button>
                </div>
              );})}
            </>)}
          </>}

          {/* ─── MAL KABUL ─── */}
          {tab==="malkabul"&&<>
            {mkRows.length===0?(
              <div style={S.emptyCard}><div style={{fontSize:28,marginBottom:8}}>📦</div>Excel yüklendiğinde mal kabul kayıtları burada görünecek</div>
            ):(<>
              <div style={{maxWidth:820,margin:"0 auto 10px",background:"#F0F7FF",border:`1px solid #C8DFF8`,borderRadius:12,padding:"10px 18px",display:"flex",gap:20,alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>📊 {mkRows.length} belge</span>
                <span style={{fontSize:13,fontWeight:700,color:C.navy}}>📦 {mkRows.reduce((s,r)=>s+(parseInt(r.adet)||0),0).toLocaleString("tr-TR")} adet</span>
                <span style={{fontSize:13,fontWeight:700,color:C.greenDk}}>✓ Tamamlanan: {mkRows.filter(r=>r.durum==="TAMAMLANDI").length}</span>
                <span style={{fontSize:13,fontWeight:700,color:"#d97706"}}>⏳ İşlemde: {mkRows.filter(r=>r.durum==="İŞLEMDE").length}</span>
              </div>
              {mkRows.map(r=>{const dc=r.durum==="TAMAMLANDI"?C.greenDk:r.durum==="İŞLEMDE"?"#d97706":"#94a3b8";return(
                <div key={r.id} style={{...S.dataCard,borderLeft:`3px solid ${dc}`}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:15,color:C.text,marginBottom:6}}>{r.firma}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <Tag l={r.durum} bg={dc+"18"} c={dc}/>
                      <Tag l={r.depo} bg="#F1F5F9" c="#475569"/>
                      {r.adet&&<Tag l={`${fmtN(r.adet)} Adet`} bg="#EAF3FF" c={C.navy}/>}
                      {r.cesit&&<Tag l={`${r.cesit} Çeşit`} bg="#EAF3FF" c={C.navy}/>}
                      {r.tarih&&<Tag l={fmtDate(r.tarih)} bg="#F8FAFD" c={C.sub}/>}
                      {r.belgeNo&&<Tag l={r.belgeNo} bg="#F8FAFD" c={C.sub}/>}
                    </div>
                  </div>
                  <button style={S.delBtn} onClick={()=>setMkRows(rs=>rs.filter(x=>x.id!==r.id))}>×</button>
                </div>
              );})}
            </>)}
          </>}

        </div>
      </main>

      <input ref={refYi} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"yi");e.target.value="";}}/>
      <input ref={refIh} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"ih");e.target.value="";}}/>
      <input ref={refIr} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"ir");e.target.value="";}}/>
    </div>
  );
}
