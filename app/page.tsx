"use client";
import React, { useState, useRef, useEffect } from "react";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SB_URL = "https://dqoreukmpkxmdputjigy.supabase.co";
const SB_KEY = "sb_publishable_gKwtDDLun7O0UybI4R71cA_xMDT2DX8";
const TABLE  = "gun_sonu_raporlar";

async function sbSave(p:object):Promise<string|null>{try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}`,{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,Prefer:"return=representation"},body:JSON.stringify(p)});const d=await r.json();return d[0]?.id??null;}catch{return null;}}
async function sbUpdate(id:string,p:object){try{await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}`,{method:"PATCH",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`},body:JSON.stringify(p)});}catch{}}
async function sbLoad(id:string){try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}&select=*`,{headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}});const d=await r.json();return d[0]??null;}catch{return null;}}

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
const sv=(v:any)=>String(v??"").trim();
const nn=(v:any)=>{const n=parseFloat(sv(v));return isNaN(n)?0:Math.round(n);};
const uid=()=>Math.random().toString(36).slice(2,9);
const todayStr=()=>new Date().toISOString().split("T")[0];
function xlDT(v:any):string{
  if(typeof v==="number"&&v>1){const d=new Date(Math.round((v-25569)*86400*1000));return d.toLocaleDateString("tr-TR")+" "+d.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});}
  return sv(v)||new Date().toLocaleDateString("tr-TR");
}
function terminType(tarihStr:string,sku:number):{durum:string;type:string}{
  const m=tarihStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if(!m)return{durum:"RİSKLİ",type:"yellow"};
  const ilk=new Date(`${m[3]}-${m[2]}-${m[1]}`);
  const gun=sku<=50?1:sku<=100?2:sku<=250?4:7;
  const son=new Date(ilk);son.setDate(ilk.getDate()+gun);
  const today=new Date();today.setHours(0,0,0,0);
  const kalan=Math.ceil((son.getTime()-today.getTime())/86400000);
  if(kalan>1)return{durum:"ZAMANINDA",type:"green"};
  if(kalan>=0)return{durum:"RİSKLİ",type:"yellow"};
  return{durum:"GECİKTİ",type:"red"};
}

// ─── Tipler & Demo Veri ───────────────────────────────────────────────────────
interface YIRow{no:string;musteri:string;tarih:string;siparis:number;fatura:number;kalan:number;}
interface IHRow{no:string;firma:string;ulke:string;termin:string;adet:number;durum:string;type:string;}
interface MKRow{no:string;tedarikci:string;tarih:string;durum:string;type:string;aciklama:string;}
type Tab="yurtici"|"ihracat"|"malKabul";
type US="idle"|"loading"|"ok"|"err";

