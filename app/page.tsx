"use client";

import { useState, useRef } from "react";

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
interface YIRow { id:string; musteri:string; sebep:string; sku:string; adet:string; not:string; }
interface IHRow { id:string; musteri:string; ulke:string; ilkTarih:string; cikisTarih:string; sebep:string; sku:string; adet:string; }
interface MKRow { id:string; firma:string; depo:string; belgeNo:string; belgeNo2:string; tarih:string; adet:string; cesit:string; durum:string; }
type Tab = "yurtici"|"ihracat"|"malkabul";
type US  = "idle"|"loading"|"ok"|"err";

const uid = () => Math.random().toString(36).slice(2,10);
const sv  = (v:any) => String(v??"").trim();
const ns  = (v:any) => { const n=parseFloat(sv(v)); return isNaN(n)?"":String(Math.round(n)); };
const fmtDate = (d:string) => d ? new Date(d).toLocaleDateString("tr-TR") : "—";
const fmtN    = (v:string|number) => { const n=parseInt(String(v)); return isNaN(n)?"0":n.toLocaleString("tr-TR"); };
const todayStr = () => new Date().toISOString().split("T")[0];
function xlDate(val:any):string {
  if(!val&&val!==0)return"";
  const s=Math.floor(typeof val==="number"?val:parseFloat(sv(val)));
  if(isNaN(s)||s<1)return"";
  const d=new Date(Math.round((s-25569)*86400*1000));
  return`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
}
function parseTrDate(val:string):string {
  const m=val?.match(/(\d{2})\.(\d{2})\.(\d{4})/);
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
  return today<=son?{durum:"TERMİN SÜRESİ İÇİNDE",renk:"#d97706"}:{durum:"TERMİN AŞTI — ACİL",renk:"#dc2626"};
}

// ─── Stiller (sağlanan kodun birebir kopyası) ─────────────────────────────────
const S = {
  page:{minHeight:"100vh",width:"100%",background:"#F7FAFF",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif",color:"#0B214A",position:"relative" as const,overflowX:"hidden" as const},
  bgLayer:{position:"absolute" as const,inset:"88px 0 0 0",backgroundImage:"linear-gradient(90deg,rgba(247,250,255,0.22) 0%,rgba(247,250,255,0.78) 34%,rgba(247,250,255,0.88) 52%,rgba(247,250,255,0.55) 100%),url('/background-logistics.jpg')",backgroundSize:"cover",backgroundPosition:"center",opacity:1,zIndex:0},
  topbar:{height:88,background:"rgba(255,255,255,0.94)",borderBottom:"1px solid #E6ECF5",display:"flex" as const,alignItems:"center" as const,justifyContent:"space-between" as const,padding:"0 46px",boxSizing:"border-box" as const,position:"relative" as const,zIndex:10,boxShadow:"0 8px 24px rgba(11,33,74,0.06)"},
  topLeft:{display:"flex" as const,alignItems:"center" as const,gap:28},
  logoWrap:{display:"flex" as const,alignItems:"center" as const,gap:12,minWidth:300},
  logoMark:{width:74,height:44,borderRadius:10,display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,fontWeight:900,fontSize:34,letterSpacing:-4,color:"#168BDF",background:"linear-gradient(135deg,#EAF7FF,#FFFFFF)",boxShadow:"inset 0 0 0 1px rgba(22,139,223,0.08)"},
  logoText:{fontSize:30,fontWeight:700,letterSpacing:-1,color:"#1786D4",whiteSpace:"nowrap" as const},
  logoTextLight:{color:"#A9ADB4",fontWeight:300,marginLeft:3},
  divider:{width:1,height:38,background:"#D9E2EF"},
  pageTitle:{display:"flex" as const,alignItems:"center" as const,gap:12,fontSize:21,fontWeight:800,color:"#0B214A"},
  date:{color:"#D38314",fontWeight:800,marginLeft:4},
  topRight:{display:"flex" as const,alignItems:"center" as const,gap:18,fontSize:18},
  iconCircle:{width:42,height:42,borderRadius:"50%",border:"1px solid #D9E2EF",display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,background:"#FFFFFF",position:"relative" as const,fontWeight:700,color:"#0B214A"},
  badge:{position:"absolute" as const,top:-8,right:-4,width:22,height:22,borderRadius:"50%",background:"#E4A13A",color:"#FFFFFF",fontSize:12,fontWeight:900,display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const},
  main:{position:"relative" as const,zIndex:2,maxWidth:1280,margin:"0 auto",padding:"24px 28px 34px",boxSizing:"border-box" as const},
  tabRow:{height:66,display:"grid" as const,gridTemplateColumns:"1fr 150px",gap:28,alignItems:"center" as const,marginBottom:20},
  tabs:{display:"grid" as const,gridTemplateColumns:"1fr 1fr 1fr",background:"rgba(255,255,255,0.90)",border:"1px solid #DCE5F1",borderRadius:14,boxShadow:"0 10px 30px rgba(11,33,74,0.10)",overflow:"hidden",height:66},
  tab:{border:"none",background:"transparent",fontSize:18,fontWeight:800,color:"#0B214A",display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,gap:12,position:"relative" as const,cursor:"pointer"},
  activeTab:{background:"linear-gradient(135deg,#008FE3 0%,#003B82 100%)",color:"#FFFFFF",boxShadow:"0 12px 26px rgba(0,72,152,0.24)"},
  activeTriangle:{position:"absolute" as const,bottom:-10,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:"10px solid #004A96"},
  sendBtn:{height:66,border:"none",borderRadius:12,background:"linear-gradient(135deg,#25C964 0%,#0DA044 100%)",color:"#FFFFFF",fontSize:18,fontWeight:900,display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,gap:10,boxShadow:"0 14px 28px rgba(13,160,68,0.28)",cursor:"pointer",width:"100%"},
  uploadCard:{width:860,margin:"0 auto",background:"rgba(255,255,255,0.95)",border:"1px solid #E2E9F3",borderRadius:18,boxShadow:"0 14px 36px rgba(11,33,74,0.12)",padding:"22px 26px 14px",boxSizing:"border-box" as const},
  secTitle:{display:"flex" as const,alignItems:"center" as const,gap:10,color:"#0B3A75",fontSize:17,fontWeight:900,marginBottom:14},
  uploadGrid:{display:"grid" as const,gridTemplateColumns:"1fr 1fr 1fr",gap:18},
  uploadBox:{height:150,border:"2px dashed #C9D5E5",borderRadius:16,display:"flex" as const,flexDirection:"column" as const,alignItems:"center" as const,justifyContent:"center" as const,background:"rgba(255,255,255,0.72)",cursor:"pointer" as const,transition:"border-color 0.2s"},
  uploadIcon:{fontSize:38,color:"#D48A20",lineHeight:1,marginBottom:10},
  uploadTitle:{fontSize:19,fontWeight:900,color:"#0B214A",marginBottom:2},
  uploadSub:{fontSize:14,color:"#2B68A5",marginBottom:12},
  smallBtn:{height:36,padding:"0 22px",borderRadius:8,border:"1px solid #BFD0E6",background:"#FFFFFF",color:"#0B3A75",fontSize:15,fontWeight:800,display:"flex" as const,alignItems:"center" as const,gap:8,cursor:"pointer"},
  helper:{marginTop:12,textAlign:"center" as const,color:"#3D6E9E",fontSize:15,fontWeight:600},
  stats:{width:860,margin:"18px auto 16px",display:"grid" as const,gridTemplateColumns:"1fr 1fr 1fr",gap:16},
  statCard:{height:100,background:"rgba(255,255,255,0.96)",border:"1px solid #E1E9F4",borderRadius:16,boxShadow:"0 12px 28px rgba(11,33,74,0.10)",display:"flex" as const,alignItems:"center" as const,padding:"0 24px",gap:20,boxSizing:"border-box" as const},
  statIcon:{width:58,height:58,borderRadius:14,display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,fontSize:30,fontWeight:900},
  statLabel:{fontSize:16,color:"#27527E",fontWeight:700,marginBottom:4},
  statNumber:{fontSize:40,color:"#071E42",fontWeight:900,lineHeight:1},
  formCard:{width:860,margin:"0 auto",background:"rgba(255,255,255,0.97)",border:"1px solid #E1E9F4",borderRadius:18,boxShadow:"0 16px 38px rgba(11,33,74,0.13)",padding:"20px 22px 16px",boxSizing:"border-box" as const},
  formTitle:{color:"#D48415",fontSize:18,fontWeight:900,marginBottom:14,display:"flex" as const,alignItems:"center" as const,gap:8},
  field:{height:52,border:"1px solid #C9D7E8",borderRadius:9,background:"#FFFFFF",display:"flex" as const,alignItems:"center" as const,padding:"0 16px",gap:12,boxSizing:"border-box" as const,marginBottom:10},
  fieldLabel:{color:"#31567F",fontSize:14,fontWeight:800,lineHeight:1.1},
  fieldSub:{color:"#8A99AF",fontSize:15,marginTop:2},
  row2:{display:"grid" as const,gridTemplateColumns:"1fr 1fr",gap:12},
  addBtn:{height:48,width:"100%",border:"none",borderRadius:8,background:"linear-gradient(135deg,#082A5B 0%,#001C40 100%)",color:"#FFFFFF",fontSize:17,fontWeight:900,display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,gap:10,marginTop:10,cursor:"pointer"},
  success:{width:860,margin:"18px auto 0",minHeight:60,background:"rgba(245,255,249,0.96)",border:"1px solid #CDECD8",borderRadius:16,boxShadow:"0 12px 30px rgba(16,142,69,0.10)",display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,gap:16,color:"#0B8F3C",fontSize:18,fontWeight:900,padding:"12px 20px"},
  checkCircle:{width:34,height:34,borderRadius:"50%",background:"#2FC35E",color:"#FFFFFF",display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,fontWeight:900,fontSize:20,flexShrink:0},
  rowCard:{width:860,margin:"0 auto 10px",background:"rgba(255,255,255,0.97)",border:"1px solid #E1E9F4",borderRadius:14,boxShadow:"0 8px 20px rgba(11,33,74,0.08)",padding:"14px 20px",boxSizing:"border-box" as const,display:"flex" as const,alignItems:"flex-start" as const,justifyContent:"space-between" as const,gap:16},
  delBtn:{width:30,height:30,border:"none",borderRadius:6,background:"#FEF2F2",color:"#ef4444",cursor:"pointer",fontSize:18,display:"flex" as const,alignItems:"center" as const,justifyContent:"center" as const,flexShrink:0},
  input:{width:"100%",height:52,border:"1px solid #C9D7E8",borderRadius:9,background:"#FFFFFF",padding:"0 16px",boxSizing:"border-box" as const,color:"#0B214A",fontSize:15,fontWeight:600,outline:"none",marginBottom:10,fontFamily:"inherit"},
  select:{width:"100%",height:52,border:"1px solid #C9D7E8",borderRadius:9,background:"#FFFFFF",padding:"0 16px",boxSizing:"border-box" as const,color:"#0B214A",fontSize:15,fontWeight:700,outline:"none",marginBottom:10,fontFamily:"inherit"},
};

export default function App() {
  const [tab, setTab] = useState<Tab>("yurtici");
  const [yiSiparis, setYiSiparis] = useState("");
  const [yiFatura,  setYiFatura]  = useState("");
  const [yiRows,    setYiRows]    = useState<YIRow[]>([]);
  const [yiF, setYiF] = useState({musteri:"",sebep:"",sku:"",adet:"",not:""});
  const [ihRows, setIhRows] = useState<IHRow[]>([]);
  const [ihF, setIhF] = useState({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});
  const [mkRows, setMkRows] = useState<MKRow[]>([]);
  const [mkF, setMkF] = useState({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),adet:"",cesit:"",durum:"BAŞLAMADI"});

  const [stYi,setStYi]=useState<US>("idle"); const [msgYi,setMsgYi]=useState("");
  const [stIh,setStIh]=useState<US>("idle"); const [msgIh,setMsgIh]=useState("");
  const [stIr,setStIr]=useState<US>("idle"); const [msgIr,setMsgIr]=useState("");
  const refYi=useRef<HTMLInputElement>(null);
  const refIh=useRef<HTMLInputElement>(null);
  const refIr=useRef<HTMLInputElement>(null);

  const yiKalan = (parseInt(yiSiparis)||0)-(parseInt(yiFatura)||0);
  const longDate = new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});

  async function parseExcel(file:File, mode:"yi"|"ih"|"ir") {
    const setS = mode==="yi"?setStYi:mode==="ih"?setStIh:setStIr;
    const setM = mode==="yi"?setMsgYi:mode==="ih"?setMsgIh:setMsgIr;
    setS("loading");
    try {
      const XLSX = await import("xlsx");
      const wb   = XLSX.read(await file.arrayBuffer());
      const ws   = wb.Sheets["data"] ?? wb.Sheets[wb.SheetNames[0]];
      const data:any[][] = XLSX.utils.sheet_to_json(ws,{header:1,defval:""});

      if (mode==="ir") {
        // İrsaliye → Mal Kabul
        const hi   = data.findIndex(r=>r.some((c:any)=>sv(c)==="Firma"||sv(c)==="FİRMA"));
        const hRow = hi>=0?data[hi]:data[0];
        const iDep = hRow.findIndex((c:any)=>sv(c)==="Depo");
        const iBno = hRow.findIndex((c:any)=>sv(c)==="BelgeNo");
        const iBn2 = hRow.findIndex((c:any)=>sv(c)==="BelgeNo2");
        const iTar = hRow.findIndex((c:any)=>sv(c)==="Tarih");
        const iCnm = hRow.findIndex((c:any)=>sv(c).includes("Cari İsmi"));
        const iAdt = hRow.findIndex((c:any)=>sv(c)==="Adet");
        const iCes = hRow.findIndex((c:any)=>sv(c)==="Çeşit");
        const iDur = hRow.findIndex((c:any)=>sv(c)==="Durum");
        const rows:MKRow[]=[];
        for(let i=(hi>=0?hi+1:1);i<data.length;i++){
          const r=data[i];
          const fir=sv(iCnm>=0?r[iCnm]:r[6]); if(!fir)continue;
          const raw=sv(iDur>=0?r[iDur]:r[9]);
          rows.push({id:uid(),firma:fir,
            depo:sv(iDep>=0?r[iDep]:r[1])||"TEM.34",
            belgeNo:sv(iBno>=0?r[iBno]:r[2]),
            belgeNo2:sv(iBn2>=0?r[iBn2]:r[3]),
            tarih:xlDate(iTar>=0?r[iTar]:r[4])||todayStr(),
            adet:ns(iAdt>=0?r[iAdt]:r[7]),
            cesit:ns(iCes>=0?r[iCes]:r[8]),
            durum:raw==="Başlamadı"?"BAŞLAMADI":raw==="İşlemde"?"İŞLEMDE":raw==="Tamamlandı"?"TAMAMLANDI":raw||"BAŞLAMADI",
          });
        }
        setMkRows(rows);
        const tot=rows.reduce((s,r)=>s+(parseInt(r.adet)||0),0);
        setM(`${rows.length} belge · ${tot.toLocaleString("tr-TR")} adet`);
        setTab("malkabul");
      } else {
        // İş Talepleri (Yurtiçi veya İhracat)
        const hi   = data.findIndex(r=>r.some((c:any)=>sv(c)==="Müşteri"||sv(c).includes("MÜŞTERİ")));
        const hRow = hi>=0?data[hi]:data[0];
        const iMus = hRow.findIndex((c:any)=>sv(c)==="Müşteri"||sv(c).includes("MÜŞTERİ"));
        const iIl  = hRow.findIndex((c:any)=>sv(c)==="İl"||sv(c)==="ÜLKE");
        const iTar = hRow.findIndex((c:any)=>sv(c).includes("Tarih")||sv(c).includes("TARİH"));
        const iAdt = hRow.findIndex((c:any)=>sv(c)==="Adet"||sv(c)==="ADET");
        const iCes = hRow.findIndex((c:any)=>sv(c)==="Çeşit"||sv(c)==="SKU");
        const newRows:IHRow[]=[];
        let count=0;
        for(let i=(hi>=0?hi+1:1);i<data.length;i++){
          const r=data[i];
          const mus=sv(iMus>=0?r[iMus]:r[3]); if(!mus)continue;
          const ulke=sv(iIl>=0?r[iIl]:r[4]);
          const tar=parseTrDate(sv(iTar>=0?r[iTar]:r[2]));
          const adt=ns(iAdt>=0?r[iAdt]:r[6]);
          const ces=ns(iCes>=0?r[iCes]:r[7]);
          count++;
          if(mode==="ih") newRows.push({id:uid(),musteri:mus,ulke,ilkTarih:tar,cikisTarih:"",sebep:"",sku:ces,adet:adt});
        }
        if(mode==="yi") { setYiFatura(String(count)); setM(`${count} fatura`); setTab("yurtici"); }
        else            { setIhRows(r=>[...r,...newRows]); setM(`${newRows.length} sipariş`); setTab("ihracat"); }
      }
      setS("ok");
    } catch(e) { setM("Dosya okunamadı"); setS("err"); }
  }

  const addYi=()=>{if(!yiF.musteri.trim())return; setYiRows(r=>[...r,{...yiF,id:uid()}]); setYiF({musteri:"",sebep:"",sku:"",adet:"",not:""});};
  const addIh=()=>{if(!ihF.musteri.trim())return; setIhRows(r=>[...r,{...ihF,id:uid()}]); setIhF({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});};
  const addMk=()=>{if(!mkF.firma.trim())return;   setMkRows(r=>[...r,{...mkF,id:uid()}]); setMkF({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),adet:"",cesit:"",durum:"BAŞLAMADI"});};

  function shareWA() {
    const d=new Date().toLocaleDateString("tr-TR");
    let msg=`📋 *GÜN SONU RAPORU — ${d}*\n\n`;
    msg+=`*🚚 YURTİÇİ*\nSipariş: ${yiSiparis||0} | Faturalanan: ${yiFatura||0} | Kalan: ${yiKalan}\n`;
    if(yiRows.length>0) yiRows.forEach(r=>{msg+=`• ${r.musteri} — ${r.sebep}`;if(r.sku)msg+=` | ${r.sku} SKU`;if(r.adet)msg+=` | ${r.adet} Adet`;if(r.not)msg+=` | ${r.not}`;msg+="\n";});
    else msg+="Tüm siparişler faturalandı ✅\n";
    msg+=`\n*✈️ İHRACAT*\n`;
    if(!ihRows.length)msg+="Kayıt yok\n";
    else ihRows.forEach(r=>{const s=calcStatus(r);const e=s?.renk==="#16a34a"?"🟢":s?.renk==="#d97706"?"🟡":"🔴";msg+=`${e} ${r.musteri} (${r.ulke||"?"}) — ${s?.durum||"—"}\n`;});
    msg+=`\n*📦 MAL KABUL*\n`;
    if(!mkRows.length)msg+="Kayıt yok\n";
    else{const tot=mkRows.reduce((s,r)=>s+(parseInt(r.adet)||0),0);msg+=`${mkRows.length} belge — ${tot.toLocaleString("tr-TR")} adet\n`; mkRows.forEach(r=>msg+=`• ${r.firma} | ${r.depo} | ${r.adet} Adet | ${r.durum}\n`);}
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  }

  function UploadBox({icon,title,st,msg,onPick}:{icon:string;title:string;st:US;msg:string;onPick:()=>void}) {
    const ok=st==="ok",err=st==="err",loading=st==="loading";
    return(
      <div onClick={onPick}
        style={{...S.uploadBox, borderColor:ok?"#6ee7b7":err?"#fca5a5":loading?"#e2e8f0":"#C9D5E5"}}>
        <div style={S.uploadIcon}>{ok?"✅":err?"❌":loading?"⏳":icon}</div>
        <div style={S.uploadTitle}>{ok||err ? msg : title}</div>
        {!ok&&!err&&<div style={S.uploadSub}>.xlsx / .xls</div>}
        {!ok&&!err&&!loading&&<button style={S.smallBtn} onClick={e=>{e.stopPropagation();onPick();}}>☁️ Dosya Seç</button>}
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.bgLayer}/>

      {/* HEADER */}
      <header style={S.topbar}>
        <div style={S.topLeft}>
          <div style={S.logoWrap}>
            <div style={S.logoMark}>BO</div>
            <div style={S.logoText}>Başarı<span style={S.logoTextLight}>Otomotiv</span></div>
          </div>
          <div style={S.divider}/>
          <div style={S.pageTitle}>
            <span>📅</span>
            <span>Gün Sonu İzleme</span>
            <span>•</span>
            <span style={S.date}>{longDate}</span>
          </div>
        </div>
        <div style={S.topRight}>
          <div style={S.iconCircle}>🔔<span style={S.badge}>1</span></div>
          <div style={S.iconCircle}>?</div>
          <div style={S.iconCircle}>BO</div>
          <span style={{color:"#0B214A",fontWeight:900}}>⌄</span>
        </div>
      </header>

      <main style={S.main}>
        {/* TABS */}
        <div style={S.tabRow}>
          <div style={S.tabs}>
            {([["yurtici","🚚","Yurtiçi"],["ihracat","🌐","İhracat"],["malkabul","📦","Mal Kabul"]] as const).map(([k,ic,lb])=>(
              <button key={k} onClick={()=>setTab(k as Tab)}
                style={tab===k?{...S.tab,...S.activeTab}:S.tab}>
                <span>{ic}</span>{lb}
                {tab===k&&<span style={S.activeTriangle}/>}
              </button>
            ))}
          </div>
          <button style={S.sendBtn} onClick={shareWA}><span style={{fontSize:24}}>⇧</span>Gönder</button>
        </div>

        {/* ══ YURTİÇİ ══ */}
        {tab==="yurtici"&&<>
          <section style={S.uploadCard}>
            <div style={S.secTitle}><span>☁️</span>ZEUS'TAN EXCEL YÜKLEME</div>
            <div style={S.uploadGrid}>
              <UploadBox icon="📋" title="Yurtiçi İş Talepleri" st={stYi} msg={msgYi} onPick={()=>refYi.current?.click()}/>
              <UploadBox icon="🌐" title="İhracat İş Talepleri" st={stIh} msg={msgIh} onPick={()=>refIh.current?.click()}/>
              <UploadBox icon="📦" title="İrsaliye" st={stIr} msg={msgIr} onPick={()=>refIr.current?.click()}/>
            </div>
            <div style={S.helper}>ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle</div>
          </section>

          <section style={S.stats}>
            <div style={S.statCard}>
              <div style={{...S.statIcon,background:"#EAF4FF",color:"#0878E8"}}>📋</div>
              <div>
                <div style={S.statLabel}>Sipariş Sayısı</div>
                <input type="number" inputMode="numeric" placeholder="0" value={yiSiparis}
                  onChange={e=>setYiSiparis(e.target.value)}
                  style={{...S.statNumber,border:"none",outline:"none",background:"transparent",width:100,fontFamily:"inherit"}}/>
              </div>
            </div>
            <div style={S.statCard}>
              <div style={{...S.statIcon,background:"#F2ECFF",color:"#7C4DFF"}}>🧾</div>
              <div>
                <div style={S.statLabel}>Faturalanan</div>
                <input type="number" inputMode="numeric" placeholder="0" value={yiFatura}
                  onChange={e=>setYiFatura(e.target.value)}
                  style={{...S.statNumber,border:"none",outline:"none",background:"transparent",width:100,fontFamily:"inherit"}}/>
              </div>
            </div>
            <div style={S.statCard}>
              <div style={{...S.statIcon,background:"#EAF9EF",color:"#16A34A",fontSize:28}}>✓</div>
              <div>
                <div style={S.statLabel}>Kalan</div>
                <div style={{...S.statNumber,color:yiKalan>0?"#dc2626":"#16A34A"}}>{yiKalan}</div>
              </div>
            </div>
          </section>

          <section style={S.formCard}>
            <div style={S.formTitle}><span>＋</span>BEKLEYEN MÜŞTERİ EKLE</div>
            <div style={S.field}>
              <span style={{fontSize:22}}>👤</span>
              <div style={{flex:1}}>
                <div style={S.fieldLabel}>Müşteri Adı *</div>
                <input value={yiF.musteri} onChange={e=>setYiF({...yiF,musteri:e.target.value})}
                  placeholder="Müşteri adını giriniz" style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
              </div>
            </div>
            <div style={{...S.field,justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:21}}>📦</span>
                <select value={yiF.sebep} onChange={e=>setYiF({...yiF,sebep:e.target.value})}
                  style={{border:"none",outline:"none",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit",fontWeight:800}}>
                  <option value="">— Seçin —</option>
                  {["TIR İLE SEVK EDİLECEK","CUT OF SONRASI DÜŞEN SİPARİŞ","ELLEÇLEME","KULVARDA","DİĞER"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <span style={{color:"#0B214A",fontWeight:900}}>⌄</span>
            </div>
            <div style={S.row2}>
              <div style={S.field}>
                <span style={{fontSize:21}}>◇</span>
                <div style={{flex:1}}>
                  <div style={S.fieldLabel}>SKU</div>
                  <input type="number" inputMode="numeric" value={yiF.sku} onChange={e=>setYiF({...yiF,sku:e.target.value})} placeholder="SKU"
                    style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
                </div>
              </div>
              <div style={S.field}>
                <span style={{fontSize:21}}>▤</span>
                <div style={{flex:1}}>
                  <div style={S.fieldLabel}>Adet</div>
                  <input type="number" inputMode="numeric" value={yiF.adet} onChange={e=>setYiF({...yiF,adet:e.target.value})} placeholder="Adet"
                    style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
                </div>
              </div>
            </div>
            <div style={S.field}>
              <span style={{fontSize:21}}>▣</span>
              <div style={{flex:1}}>
                <div style={S.fieldLabel}>Not (isteğe bağlı)</div>
                <input value={yiF.not} onChange={e=>setYiF({...yiF,not:e.target.value})} placeholder="Not giriniz (isteğe bağlı)"
                  style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
              </div>
            </div>
            <button style={S.addBtn} onClick={addYi}>
              <span style={{color:"#F2AD32",fontSize:22}}>⊕</span>Ekle
            </button>
          </section>

          {yiRows.length===0?(
            <section style={S.success}>
              <span style={S.checkCircle}>✓</span>
              Bekleyen müşteri yok — tüm siparişler faturalandı
            </section>
          ):yiRows.map(r=>(
            <div key={r.id} style={S.rowCard}>
              <div style={{flex:1}}>
                <div style={{fontWeight:900,fontSize:17,color:"#0B214A",marginBottom:4}}>{r.musteri}</div>
                {r.sebep&&<span style={{background:"#FEF3C7",color:"#92400E",borderRadius:6,padding:"2px 10px",fontSize:13,fontWeight:700}}>{r.sebep}</span>}
                <div style={{display:"flex",gap:10,marginTop:6}}>
                  {r.sku&&<span style={{background:"#EFF6FF",color:"#1d4ed8",borderRadius:6,padding:"2px 10px",fontSize:13,fontWeight:700}}>{r.sku} SKU</span>}
                  {r.adet&&<span style={{background:"#EFF6FF",color:"#1d4ed8",borderRadius:6,padding:"2px 10px",fontSize:13,fontWeight:700}}>{fmtN(r.adet)} Adet</span>}
                </div>
                {r.not&&<div style={{color:"#6b7280",fontSize:13,marginTop:4,fontStyle:"italic"}}>{r.not}</div>}
              </div>
              <button style={S.delBtn} onClick={()=>setYiRows(rs=>rs.filter(x=>x.id!==r.id))}>×</button>
            </div>
          ))}
        </>}

        {/* ══ İHRACAT ══ */}
        {tab==="ihracat"&&<>
          <section style={S.uploadCard}>
            <div style={S.secTitle}><span>☁️</span>ZEUS'TAN EXCEL YÜKLEME</div>
            <div style={{...S.uploadGrid,gridTemplateColumns:"1fr"}}>
              <UploadBox icon="🌐" title="İhracat İş Talepleri" st={stIh} msg={msgIh} onPick={()=>refIh.current?.click()}/>
            </div>
            <div style={S.helper}>ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle</div>
          </section>

          {ihRows.length===0?(
            <section style={{...S.success,color:"#6b7280",background:"rgba(255,255,255,0.95)",border:"1px solid #E1E9F4",boxShadow:"0 12px 30px rgba(11,33,74,0.08)"}}>
              <span style={{fontSize:32}}>✈️</span>
              İhracat siparişi yok
            </section>
          ):ihRows.map(r=>{
            const s=calcStatus(r);
            return(
              <div key={r.id} style={{...S.rowCard,borderLeft:`3px solid ${s?.renk||"#E1E9F4"}`}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <span style={{fontWeight:900,fontSize:17,color:"#0B214A"}}>{r.musteri}</span>
                    {r.ulke&&<span style={{background:"#F1F5F9",color:"#475569",borderRadius:5,padding:"1px 8px",fontSize:12,fontWeight:700}}>{r.ulke}</span>}
                  </div>
                  {s&&<span style={{background:s.renk+"20",color:s.renk,border:`1px solid ${s.renk}40`,borderRadius:20,padding:"2px 12px",fontSize:13,fontWeight:800}}>{s.durum}</span>}
                  <div style={{display:"flex",gap:10,marginTop:6}}>
                    {r.sku&&<span style={{background:"#EFF6FF",color:"#1d4ed8",borderRadius:6,padding:"2px 10px",fontSize:13,fontWeight:700}}>{r.sku} SKU</span>}
                    {r.adet&&<span style={{background:"#EFF6FF",color:"#1d4ed8",borderRadius:6,padding:"2px 10px",fontSize:13,fontWeight:700}}>{fmtN(r.adet)} Adet</span>}
                  </div>
                  {!r.cikisTarih&&(
                    <button onClick={()=>setIhRows(rs=>rs.map(x=>x.id===r.id?{...x,sebep:"GÖNDERİLDİ",cikisTarih:todayStr()}:x))}
                      style={{marginTop:6,border:"none",background:"none",color:"#16a34a",fontSize:13,fontWeight:800,cursor:"pointer",padding:0}}>
                      ✓ Gönderildi olarak işaretle
                    </button>
                  )}
                </div>
                <button style={S.delBtn} onClick={()=>setIhRows(rs=>rs.filter(x=>x.id!==r.id))}>×</button>
              </div>
            );
          })}

          <section style={S.formCard}>
            <div style={S.formTitle}><span>＋</span>MANUEL SİPARİŞ EKLE</div>
            <div style={S.field}>
              <span style={{fontSize:22}}>👤</span>
              <div style={{flex:1}}>
                <div style={S.fieldLabel}>Müşteri / Alıcı Adı *</div>
                <input value={ihF.musteri} onChange={e=>setIhF({...ihF,musteri:e.target.value})} placeholder="Müşteri adını giriniz"
                  style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
              </div>
            </div>
            <div style={S.field}>
              <span style={{fontSize:22}}>🌍</span>
              <div style={{flex:1}}>
                <div style={S.fieldLabel}>Ülke / Şehir</div>
                <input value={ihF.ulke} onChange={e=>setIhF({...ihF,ulke:e.target.value})} placeholder="Ülke veya şehir"
                  style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
              </div>
            </div>
            <div style={S.row2}>
              <div style={S.field}>
                <span style={{fontSize:21}}>📅</span>
                <div style={{flex:1}}>
                  <div style={S.fieldLabel}>İlk Sipariş Tarihi</div>
                  <input type="date" value={ihF.ilkTarih} onChange={e=>setIhF({...ihF,ilkTarih:e.target.value})}
                    style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
                </div>
              </div>
              <div style={S.field}>
                <span style={{fontSize:21}}>📅</span>
                <div style={{flex:1}}>
                  <div style={S.fieldLabel}>Çıkış Tarihi</div>
                  <input type="date" value={ihF.cikisTarih} onChange={e=>setIhF({...ihF,cikisTarih:e.target.value})}
                    style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
                </div>
              </div>
            </div>
            <div style={S.row2}>
              <div style={S.field}>
                <span style={{fontSize:21}}>◇</span>
                <div style={{flex:1}}>
                  <div style={S.fieldLabel}>SKU (Çeşit)</div>
                  <input type="number" inputMode="numeric" value={ihF.sku} onChange={e=>setIhF({...ihF,sku:e.target.value})} placeholder="SKU"
                    style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
                </div>
              </div>
              <div style={S.field}>
                <span style={{fontSize:21}}>▤</span>
                <div style={{flex:1}}>
                  <div style={S.fieldLabel}>Adet</div>
                  <input type="number" inputMode="numeric" value={ihF.adet} onChange={e=>setIhF({...ihF,adet:e.target.value})} placeholder="Adet"
                    style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
                </div>
              </div>
            </div>
            <button style={S.addBtn} onClick={addIh}><span style={{color:"#F2AD32",fontSize:22}}>⊕</span>Ekle</button>
          </section>
        </>}

        {/* ══ MAL KABUL ══ */}
        {tab==="malkabul"&&<>
          <section style={S.uploadCard}>
            <div style={S.secTitle}><span>☁️</span>ZEUS'TAN EXCEL YÜKLEME</div>
            <div style={{...S.uploadGrid,gridTemplateColumns:"1fr"}}>
              <UploadBox icon="📦" title="İrsaliye" st={stIr} msg={msgIr} onPick={()=>refIr.current?.click()}/>
            </div>
            <div style={S.helper}>ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle</div>
          </section>

          {mkRows.length===0?(
            <section style={{...S.success,color:"#6b7280",background:"rgba(255,255,255,0.95)",border:"1px solid #E1E9F4",boxShadow:"0 12px 30px rgba(11,33,74,0.08)"}}>
              <span style={{fontSize:32}}>📦</span>Mal kabul kaydı yok
            </section>
          ):mkRows.map(r=>{
            const dc=r.durum==="TAMAMLANDI"?"#16a34a":r.durum==="İŞLEMDE"?"#d97706":"#94a3b8";
            return(
              <div key={r.id} style={{...S.rowCard,borderLeft:`3px solid ${dc}`}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:900,fontSize:17,color:"#0B214A",marginBottom:4}}>{r.firma}</div>
                  <span style={{background:dc+"20",color:dc,border:`1px solid ${dc}40`,borderRadius:20,padding:"2px 12px",fontSize:13,fontWeight:800}}>{r.durum}</span>
                  <div style={{display:"flex",flexWrap:"wrap" as const,gap:8,marginTop:6}}>
                    <span style={{background:"#F1F5F9",color:"#475569",borderRadius:6,padding:"2px 10px",fontSize:13,fontWeight:700}}>{r.depo}</span>
                    {r.adet&&<span style={{background:"#EFF6FF",color:"#1d4ed8",borderRadius:6,padding:"2px 10px",fontSize:13,fontWeight:700}}>{fmtN(r.adet)} Adet</span>}
                    {r.cesit&&<span style={{background:"#EFF6FF",color:"#1d4ed8",borderRadius:6,padding:"2px 10px",fontSize:13,fontWeight:700}}>{r.cesit} Çeşit</span>}
                    <span style={{background:"#F1F5F9",color:"#475569",borderRadius:6,padding:"2px 10px",fontSize:13,fontWeight:700}}>{fmtDate(r.tarih)}</span>
                  </div>
                  {(r.belgeNo||r.belgeNo2)&&<div style={{color:"#94a3b8",fontSize:12,marginTop:4,fontFamily:"monospace"}}>{r.belgeNo}{r.belgeNo2?" / "+r.belgeNo2:""}</div>}
                </div>
                <button style={S.delBtn} onClick={()=>setMkRows(rs=>rs.filter(x=>x.id!==r.id))}>×</button>
              </div>
            );
          })}

          <section style={S.formCard}>
            <div style={S.formTitle}><span>＋</span>MANUEL MAL KABUL EKLE</div>
            <div style={S.field}>
              <span style={{fontSize:22}}>🏭</span>
              <div style={{flex:1}}>
                <div style={S.fieldLabel}>Firma Adı *</div>
                <input value={mkF.firma} onChange={e=>setMkF({...mkF,firma:e.target.value})} placeholder="Firma adını giriniz"
                  style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
              </div>
            </div>
            <div style={S.row2}>
              <div style={S.field}>
                <span style={{fontSize:21}}>🏠</span>
                <div style={{flex:1}}>
                  <div style={S.fieldLabel}>Depo</div>
                  <select value={mkF.depo} onChange={e=>setMkF({...mkF,depo:e.target.value})}
                    style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit",fontWeight:700}}>
                    {["TEM.34","Kartepe","Çatalca","Ankara"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div style={S.field}>
                <span style={{fontSize:21}}>📅</span>
                <div style={{flex:1}}>
                  <div style={S.fieldLabel}>Tarih</div>
                  <input type="date" value={mkF.tarih} onChange={e=>setMkF({...mkF,tarih:e.target.value})}
                    style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
                </div>
              </div>
            </div>
            <div style={S.row2}>
              <div style={S.field}>
                <span style={{fontSize:21}}>📄</span>
                <div style={{flex:1}}>
                  <div style={S.fieldLabel}>Belge No</div>
                  <input value={mkF.belgeNo} onChange={e=>setMkF({...mkF,belgeNo:e.target.value})} placeholder="Belge No"
                    style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
                </div>
              </div>
              <div style={S.field}>
                <span style={{fontSize:21}}>▤</span>
                <div style={{flex:1}}>
                  <div style={S.fieldLabel}>Adet</div>
                  <input type="number" inputMode="numeric" value={mkF.adet} onChange={e=>setMkF({...mkF,adet:e.target.value})} placeholder="Adet"
                    style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit"}}/>
                </div>
              </div>
            </div>
            <div style={S.field}>
              <span style={{fontSize:21}}>◇</span>
              <div style={{flex:1}}>
                <div style={S.fieldLabel}>Durum</div>
                <select value={mkF.durum} onChange={e=>setMkF({...mkF,durum:e.target.value})}
                  style={{border:"none",outline:"none",width:"100%",fontSize:15,color:"#0B214A",background:"transparent",fontFamily:"inherit",fontWeight:700}}>
                  {["BAŞLAMADI","İŞLEMDE","TAMAMLANDI","ÜRÜN DEPOYA GELMEDİ"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <button style={S.addBtn} onClick={addMk}><span style={{color:"#F2AD32",fontSize:22}}>⊕</span>Ekle</button>
          </section>
        </>}
      </main>

      <input ref={refYi} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0]; if(f)parseExcel(f,"yi"); e.target.value="";}}/>
      <input ref={refIh} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0]; if(f)parseExcel(f,"ih"); e.target.value="";}}/>
      <input ref={refIr} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0]; if(f)parseExcel(f,"ir"); e.target.value="";}}/>
    </div>
  );
}
