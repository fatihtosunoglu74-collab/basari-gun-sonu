"use client";
import React, { useState, useRef, useEffect } from "react";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SB_URL="https://dqoreukmpkxmdputjigy.supabase.co";
const SB_KEY="sb_publishable_gKwtDDLun7O0UybI4R71cA_xMDT2DX8";
const TABLE="gun_sonu_raporlar";
async function sbSave(p:object):Promise<string|null>{try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}`,{method:"POST",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,Prefer:"return=representation"},body:JSON.stringify(p)});const d=await r.json();return d[0]?.id??null;}catch{return null;}}
async function sbUpdate(id:string,p:object){try{await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}`,{method:"PATCH",headers:{"Content-Type":"application/json",apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`},body:JSON.stringify(p)});}catch{}}
async function sbLoad(id:string){try{const r=await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}&select=*`,{headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}});const d=await r.json();return d[0]??null;}catch{return null;}}

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
const sv=(v:any)=>String(v??"").trim();
const nn=(v:any)=>{const n=parseFloat(sv(v));return isNaN(n)?0:Math.round(n);};
const todayStr=()=>new Date().toISOString().split("T")[0];
function xd(v:any):string{
  if(v instanceof Date)return v.toLocaleDateString("tr-TR");
  if(typeof v==="number"&&v>1){const d=new Date(Math.round((v-25569)*86400*1000));return d.toLocaleDateString("tr-TR");}
  return sv(v);
}
function normDepo(v:string):string{
  const s=sv(v).toUpperCase().replace(/\s/g,"");
  if(s.includes("KARTEPE"))return"KARTEPE";
  if(s.includes("TEM"))return"TEM.34";
  if(s.includes("ÇATALCA")||s.includes("CATALCA"))return"ÇATALCA";
  return sv(v).toUpperCase()||"TEM.34";
}
// Zeus artık her 3 raporda da aynı Durum sözlüğünü kullanıyor: Başlamadı / İşlemde / Bitti / (Silindi)
function zeusType(durum:string):string{
  const d=durum.toUpperCase();
  if(d.includes("BİTTİ")||d.includes("BITTI")||d.includes("TAMAMLAN"))return"green";
  if(d.includes("İŞLEMDE")||d.includes("ISLEMDE")||d.includes("DEVAM"))return"yellow";
  return"red"; // Başlamadı, Silindi, tanımsız
}
// Ekranda gösterilecek etiket — Zeus'un ham "İşlemde" değeri yerine operasyonel terim
function displayDurum(durum:string):string{
  const t=zeusType(durum);
  if(t==="yellow")return"Toplaması Devam Ediyor";
  return durum;
}

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface Row{depo:string;no:string;musteri:string;tip:string;tarih:string;durum:string;type:string;}
interface MKRow{depo:string;no:string;firma:string;tarih:string;adet:number;cesit:number;durum:string;type:string;}
type Tab="yurtici"|"ihracat"|"malKabul";
type US="idle"|"loading"|"ok"|"err";

const C={navy:"#0B2F78",navyDk:"#061F55",navyH:"#062B66",green:"#22C55E",red:"#EF4444",yellow:"#F59E0B",
  pageBg:"#F8FAFD",card:"#FFFFFF",border:"#E2E8F0",text:"#0F2A5F",muted:"#64748B",
  softRed:"#FEF2F2",softYellow:"#FFF7E8",softGreen:"#F0FDF4"};

