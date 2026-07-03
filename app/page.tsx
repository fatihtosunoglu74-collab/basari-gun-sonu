"use client";
import { useState, useRef } from "react";

// ─── Tipler & Yardımcılar ────────────────────────────────────────────────────
interface YIRow { id:string; musteri:string; sebep:string; sku:string; adet:string; not:string; }
interface IHRow { id:string; musteri:string; ulke:string; ilkTarih:string; cikisTarih:string; sebep:string; sku:string; adet:string; }
interface MKRow { id:string; firma:string; depo:string; belgeNo:string; belgeNo2:string; tarih:string; adet:string; cesit:string; durum:string; }
type Tab = "yurtici"|"ihracat"|"malkabul";
type US  = "idle"|"loading"|"ok"|"err";

const uid = () => Math.random().toString(36).slice(2,10);
const sv  = (v:any) => String(v??"").trim();
const ns  = (v:any) => { const n=parseFloat(sv(v)); return isNaN(n)?"":String(Math.round(n)); };
const fmtDate = (d:string) => d ? new Date(d).toLocaleDateString("tr-TR") : "—";
const fmtN = (v:string|number) => { const n=parseInt(String(v)); return isNaN(n)?"0":n.toLocaleString("tr-TR"); };
const todayStr = () => new Date().toISOString().split("T")[0];

