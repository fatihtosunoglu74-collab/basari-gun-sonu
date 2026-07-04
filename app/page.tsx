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

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface YIRow{depo:string;musteri:string;sebep:string;sku:number;adet:number;not:string;}
interface IHRow{depo:string;musteri:string;ilkTarih:string;cikisTarih:string;sebep:string;sku:number;adet:number;termin:string;durum:string;type:string;}
interface MKRow{depo:string;no:string;firma:string;tarih:string;adet:number;durum:string;type:string;}
type YITot=Record<string,{siparis:number;fatura:number}>;
type Tab="yurtici"|"ihracat"|"malKabul";
type US="idle"|"loading"|"ok"|"err";

const C={navy:"#0B2F78",navyDk:"#061F55",navyH:"#062B66",green:"#22C55E",red:"#EF4444",yellow:"#F59E0B",
  pageBg:"#F8FAFD",card:"#FFFFFF",border:"#E2E8F0",text:"#0F2A5F",muted:"#64748B",
  softRed:"#FEF2F2",softYellow:"#FFF7E8",softGreen:"#F0FDF4"};

function ihType(durum:string):string{
  const d=durum.toUpperCase();
  if(d.includes("ZAMANINDA"))return"green";
  if(d.includes("GEÇ")||d.includes("AŞTI")||d.includes("ACİL"))return"red";
  return"yellow";
}
function mkType(durum:string):string{
  const d=durum.toUpperCase();
  if(d.includes("TAMAMLANDI")||d.includes("BITTI")||d.includes("BİTTİ"))return"green";
  if(d.includes("İŞLEMDE")||d.includes("ISLEMDE")||d.includes("DEVAM"))return"yellow";
  return"red";
}