// ─── Küçük bileşenler ─────────────────────────────────────────────────────────
function Badge({type,label}:{type:string;label:string}){
  const bg=type==="green"?C.softGreen:type==="yellow"?C.softYellow:C.softRed;
  const cl=type==="green"?"#15803D":type==="yellow"?"#B45309":"#B91C1C";
  const br=type==="green"?"#BBF7D0":type==="yellow"?"#FDE68A":"#FECACA";
  return <span style={{display:"inline-flex",alignItems:"center",padding:"4px 11px",borderRadius:6,fontSize:11,fontWeight:900,letterSpacing:0.3,background:bg,color:cl,border:`1px solid ${br}`,whiteSpace:"nowrap"}}>{label}</span>;
}
function SummaryCard({type,title,val,sub,onClick,active}:{type:string;title:string;val:number;sub:string;onClick?:()=>void;active?:boolean}){
  const cl=type==="red"?C.red:type==="yellow"?C.yellow:C.green;
  const ic=type==="red"?"📋":type==="yellow"?"🕐":"✓";
  return(
    <div onClick={onClick} style={{flex:1,background:active?`${cl}0F`:C.card,border:`${active?2:1}px solid ${active?cl:C.border}`,borderRadius:16,padding:"20px 24px",display:"flex",alignItems:"center",gap:18,
      boxShadow:active?`0 8px 24px ${cl}33`:"0 6px 20px rgba(11,47,120,0.05)",cursor:onClick?"pointer":"default",transition:"all .15s",position:"relative"}}>
      {active&&<span style={{position:"absolute",top:10,right:12,fontSize:11,fontWeight:900,color:cl}}>✕ Kaldır</span>}
      <div style={{width:72,height:72,borderRadius:"50%",border:`3px solid ${cl}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:type==="green"?30:26,color:cl,background:`${cl}0D`,flexShrink:0,fontWeight:900}}>{ic}</div>
      <div>
        <div style={{fontSize:13,fontWeight:900,color:cl,letterSpacing:0.5,marginBottom:3}}>{title}</div>
        <div style={{fontSize:38,fontWeight:900,color:C.text,lineHeight:1}}>{val.toLocaleString("tr-TR")}</div>
        <div style={{fontSize:12,fontWeight:600,color:C.muted,marginTop:3}}>{sub}</div>
      </div>
    </div>
  );
}
function ContactCard(){
  const rows=[
    {icon:"📍",text:"Akçaburgaz Mah. 3126. Sk. No: 10/1 DMN Plaza Kat:2 Esenyurt / İSTANBUL"},
    {icon:"📞",text:"+90 537 952 06 13"},
    {icon:"📞",text:"+90 212 632 59 65 (Fax)"},
    {icon:"🟢",text:"90 537 952 06 13"},
    {icon:"✈️",text:"info@basariotomotive.com"},
  ];
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",boxShadow:"0 6px 20px rgba(11,47,120,0.05)"}}>
      {rows.map(({icon,text},i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:11,padding:"7px 0"}}>
          <span style={{fontSize:15,flexShrink:0,lineHeight:1.3}}>{icon}</span>
          <span style={{fontSize:12.5,fontWeight:700,color:C.text,lineHeight:1.45}}>{text}</span>
        </div>
      ))}
    </div>
  );
}
function DayEndSummary({title,rows}:{title:string;rows:[string,number,string][]}){
  return(
    <div style={{background:`linear-gradient(160deg,${C.navyH} 0%,${C.navy} 100%)`,borderRadius:14,padding:"20px",color:"#fff",marginBottom:14,boxShadow:"0 10px 30px rgba(6,31,85,0.25)"}}>
      <div style={{fontWeight:900,fontSize:14,letterSpacing:0.5,marginBottom:12}}>{title}</div>
      {rows.map(([l,v,c],i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<rows.length-1?"1px solid rgba(255,255,255,0.12)":"none"}}>
          <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.85)"}}>{l}</span>
          <span style={{fontSize:16,fontWeight:900,color:c}}>{v.toLocaleString("tr-TR")}</span>
        </div>
      ))}
      <div style={{marginTop:14,display:"flex",justifyContent:"space-around",fontSize:30,opacity:0.18,filter:"grayscale(1) brightness(3)"}}>
        <span>🏭</span><span>🚜</span><span>🚛</span>
      </div>
    </div>
  );
}

// ─── ANA SAYFA ────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState<Tab>("yurtici");
  
  const [mobile,setMobile]=useState(false);
  const [depoFiltre,setDepoFiltre]=useState("Tümü");
  const [durumFiltre,setDurumFiltre]=useState<string>("");
  const [yiRows,setYiRows]=useState<Row[]>([]);
  const [ihRows,setIhRows]=useState<Row[]>([]);
  const [mkRows,setMkRows]=useState<MKRow[]>([]);
  const [stU,setStU]=useState<Record<Tab,US>>({yurtici:"idle",ihracat:"idle",malKabul:"idle"});
  const [msgU,setMsgU]=useState<Record<Tab,string>>({yurtici:"",ihracat:"",malKabul:""});
  const fileRefYi=useRef<HTMLInputElement>(null);
  const fileRefIh=useRef<HTMLInputElement>(null);
  const fileRefMk=useRef<HTMLInputElement>(null);
  const [raporId,setRaporId]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const [shareUrl,setShareUrl]=useState("");
  const [copied,setCopied]=useState(false);
  const [isView,setIsView]=useState(false);
  const [lastRefresh,setLastRefresh]=useState<Date|null>(null);

  const today=new Date().toLocaleDateString("tr-TR",{day:"2-digit",month:"long",year:"numeric",weekday:"long"});

  useEffect(()=>{
    const chk=()=>setMobile(window.innerWidth<900);
    chk();window.addEventListener("resize",chk);
    return()=>window.removeEventListener("resize",chk);
  },[]);

  useEffect(()=>{
    const id=new URLSearchParams(window.location.search).get("rapor");
    if(id){
      setRaporId(id);setIsView(true);loadReport(id);
      const iv=setInterval(()=>loadReport(id).then(()=>setLastRefresh(new Date())),30000);
      return()=>clearInterval(iv);
    } else {
      // ?rapor= yoksa: bugüne ait bir kayıt var mı diye bak — varsa onu benimse
      // (aynı gün farklı cihazlardan girilse bile hep AYNI rapor güncellensin, yeni link üretilmesin)
      (async()=>{
        try{
          const r=await fetch(`${SB_URL}/rest/v1/${TABLE}?tarih=eq.${todayStr()}&select=id&order=created_at.desc&limit=1`,
            {headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`}});
          const d=await r.json();
          if(d?.[0]?.id){
            setRaporId(d[0].id);
            setShareUrl(`${window.location.origin}?rapor=${d[0].id}`);
          }
        }catch{}
      })();
    }
  // eslint-disable-next-line
  },[]);

  async function loadReport(id:string){
    const d=await sbLoad(id);
    if(d){
      const yr=d.yurtici_rows;
      if(Array.isArray(yr))setYiRows(yr);
      else if(yr?.rows)setYiRows(yr.rows);
      if(Array.isArray(d.ihracat_rows))setIhRows(d.ihracat_rows);
      if(Array.isArray(d.malkabul_rows))setMkRows(d.malkabul_rows);
      setLastRefresh(new Date());
    }
  }

  async function handleSave(){
    setSaving(true);
    const p={tarih:todayStr(),
      yurtici_siparis:yiRows.length,yurtici_fatura:yiRows.filter(r=>r.type==="green").length,
      yurtici_rows:yiRows,ihracat_rows:ihRows,malkabul_rows:mkRows};
    let id=raporId;
    if(id){await sbUpdate(id,p);}
    else{id=await sbSave(p);if(id){setRaporId(id);const u=`${window.location.origin}?rapor=${id}`;setShareUrl(u);window.history.pushState({},"",`?rapor=${id}`);}}
    setSaving(false);
    if(id){const u=shareUrl||`${window.location.origin}?rapor=${id}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(`📋 *GÜN SONU RAPORU — ${new Date().toLocaleDateString("tr-TR")}*\n\nCanlı rapor:\n${u}`)}`,"_blank");}
  }

  // ─── Ortak parser: Yurtiçi & İhracat — Firma|Depo|BelgeNo|Cari|Gönderi Tipi|Tarih|Durum
  async function parseSimple(file:File,target:"yurtici"|"ihracat"){
    setStU(s=>({...s,[target]:"loading"}));
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer(),{cellDates:true});
      const ws=wb.Sheets["data"]??wb.Sheets[wb.SheetNames[0]];
      const raw:any[][]=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi=raw.findIndex(r=>r.some((c:any)=>sv(c)==="Firma"));
      const h=hi>=0?raw[hi]:raw[0];
      const col=(k:string)=>h.findIndex((c:any)=>sv(c)===k);
      const iDep=col("Depo"),iBno=col("BelgeNo"),iCari=col("Cari"),iTip=col("Gönderi Tipi"),iTar=col("Tarih"),iDur=col("Durum");

      let fileDepo="TEM.34";
      const cnt:Record<string,number>={};
      for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
        const r=raw[i];if(!sv(r[iCari>=0?iCari:3]))continue;
        const d=normDepo(sv(r[iDep>=0?iDep:1]));if(d)cnt[d]=(cnt[d]||0)+1;
      }
      const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
      if(top)fileDepo=top[0];

      const rows:Row[]=[];
      for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
        const r=raw[i];const mus=sv(r[iCari>=0?iCari:3]);if(!mus)continue;
        const durum=sv(r[iDur>=0?iDur:6])||"Başlamadı";
        rows.push({depo:normDepo(sv(r[iDep>=0?iDep:1]))||fileDepo,no:sv(r[iBno>=0?iBno:2])||("BLG-"+Math.random().toString(36).slice(2,8)),
          musteri:mus,tip:sv(r[iTip>=0?iTip:4])||"—",tarih:xd(r[iTar>=0?iTar:5]),durum,type:zeusType(durum)});
      }
      if(target==="yurtici")setYiRows(prev=>[...prev.filter(x=>x.depo!==fileDepo),...rows]);
      else setIhRows(prev=>[...prev.filter(x=>x.depo!==fileDepo),...rows]);
      setMsgU(m=>({...m,[target]:`${fileDepo} · ${rows.length} kayıt yüklendi`}));
      setStU(s=>({...s,[target]:"ok"}));
    }catch{
      setMsgU(m=>({...m,[target]:"Dosya okunamadı"}));
      setStU(s=>({...s,[target]:"err"}));
    }
  }

  // ─── Mal Kabul parser — Firma|Depo|BelgeNo|BelgeNo2|Tarih|Cari|Cari İsmi|Adet|Çeşit|Durum
  async function parseMalKabul(file:File){
    setStU(s=>({...s,malKabul:"loading"}));
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer(),{cellDates:true});
      const ws=wb.Sheets["data"]??wb.Sheets[wb.SheetNames[0]];
      const raw:any[][]=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi=raw.findIndex(r=>r.some((c:any)=>sv(c)==="Firma"));
      const h=hi>=0?raw[hi]:raw[0];
      const col=(k:string)=>h.findIndex((c:any)=>sv(c)===k);
      const iDep=col("Depo"),iBno=col("BelgeNo"),iTar=col("Tarih"),iCariIsim=col("Cari İsmi"),iCari=col("Cari"),iAdet=col("Adet"),iCesit=col("Çeşit"),iDur=col("Durum");
      const iFirCol=iCariIsim>=0?iCariIsim:(iCari>=0?iCari:5);

      let fileDepo="TEM.34";
      const cnt:Record<string,number>={};
      for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
        const r=raw[i];if(!sv(r[iFirCol]))continue;
        const d=normDepo(sv(r[iDep>=0?iDep:1]));if(d)cnt[d]=(cnt[d]||0)+1;
      }
      const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
      if(top)fileDepo=top[0];

      const rows:MKRow[]=[];
      for(let i=(hi>=0?hi+1:1);i<raw.length;i++){
        const r=raw[i];const fir=sv(r[iFirCol]);if(!fir)continue;
        const durum=sv(r[iDur>=0?iDur:9])||"Başlamadı";
        rows.push({depo:normDepo(sv(r[iDep>=0?iDep:1]))||fileDepo,no:sv(r[iBno>=0?iBno:2]),firma:fir,
          tarih:xd(r[iTar>=0?iTar:4]),adet:nn(r[iAdet>=0?iAdet:7]),cesit:nn(r[iCesit>=0?iCesit:8]),durum,type:zeusType(durum)});
      }
      setMkRows(prev=>[...prev.filter(x=>x.depo!==fileDepo),...rows]);
      setMsgU(m=>({...m,malKabul:`${fileDepo} · ${rows.length} irsaliye yüklendi`}));
      setStU(s=>({...s,malKabul:"ok"}));
    }catch{
      setMsgU(m=>({...m,malKabul:"Dosya okunamadı"}));
      setStU(s=>({...s,malKabul:"err"}));
    }
  }

  // ─── Filtreleme ────────────────────────────────────────────────────────────
  // Depo listesi artık sekmeye özel — Yurtiçi'nde sadece TEM.34 varken Mal Kabul'da ikisi de olabilir
  const depolarYi=Array.from(new Set(yiRows.map(r=>r.depo))).filter(Boolean);
  const depolarIh=Array.from(new Set(ihRows.map(r=>r.depo))).filter(Boolean);
  const depolarMk=Array.from(new Set(mkRows.map(r=>r.depo))).filter(Boolean);
  const activeDepolar=tab==="yurtici"?depolarYi:tab==="ihracat"?depolarIh:depolarMk;

  // Sağdaki GÜN SONU ÖZETİ her zaman TÜM depoların toplamı — depo filtresinden etkilenmez,
  // böylece "Tümü" seçiliyken karışan bir toplam değil, her zaman net bir genel toplam görünür
  const grand=<T extends{type:string}>(arr:T[])=>({b:arr.filter(r=>r.type==="red").length,y:arr.filter(r=>r.type==="yellow").length,g:arr.filter(r=>r.type==="green").length});
  const yiG=grand(yiRows), ihG=grand(ihRows), mkG=grand(mkRows);

  const th:React.CSSProperties={padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:C.muted,borderBottom:`1px solid ${C.border}`,letterSpacing:0.2,whiteSpace:"nowrap"};
  const td:React.CSSProperties={padding:"13px 16px",fontSize:13,fontWeight:700,borderBottom:`1px solid ${C.border}`,color:C.text};

  const TABS:{id:Tab;label:string;icon:string}[]=[
    {id:"yurtici",label:"Yurtiçi",icon:"🚚"},
    {id:"ihracat",label:"İhracat",icon:"🚢"},
    {id:"malKabul",label:"Mal Kabul",icon:"🏭"},
  ];
  const UPLOAD:{[k in Tab]:{title:string;sub:string}}={
    yurtici: {title:"Yurtiçi Excel Dosyası Yükle",  sub:"Zeus'tan aldığın yurtiçi sipariş raporunu yükle."},
    ihracat: {title:"İhracat Excel Dosyası Yükle",  sub:"Zeus'tan aldığın ihracat sipariş raporunu yükle."},
    malKabul:{title:"Mal Kabul Excel Dosyası Yükle",sub:"Zeus'tan aldığın irsaliye raporunu yükle."},
  };
  const currentRef=tab==="yurtici"?fileRefYi:tab==="ihracat"?fileRefIh:fileRefMk;

  const tableCard=(icon:string,title:string,count:number,head:string[],body:React.ReactNode,depotLabel?:string)=>(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 6px 20px rgba(11,47,120,0.05)"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,fontWeight:900,fontSize:15,color:C.text,letterSpacing:0.4}}>
          <span style={{fontSize:17}}>{icon}</span>{title}
        </div>
        <span style={{fontSize:12,fontWeight:700,color:C.muted}}>{count} kayıt{depotLabel?` · ${depotLabel}`:""}{durumFiltre?` · ${durumFiltre==="red"?"Başlamadı":durumFiltre==="yellow"?"İşlemde":"Tamamlandı"} filtresi aktif`:""}</span>
      </div>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch" as any}}>
        <table style={{width:"100%",minWidth:640,borderCollapse:"collapse"}}>
          <thead><tr>{head.map((h,i)=><th key={i} style={th}>{h}</th>)}</tr></thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    </div>
  );

  // Bir sekme için depo bazlı bölümleri üretir — 2+ depo varsa her biri ayrı başlık+kart+tablo ile,
  // tek depo varsa (normal gün) hiç ek başlık göstermeden eskisi gibi tek blok
  function renderDepotSections<T extends{depo:string;type:string}>(
    allRows:T[],activeList:string[],subLabel:string,
    icon:string,tableTitle:string,head:string[],colSpan:number,
    renderRow:(r:T,i:number)=>React.ReactNode,emptyMsg:string
  ){
    const depotsToShow:(string|null)[]=activeList.length<=1?[null]:(depoFiltre==="Tümü"?activeList:[depoFiltre]);
    return depotsToShow.map(depot=>{
      const rowsForDepot=depot?allRows.filter(r=>r.depo===depot):allRows;
      const rowsForTable=durumFiltre?rowsForDepot.filter(r=>r.type===durumFiltre):rowsForDepot;
      const b=rowsForDepot.filter(r=>r.type==="red").length;
      const y=rowsForDepot.filter(r=>r.type==="yellow").length;
      const g=rowsForDepot.filter(r=>r.type==="green").length;
      return(
        <div key={depot??"tek"} style={{marginBottom:22}}>
          {depot&&(
            <div style={{display:"flex",alignItems:"center",gap:9,margin:"2px 0 12px",fontWeight:900,fontSize:14,color:C.navy,letterSpacing:0.4}}>
              <span style={{width:9,height:9,borderRadius:"50%",background:depot==="KARTEPE"?C.yellow:C.green,display:"inline-block",flexShrink:0}}/>
              🏬 {depot} DEPOSU
            </div>
          )}
          <div style={{display:"flex",flexDirection:mobile?"column":"row",gap:mobile?10:14,marginBottom:14}}>
            <SummaryCard type="red"    title="BAŞLAMADI"  val={b} sub={subLabel} active={durumFiltre==="red"}    onClick={()=>setDurumFiltre(f=>f==="red"?"":"red")}/>
            <SummaryCard type="yellow" title="TOPLAMASI DEVAM EDİYOR" val={y} sub={subLabel} active={durumFiltre==="yellow"} onClick={()=>setDurumFiltre(f=>f==="yellow"?"":"yellow")}/>
            <SummaryCard type="green"  title="TAMAMLANDI" val={g} sub={subLabel} active={durumFiltre==="green"}  onClick={()=>setDurumFiltre(f=>f==="green"?"":"green")}/>
          </div>
          {tableCard(icon,tableTitle,rowsForTable.length,head,
            rowsForTable.length===0
              ?<tr><td colSpan={colSpan} style={{...td,textAlign:"center",color:C.muted,padding:24}}>{emptyMsg}</td></tr>
              :rowsForTable.map(renderRow),
            depot??undefined
          )}
        </div>
      );
    });
  }

  return(
    <div style={{minHeight:"100vh",background:C.pageBg,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',color:C.text}}>

      {/* HEADER */}
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

      {/* HERO */}
      <div style={{width:"100%",lineHeight:0,background:C.navyDk}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/basari-logistics-hero.png" alt="Güçlü Lojistik" style={{width:"100%",height:"auto",maxHeight:mobile?120:220,objectFit:"cover",objectPosition:"center",display:"block"}}/>
      </div>

      {/* ANA CONTAINER */}
      <div style={{maxWidth:1500,margin:"-18px auto 0",padding:mobile?"0 10px 40px":"0 24px 60px",position:"relative",zIndex:5}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:mobile?16:22,boxShadow:"0 20px 60px rgba(11,47,120,0.10)",padding:mobile?"14px 12px":"22px 24px"}}>

          {isView&&(
            <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:"9px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontSize:13,fontWeight:700,color:"#15803D"}}>🔄 Otomatik güncelleniyor{lastRefresh&&` · ${lastRefresh.toLocaleTimeString("tr-TR")}`}</span>
              <button onClick={()=>raporId&&loadReport(raporId)} style={{border:"1px solid #86EFAC",borderRadius:8,background:"#fff",color:"#15803D",padding:"4px 12px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>↺ Yenile</button>
            </div>
          )}
          {shareUrl&&(
            <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:12,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <span>🔗</span>
              <span style={{flex:1,fontSize:12,color:C.muted,fontFamily:"monospace",wordBreak:"break-all"}}>{shareUrl}</span>
              <button onClick={async()=>{await navigator.clipboard.writeText(shareUrl);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                style={{border:"1px solid #BFDBFE",borderRadius:8,background:"#fff",color:C.navy,padding:"5px 12px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                {copied?"✅":"📋 Kopyala"}
              </button>
            </div>
          )}

          {/* SEKMELER + KAYDET */}
          <div style={{display:"flex",flexDirection:mobile?"column":"row",alignItems:"stretch",gap:mobile?10:14,marginBottom:14}}>
            <div style={{display:"flex",gap:mobile?8:14,flex:1}}>
              {TABS.map(t=>{
                const act=tab===t.id;
                return(
                  <button key={t.id} onClick={()=>{setTab(t.id);setDurumFiltre("");}}
                    style={{flex:1,maxWidth:mobile?undefined:300,display:"flex",alignItems:"center",justifyContent:"center",gap:mobile?6:12,height:mobile?50:62,border:act?"none":`1px solid ${C.border}`,borderRadius:12,
                      background:act?C.navyDk:"#fff",color:act?"#fff":C.navy,fontSize:mobile?13:16,fontWeight:900,cursor:"pointer",fontFamily:"inherit",
                      boxShadow:act?"0 10px 26px rgba(6,31,85,0.30)":"0 4px 12px rgba(11,47,120,0.04)",transition:"all .15s"}}>
                    <span style={{fontSize:mobile?18:24}}>{t.icon}</span>{t.label}
                  </button>
                );
              })}
            </div>
            <button onClick={handleSave} disabled={saving}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:C.green,color:"#fff",border:"none",borderRadius:12,padding:"0 24px",height:mobile?48:62,fontWeight:900,fontSize:mobile?14:15,cursor:"pointer",boxShadow:"0 10px 24px rgba(34,197,94,0.30)",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              <span style={{fontSize:18}}>{saving?"⏳":"🔗"}</span>{saving?"Kaydediliyor...":"Kaydet ve Paylaş"}
            </button>
          </div>

          {/* DEPO FİLTRE ÇUBUĞU */}
          {activeDepolar.length>1&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:800,color:C.muted,letterSpacing:0.4}}>🏬 DEPO:</span>
              {["Tümü",...activeDepolar].map(d=>{
                const act=depoFiltre===d;
                return(
                  <button key={d} onClick={()=>setDepoFiltre(d)}
                    style={{padding:"7px 18px",borderRadius:20,border:act?"none":`1px solid ${C.border}`,
                      background:act?C.navy:"#fff",color:act?"#fff":C.navy,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",
                      boxShadow:act?"0 6px 14px rgba(11,47,120,0.25)":"none",transition:"all .15s"}}>
                    {d}
                  </button>
                );
              })}
            </div>
          )}

          {/* UPLOAD BAR — sekmeye özel */}
          <div style={{background:"#fff",border:`1px solid ${stU[tab]==="ok"?"#BBF7D0":stU[tab]==="err"?"#FECACA":C.border}`,borderRadius:14,padding:mobile?"12px 14px":"14px 20px",display:"flex",flexDirection:mobile?"column":"row",alignItems:mobile?"stretch":"center",gap:mobile?10:0,justifyContent:"space-between",marginBottom:18,boxShadow:"0 4px 14px rgba(11,47,120,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:48,height:48,borderRadius:12,background:"#E7F6EC",border:"1px solid #C6E9D2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:"#1D6F42",fontWeight:900,fontSize:20,fontFamily:"Georgia,serif"}}>X</span>
              </div>
              <div>
                <div style={{fontWeight:900,fontSize:15,color:C.text}}>
                  {stU[tab]==="ok"?`✅ ${msgU[tab]}`:stU[tab]==="err"?`❌ ${msgU[tab]}`:UPLOAD[tab].title}
                </div>
                <div style={{fontSize:12,color:C.muted,fontWeight:600,marginTop:2}}>
                  {stU[tab]==="ok"?"Değiştirmek için tekrar Excel seçebilirsiniz":UPLOAD[tab].sub}
                </div>
              </div>
            </div>
            <button onClick={()=>currentRef.current?.click()}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:`1.5px solid ${C.navy}`,color:C.navy,background:"#fff",borderRadius:11,padding:"11px 22px",fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
              <span>⇧</span>{stU[tab]==="loading"?"Yükleniyor...":"Excel Seç"}
            </button>
          </div>

          {/* İKİ KOLON */}
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 300px",gap:18,alignItems:"start"}}>

            {/* SOL */}
            <div>
              {tab==="yurtici"&&renderDepotSections(yiRows,depolarYi,"Sipariş","📋","SİPARİŞ LİSTESİ",
                ["Belge No","Müşteri","Gönderi Tipi","Depo","Tarih","Durum"],6,
                (r,i)=>(
                  <tr key={i}>
                    <td style={{...td,fontWeight:900}}>{r.no}</td>
                    <td style={td}>{r.musteri}</td>
                    <td style={td}>{r.tip}</td>
                    <td style={td}><Badge type={r.depo==="KARTEPE"?"yellow":"green"} label={r.depo}/></td>
                    <td style={td}>{r.tarih}</td>
                    <td style={td}><Badge type={r.type} label={displayDurum(r.durum)}/></td>
                  </tr>
                ),
                "Excel yüklendikten sonra siparişler burada listelenir"
              )}
              {tab==="ihracat"&&renderDepotSections(ihRows,depolarIh,"Sevkiyat","🚢","İHRACAT SEVKİYAT LİSTESİ",
                ["Belge No","Müşteri","Depo","Tarih","Durum"],5,
                (r,i)=>(
                  <tr key={i}>
                    <td style={{...td,fontWeight:900}}>{r.no}</td>
                    <td style={td}>{r.musteri}</td>
                    <td style={td}><Badge type={r.depo==="KARTEPE"?"yellow":"green"} label={r.depo}/></td>
                    <td style={td}>{r.tarih}</td>
                    <td style={td}><Badge type={r.type} label={displayDurum(r.durum)}/></td>
                  </tr>
                ),
                "Excel yüklendikten sonra sevkiyatlar burada listelenir"
              )}
              {tab==="malKabul"&&renderDepotSections(mkRows,depolarMk,"İrsaliye","📦","İRSALİYE LİSTESİ",
                ["Belge No","Firma","Depo","Tarih","Çeşit","Adet","Durum"],7,
                (r,i)=>(
                  <tr key={i}>
                    <td style={{...td,fontWeight:900}}>{r.no}</td>
                    <td style={td}>{r.firma}</td>
                    <td style={td}><Badge type={r.depo==="KARTEPE"?"yellow":"green"} label={r.depo}/></td>
                    <td style={td}>{r.tarih}</td>
                    <td style={td}>{r.cesit||"—"}</td>
                    <td style={td}>{r.adet.toLocaleString("tr-TR")}</td>
                    <td style={td}><Badge type={r.type} label={displayDurum(r.durum)}/></td>
                  </tr>
                ),
                "Excel yüklendikten sonra irsaliyeler burada listelenir"
              )}
            </div>

            {/* SAĞ */}
            <div>
              {tab==="yurtici"&&<DayEndSummary title="GÜN SONU ÖZETİ · Tüm Depolar" rows={[
                ["Toplam Sipariş",yiRows.length,"#fff"],["Başlamadı",yiG.b,"#FCA5A5"],["Toplamı Devam Ediyor",yiG.y,"#FCD34D"],["Tamamlandı",yiG.g,"#86EFAC"]]}/>}
              {tab==="ihracat"&&<DayEndSummary title="GÜN SONU ÖZETİ · Tüm Depolar" rows={[
                ["Toplam Sevkiyat",ihRows.length,"#fff"],["Başlamadı",ihG.b,"#FCA5A5"],["Toplamı Devam Ediyor",ihG.y,"#FCD34D"],["Tamamlandı",ihG.g,"#86EFAC"]]}/>}
              {tab==="malKabul"&&<DayEndSummary title="GÜN SONU ÖZETİ · Tüm Depolar" rows={[
                ["Toplam İrsaliye",mkRows.length,"#fff"],["Başlamadı",mkG.b,"#FCA5A5"],["Toplamı Devam Ediyor",mkG.y,"#FCD34D"],["Tamamlandı",mkG.g,"#86EFAC"]]}/>}
              <ContactCard/>
            </div>
          </div>
        </div>
      </div>

      <input ref={fileRefYi} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0];if(f)parseSimple(f,"yurtici");e.target.value="";}}/>
      <input ref={fileRefIh} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0];if(f)parseSimple(f,"ihracat");e.target.value="";}}/>
      <input ref={fileRefMk} type="file" accept=".xlsx,.xls" style={{display:"none"}}
        onChange={e=>{const f=e.target.files?.[0];if(f)parseMalKabul(f);e.target.value="";}}/>
    </div>
  );
}