const DEF_YI:YIRow[]=[
  {no:"YT-2026-001",musteri:"Başarı Ankara",   tarih:"04.07.2026 08:30",siparis:240,fatura:210,kalan:30},
  {no:"YT-2026-002",musteri:"İstanbul Avrupa",  tarih:"04.07.2026 09:15",siparis:190,fatura:190,kalan:0},
  {no:"YT-2026-003",musteri:"Ege Bölge",        tarih:"04.07.2026 10:45",siparis:160,fatura:145,kalan:15},
  {no:"YT-2026-004",musteri:"Kartepe Sevkiyat", tarih:"04.07.2026 11:20",siparis:89, fatura:89, kalan:0},
  {no:"YT-2026-005",musteri:"GooN Tech Ankara", tarih:"04.07.2026 13:10",siparis:130,fatura:0,  kalan:130},
];
const DEF_IH:IHRow[]=[
  {no:"IH-2026-101",firma:"Auto Balkan",  ulke:"Bulgaristan",termin:"04.07.2026 17:00",adet:420,durum:"ZAMANINDA",type:"green"},
  {no:"IH-2026-102",firma:"Global Parts", ulke:"Almanya",    termin:"04.07.2026 18:30",adet:275,durum:"RİSKLİ",  type:"yellow"},
  {no:"IH-2026-103",firma:"MENA Trade",   ulke:"BAE",        termin:"04.07.2026 16:00",adet:610,durum:"GECİKTİ", type:"red"},
];
const DEF_MK:MKRow[]=[
  {no:"IRS-2026-1452",tedarikci:"Martaş Otomotiv",   tarih:"04.07.2026 08:30",durum:"BAŞLAMADI", type:"red",   aciklama:"İşleme alınmadı"},
  {no:"IRS-2026-1453",tedarikci:"Başarı İthalat",    tarih:"04.07.2026 09:15",durum:"İŞLEMDE",   type:"yellow",aciklama:"Kontrol aşamasında"},
  {no:"IRS-2026-1454",tedarikci:"Arıcıoğlu Otomotiv",tarih:"04.07.2026 10:45",durum:"TAMAMLANDI",type:"green", aciklama:"İşlem tamamlandı"},
  {no:"IRS-2026-1455",tedarikci:"Sampa Otomotiv",    tarih:"04.07.2026 11:20",durum:"İŞLEMDE",   type:"yellow",aciklama:"Eksik parça bekleniyor"},
  {no:"IRS-2026-1456",tedarikci:"Kanca Otomotiv",    tarih:"04.07.2026 13:10",durum:"BAŞLAMADI", type:"red",   aciklama:"Henüz başlanmadı"},
];

// ─── Renk Paleti (spec) ───────────────────────────────────────────────────────
const C={navy:"#0B2F78",navyDk:"#061F55",navyH:"#062B66",green:"#22C55E",red:"#EF4444",yellow:"#F59E0B",
  pageBg:"#F8FAFD",card:"#FFFFFF",border:"#E2E8F0",text:"#0F2A5F",muted:"#64748B",
  softRed:"#FEF2F2",softYellow:"#FFF7E8",softGreen:"#F0FDF4"};

// ─── Alt Bileşenler ───────────────────────────────────────────────────────────
function Badge({type,label}:{type:string;label:string}){
  const bg=type==="green"?C.softGreen:type==="yellow"?C.softYellow:C.softRed;
  const cl=type==="green"?"#15803D":type==="yellow"?"#B45309":"#B91C1C";
  const br=type==="green"?"#BBF7D0":type==="yellow"?"#FDE68A":"#FECACA";
  return <span style={{display:"inline-flex",alignItems:"center",padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:900,letterSpacing:0.4,background:bg,color:cl,border:`1px solid ${br}`}}>{label}</span>;
}