function xlDate(val:any):string {
  if(!val&&val!==0)return"";
  const s=Math.floor(typeof val==="number"?val:parseFloat(sv(val)));
  if(isNaN(s)||s<1)return"";
  const d=new Date(Math.round((s-25569)*86400*1000));
  return`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
}
function parseTrDate(v:string):string {
  const m=v?.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return m?`${m[3]}-${m[2]}-${m[1]}`:todayStr();
}
function calcTermin(sku:string,sebep=""):number {
  if(sebep.toUpperCase().includes("ELLEÇLEME"))return 7;
  const n=parseInt(sku)||0;
  if(n<=50)return 1; if(n<=100)return 2; if(n<=250)return 4; return 7;
}
function calcStatus(row:Partial<IHRow>) {
  const{ilkTarih,cikisTarih,sebep="",sku}=row;
  if(!ilkTarih||!sku)return null;
  const g=calcTermin(sku,sebep);
  const ilk=new Date(ilkTarih),son=new Date(ilk); son.setDate(ilk.getDate()+g);
  const today=new Date(); today.setHours(0,0,0,0);
  const isG=sebep==="GÖNDERİLDİ"||!!cikisTarih;
  const cikis=cikisTarih?new Date(cikisTarih):today;
  if(isG) return cikis<=son?{durum:"ZAMANINDA ÇIKTI",renk:"#16a34a"}:{durum:"GEÇ ÇIKTI",renk:"#dc2626"};
  return today<=son?{durum:"TERMİN İÇİNDE",renk:"#d97706"}:{durum:"TERMİN AŞTI — ACİL",renk:"#dc2626"};
}

// ─── Stil Nesnesi (Sadece inline, basari-dashboard prefix mantığı) ─────────────
const D = {
  page:{minHeight:"100vh",width:"100%",background:"#F7FAFF",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif",color:"#0B214A",position:"relative" as const},
  bgFixed:{position:"fixed" as const,top:88,left:0,right:0,bottom:0,
    backgroundImage:"linear-gradient(90deg,rgba(247,250,255,0.08) 0%,rgba(247,250,255,0.72) 28%,rgba(247,250,255,0.82) 55%,rgba(247,250,255,0.35) 100%),url('/background-logistics.jpg')",
    backgroundSize:"cover",backgroundPosition:"center",zIndex:0},
  header:{height:88,background:"rgba(255,255,255,0.96)",borderBottom:"1px solid #E6ECF5",
    boxShadow:"0 4px 20px rgba(11,33,74,0.07)",position:"sticky" as const,top:0,zIndex:100},
  headerInner:{maxWidth:1320,margin:"0 auto",height:"100%",display:"flex" as const,
    alignItems:"center" as const,justifyContent:"space-between" as const,padding:"0 36px",boxSizing:"border-box" as const},
  headerLeft:{display:"flex" as const,alignItems:"center" as const,gap:28},
  logo:{height:52,width:"auto",objectFit:"contain" as const},
  hdivider:{width:1,height:44,background:"#D9E2EF",flexShrink:0},
  pageTitle:{display:"flex" as const,alignItems:"center" as const,gap:10,fontSize:21,fontWeight:800,color:"#0B214A"},
  pageDate:{color:"#D38314",fontWeight:800},
  headerRight:{display:"flex" as const,alignItems:"center" as const,gap:14},
  icoCircle:{width:44,height:44,borderRadius:"50%",border:"1px solid #D9E2EF",display:"flex" as const,
    alignItems:"center" as const,justifyContent:"center" as const,background:"#FFFFFF",
    position:"relative" as const,fontWeight:700,color:"#0B214A",fontSize:19,cursor:"pointer" as const},
  badge:{position:"absolute" as const,top:-7,right:-4,width:22,height:22,borderRadius:"50%",
    background:"#E4A13A",color:"#FFFFFF",fontSize:11,fontWeight:900,
    display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const},
  main:{position:"relative" as const,zIndex:2},
  container:{maxWidth:1320,margin:"0 auto",padding:"32px 36px 80px",boxSizing:"border-box" as const},
  tabRow:{display:"grid" as const,gridTemplateColumns:"1fr 164px",gap:24,
    alignItems:"stretch" as const,marginBottom:32,height:70},
  tabsCard:{display:"grid" as const,gridTemplateColumns:"1fr 1fr 1fr",
    background:"rgba(255,255,255,0.93)",border:"1px solid #DCE5F1",borderRadius:18,
    boxShadow:"0 10px 30px rgba(11,33,74,0.10)",overflow:"hidden" as const,height:70},
  tabBtn:{border:"none",background:"transparent",fontSize:17,fontWeight:800,color:"#5A7299",
    display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,
    gap:10,cursor:"pointer" as const,position:"relative" as const,
    fontFamily:"inherit",height:"100%",transition:"background 0.18s"},
  tabActive:{background:"linear-gradient(135deg,#008FE3 0%,#003B82 100%)",color:"#FFFFFF",
    boxShadow:"0 12px 26px rgba(0,72,152,0.22)"},
  tabTriangle:{position:"absolute" as const,bottom:-10,left:"50%",transform:"translateX(-50%)",
    width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:"10px solid #004A96"},
  sendBtn:{height:70,width:"100%",border:"none",borderRadius:18,
    background:"linear-gradient(135deg,#25C964 0%,#0DA044 100%)",color:"#FFFFFF",
    fontSize:19,fontWeight:900,display:"flex" as const,alignItems:"center" as const,
    justifyContent:"center" as const,gap:10,boxShadow:"0 14px 28px rgba(13,160,68,0.28)",
    cursor:"pointer" as const,fontFamily:"inherit"},
  // Upload: 780px centered
  uploadCard:{width:780,margin:"0 auto 22px",background:"rgba(255,255,255,0.97)",
    border:"1px solid #E2E9F3",borderRadius:20,boxShadow:"0 16px 40px rgba(11,33,74,0.12)",
    padding:"26px 30px 18px",boxSizing:"border-box" as const},
  secTitle:{display:"flex" as const,alignItems:"center" as const,gap:10,color:"#0B3A75",fontSize:17,fontWeight:900,marginBottom:18},
  uploadGrid3:{display:"grid" as const,gridTemplateColumns:"1fr 1fr 1fr",gap:16},
  uploadGrid1:{display:"grid" as const,gridTemplateColumns:"1fr",gap:16},
  uploadBox:{height:154,border:"2px dashed #C9D5E5",borderRadius:16,display:"flex" as const,
    flexDirection:"column" as const,alignItems:"center" as const,justifyContent:"center" as const,
    background:"rgba(255,255,255,0.75)",cursor:"pointer" as const,transition:"border-color 0.2s",gap:2},
  uIcon:{fontSize:36,color:"#D48A20",lineHeight:1,marginBottom:8},
  uTitle:{fontSize:17,fontWeight:900,color:"#0B214A",marginBottom:2},
  uSub:{fontSize:13,color:"#2B68A5",marginBottom:12},
  uBtn:{height:34,padding:"0 20px",borderRadius:8,border:"1px solid #BFD0E6",background:"#FFFFFF",
    color:"#0B3A75",fontSize:14,fontWeight:800,display:"flex" as const,alignItems:"center" as const,
    gap:7,cursor:"pointer" as const,fontFamily:"inherit"},
  helper:{marginTop:14,textAlign:"center" as const,color:"#3D6E9E",fontSize:14,fontWeight:600},
  // Stats: 780px centered, 3 cols
  statsRow:{width:780,margin:"0 auto 22px",display:"grid" as const,gridTemplateColumns:"1fr 1fr 1fr",gap:16},
  statCard:{minHeight:104,background:"rgba(255,255,255,0.97)",border:"1px solid #E1E9F4",borderRadius:16,
    boxShadow:"0 12px 28px rgba(11,33,74,0.10)",display:"flex" as const,alignItems:"center" as const,
    padding:"0 26px",gap:22,boxSizing:"border-box" as const},
  statIcon:{width:60,height:60,borderRadius:15,display:"flex" as const,alignItems:"center" as const,
    justifyContent:"center" as const,fontSize:30,fontWeight:900,flexShrink:0},
  statLabel:{fontSize:15,color:"#27527E",fontWeight:700,marginBottom:4},
  statNum:{fontSize:42,color:"#071E42",fontWeight:900,lineHeight:1},
  // Form: 820px centered
  formCard:{width:820,margin:"0 auto 22px",background:"rgba(255,255,255,0.97)",
    border:"1px solid #E1E9F4",borderRadius:20,boxShadow:"0 18px 42px rgba(11,33,74,0.13)",
    padding:"26px 30px 22px",boxSizing:"border-box" as const},
  formTitle:{color:"#D48415",fontSize:18,fontWeight:900,marginBottom:18,
    display:"flex" as const,alignItems:"center" as const,gap:8},
  field:{minHeight:58,border:"1px solid #C9D7E8",borderRadius:11,background:"#FFFFFF",
    display:"flex" as const,alignItems:"center" as const,padding:"0 18px",gap:14,
    boxSizing:"border-box" as const,marginBottom:12},
  fLabel:{color:"#31567F",fontSize:13,fontWeight:800,lineHeight:1.1},
  fSub:{color:"#8A99AF",fontSize:14,marginTop:2},
  row2:{display:"grid" as const,gridTemplateColumns:"1fr 1fr",gap:12},
  addBtn:{height:52,width:"100%",border:"none",borderRadius:10,
    background:"linear-gradient(135deg,#082A5B 0%,#001C40 100%)",color:"#FFFFFF",
    fontSize:17,fontWeight:900,display:"flex" as const,alignItems:"center" as const,
    justifyContent:"center" as const,gap:10,marginTop:12,cursor:"pointer" as const,fontFamily:"inherit"},
  // Success / Empty
  successBanner:{width:820,margin:"0 auto 16px",minHeight:64,
    background:"rgba(245,255,249,0.97)",border:"1px solid #CDECD8",borderRadius:16,
    boxShadow:"0 12px 30px rgba(16,142,69,0.10)",display:"flex" as const,
    alignItems:"center" as const,justifyContent:"center" as const,
    gap:16,color:"#0B8F3C",fontSize:18,fontWeight:900,padding:"12px 24px"},
  emptyBanner:{width:820,margin:"0 auto 16px",minHeight:64,
    background:"rgba(255,255,255,0.95)",border:"1px solid #E1E9F4",borderRadius:16,
    boxShadow:"0 12px 28px rgba(11,33,74,0.07)",display:"flex" as const,
    alignItems:"center" as const,justifyContent:"center" as const,
    gap:14,color:"#6b7280",fontSize:17,fontWeight:700,padding:"12px 24px"},
  checkCircle:{width:36,height:36,borderRadius:"50%",background:"#2FC35E",color:"#FFFFFF",
    display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,fontWeight:900,fontSize:20,flexShrink:0},
  // Row card
  rowCard:{width:820,margin:"0 auto 12px",background:"rgba(255,255,255,0.97)",
    border:"1px solid #E1E9F4",borderRadius:14,boxShadow:"0 8px 20px rgba(11,33,74,0.08)",
    padding:"16px 22px",boxSizing:"border-box" as const,
    display:"flex" as const,alignItems:"flex-start" as const,justifyContent:"space-between" as const,gap:16},
  delBtn:{width:32,height:32,border:"none",borderRadius:7,background:"#FEF2F2",
    color:"#ef4444",cursor:"pointer" as const,fontSize:18,display:"flex" as const,
    alignItems:"center" as const,justifyContent:"center" as const,flexShrink:0,fontWeight:900},
  tag:{borderRadius:6,padding:"3px 12px",fontSize:13,fontWeight:700,display:"inline-block"},
};

// ─── Inline Input Bileşeni ────────────────────────────────────────────────────
function FInput({icon,label,placeholder,value,onChange,type="text"}:{icon:string;label:string;placeholder:string;value:string;onChange:(v:string)=>void;type?:string}) {
  return(
    <div style={D.field}>
      <span style={{fontSize:22,flexShrink:0}}>{icon}</span>
      <div style={{flex:1}}>
        <div style={D.fLabel}>{label}</div>
        <input value={value} onChange={e=>onChange(e.target.value)} type={type}
          inputMode={type==="number"?"numeric":undefined} placeholder={placeholder}
          style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit",marginTop:2,fontWeight:600}}/>
      </div>
    </div>
  );
}
function FSelect({icon,label,value,onChange,opts}:{icon:string;label:string;value:string;onChange:(v:string)=>void;opts:string[]}) {
  return(
    <div style={{...D.field,justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,flex:1}}>
        <span style={{fontSize:22,flexShrink:0}}>{icon}</span>
        <div style={{flex:1}}>
          <div style={D.fLabel}>{label}</div>
          <select value={value} onChange={e=>onChange(e.target.value)}
            style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit",fontWeight:700,marginTop:2,cursor:"pointer"}}>
            <option value="">— Seçin —</option>
            {opts.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <span style={{color:"#0B214A",fontWeight:900,fontSize:18}}>⌄</span>
    </div>
  );
}

// ─── Upload Kutusu ────────────────────────────────────────────────────────────
function UpBox({icon,title,st,msg,onPick}:{icon:string;title:string;st:US;msg:string;onPick:()=>void}) {
  const ok=st==="ok",err=st==="err",loading=st==="loading";
  return(
    <div onClick={onPick} style={{...D.uploadBox,borderColor:ok?"#6ee7b7":err?"#fca5a5":loading?"#e2e8f0":"#C9D5E5"}}>
      <div style={D.uIcon}>{ok?"✅":err?"❌":loading?"⏳":icon}</div>
      <div style={D.uTitle}>{ok||err ? msg : title}</div>
      {!ok&&!err&&<div style={D.uSub}>.xlsx / .xls</div>}
      {!ok&&!err&&!loading&&(
        <button style={D.uBtn} onClick={e=>{e.stopPropagation();onPick();}}>☁️ Dosya Seç</button>
      )}
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState<Tab>("yurtici");
  const [yiSiparis,setYiSiparis]=useState("");
  const [yiFatura,setYiFatura]=useState("");
  const [yiRows,setYiRows]=useState<YIRow[]>([]);
  const [yiF,setYiF]=useState({musteri:"",sebep:"",sku:"",adet:"",not:""});
  const [ihRows,setIhRows]=useState<IHRow[]>([]);
  const [ihF,setIhF]=useState({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});
  const [mkRows,setMkRows]=useState<MKRow[]>([]);
  const [mkF,setMkF]=useState({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),adet:"",cesit:"",durum:"BAŞLAMADI"});
  const [stYi,setStYi]=useState<US>("idle"); const [msgYi,setMsgYi]=useState("");
  const [stIh,setStIh]=useState<US>("idle"); const [msgIh,setMsgIh]=useState("");
  const [stIr,setStIr]=useState<US>("idle"); const [msgIr,setMsgIr]=useState("");
  const refYi=useRef<HTMLInputElement>(null);
  const refIh=useRef<HTMLInputElement>(null);
  const refIr=useRef<HTMLInputElement>(null);

  const yiKalan=(parseInt(yiSiparis)||0)-(parseInt(yiFatura)||0);
  const longDate=new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});

  async function parseExcel(file:File, mode:"yi"|"ih"|"ir") {
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
        const iDep=hRow.findIndex((c:any)=>sv(c)==="Depo");
        const iBno=hRow.findIndex((c:any)=>sv(c)==="BelgeNo");
        const iBn2=hRow.findIndex((c:any)=>sv(c)==="BelgeNo2");
        const iTar=hRow.findIndex((c:any)=>sv(c)==="Tarih");
        const iCnm=hRow.findIndex((c:any)=>sv(c).includes("Cari İsmi"));
        const iAdt=hRow.findIndex((c:any)=>sv(c)==="Adet");
        const iCes=hRow.findIndex((c:any)=>sv(c)==="Çeşit");
        const iDur=hRow.findIndex((c:any)=>sv(c)==="Durum");
        const rows:MKRow[]=[];
        for(let i=(hi>=0?hi+1:1);i<data.length;i++){
          const r=data[i];
          const fir=sv(iCnm>=0?r[iCnm]:r[6]); if(!fir)continue;
          const raw=sv(iDur>=0?r[iDur]:r[9]);
          rows.push({id:uid(),firma:fir,depo:sv(iDep>=0?r[iDep]:r[1])||"TEM.34",
            belgeNo:sv(iBno>=0?r[iBno]:r[2]),belgeNo2:sv(iBn2>=0?r[iBn2]:r[3]),
            tarih:xlDate(iTar>=0?r[iTar]:r[4])||todayStr(),adet:ns(iAdt>=0?r[iAdt]:r[7]),
            cesit:ns(iCes>=0?r[iCes]:r[8]),
            durum:raw==="Başlamadı"?"BAŞLAMADI":raw==="İşlemde"?"İŞLEMDE":raw==="Tamamlandı"?"TAMAMLANDI":raw||"BAŞLAMADI"});
        }
        setMkRows(rows);
        const tot=rows.reduce((s,r)=>s+(parseInt(r.adet)||0),0);
        setM(`${rows.length} belge · ${tot.toLocaleString("tr-TR")} adet`);
        setTab("malkabul");
      } else {
        const hi=data.findIndex(r=>r.some((c:any)=>sv(c)==="Müşteri"||sv(c).includes("MÜŞTERİ")));
        const hRow=hi>=0?data[hi]:data[0];
        const iMus=hRow.findIndex((c:any)=>sv(c)==="Müşteri"||sv(c).includes("MÜŞTERİ"));
        const iIl=hRow.findIndex((c:any)=>sv(c)==="İl"||sv(c)==="ÜLKE");
        const iTar=hRow.findIndex((c:any)=>sv(c).includes("Tarih")||sv(c).includes("TARİH"));
        const iAdt=hRow.findIndex((c:any)=>sv(c)==="Adet"||sv(c)==="ADET");
        const iCes=hRow.findIndex((c:any)=>sv(c)==="Çeşit"||sv(c)==="SKU");
        const newRows:IHRow[]=[];
        let count=0;
        for(let i=(hi>=0?hi+1:1);i<data.length;i++){
          const r=data[i];
          const mus=sv(iMus>=0?r[iMus]:r[3]); if(!mus)continue;
          count++;
          if(mode==="ih") newRows.push({id:uid(),musteri:mus,ulke:sv(iIl>=0?r[iIl]:r[4]),
            ilkTarih:parseTrDate(sv(iTar>=0?r[iTar]:r[2])),cikisTarih:"",sebep:"",
            sku:ns(iCes>=0?r[iCes]:r[7]),adet:ns(iAdt>=0?r[iAdt]:r[6])});
        }
        if(mode==="yi"){setYiFatura(String(count));setM(`${count} fatura`);setTab("yurtici");}
        else{setIhRows(r=>[...r,...newRows]);setM(`${newRows.length} sipariş`);setTab("ihracat");}
      }
      setS("ok");
    }catch(e){setM("Dosya okunamadı");setS("err");}
  }

  const addYi=()=>{if(!yiF.musteri.trim())return;setYiRows(r=>[...r,{...yiF,id:uid()}]);setYiF({musteri:"",sebep:"",sku:"",adet:"",not:""});};
  const addIh=()=>{if(!ihF.musteri.trim())return;setIhRows(r=>[...r,{...ihF,id:uid()}]);setIhF({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});};
  const addMk=()=>{if(!mkF.firma.trim())return;setMkRows(r=>[...r,{...mkF,id:uid()}]);setMkF({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),adet:"",cesit:"",durum:"BAŞLAMADI"});};

  function shareWA(){
    const d=new Date().toLocaleDateString("tr-TR");
    let msg=`📋 *GÜN SONU RAPORU — ${d}*\n\n`;
    msg+=`*🚚 YURTİÇİ*\nSipariş: ${yiSiparis||0} | Faturalanan: ${yiFatura||0} | Kalan: ${yiKalan}\n`;
    if(yiRows.length>0)yiRows.forEach(r=>{msg+=`• ${r.musteri} — ${r.sebep}`;if(r.sku)msg+=` | ${r.sku} SKU`;if(r.adet)msg+=` | ${r.adet} Adet`;if(r.not)msg+=` | ${r.not}`;msg+="\n";});
    else msg+="Tüm siparişler faturalandı ✅\n";
    msg+=`\n*✈️ İHRACAT*\n`;
    if(!ihRows.length)msg+="Kayıt yok\n";
    else ihRows.forEach(r=>{const s=calcStatus(r);const e=s?.renk==="#16a34a"?"🟢":s?.renk==="#d97706"?"🟡":"🔴";msg+=`${e} ${r.musteri} (${r.ulke||"?"}) — ${s?.durum||"—"}\n`;});
    msg+=`\n*📦 MAL KABUL*\n`;
    if(!mkRows.length)msg+="Kayıt yok\n";
    else{const tot=mkRows.reduce((s,r)=>s+(parseInt(r.adet)||0),0);msg+=`${mkRows.length} belge — ${tot.toLocaleString("tr-TR")} adet\n`;mkRows.forEach(r=>msg+=`• ${r.firma} | ${r.depo} | ${r.adet} | ${r.durum}\n`);}
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  }

  return(
    <div style={D.page}>
      {/* Sabit arka plan görseli */}
      <div style={D.bgFixed}/>

      {/* HEADER — 88px */}
      <header style={D.header}>
        <div style={D.headerInner}>
          <div style={D.headerLeft}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full-color.png" alt="Başarı Otomotiv" style={D.logo}/>
            <div style={D.hdivider}/>
            <div style={D.pageTitle}>
              <span>📅</span>
              <span>Gün Sonu İzleme</span>
              <span style={{color:"#CBD5E1"}}>•</span>
              <span style={D.pageDate}>{longDate}</span>
            </div>
          </div>
          <div style={D.headerRight}>
            <div style={D.icoCircle}>🔔<span style={D.badge}>1</span></div>
            <div style={D.icoCircle}>?</div>
            <div style={D.icoCircle}>BO</div>
            <span style={{color:"#0B214A",fontWeight:900,fontSize:18,cursor:"pointer"}}>⌄</span>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <main style={D.main}>
        <div style={D.container}>

          {/* SEKME SATIRI */}
          <div style={D.tabRow}>
            <div style={D.tabsCard}>
              {([["yurtici","🚚","Yurtiçi"],["ihracat","🌐","İhracat"],["malkabul","📦","Mal Kabul"]] as const).map(([k,ic,lb])=>(
                <button key={k} onClick={()=>setTab(k as Tab)}
                  style={tab===k?{...D.tabBtn,...D.tabActive}:D.tabBtn}>
                  <span style={{fontSize:22}}>{ic}</span>{lb}
                  {tab===k&&<span style={D.tabTriangle}/>}
                </button>
              ))}
            </div>
            <button style={D.sendBtn} onClick={shareWA}>
              <span style={{fontSize:26}}>⇧</span>Gönder
            </button>
          </div>

          {/* ══ YURTİÇİ ══ */}
          {tab==="yurtici"&&<>
            {/* Upload — 780px */}
            <div style={D.uploadCard}>
              <div style={D.secTitle}><span>☁️</span>ZEUS'TAN EXCEL YÜKLEME</div>
              <div style={D.uploadGrid3}>
                <UpBox icon="📋" title="Yurtiçi İş Talepleri" st={stYi} msg={msgYi} onPick={()=>refYi.current?.click()}/>
                <UpBox icon="🌐" title="İhracat İş Talepleri" st={stIh} msg={msgIh} onPick={()=>refIh.current?.click()}/>
                <UpBox icon="📦" title="İrsaliye" st={stIr} msg={msgIr} onPick={()=>refIr.current?.click()}/>
              </div>
              <div style={D.helper}>ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle</div>
            </div>

            {/* Sayaçlar — 780px */}
            <div style={D.statsRow}>
              <div style={D.statCard}>
                <div style={{...D.statIcon,background:"#EAF4FF",color:"#0878E8"}}>📋</div>
                <div>
                  <div style={D.statLabel}>Sipariş Sayısı</div>
                  <input type="number" inputMode="numeric" placeholder="0" value={yiSiparis}
                    onChange={e=>setYiSiparis(e.target.value)}
                    style={{...D.statNum,border:"none",outline:"none",background:"transparent",width:120,fontFamily:"inherit"}}/>
                </div>
              </div>
              <div style={D.statCard}>
                <div style={{...D.statIcon,background:"#F2ECFF",color:"#7C4DFF"}}>🧾</div>
                <div>
                  <div style={D.statLabel}>Faturalanan</div>
                  <input type="number" inputMode="numeric" placeholder="0" value={yiFatura}
                    onChange={e=>setYiFatura(e.target.value)}
                    style={{...D.statNum,border:"none",outline:"none",background:"transparent",width:120,fontFamily:"inherit"}}/>
                </div>
              </div>
              <div style={D.statCard}>
                <div style={{...D.statIcon,background:"#EAF9EF",color:"#16A34A",fontSize:26,fontWeight:900}}>✓</div>
                <div>
                  <div style={D.statLabel}>Kalan</div>
                  <div style={{...D.statNum,color:yiKalan>0?"#dc2626":"#16A34A"}}>{yiKalan}</div>
                </div>
              </div>
            </div>

            {/* Form — 820px */}
            <div style={D.formCard}>
              <div style={D.formTitle}><span>＋</span>BEKLEYEN MÜŞTERİ EKLE</div>
              <FInput icon="👤" label="Müşteri Adı *" placeholder="Müşteri adını giriniz" value={yiF.musteri} onChange={v=>setYiF({...yiF,musteri:v})}/>
              <FSelect icon="📦" label="Çıkmama Sebebi" value={yiF.sebep} onChange={v=>setYiF({...yiF,sebep:v})}
                opts={["TIR İLE SEVK EDİLECEK","CUT OF SONRASI DÜŞEN SİPARİŞ","ELLEÇLEME","KULVARDA","DİĞER"]}/>
              <div style={D.row2}>
                <FInput icon="◇" label="SKU" placeholder="SKU" type="number" value={yiF.sku} onChange={v=>setYiF({...yiF,sku:v})}/>
                <FInput icon="▤" label="Adet" placeholder="Adet" type="number" value={yiF.adet} onChange={v=>setYiF({...yiF,adet:v})}/>
              </div>
              <FInput icon="▣" label="Not (isteğe bağlı)" placeholder="Not giriniz (isteğe bağlı)" value={yiF.not} onChange={v=>setYiF({...yiF,not:v})}/>
              <button style={D.addBtn} onClick={addYi}>
                <span style={{color:"#F2AD32",fontSize:22}}>⊕</span>Ekle
              </button>
            </div>

            {/* Liste / Success */}
            {yiRows.length===0?(
              <div style={D.successBanner}>
                <span style={D.checkCircle}>✓</span>
                Bekleyen müşteri yok — tüm siparişler faturalandı
              </div>
            ):yiRows.map(r=>(
              <div key={r.id} style={{...D.rowCard,borderLeft:"4px solid #fca5a5"}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:900,fontSize:17,color:"#0B214A",marginBottom:6}}>{r.musteri}</div>
                  {r.sebep&&<span style={{...D.tag,background:"#FEF3C7",color:"#92400E"}}>{r.sebep}</span>}
                  <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap" as const}}>
                    {r.sku&&<span style={{...D.tag,background:"#EFF6FF",color:"#1d4ed8"}}>{r.sku} SKU</span>}
                    {r.adet&&<span style={{...D.tag,background:"#EFF6FF",color:"#1d4ed8"}}>{fmtN(r.adet)} Adet</span>}
                  </div>
                  {r.not&&<div style={{color:"#6b7280",fontSize:13,marginTop:6,fontStyle:"italic"}}>{r.not}</div>}
                </div>
                <button style={D.delBtn} onClick={()=>setYiRows(rs=>rs.filter(x=>x.id!==r.id))}>×</button>
              </div>
            ))}
          </>}

          {/* ══ İHRACAT ══ */}
          {tab==="ihracat"&&<>
            <div style={D.uploadCard}>
              <div style={D.secTitle}><span>☁️</span>ZEUS'TAN EXCEL YÜKLEME</div>
              <div style={D.uploadGrid1}>
                <UpBox icon="🌐" title="İhracat İş Talepleri" st={stIh} msg={msgIh} onPick={()=>refIh.current?.click()}/>
              </div>
              <div style={D.helper}>ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle</div>
            </div>

            {ihRows.length===0?(
              <div style={D.emptyBanner}><span style={{fontSize:32}}>✈️</span>İhracat siparişi yok</div>
            ):ihRows.map(r=>{
              const s=calcStatus(r);
              return(
                <div key={r.id} style={{...D.rowCard,borderLeft:`4px solid ${s?.renk||"#CBD5E1"}`}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap" as const}}>
                      <span style={{fontWeight:900,fontSize:17,color:"#0B214A"}}>{r.musteri}</span>
                      {r.ulke&&<span style={{...D.tag,background:"#F1F5F9",color:"#475569"}}>{r.ulke}</span>}
                    </div>
                    {s&&<span style={{...D.tag,background:s.renk+"18",color:s.renk,border:`1px solid ${s.renk}40`}}>{s.durum}</span>}
                    <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap" as const}}>
                      {r.sku&&<span style={{...D.tag,background:"#EFF6FF",color:"#1d4ed8"}}>{r.sku} SKU</span>}
                      {r.adet&&<span style={{...D.tag,background:"#EFF6FF",color:"#1d4ed8"}}>{fmtN(r.adet)} Adet</span>}
                    </div>
                    {!r.cikisTarih&&(
                      <button onClick={()=>setIhRows(rs=>rs.map(x=>x.id===r.id?{...x,sebep:"GÖNDERİLDİ",cikisTarih:todayStr()}:x))}
                        style={{marginTop:8,border:"none",background:"none",color:"#16a34a",fontSize:14,fontWeight:800,cursor:"pointer",padding:0,fontFamily:"inherit"}}>
                        ✓ Gönderildi olarak işaretle
                      </button>
                    )}
                  </div>
                  <button style={D.delBtn} onClick={()=>setIhRows(rs=>rs.filter(x=>x.id!==r.id))}>×</button>
                </div>
              );
            })}

            <div style={D.formCard}>
              <div style={D.formTitle}><span>＋</span>MANUEL SİPARİŞ EKLE</div>
              <FInput icon="👤" label="Müşteri / Alıcı Adı *" placeholder="Müşteri adını giriniz" value={ihF.musteri} onChange={v=>setIhF({...ihF,musteri:v})}/>
              <FInput icon="🌍" label="Ülke / Şehir" placeholder="Ülke veya şehir" value={ihF.ulke} onChange={v=>setIhF({...ihF,ulke:v})}/>
              <div style={D.row2}>
                <div style={D.field}>
                  <span style={{fontSize:22,flexShrink:0}}>📅</span>
                  <div style={{flex:1}}>
                    <div style={D.fLabel}>İlk Sipariş Tarihi</div>
                    <input type="date" value={ihF.ilkTarih} onChange={e=>setIhF({...ihF,ilkTarih:e.target.value})}
                      style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit",marginTop:2}}/>
                  </div>
                </div>
                <div style={D.field}>
                  <span style={{fontSize:22,flexShrink:0}}>📅</span>
                  <div style={{flex:1}}>
                    <div style={D.fLabel}>Çıkış Tarihi</div>
                    <input type="date" value={ihF.cikisTarih} onChange={e=>setIhF({...ihF,cikisTarih:e.target.value})}
                      style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit",marginTop:2}}/>
                  </div>
                </div>
              </div>
              <div style={D.row2}>
                <FInput icon="◇" label="SKU (Çeşit)" placeholder="SKU sayısı" type="number" value={ihF.sku} onChange={v=>setIhF({...ihF,sku:v})}/>
                <FInput icon="▤" label="Adet" placeholder="Adet" type="number" value={ihF.adet} onChange={v=>setIhF({...ihF,adet:v})}/>
              </div>
              <button style={D.addBtn} onClick={addIh}><span style={{color:"#F2AD32",fontSize:22}}>⊕</span>Ekle</button>
            </div>
          </>}

          {/* ══ MAL KABUL ══ */}
          {tab==="malkabul"&&<>
            <div style={D.uploadCard}>
              <div style={D.secTitle}><span>☁️</span>ZEUS'TAN EXCEL YÜKLEME</div>
              <div style={D.uploadGrid1}>
                <UpBox icon="📦" title="İrsaliye" st={stIr} msg={msgIr} onPick={()=>refIr.current?.click()}/>
              </div>
              <div style={D.helper}>ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle</div>
            </div>

            {mkRows.length===0?(
              <div style={D.emptyBanner}><span style={{fontSize:32}}>📦</span>Mal kabul kaydı yok</div>
            ):mkRows.map(r=>{
              const dc=r.durum==="TAMAMLANDI"?"#16a34a":r.durum==="İŞLEMDE"?"#d97706":"#94a3b8";
              return(
                <div key={r.id} style={{...D.rowCard,borderLeft:`4px solid ${dc}`}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:900,fontSize:17,color:"#0B214A",marginBottom:6}}>{r.firma}</div>
                    <span style={{...D.tag,background:dc+"18",color:dc,border:`1px solid ${dc}40`}}>{r.durum}</span>
                    <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap" as const}}>
                      <span style={{...D.tag,background:"#F1F5F9",color:"#475569"}}>{r.depo}</span>
                      {r.adet&&<span style={{...D.tag,background:"#EFF6FF",color:"#1d4ed8"}}>{fmtN(r.adet)} Adet</span>}
                      {r.cesit&&<span style={{...D.tag,background:"#EFF6FF",color:"#1d4ed8"}}>{r.cesit} Çeşit</span>}
                      <span style={{...D.tag,background:"#F1F5F9",color:"#475569"}}>{fmtDate(r.tarih)}</span>
                    </div>
                    {(r.belgeNo||r.belgeNo2)&&<div style={{color:"#94a3b8",fontSize:12,marginTop:6,fontFamily:"monospace"}}>{r.belgeNo}{r.belgeNo2?" / "+r.belgeNo2:""}</div>}
                  </div>
                  <button style={D.delBtn} onClick={()=>setMkRows(rs=>rs.filter(x=>x.id!==r.id))}>×</button>
                </div>
              );
            })}

            <div style={D.formCard}>
              <div style={D.formTitle}><span>＋</span>MANUEL MAL KABUL EKLE</div>
              <FInput icon="🏭" label="Firma Adı *" placeholder="Firma adını giriniz" value={mkF.firma} onChange={v=>setMkF({...mkF,firma:v})}/>
              <div style={D.row2}>
                <FSelect icon="🏠" label="Depo" value={mkF.depo} onChange={v=>setMkF({...mkF,depo:v})} opts={["TEM.34","Kartepe","Çatalca","Ankara"]}/>
                <div style={D.field}>
                  <span style={{fontSize:22,flexShrink:0}}>📅</span>
                  <div style={{flex:1}}>
                    <div style={D.fLabel}>Tarih</div>
                    <input type="date" value={mkF.tarih} onChange={e=>setMkF({...mkF,tarih:e.target.value})}
                      style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit",marginTop:2}}/>
                  </div>
                </div>
              </div>
              <div style={D.row2}>
                <FInput icon="📄" label="Belge No" placeholder="Belge No" value={mkF.belgeNo} onChange={v=>setMkF({...mkF,belgeNo:v})}/>
                <FInput icon="▤" label="Adet" placeholder="Adet" type="number" value={mkF.adet} onChange={v=>setMkF({...mkF,adet:v})}/>
              </div>
              <FSelect icon="◇" label="Durum" value={mkF.durum} onChange={v=>setMkF({...mkF,durum:v})} opts={["BAŞLAMADI","İŞLEMDE","TAMAMLANDI","ÜRÜN DEPOYA GELMEDİ"]}/>
              <button style={D.addBtn} onClick={addMk}><span style={{color:"#F2AD32",fontSize:22}}>⊕</span>Ekle</button>
            </div>
          </>}

        </div>
      </main>

      <input ref={refYi} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"yi");e.target.value="";}}/>
      <input ref={refIh} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"ih");e.target.value="";}}/>
      <input ref={refIr} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0];if(f)parseExcel(f,"ir");e.target.value="";}}/>
    </div>
  );
}