// ─── Küçük bileşenler ─────────────────────────────────────────────────────────
function Badge({type,label}:{type:string;label:string}){
  const bg=type==="green"?C.softGreen:type==="yellow"?C.softYellow:C.softRed;
  const cl=type==="green"?"#15803D":type==="yellow"?"#B45309":"#B91C1C";
  const br=type==="green"?"#BBF7D0":type==="yellow"?"#FDE68A":"#FECACA";
  return <span style={{display:"inline-flex",alignItems:"center",padding:"4px 11px",borderRadius:6,fontSize:11,fontWeight:900,letterSpacing:0.3,background:bg,color:cl,border:`1px solid ${br}`,whiteSpace:"nowrap"}}>{label}</span>;
}
function SummaryCard({type,title,val,sub}:{type:string;title:string;val:number;sub:string}){
  const cl=type==="red"?C.red:type==="yellow"?C.yellow:type==="navy"?C.navy:C.green;
  const ic=type==="red"?"📋":type==="yellow"?"🕐":type==="navy"?"📦":"✓";
  return(
    <div style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px 24px",display:"flex",alignItems:"center",gap:18,boxShadow:"0 6px 20px rgba(11,47,120,0.05)"}}>
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
function DayEndSummary({title,rows}:{title:string;rows:[string,number|string,string][]}){
  return(
    <div style={{background:`linear-gradient(160deg,${C.navyH} 0%,${C.navy} 100%)`,borderRadius:14,padding:"20px",color:"#fff",marginBottom:14,boxShadow:"0 10px 30px rgba(6,31,85,0.25)"}}>
      <div style={{fontWeight:900,fontSize:14,letterSpacing:0.5,marginBottom:12}}>{title}</div>
      {rows.map(([l,v,c],i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<rows.length-1?"1px solid rgba(255,255,255,0.12)":"none"}}>
          <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.85)"}}>{l}</span>
          <span style={{fontSize:16,fontWeight:900,color:c}}>{typeof v==="number"?v.toLocaleString("tr-TR"):v}</span>
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
  const [yiTot,setYiTot]=useState<YITot>({});
  const [yiRows,setYiRows]=useState<YIRow[]>([]);
  const [ihRows,setIhRows]=useState<IHRow[]>([]);
  const [mkRows,setMkRows]=useState<MKRow[]>([]);
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
    const chk=()=>setMobile(window.innerWidth<900);
    chk();window.addEventListener("resize",chk);
    return()=>window.removeEventListener("resize",chk);
  },[]);

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
      const yr=d.yurtici_rows;
      if(yr&&!Array.isArray(yr)){setYiTot(yr.totals??{});setYiRows(yr.rows??[]);}
      else if(Array.isArray(yr))setYiRows(yr);
      if(Array.isArray(d.ihracat_rows))setIhRows(d.ihracat_rows);
      if(Array.isArray(d.malkabul_rows))setMkRows(d.malkabul_rows);
      setLastRefresh(new Date());
    }
  }

  async function handleSave(){
    setSaving(true);
    const sumS=Object.values(yiTot).reduce((s,t)=>s+t.siparis,0);
    const sumF=Object.values(yiTot).reduce((s,t)=>s+t.fatura,0);
    const p={tarih:todayStr(),yurtici_siparis:sumS,yurtici_fatura:sumF,
      yurtici_rows:{totals:yiTot,rows:yiRows},ihracat_rows:ihRows,malkabul_rows:mkRows};
    let id=raporId;
    if(id){await sbUpdate(id,p);}
    else{id=await sbSave(p);if(id){setRaporId(id);const u=`${window.location.origin}?rapor=${id}`;setShareUrl(u);window.history.pushState({},"",`?rapor=${id}`);}}
    setSaving(false);
    if(id){const u=shareUrl||`${window.location.origin}?rapor=${id}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(`📋 *GÜN SONU RAPORU — ${new Date().toLocaleDateString("tr-TR")}*\n\nCanlı rapor:\n${u}`)}`,"_blank");}
  }

  // ─── 3 sayfalı Gün Sonu Exceli parse ──────────────────────────────────────
  async function parseExcel(file:File){
    setStU("loading");
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer(),{cellDates:true});
      const findSheet=(k:string)=>wb.SheetNames.find(n=>n.toLowerCase().includes(k));
      const snYi=findSheet("yurt"),snIh=findSheet("ihracat")??findSheet("İhracat".toLowerCase()),snMk=findSheet("mal");
      if(!snYi&&!snIh&&!snMk){setMsgU("3 sayfalı Gün Sonu şablonu bulunamadı");setStU("err");return;}

      const rowsOf=(sn:string)=>XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:""}) as any[][];

      // ── Depo tespiti: Mal Kabul sayfasındaki Depo kolonundan
      let fileDepo="TEM.34";
      if(snMk){
        const raw=rowsOf(snMk);
        const hi=raw.findIndex(r=>r.some((c:any)=>sv(c)==="Firma"));
        if(hi>=0){
          const iDep=raw[hi].findIndex((c:any)=>sv(c)==="Depo");
          const cnt:Record<string,number>={};
          for(let i=hi+1;i<raw.length;i++){const d=normDepo(sv(raw[i][iDep>=0?iDep:1]));if(d){cnt[d]=(cnt[d]||0)+1;}}
          const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
          if(top)fileDepo=top[0];
        }
      }

      // ── Yurtiçi: SİPARİŞ SAYISI | FATURA EDİLEN | KALAN | MÜŞTERİ | SEBEP | SKU | ADET | NOT
      if(snYi){
        const raw=rowsOf(snYi);
        const hi=raw.findIndex(r=>sv(r[0]).includes("SİPARİŞ SAYISI"));
        if(hi>=0){
          let sip=0,fat=0;
          const rows:YIRow[]=[];
          for(let i=hi+1;i<raw.length;i++){
            const r=raw[i];
            if(nn(r[0])>0)sip=nn(r[0]);
            if(nn(r[1])>0)fat=nn(r[1]);
            const mus=sv(r[3]);
            if(mus&&!mus.includes("AÇIKLAMA")){
              rows.push({depo:fileDepo,musteri:mus,sebep:sv(r[4]),sku:nn(r[5]),adet:nn(r[6]),not:sv(r[7])});
            }
          }
          setYiTot(t=>({...t,[fileDepo]:{siparis:sip,fatura:fat}}));
          setYiRows(prev=>[...prev.filter(x=>x.depo!==fileDepo),...rows]);
        }
      }

      // ── İhracat: ...MÜŞTERİ(3) İLK TARİH(4) ÇIKIŞ(5) SEBEP(6) SKU(7) ADET(8) SON TERMİN(10) TERMİN DURUMU(12)
      if(snIh){
        const raw=rowsOf(snIh);
        const hi=raw.findIndex(r=>sv(r[0]).includes("SİPARİŞ SAYISI"));
        if(hi>=0){
          const rows:IHRow[]=[];
          for(let i=hi+1;i<raw.length;i++){
            const r=raw[i];const mus=sv(r[3]);
            if(!mus||mus.includes("AÇIKLAMA"))continue;
            const durum=sv(r[12])||sv(r[14])||"TERMİN İÇİNDE";
            rows.push({depo:fileDepo,musteri:mus,ilkTarih:xd(r[4]),cikisTarih:xd(r[5]),sebep:sv(r[6]),
              sku:nn(r[7]),adet:nn(r[8]),termin:xd(r[10]),durum,type:ihType(durum)});
          }
          setIhRows(prev=>[...prev.filter(x=>x.depo!==fileDepo),...rows]);
        }
      }

      // ── Mal Kabul: Firma | Depo | BelgeNo | (BelgeNo2) | Tarih | Cari | Adet | Durum
      if(snMk){
        const raw=rowsOf(snMk);
        const hi=raw.findIndex(r=>r.some((c:any)=>sv(c)==="Firma"));
        if(hi>=0){
          const h=raw[hi];
          const col=(k:string)=>h.findIndex((c:any)=>sv(c)===k);
          const iF=col("Firma"),iD=col("Depo"),iB=col("BelgeNo"),iT=col("Tarih"),iA=col("Adet"),iDu=col("Durum");
          const rows:MKRow[]=[];
          for(let i=hi+1;i<raw.length;i++){
            const r=raw[i];const fir=sv(r[iF>=0?iF:0]);if(!fir)continue;
            const durum=sv(r[iDu>=0?iDu:7]).toUpperCase()||"BAŞLAMADI";
            rows.push({depo:normDepo(sv(r[iD>=0?iD:1]))||fileDepo,no:sv(r[iB>=0?iB:2]),firma:fir,
              tarih:xd(r[iT>=0?iT:4]),adet:nn(r[iA>=0?iA:6]),durum,type:mkType(durum)});
          }
          setMkRows(prev=>[...prev.filter(x=>x.depo!==fileDepo),...rows]);
        }
      }

      setMsgU(`${fileDepo} verileri yüklendi`);
      setStU("ok");
      setDepoFiltre("Tümü");
    }catch(e){setMsgU("Dosya okunamadı");setStU("err");}
  }

  // ─── Filtreleme ────────────────────────────────────────────────────────────
  const depolar=Array.from(new Set([...Object.keys(yiTot),...yiRows.map(r=>r.depo),...ihRows.map(r=>r.depo),...mkRows.map(r=>r.depo)])).filter(Boolean);
  const fYi=depoFiltre==="Tümü"?yiRows:yiRows.filter(r=>r.depo===depoFiltre);
  const fIh=depoFiltre==="Tümü"?ihRows:ihRows.filter(r=>r.depo===depoFiltre);
  const fMk=depoFiltre==="Tümü"?mkRows:mkRows.filter(r=>r.depo===depoFiltre);

  // Yurtiçi toplamları (filtreye göre)
  const totKeys=depoFiltre==="Tümü"?Object.keys(yiTot):[depoFiltre];
  const totS=totKeys.reduce((s,k)=>s+(yiTot[k]?.siparis||0),0);
  const totF=totKeys.reduce((s,k)=>s+(yiTot[k]?.fatura||0),0);
  const totK=totS-totF;

  // İhracat özet
  const ihZ=fIh.filter(r=>r.type==="green").length, ihR2=fIh.filter(r=>r.type==="yellow").length, ihG=fIh.filter(r=>r.type==="red").length;
  // Mal kabul özet
  const mkB=fMk.filter(r=>r.type==="red").length, mkI=fMk.filter(r=>r.type==="yellow").length, mkT=fMk.filter(r=>r.type==="green").length;

  const th:React.CSSProperties={padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:C.muted,borderBottom:`1px solid ${C.border}`,letterSpacing:0.2,whiteSpace:"nowrap"};
  const td:React.CSSProperties={padding:"13px 16px",fontSize:13,fontWeight:700,borderBottom:`1px solid ${C.border}`,color:C.text};

  const TABS:{id:Tab;label:string;icon:string}[]=[
    {id:"yurtici",label:"Yurtiçi",icon:"🚚"},
    {id:"ihracat",label:"İhracat",icon:"🚢"},
    {id:"malKabul",label:"Mal Kabul",icon:"🏭"},
  ];

  const tableCard=(icon:string,title:string,count:number,head:string[],body:React.ReactNode)=>(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 6px 20px rgba(11,47,120,0.05)"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,fontWeight:900,fontSize:15,color:C.text,letterSpacing:0.4}}>
          <span style={{fontSize:17}}>{icon}</span>{title}
        </div>
        <span style={{fontSize:12,fontWeight:700,color:C.muted}}>{count} kayıt{depoFiltre!=="Tümü"?` · ${depoFiltre}`:""}</span>
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
                  <button key={t.id} onClick={()=>setTab(t.id)}
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
          {depolar.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:800,color:C.muted,letterSpacing:0.4}}>🏬 DEPO:</span>
              {["Tümü",...depolar].map(d=>{
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

          {/* UPLOAD BAR */}
          <div style={{background:"#fff",border:`1px solid ${stU==="ok"?"#BBF7D0":stU==="err"?"#FECACA":C.border}`,borderRadius:14,padding:mobile?"12px 14px":"14px 20px",display:"flex",flexDirection:mobile?"column":"row",alignItems:mobile?"stretch":"center",gap:mobile?10:0,justifyContent:"space-between",marginBottom:18,boxShadow:"0 4px 14px rgba(11,47,120,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:48,height:48,borderRadius:12,background:"#E7F6EC",border:"1px solid #C6E9D2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:"#1D6F42",fontWeight:900,fontSize:20,fontFamily:"Georgia,serif"}}>X</span>
              </div>
              <div>
                <div style={{fontWeight:900,fontSize:15,color:C.text}}>
                  {stU==="ok"?`✅ ${msgU}`:stU==="err"?`❌ ${msgU}`:"Gün Sonu Exceli Yükle"}
                </div>
                <div style={{fontSize:12,color:C.muted,fontWeight:600,marginTop:2}}>
                  {stU==="ok"?"Diğer deponun dosyasını da yükleyebilirsiniz":"3 sayfalı şablon — TEM.34 ve Kartepe dosyalarını ayrı ayrı yükleyin, depo otomatik tanınır"}
                </div>
              </div>
            </div>
            <button onClick={()=>fileRef.current?.click()}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:`1.5px solid ${C.navy}`,color:C.navy,background:"#fff",borderRadius:11,padding:"11px 22px",fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
              <span>⇧</span>{stU==="loading"?"Yükleniyor...":"Excel Seç"}
            </button>
          </div>

          {/* İKİ KOLON */}
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 300px",gap:18,alignItems:"start"}}>

            {/* SOL */}
            <div>
              {/* Özet kartları */}
              <div style={{display:"flex",flexDirection:mobile?"column":"row",gap:mobile?10:14,marginBottom:18}}>
                {tab==="yurtici"&&<>
                  <SummaryCard type="navy"  title="TOPLAM SİPARİŞ" val={totS} sub="Sipariş"/>
                  <SummaryCard type="green" title="KESİLEN FATURA" val={totF} sub="Fatura"/>
                  <SummaryCard type={totK>0?"red":"green"} title="KALAN SİPARİŞ" val={totK} sub="Sipariş"/>
                </>}
                {tab==="ihracat"&&<>
                  <SummaryCard type="green"  title="ZAMANINDA" val={ihZ} sub="Sevkiyat"/>
                  <SummaryCard type="yellow" title="TERMİN İÇİNDE" val={ihR2} sub="Sevkiyat"/>
                  <SummaryCard type="red"    title="GECİKEN / AŞAN" val={ihG} sub="Sevkiyat"/>
                </>}
                {tab==="malKabul"&&<>
                  <SummaryCard type="red"    title="BAŞLAMADI"  val={mkB} sub="İrsaliye"/>
                  <SummaryCard type="yellow" title="İŞLEMDE"    val={mkI} sub="İrsaliye"/>
                  <SummaryCard type="green"  title="TAMAMLANDI" val={mkT} sub="İrsaliye"/>
                </>}
              </div>

              {/* Tablolar */}
              {tab==="yurtici"&&tableCard("📋","BEKLEYEN MÜŞTERİLER",fYi.length,
                ["Depo","Müşteri","Çıkmama Sebebi","SKU","Adet","Not"],
                fYi.length===0?(
                  <tr><td colSpan={6} style={{...td,textAlign:"center",color:C.muted,padding:24}}>Bekleyen müşteri yok — tüm siparişler faturalandı ✅</td></tr>
                ):fYi.map((r,i)=>(
                  <tr key={i}>
                    <td style={td}><Badge type={r.depo==="KARTEPE"?"yellow":"green"} label={r.depo}/></td>
                    <td style={{...td,fontWeight:800}}>{r.musteri}</td>
                    <td style={td}>{r.sebep?<Badge type="yellow" label={r.sebep}/>:"—"}</td>
                    <td style={td}>{r.sku||"—"}</td>
                    <td style={td}>{r.adet?r.adet.toLocaleString("tr-TR"):"—"}</td>
                    <td style={{...td,color:C.muted,fontWeight:600}}>{r.not||"—"}</td>
                  </tr>
                ))
              )}
              {tab==="ihracat"&&tableCard("🚢","İHRACAT SEVKİYAT LİSTESİ",fIh.length,
                ["Depo","Müşteri","İlk Sipariş","Çıkış","SKU","Adet","Son Termin","Durum"],
                fIh.length===0?(
                  <tr><td colSpan={8} style={{...td,textAlign:"center",color:C.muted,padding:24}}>Kayıt yok</td></tr>
                ):fIh.map((r,i)=>(
                  <tr key={i}>
                    <td style={td}><Badge type={r.depo==="KARTEPE"?"yellow":"green"} label={r.depo}/></td>
                    <td style={{...td,fontWeight:800}}>{r.musteri}</td>
                    <td style={td}>{r.ilkTarih||"—"}</td>
                    <td style={td}>{r.cikisTarih||"—"}</td>
                    <td style={td}>{r.sku||"—"}</td>
                    <td style={td}>{r.adet?r.adet.toLocaleString("tr-TR"):"—"}</td>
                    <td style={{...td,fontWeight:900}}>{r.termin||"—"}</td>
                    <td style={td}><Badge type={r.type} label={r.durum}/></td>
                  </tr>
                ))
              )}
              {tab==="malKabul"&&tableCard("📦","İRSALİYE LİSTESİ",fMk.length,
                ["Belge No","Firma","Depo","Tarih","Adet","Durum"],
                fMk.length===0?(
                  <tr><td colSpan={6} style={{...td,textAlign:"center",color:C.muted,padding:24}}>Kayıt yok</td></tr>
                ):fMk.map((r,i)=>(
                  <tr key={i}>
                    <td style={{...td,fontWeight:900}}>{r.no}</td>
                    <td style={td}>{r.firma}</td>
                    <td style={td}><Badge type={r.depo==="KARTEPE"?"yellow":"green"} label={r.depo}/></td>
                    <td style={td}>{r.tarih}</td>
                    <td style={td}>{r.adet.toLocaleString("tr-TR")}</td>
                    <td style={td}><Badge type={r.type} label={r.durum}/></td>
                  </tr>
                ))
              )}
            </div>

            {/* SAĞ */}
            <div>
              {tab==="yurtici"&&<DayEndSummary title={`GÜN SONU ÖZETİ${depoFiltre!=="Tümü"?" · "+depoFiltre:""}`} rows={[
                ["Toplam Sipariş",totS,"#fff"],["Kesilen Fatura",totF,"#86EFAC"],["Kalan Sipariş",totK,totK>0?"#FCA5A5":"#86EFAC"],
                ...(depoFiltre==="Tümü"?depolar.map(d=>[`— ${d}`,`${yiTot[d]?.siparis||0} / ${yiTot[d]?.fatura||0}`,"#FCD34D"] as [string,string,string]):[])
              ]}/>}
              {tab==="ihracat"&&<DayEndSummary title={`GÜN SONU ÖZETİ${depoFiltre!=="Tümü"?" · "+depoFiltre:""}`} rows={[
                ["Toplam Sevkiyat",fIh.length,"#fff"],["Zamanında",ihZ,"#86EFAC"],["Termin İçinde",ihR2,"#FCD34D"],["Geciken",ihG,"#FCA5A5"]]}/>}
              {tab==="malKabul"&&<DayEndSummary title={`GÜN SONU ÖZETİ${depoFiltre!=="Tümü"?" · "+depoFiltre:""}`} rows={[
                ["Toplam İrsaliye",fMk.length,"#fff"],["Başlamadı",mkB,"#FCA5A5"],["İşlemde",mkI,"#FCD34D"],["Tamamlandı",mkT,"#86EFAC"]]}/>}
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