function SummaryCard({type,title,val,sub}:{type:string;title:string;val:number;sub:string}){
  const cl=type==="red"?C.red:type==="yellow"?C.yellow:C.green;
  const ic=type==="red"?"📋":type==="yellow"?"🕐":"✓";
  return(
    <div style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"22px 26px",display:"flex",alignItems:"center",gap:20,boxShadow:"0 6px 20px rgba(11,47,120,0.05)"}}>
      <div style={{width:76,height:76,borderRadius:"50%",border:`3px solid ${cl}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:type==="green"?32:28,color:cl,background:`${cl}0D`,flexShrink:0,fontWeight:900}}>
        {ic}
      </div>
      <div>
        <div style={{fontSize:14,fontWeight:900,color:cl,letterSpacing:0.6,marginBottom:4}}>{title}</div>
        <div style={{fontSize:40,fontWeight:900,color:C.text,lineHeight:1}}>{val}</div>
        <div style={{fontSize:13,fontWeight:600,color:C.muted,marginTop:4}}>{sub}</div>
      </div>
    </div>
  );
}

function ContactCard(){
  const rows=[
    {icon:"📍",color:C.navy, text:"Akçaburgaz Mah. 3126. Sk. No: 10/1 DMN Plaza Kat:2 Esenyurt / İSTANBUL"},
    {icon:"📞",color:C.navy, text:"+90 537 952 06 13"},
    {icon:"📞",color:C.navy, text:"+90 212 632 59 65 (Fax)"},
    {icon:"🟢",color:"#25D366",text:"90 537 952 06 13"},
    {icon:"✈️",color:C.navy, text:"info@basariotomotive.com"},
  ];
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",boxShadow:"0 6px 20px rgba(11,47,120,0.05)"}}>
      {rows.map(({icon,text},i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"8px 0"}}>
          <span style={{fontSize:16,flexShrink:0,lineHeight:1.3}}>{icon}</span>
          <span style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.45}}>{text}</span>
        </div>
      ))}
    </div>
  );
}

function DayEndSummary({title,rows}:{title:string;rows:[string,number,string][]}){
  return(
    <div style={{background:`linear-gradient(160deg,${C.navyH} 0%,${C.navy} 100%)`,borderRadius:14,padding:"22px",color:"#fff",marginBottom:16,position:"relative",overflow:"hidden",boxShadow:"0 10px 30px rgba(6,31,85,0.25)"}}>
      <div style={{fontWeight:900,fontSize:15,letterSpacing:0.6,marginBottom:14}}>{title}</div>
      {rows.map(([l,v,c],i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<rows.length-1?"1px solid rgba(255,255,255,0.12)":"none"}}>
          <span style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.85)"}}>{l}</span>
          <span style={{fontSize:17,fontWeight:900,color:c}}>{v}</span>
        </div>
      ))}
      {/* Depo/forklift/kamyon silüetleri */}
      <div style={{marginTop:18,display:"flex",justifyContent:"space-around",fontSize:34,opacity:0.18,filter:"grayscale(1) brightness(3)"}}>
        <span>🏭</span><span>🚜</span><span>🚛</span>
      </div>
    </div>
  );
}

// ─── ANA SAYFA ────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState<Tab>("malKabul");
  const [mobile,setMobile]=useState(false);
  useEffect(()=>{
    const chk=()=>setMobile(window.innerWidth<900);
    chk();window.addEventListener("resize",chk);
    return()=>window.removeEventListener("resize",chk);
  },[]);
  const [yiRows,setYiRows]=useState<YIRow[]>(DEF_YI);
  const [ihRows,setIhRows]=useState<IHRow[]>(DEF_IH);
  const [mkRows,setMkRows]=useState<MKRow[]>(DEF_MK);
  const [stU,setStU]=useState<US>("idle");
  const [msgU,setMsgU]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);
  const [raporId,setRaporId]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const [shareUrl,setShareUrl]=useState("");
  const [copied,setCopied]=useState(false);
  const [isView,setIsView]=useState(false);
  const [lastRefresh,setLastRefresh]=useState<Date|null>(null);

  const today=new Date().toLocaleDateString("tr-TR",{day:"2-digit",month:"long",year:"numeric",weekday:"long"});

  useEffect(()=>{
    const id=new URLSearchParams(window.location.search).get("rapor");
    if(id){setRaporId(id);setIsView(true);loadReport(id);
      const iv=setInterval(()=>loadReport(id).then(()=>setLastRefresh(new Date())),30000);
      return()=>clearInterval(iv);}
  // eslint-disable-next-line
  },[]);

  async function loadReport(id:string){
    const d=await sbLoad(id);
    if(d){
      if(d.yurtici_rows?.length)setYiRows(d.yurtici_rows);
      if(d.ihracat_rows?.length)setIhRows(d.ihracat_rows);
      if(d.malkabul_rows?.length)setMkRows(d.malkabul_rows);
      setLastRefresh(new Date());
    }
  }

  async function handleSave(){
    setSaving(true);
    const p={tarih:todayStr(),yurtici_rows:yiRows,ihracat_rows:ihRows,malkabul_rows:mkRows};
    let id=raporId;
    if(id){await sbUpdate(id,p);}
    else{id=await sbSave(p);if(id){setRaporId(id);const u=`${window.location.origin}?rapor=${id}`;setShareUrl(u);window.history.pushState({},"",`?rapor=${id}`);}}
    setSaving(false);
    if(id){const u=shareUrl||`${window.location.origin}?rapor=${id}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(`📋 *GÜN SONU RAPORU — ${new Date().toLocaleDateString("tr-TR")}*\n\nCanlı rapor:\n${u}`)}`,"_blank");}
  }

  // ─── Excel Parse (aktif sekmeye göre) ─────────────────────────────────────
  async function parseExcel(file:File){
    setStU("loading");
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer());
      const ws=wb.Sheets["data"]??wb.Sheets[wb.SheetNames[0]];
      const raw:any[][]=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi=raw.findIndex(r=>r.some((c:any)=>["Müşteri","Firma","FİRMA"].includes(sv(c))||sv(c).includes("MÜŞTERİ")));
      const hRow=hi>=0?raw[hi]:raw[0];
      const col=(k:string,k2="")=>hRow.findIndex((c:any)=>sv(c)===k||sv(c).includes(k)||(k2&&sv(c).includes(k2)));

      if(tab==="malKabul"){
        const iCnm=col("Cari İsmi"),iBno=col("BelgeNo"),iTar=col("Tarih"),iDur=col("Durum");
        const rows:MKRow[]=[];
        for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
          const r=raw[i];const fir=sv(iCnm>=0?r[iCnm]:r[6]);if(!fir)continue;
          const d0=sv(iDur>=0?r[iDur]:r[9]);
          const durum=d0==="Başlamadı"?"BAŞLAMADI":d0==="İşlemde"?"İŞLEMDE":d0==="Tamamlandı"?"TAMAMLANDI":d0.toUpperCase()||"BAŞLAMADI";
          const type=durum==="TAMAMLANDI"?"green":durum==="İŞLEMDE"?"yellow":"red";
          const acik=durum==="TAMAMLANDI"?"İşlem tamamlandı":durum==="İŞLEMDE"?"Kontrol aşamasında":"İşleme alınmadı";
          rows.push({no:sv(iBno>=0?r[iBno]:r[2])||("IRS-"+uid()),tedarikci:fir,tarih:xlDT(iTar>=0?r[iTar]:r[4]),durum,type,aciklama:acik});
        }
        setMkRows(rows);setMsgU(`${rows.length} irsaliye yüklendi`);
      } else if(tab==="yurtici"){
        const iMus=col("Müşteri","MÜŞTERİ"),iBno=col("Belge No","BELGE"),iTar=col("Tarih","TARİH"),iAdt=col("Adet","ADET"),iKar=col("Karşılan");
        const rows:YIRow[]=[];
        for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
          const r=raw[i];const mus=sv(iMus>=0?r[iMus]:r[3]);if(!mus)continue;
          const adet=nn(iAdt>=0?r[iAdt]:r[6]);
          const oran=Math.min(nn(iKar>=0?r[iKar]:r[10]),100);
          const fat=Math.round(adet*oran/100);
          rows.push({no:sv(iBno>=0?r[iBno]:r[1])||("YT-"+uid()),musteri:mus,tarih:xlDT(iTar>=0?r[iTar]:r[2]),siparis:adet,fatura:fat,kalan:adet-fat});
        }
        setYiRows(rows);setMsgU(`${rows.length} sipariş yüklendi`);
      } else {
        const iMus=col("Müşteri","MÜŞTERİ"),iIl=col("İl","ÜLKE"),iBno=col("Belge No","BELGE"),iTar=col("Tarih","TARİH"),iAdt=col("Adet","ADET"),iCes=col("Çeşit","SKU");
        const rows:IHRow[]=[];
        for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
          const r=raw[i];const mus=sv(iMus>=0?r[iMus]:r[3]);if(!mus)continue;
          const tarih=xlDT(iTar>=0?r[iTar]:r[2]);
          const sku=nn(iCes>=0?r[iCes]:r[7]);
          const {durum,type}=terminType(tarih,sku);
          rows.push({no:sv(iBno>=0?r[iBno]:r[1])||("IH-"+uid()),firma:mus,ulke:sv(iIl>=0?r[iIl]:r[4])||"—",termin:tarih,adet:nn(iAdt>=0?r[iAdt]:r[6]),durum,type});
        }
        setIhRows(rows);setMsgU(`${rows.length} sevkiyat yüklendi`);
      }
      setStU("ok");
    }catch{setMsgU("Dosya okunamadı");setStU("err");}
  }

  // ─── Sekme konfigürasyonları ──────────────────────────────────────────────
  const TABS:{id:Tab;label:string;icon:string}[]=[
    {id:"yurtici", label:"Yurtiçi", icon:"🚚"},
    {id:"ihracat", label:"İhracat", icon:"🚢"},
    {id:"malKabul",label:"Mal Kabul",icon:"🏭"},
  ];
  const UPLOAD:{[k in Tab]:{title:string;sub:string}}={
    yurtici: {title:"Yurtiçi Excel Dosyası Yükle",  sub:"Sipariş, faturalanan ve kalan verilerini yükleyin."},
    ihracat: {title:"İhracat Excel Dosyası Yükle",  sub:"Termin, müşteri ve durum verilerini yükleyin."},
    malKabul:{title:"Mal Kabul Excel Dosyası Yükle",sub:"İrsaliye, tedarikçi ve işlem verilerini yükleyin."},
  };

  // Özetler
  const yiB=yiRows.filter(r=>r.fatura===0).length, yiD=yiRows.filter(r=>r.fatura>0&&r.kalan>0).length, yiT=yiRows.filter(r=>r.kalan===0).length;
  const ihZ=ihRows.filter(r=>r.type==="green").length, ihR=ihRows.filter(r=>r.type==="yellow").length, ihG=ihRows.filter(r=>r.type==="red").length;
  const mkB=mkRows.filter(r=>r.type==="red").length, mkI=mkRows.filter(r=>r.type==="yellow").length, mkT=mkRows.filter(r=>r.type==="green").length;

  const th:React.CSSProperties={padding:"13px 18px",textAlign:"left",fontSize:12,fontWeight:800,color:C.muted,borderBottom:`1px solid ${C.border}`,letterSpacing:0.2};
  const td:React.CSSProperties={padding:"15px 18px",fontSize:13.5,fontWeight:700,borderBottom:`1px solid ${C.border}`,color:C.text};

  const tableCard=(icon:string,title:string,count:number,head:string[],body:React.ReactNode)=>(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 6px 20px rgba(11,47,120,0.05)"}}>
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,fontWeight:900,fontSize:15,color:C.text,letterSpacing:0.4}}>
          <span style={{fontSize:17}}>{icon}</span>{title}
        </div>
        <span style={{fontSize:12,fontWeight:700,color:C.muted}}>{count} kayıt</span>
      </div>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch" as any}}>
        <table style={{width:"100%",minWidth:640,borderCollapse:"collapse"}}>
          <thead><tr>{head.map((h,i)=><th key={i} style={th}>{h}</th>)}</tr></thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.pageBg,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',color:C.text}}>

      {/* ── 1. HEADER — 70px, koyu navy, sağ alan YOK ── */}
      <header style={{minHeight:mobile?56:70,background:C.navyDk,display:"flex",alignItems:"center",flexWrap:"wrap",gap:mobile?8:0,padding:mobile?"8px 16px":"0 36px",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(6,31,85,0.35)"}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/basari-logo-white.png" alt="Başarı Otomotiv" style={{height:mobile?30:42,objectFit:"contain"}}
          onError={e=>{const t=e.target as HTMLImageElement;t.src="/logo-full-color.png";t.style.filter="brightness(0) invert(1)";}}/>
        <div style={{width:1,height:mobile?24:36,background:"rgba(255,255,255,0.25)",margin:mobile?"0 12px":"0 22px"}}/>
        <span style={{color:"#fff",fontSize:mobile?16:22,fontWeight:900,letterSpacing:-0.4}}>Gün Sonu İzleme</span>
        {!mobile&&<span style={{display:"inline-flex",alignItems:"center",gap:8,marginLeft:20,color:"rgba(255,255,255,0.85)",fontSize:14,fontWeight:700}}>
          <span style={{fontSize:16}}>📅</span>{today}
        </span>}
        {raporId&&<span style={{marginLeft:"auto",fontSize:12,fontWeight:800,color:"#86efac",background:"rgba(34,197,94,0.15)",border:"1px solid rgba(134,239,172,0.4)",borderRadius:20,padding:"4px 14px"}}>🟢 Canlı</span>}
      </header>

      {/* ── 2. HERO BANNER — gerçek asset ── */}
      <div style={{width:"100%",lineHeight:0,background:C.navyDk}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/basari-logistics-hero.png" alt="Güçlü Lojistik Güvenilir Teslimat"
          style={{width:"100%",height:"auto",maxHeight:220,objectFit:"cover",objectPosition:"center",display:"block"}}/>
      </div>

      {/* ── 4. ANA CONTAINER — banner'a hafif bindirilmiş ── */}
      <div style={{maxWidth:1500,margin:"-18px auto 0",padding:mobile?"0 10px 40px":"0 24px 60px",position:"relative",zIndex:5}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:mobile?16:22,boxShadow:"0 20px 60px rgba(11,47,120,0.10)",padding:mobile?"14px 12px":"22px 24px"}}>

          {/* Canlı / paylaşım banner */}
          {isView&&(
            <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:"9px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <span style={{fontSize:13,fontWeight:700,color:"#15803D"}}>🔄 Otomatik güncelleniyor (30 sn){lastRefresh&&` · ${lastRefresh.toLocaleTimeString("tr-TR")}`}</span>
              <button onClick={()=>raporId&&loadReport(raporId)} style={{border:"1px solid #86EFAC",borderRadius:8,background:"#fff",color:"#15803D",padding:"4px 14px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>↺ Yenile</button>
            </div>
          )}
          {shareUrl&&(
            <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:12,padding:"10px 18px",display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <span>🔗</span>
              <span style={{flex:1,fontSize:12,color:C.muted,fontFamily:"monospace",wordBreak:"break-all"}}>{shareUrl}</span>
              <button onClick={async()=>{await navigator.clipboard.writeText(shareUrl);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                style={{border:"1px solid #BFDBFE",borderRadius:8,background:"#fff",color:C.navy,padding:"5px 14px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                {copied?"✅ Kopyalandı":"📋 Kopyala"}
              </button>
            </div>
          )}

          {/* ── 5. SEKMELER + KAYDET ── */}
          <div style={{display:"flex",flexDirection:mobile?"column":"row",alignItems:"stretch",gap:mobile?10:14,marginBottom:18}}>
            <div style={{display:"flex",gap:mobile?8:14,flex:1}}>
              {TABS.map(t=>{
                const act=tab===t.id;
                return(
                  <button key={t.id} onClick={()=>setTab(t.id)}
                    style={{flex:1,maxWidth:mobile?undefined:300,display:"flex",alignItems:"center",justifyContent:"center",gap:mobile?6:12,height:mobile?52:64,border:act?"none":`1px solid ${C.border}`,borderRadius:12,
                      background:act?C.navyDk:"#fff",color:act?"#fff":C.navy,fontSize:mobile?13:17,fontWeight:900,cursor:"pointer",fontFamily:"inherit",
                      boxShadow:act?"0 10px 26px rgba(6,31,85,0.30)":"0 4px 12px rgba(11,47,120,0.04)",transition:"all .15s"}}>
                    <span style={{fontSize:mobile?20:26}}>{t.icon}</span>{t.label}
                  </button>
                );
              })}
            </div>
            <button onClick={handleSave} disabled={saving}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:C.green,color:"#fff",border:"none",borderRadius:12,padding:"0 26px",height:mobile?50:64,fontWeight:900,fontSize:mobile?14:15,cursor:"pointer",boxShadow:"0 10px 24px rgba(34,197,94,0.30)",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              <span style={{fontSize:20}}>{saving?"⏳":"🔗"}</span>{saving?"Kaydediliyor...":"Kaydet ve Paylaş"}
            </button>
          </div>

          {/* ── 7. EXCEL UPLOAD BAR ── */}
          <div style={{background:"#fff",border:`1px solid ${stU==="ok"?"#BBF7D0":stU==="err"?"#FECACA":C.border}`,borderRadius:14,padding:mobile?"12px 14px":"16px 22px",display:"flex",flexDirection:mobile?"column":"row",alignItems:mobile?"stretch":"center",gap:mobile?12:0,justifyContent:"space-between",marginBottom:20,boxShadow:"0 4px 14px rgba(11,47,120,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:52,height:52,borderRadius:12,background:"#E7F6EC",border:"1px solid #C6E9D2",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:"#1D6F42",fontWeight:900,fontSize:22,fontFamily:"Georgia,serif"}}>X</span>
              </div>
              <div>
                <div style={{fontWeight:900,fontSize:16,color:C.text}}>
                  {stU==="ok"?`✅ ${msgU}`:stU==="err"?`❌ ${msgU}`:UPLOAD[tab].title}
                </div>
                <div style={{fontSize:13,color:C.muted,fontWeight:600,marginTop:3}}>
                  {stU==="ok"?"Değiştirmek için tekrar Excel seçebilirsiniz":UPLOAD[tab].sub}
                </div>
              </div>
            </div>
            <button onClick={()=>fileRef.current?.click()}
              style={{display:"flex",alignItems:"center",gap:9,border:`1.5px solid ${C.navy}`,color:C.navy,background:"#fff",borderRadius:11,padding:"12px 24px",fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
              <span style={{fontSize:16}}>⇧</span>{stU==="loading"?"Yükleniyor...":"Excel Seç"}
            </button>
          </div>

          {/* ── 9. İKİ KOLON ── */}
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 310px",gap:20,alignItems:"start"}}>

            {/* SOL KOLON */}
            <div>
              {/* ── 8. ÖZET KARTLARI ── */}
              <div style={{display:"flex",flexDirection:mobile?"column":"row",gap:mobile?10:16,marginBottom:20}}>
                {tab==="yurtici"&&<>
                  <SummaryCard type="red"    title="BAŞLAMADI"  val={yiB} sub="Sipariş"/>
                  <SummaryCard type="yellow" title="DEVAM"      val={yiD} sub="Sipariş"/>
                  <SummaryCard type="green"  title="TAMAMLANDI" val={yiT} sub="Sipariş"/>
                </>}
                {tab==="ihracat"&&<>
                  <SummaryCard type="green"  title="ZAMANINDA" val={ihZ} sub="Sevkiyat"/>
                  <SummaryCard type="yellow" title="RİSKLİ"    val={ihR} sub="Sevkiyat"/>
                  <SummaryCard type="red"    title="GECİKTİ"   val={ihG} sub="Sevkiyat"/>
                </>}
                {tab==="malKabul"&&<>
                  <SummaryCard type="red"    title="BAŞLAMADI"  val={mkB} sub="İrsaliye"/>
                  <SummaryCard type="yellow" title="İŞLEMDE"    val={mkI} sub="İrsaliye"/>
                  <SummaryCard type="green"  title="TAMAMLANDI" val={mkT} sub="İrsaliye"/>
                </>}
              </div>

              {/* ── 10. TABLO ── */}
              {tab==="malKabul"&&tableCard("📋","İRSALİYE LİSTESİ",mkRows.length,
                ["İrsaliye No","Tedarikçi","Giriş Tarihi","Durum","Açıklama",""],
                mkRows.map((r,i)=>(
                  <tr key={i}>
                    <td style={{...td,fontWeight:900}}>{r.no}</td>
                    <td style={td}>{r.tedarikci}</td>
                    <td style={td}>{r.tarih}</td>
                    <td style={td}><Badge type={r.type} label={r.durum}/></td>
                    <td style={{...td,color:C.muted,fontWeight:600}}>{r.aciklama}</td>
                    <td style={{...td,textAlign:"center",color:C.muted,cursor:"pointer",fontSize:17,width:40}}>⋮</td>
                  </tr>
                ))
              )}
              {tab==="yurtici"&&tableCard("📋","SİPARİŞ LİSTESİ",yiRows.length,
                ["Sipariş No","Müşteri","Giriş Tarihi","Sipariş","Faturalanan","Kalan",""],
                yiRows.map((r,i)=>(
                  <tr key={i}>
                    <td style={{...td,fontWeight:900}}>{r.no}</td>
                    <td style={td}>{r.musteri}</td>
                    <td style={td}>{r.tarih}</td>
                    <td style={td}>{r.siparis.toLocaleString("tr-TR")}</td>
                    <td style={td}>{r.fatura.toLocaleString("tr-TR")}</td>
                    <td style={{...td,fontWeight:900,color:r.kalan>0?C.red:"#15803D"}}>{r.kalan.toLocaleString("tr-TR")}</td>
                    <td style={{...td,textAlign:"center",color:C.muted,cursor:"pointer",fontSize:17,width:40}}>⋮</td>
                  </tr>
                ))
              )}
              {tab==="ihracat"&&tableCard("🚢","İHRACAT SEVKİYAT LİSTESİ",ihRows.length,
                ["Sipariş No","Firma","Ülke","Termin","Adet","Durum",""],
                ihRows.map((r,i)=>(
                  <tr key={i}>
                    <td style={{...td,fontWeight:900}}>{r.no}</td>
                    <td style={td}>{r.firma}</td>
                    <td style={td}>{r.ulke}</td>
                    <td style={td}>{r.termin}</td>
                    <td style={td}>{r.adet.toLocaleString("tr-TR")}</td>
                    <td style={td}><Badge type={r.type} label={r.durum}/></td>
                    <td style={{...td,textAlign:"center",color:C.muted,cursor:"pointer",fontSize:17,width:40}}>⋮</td>
                  </tr>
                ))
              )}
            </div>

            {/* SAĞ KOLON */}
            <div>
              {tab==="yurtici"&&<DayEndSummary title="GÜN SONU ÖZETİ" rows={[
                ["Toplam Sipariş",yiRows.length,"#fff"],["Başlamadı",yiB,"#FCA5A5"],["Devam",yiD,"#FCD34D"],["Tamamlandı",yiT,"#86EFAC"]]}/>}
              {tab==="ihracat"&&<DayEndSummary title="GÜN SONU ÖZETİ" rows={[
                ["Toplam Sevkiyat",ihRows.length,"#fff"],["Zamanında",ihZ,"#86EFAC"],["Riskli",ihR,"#FCD34D"],["Gecikti",ihG,"#FCA5A5"]]}/>}
              {tab==="malKabul"&&<DayEndSummary title="GÜN SONU ÖZETİ" rows={[
                ["Toplam İrsaliye",mkRows.length,"#fff"],["Başlamadı",mkB,"#FCA5A5"],["İşlemde",mkI,"#FCD34D"],["Tamamlandı",mkT,"#86EFAC"]]}/>}
              <ContactCard/>
            </div>
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f);e.target.value="";}}/>
    </div>
  );
}
