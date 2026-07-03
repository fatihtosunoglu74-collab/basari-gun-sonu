"use client";

import { useState, useRef } from "react";
import Image from "next/image";

// ─── Türkiye İlleri ──────────────────────────────────────────────────────────
const TR_ILLER = new Set([
  "ADANA","ADIYAMAN","AFYONKARAHİSAR","AĞRI","AKSARAY","AMASYA","ANKARA",
  "ANTALYA","ARDAHAN","ARTVİN","AYDIN","BALIKESİR","BARTIN","BATMAN",
  "BAYBURT","BİLECİK","BİNGÖL","BİTLİS","BOLU","BURDUR","BURSA",
  "ÇANAKKALE","ÇANKIRI","ÇORUM","DENİZLİ","DİYARBAKIR","DÜZCE","EDİRNE",
  "ELAZIĞ","ERZİNCAN","ERZURUM","ESKİŞEHİR","GAZİANTEP","GİRESUN",
  "GÜMÜŞHANE","HAKKARİ","HATAY","IĞDIR","ISPARTA","İSTANBUL","İZMİR",
  "KAHRAMANMARAŞ","KARABÜK","KARAMAN","KARS","KASTAMONU","KAYSERİ",
  "KİLİS","KIRIKKALE","KIRKLARELİ","KIRŞEHİR","KOCAELİ","KONYA",
  "KÜTAHYA","MALATYA","MANİSA","MARDİN","MERSİN","MUĞLA","MUŞ",
  "NEVŞEHİR","NİĞDE","ORDU","OSMANİYE","RİZE","SAKARYA","SAMSUN",
  "SİİRT","SİNOP","SİVAS","ŞANLIURFA","ŞIRNAK","TEKİRDAĞ","TOKAT",
  "TRABZON","TUNCELİ","UŞAK","VAN","YALOVA","YOZGAT","ZONGULDAK"
]);

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface YIRow { id:string; musteri:string; sebep:string; sku:string; adet:string; not:string; }
interface IHRow { id:string; musteri:string; ulke:string; ilkTarih:string; cikisTarih:string; sebep:string; sku:string; adet:string; }
interface MKRow { id:string; firma:string; depo:string; belgeNo:string; belgeNo2:string; tarih:string; cari:string; adet:string; cesit:string; durum:string; }
type Renk = "green"|"yellow"|"red";
interface Status { durum:string; renk:Renk; terminGun:number; sonTermin:string; }

// ─── Hesaplama ────────────────────────────────────────────────────────────────
function calcTermin(sku:string, sebep=""):number {
  if (sebep.toUpperCase().includes("ELLEÇLEME")) return 7;
  const n = parseInt(sku)||0;
  if (n<=50) return 1; if (n<=100) return 2; if (n<=250) return 4; return 7;
}
function calcStatus(row:Partial<IHRow>):Status|null {
  const { ilkTarih, cikisTarih, sebep="", sku } = row;
  if (!ilkTarih||!sku) return null;
  const g = calcTermin(sku,sebep);
  const ilk = new Date(ilkTarih);
  const son = new Date(ilk); son.setDate(ilk.getDate()+g);
  const today = new Date(); today.setHours(0,0,0,0);
  const isG = sebep==="GÖNDERİLDİ"||!!cikisTarih;
  const cikis = cikisTarih ? new Date(cikisTarih) : today;
  let durum:string, renk:Renk;
  if (isG) { durum=cikis<=son?"ZAMANINDA ÇIKTI":"GEÇ ÇIKTI"; renk=cikis<=son?"green":"red"; }
  else      { durum=today<=son?"TERMİN SÜRESİ İÇİNDE":"TERMİN AŞTI — ACİL"; renk=today<=son?"yellow":"red"; }
  return { durum, renk, terminGun:g, sonTermin:son.toLocaleDateString("tr-TR") };
}

const todayStr = () => new Date().toISOString().split("T")[0];
const uid      = () => Math.random().toString(36).slice(2,10);
const st       = (v:any) => String(v??"").trim();
const ns       = (v:any) => { const n=parseFloat(st(v)); return isNaN(n)?"":String(Math.round(n)); };
const fmtDate  = (d:string) => d ? new Date(d).toLocaleDateString("tr-TR") : "—";
const fmtNum   = (n:string|number) => { const v=parseInt(String(n)); return isNaN(v)?"0":v.toLocaleString("tr-TR"); };

function xlDate(val:any):string {
  if (!val&&val!==0) return "";
  const serial = Math.floor(typeof val==="number"?val:parseFloat(st(val)));
  if (isNaN(serial)||serial<1) return "";
  const d = new Date(Math.round((serial-25569)*86400*1000));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
}
function parseTrDate(val:string):string {
  const m = val?.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : todayStr();
}

// ─── Renk Haritası ───────────────────────────────────────────────────────────
const SC:Record<Renk,string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow:"bg-amber-50   text-amber-700   border-amber-200",
  red:   "bg-red-50     text-red-700     border-red-200",
};
const SB:Record<Renk,string> = {
  green:"border-l-emerald-500", yellow:"border-l-amber-500", red:"border-l-red-500",
};
const RENK_DOT:Record<Renk,string> = {
  green:"bg-emerald-500", yellow:"bg-amber-400", red:"bg-red-500",
};

// ─── Atom Bileşenler ──────────────────────────────────────────────────────────
const Lbl = ({c}:{c:string}) => <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{c}</span>;

const Inp = ({ph,val,set,tp="text"}:{ph?:string;val:string;set:(v:string)=>void;tp?:string}) => (
  <input type={tp} inputMode={tp==="number"?"numeric":undefined} placeholder={ph} value={val}
    onChange={e=>set(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800
      placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]
      transition-all" />
);

const Sel = ({val,set,opts,ph="— Seçin —"}:{val:string;set:(v:string)=>void;opts:string[];ph?:string}) => (
  <select value={val} onChange={e=>set(e.target.value)}
    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800
      focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] transition-all">
    <option value="">{ph}</option>
    {opts.map(o=><option key={o}>{o}</option>)}
  </select>
);

const PrimaryBtn = ({children,onClick,cls=""}:{children:React.ReactNode;onClick:()=>void;cls?:string}) => (
  <button onClick={onClick}
    className={`w-full bg-[#1B2A4A] hover:bg-[#243650] active:scale-[0.98] text-white rounded-xl py-3
      text-sm font-bold tracking-wide transition-all shadow-sm ${cls}`}>
    {children}
  </button>
);

const DelBtn = ({onClick}:{onClick:()=>void}) => (
  <button onClick={onClick}
    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400
      flex items-center justify-center text-lg transition-colors flex-shrink-0 ml-2">
    ×
  </button>
);

// ─── Stat Kartı ──────────────────────────────────────────────────────────────
function StatCard({label,val,sub,color,big=false}:{label:string;val:string|number;sub?:string;color:string;big?:boolean}) {
  return (
    <div className={`flex-1 rounded-2xl border shadow-sm overflow-hidden ${big?"p-4":"p-3"} ${color}`}>
      <div className={`font-black tabular-nums ${big?"text-3xl":"text-2xl"}`}>{val}</div>
      <div className="text-xs font-semibold mt-0.5 opacity-70 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs opacity-50 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Kayıt Kartı ─────────────────────────────────────────────────────────────
function RowCard({borderCls,children}:{borderCls:string;children:React.ReactNode}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${borderCls}
      shadow-sm hover:shadow-md transition-shadow p-4 mb-3 flex items-start justify-between gap-2`}>
      {children}
    </div>
  );
}

// ─── Upload Bölgesi ──────────────────────────────────────────────────────────
type UpSt = "idle"|"loading"|"ok"|"err";
function UpZone({label,icon,bg,st:upSt,msg,onClick}:{label:string;icon:string;bg:string;st:UpSt;msg:string;onClick:()=>void}) {
  return (
    <button onClick={onClick}
      className={`flex-1 min-w-0 rounded-2xl border-2 border-dashed p-5 flex flex-col items-center gap-2
        text-center transition-all
        ${upSt==="loading" ? "border-slate-200 bg-slate-50 cursor-wait opacity-60"
        : upSt==="ok"  ? "border-emerald-300 bg-emerald-50"
        : upSt==="err" ? "border-red-300 bg-red-50"
        : `${bg} hover:scale-[1.02] active:scale-[0.98]`}`}>
      <span className="text-3xl">{upSt==="ok"?"✅":upSt==="err"?"❌":upSt==="loading"?"⏳":icon}</span>
      <div>
        <div className={`text-sm font-bold ${upSt==="ok"?"text-emerald-700":upSt==="err"?"text-red-600":"text-slate-700"}`}>
          {upSt==="ok"||upSt==="err" ? msg : label}
        </div>
        {upSt==="idle" && <div className="text-xs text-slate-400 mt-0.5">.xlsx / .xls</div>}
      </div>
    </button>
  );
}

// ─── ANA SAYFA ────────────────────────────────────────────────────────────────
export default function GunSonuPage() {
  type TabKey = "yurtici"|"ihracat"|"malkabul";
  const [tab, setTab] = useState<TabKey>("yurtici");

  const [yiSiparis, setYiSiparis] = useState("");
  const [yiFatura,  setYiFatura]  = useState("");
  const [yiRows,    setYiRows]    = useState<YIRow[]>([]);
  const [yiF, setYiF] = useState<Omit<YIRow,"id">>({musteri:"",sebep:"",sku:"",adet:"",not:""});

  const [ihRows, setIhRows] = useState<IHRow[]>([]);
  const [ihF, setIhF] = useState<Omit<IHRow,"id">>({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});

  const [mkRows, setMkRows] = useState<MKRow[]>([]);
  const [mkF, setMkF] = useState<Omit<MKRow,"id">>({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),cari:"",adet:"",cesit:"",durum:"BAŞLAMADI"});

  const [stIt, setStIt] = useState<UpSt>("idle"); const [msgIt, setMsgIt] = useState("");
  const [stIr, setStIr] = useState<UpSt>("idle"); const [msgIr, setMsgIr] = useState("");
  const refIt = useRef<HTMLInputElement>(null);
  const refIr = useRef<HTMLInputElement>(null);

  const yiKalan = (parseInt(yiSiparis)||0)-(parseInt(yiFatura)||0);
  const liveS   = ihF.sku ? calcStatus(ihF) : null;
  const ihSts   = ihRows.map(r=>calcStatus(r));
  const mkTot   = mkRows.reduce((t,r)=>t+(parseInt(r.adet)||0),0);

  // ── Parse: İş Talepleri ───────────────────────────────────────────────────
  async function parseIsTalepleri(file:File) {
    setStIt("loading");
    try {
      const XLSX  = await import("xlsx");
      const buf   = await file.arrayBuffer();
      const wb    = XLSX.read(buf);
      const ws    = wb.Sheets["data"] ?? wb.Sheets[wb.SheetNames[0]];
      const data:any[][] = XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi    = data.findIndex(r=>r.some((c:any)=>st(c)==="Müşteri"));
      const hRow  = hi>=0 ? data[hi] : data[0];
      const iMus  = hRow.findIndex((c:any)=>st(c)==="Müşteri");
      const iIl   = hRow.findIndex((c:any)=>st(c)==="İl");
      const iTar  = hRow.findIndex((c:any)=>st(c).includes("Tarih"));
      const iAdt  = hRow.findIndex((c:any)=>st(c)==="Adet");
      const iCes  = hRow.findIndex((c:any)=>st(c)==="Çeşit");
      const rows  = data.slice(hi>=0?hi+1:1);
      let fatCount=0; const ihNew:IHRow[]=[];
      for (const r of rows) {
        const mus = st(iMus>=0?r[iMus]:r[3]); if (!mus) continue;
        const il  = st(iIl>=0?r[iIl]:r[4]).toUpperCase();
        const tar = parseTrDate(st(iTar>=0?r[iTar]:r[2]));
        const adt = ns(iAdt>=0?r[iAdt]:r[6]);
        const ces = ns(iCes>=0?r[iCes]:r[7]);
        if (TR_ILLER.has(il)) { fatCount++; }
        else if (il) { ihNew.push({id:uid(),musteri:mus,ulke:il,ilkTarih:tar,cikisTarih:"",sebep:"",sku:ces,adet:adt}); }
      }
      setYiFatura(String(fatCount));
      setIhRows(r=>[...r,...ihNew]);
      setMsgIt(`${fatCount} Yurtiçi · ${ihNew.length} İhracat`);
      setStIt("ok"); setTab("yurtici");
    } catch(e) { console.error(e); setMsgIt("Dosya okunamadı"); setStIt("err"); }
  }

  // ── Parse: İrsaliye ───────────────────────────────────────────────────────
  async function parseIrsaliye(file:File) {
    setStIr("loading");
    try {
      const XLSX = await import("xlsx");
      const wb   = XLSX.read(await file.arrayBuffer());
      const ws   = wb.Sheets["data"] ?? wb.Sheets[wb.SheetNames[0]];
      const data:any[][] = XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi   = data.findIndex(r=>r.some((c:any)=>st(c)==="Firma"||st(c)==="FİRMA"));
      const hRow = hi>=0?data[hi]:data[0];
      const iDep = hRow.findIndex((c:any)=>st(c)==="Depo");
      const iBno = hRow.findIndex((c:any)=>st(c)==="BelgeNo");
      const iBn2 = hRow.findIndex((c:any)=>st(c)==="BelgeNo2");
      const iTar = hRow.findIndex((c:any)=>st(c)==="Tarih");
      const iCar = hRow.findIndex((c:any)=>st(c)==="Cari"&&!st(c).includes("İsmi"));
      const iCnm = hRow.findIndex((c:any)=>st(c).includes("Cari İsmi"));
      const iAdt = hRow.findIndex((c:any)=>st(c)==="Adet");
      const iCes = hRow.findIndex((c:any)=>st(c)==="Çeşit");
      const iDur = hRow.findIndex((c:any)=>st(c)==="Durum");
      const rows:MKRow[]=[];
      for (let i=(hi>=0?hi+1:1); i<data.length; i++) {
        const r   = data[i];
        const fir = st(iCnm>=0?r[iCnm]:r[6]); if (!fir) continue;
        const raw = st(iDur>=0?r[iDur]:r[9]);
        const dur = raw==="Başlamadı"?"BAŞLAMADI":raw==="İşlemde"?"İŞLEMDE":raw==="Tamamlandı"?"TAMAMLANDI":raw||"BAŞLAMADI";
        rows.push({id:uid(),firma:fir,
          depo:    st(iDep>=0?r[iDep]:r[1])||"TEM.34",
          belgeNo: st(iBno>=0?r[iBno]:r[2]),
          belgeNo2:st(iBn2>=0?r[iBn2]:r[3]),
          tarih:   xlDate(iTar>=0?r[iTar]:r[4])||todayStr(),
          cari:    st(iCar>=0?r[iCar]:r[5]),
          adet:    ns(iAdt>=0?r[iAdt]:r[7]),
          cesit:   ns(iCes>=0?r[iCes]:r[8]),
          durum:   dur,
        });
      }
      setMkRows(rows);
      setMsgIr(`${rows.length} irsaliye · ${rows.reduce((s,r)=>s+(parseInt(r.adet)||0),0).toLocaleString("tr-TR")} adet`);
      setStIr("ok"); setTab("malkabul");
    } catch(e) { console.error(e); setMsgIr("Dosya okunamadı"); setStIr("err"); }
  }

  const addYi = ()=>{if(!yiF.musteri.trim())return; setYiRows(r=>[...r,{...yiF,id:uid()}]); setYiF({musteri:"",sebep:"",sku:"",adet:"",not:""});};
  const addIh = ()=>{if(!ihF.musteri.trim())return; setIhRows(r=>[...r,{...ihF,id:uid()}]); setIhF({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});};
  const addMk = ()=>{if(!mkF.firma.trim())return;   setMkRows(r=>[...r,{...mkF,id:uid()}]); setMkF({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),cari:"",adet:"",cesit:"",durum:"BAŞLAMADI"});};

  function shareWA() {
    const d = new Date().toLocaleDateString("tr-TR");
    let msg = `📋 *GÜN SONU RAPORU — ${d}*\n\n`;
    msg += `*🚚 YURTİÇİ*\nSipariş: ${yiSiparis||0} | Faturalanan: ${yiFatura||0} | Kalan: ${yiKalan}\n`;
    if (yiRows.length>0) yiRows.forEach(r=>{
      msg += `• ${r.musteri} — ${r.sebep}`;
      if (r.sku)  msg += ` | ${r.sku} SKU`;
      if (r.adet) msg += ` | ${r.adet} Adet`;
      if (r.not)  msg += ` | ${r.not}`;
      msg+="\n";
    }); else msg += "Tüm siparişler faturalandı ✅\n";
    msg += `\n*✈️ İHRACAT*\n`;
    if (!ihRows.length) msg+="Kayıt yok\n";
    else ihRows.forEach(r=>{
      const s=calcStatus(r);
      const e=s?.renk==="green"?"🟢":s?.renk==="yellow"?"🟡":"🔴";
      msg+=`${e} ${r.musteri} (${r.ulke||"?"}) — ${s?.durum||r.sebep||"—"} | ${r.sku} SKU | ${r.adet} Adet\n`;
    });
    msg += `\n*📦 MAL KABUL*\n`;
    if (!mkRows.length) msg+="Kayıt yok\n";
    else {
      const tot=mkRows.reduce((s,r)=>s+(parseInt(r.adet)||0),0);
      msg+=`${mkRows.length} belge — ${tot.toLocaleString("tr-TR")} adet toplam\n`;
      mkRows.forEach(r=>msg+=`• ${r.firma} | ${r.depo} | ${r.adet} Adet | ${r.durum}\n`);
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  }

  const resetAll = () => {
    setStIt("idle"); setMsgIt(""); setStIr("idle"); setMsgIr("");
    setYiRows([]); setIhRows([]); setMkRows([]);
    setYiSiparis(""); setYiFatura("");
  };

  const longDate = new Date().toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  return (
    <div className="min-h-screen bg-slate-100 pb-24">

      {/* ── HERO HEADER ── */}
      <header className="relative bg-cover bg-center" style={{backgroundImage:"url('/hero-bg.jpg')"}}>
        <div className="absolute inset-0" style={{background:"linear-gradient(160deg,rgba(10,18,35,0.95) 0%,rgba(27,42,74,0.88) 60%,rgba(15,28,55,0.92) 100%)"}} />
        <div className="relative px-5 pt-7 pb-6">
          {/* Logo + Gönder */}
          <div className="flex items-start justify-between mb-6">
            <Image src="/logo-full-color.png" alt="Başarı Otomotiv" width={140} height={36}
              className="h-9 w-auto object-contain" priority />
            <button onClick={shareWA}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 active:scale-95
                text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all">
              <span>📤</span> Gönder
            </button>
          </div>
          {/* Başlık */}
          <h1 className="text-white font-black text-2xl tracking-tight leading-tight">
            Gün Sonu İzleme
          </h1>
          <p className="text-white/50 text-sm mt-1">{longDate}</p>

          {/* Hızlı istatistikler */}
          <div className="flex gap-3 mt-5">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Yurtiçi Kalan</div>
              <div className={`text-2xl font-black ${yiKalan>0?"text-red-400":"text-emerald-400"}`}>{yiKalan}</div>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">İhracat</div>
              <div className="text-2xl font-black text-amber-400">{ihRows.length}</div>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Mal Kabul</div>
              <div className="text-2xl font-black text-sky-400">{mkRows.length}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── TABS ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="flex max-w-xl mx-auto">
          {([["yurtici","🚚","Yurtiçi"],["ihracat","✈️","İhracat"],["malkabul","📦","Mal Kabul"]] as const).map(([k,ic,lb])=>(
            <button key={k} onClick={()=>setTab(k as TabKey)}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wide transition-all flex flex-col items-center gap-0.5
                ${tab===k
                  ? "text-[#1B2A4A] border-b-2 border-[#C8962E]"
                  : "text-slate-400 border-b-2 border-transparent hover:text-slate-600"}`}>
              <span className="text-lg">{ic}</span>
              {lb}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5">

        {/* ── ZEUS UPLOAD ── */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#1B2A4A] flex items-center justify-center">
              <span className="text-sm">⚡</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Zeus WMS Entegrasyonu</div>
              <div className="text-xs text-slate-400">Rapor Al → Excel Kaydet → Buraya Yükle</div>
            </div>
          </div>
          <div className="flex gap-3">
            <UpZone label="İş Talepleri" icon="📋"
              bg="border-[#1B2A4A]/20 bg-[#1B2A4A]/5 hover:bg-[#1B2A4A]/10"
              st={stIt} msg={msgIt} onClick={()=>refIt.current?.click()} />
            <UpZone label="İrsaliye" icon="📦"
              bg="border-[#C8962E]/30 bg-[#C8962E]/5 hover:bg-[#C8962E]/10"
              st={stIr} msg={msgIr} onClick={()=>refIr.current?.click()} />
          </div>
          <input ref={refIt} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e=>{const f=e.target.files?.[0]; if(f) parseIsTalepleri(f); e.target.value="";}} />
          <input ref={refIr} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e=>{const f=e.target.files?.[0]; if(f) parseIrsaliye(f);   e.target.value="";}} />
          {(stIt==="ok"||stIr==="ok") && (
            <button onClick={resetAll}
              className="mt-3 w-full text-xs text-slate-400 hover:text-red-500 transition-colors py-1">
              ↺ Temizle ve sıfırla
            </button>
          )}
        </div>

        {/* ══ YURTİÇİ ══ */}
        {tab==="yurtici" && <>
          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <Lbl c="Sipariş Sayısı" />
              <input type="number" inputMode="numeric" placeholder="0" value={yiSiparis}
                onChange={e=>setYiSiparis(e.target.value)}
                className="text-3xl font-black text-slate-800 w-full border-none outline-none bg-transparent tabular-nums" />
            </div>
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <Lbl c="Faturalanan" />
              <input type="number" inputMode="numeric" placeholder="0" value={yiFatura}
                onChange={e=>setYiFatura(e.target.value)}
                className="text-3xl font-black text-slate-800 w-full border-none outline-none bg-transparent tabular-nums" />
            </div>
            <div className={`flex-1 rounded-2xl border-l-4 p-4 ${
              yiKalan>0 ? "bg-red-50 border-l-red-500 border border-red-100"
                        : "bg-emerald-50 border-l-emerald-500 border border-emerald-100"}`}>
              <Lbl c="Kalan" />
              <div className={`text-3xl font-black tabular-nums ${yiKalan>0?"text-red-600":"text-emerald-600"}`}>
                {yiKalan}
              </div>
            </div>
          </div>

          {/* Bekleyen form */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-5 mb-5">
            <div className="text-xs font-bold text-[#C8962E] uppercase tracking-widest mb-4">+ Bekleyen Müşteri</div>
            <div className="space-y-2.5 mb-4">
              <Inp ph="Müşteri Adı *" val={yiF.musteri} set={v=>setYiF({...yiF,musteri:v})} />
              <Sel val={yiF.sebep} set={v=>setYiF({...yiF,sebep:v})}
                opts={["TIR İLE SEVK EDİLECEK","CUT OF SONRASI DÜŞEN SİPARİŞ","ELLEÇLEME","KULVARDA","DİĞER"]} />
              <div className="grid grid-cols-2 gap-2.5">
                <Inp ph="SKU (Çeşit)" tp="number" val={yiF.sku} set={v=>setYiF({...yiF,sku:v})} />
                <Inp ph="Adet" tp="number" val={yiF.adet} set={v=>setYiF({...yiF,adet:v})} />
              </div>
              <Inp ph="Not (isteğe bağlı)" val={yiF.not} set={v=>setYiF({...yiF,not:v})} />
            </div>
            <PrimaryBtn onClick={addYi}>Ekle</PrimaryBtn>
          </div>

          {yiRows.length===0
            ? <div className="text-center text-slate-400 py-12">
                <div className="text-4xl mb-3">✅</div>
                <div className="font-semibold text-sm">Bekleyen müşteri yok</div>
                <div className="text-xs mt-1 opacity-70">Tüm siparişler faturalandı</div>
              </div>
            : yiRows.map(r=>(
              <RowCard key={r.id} borderCls="border-l-red-500">
                <div className="flex-1">
                  <div className="font-bold text-slate-800 mb-1.5">{r.musteri}</div>
                  {r.sebep && <span className={`text-xs font-semibold rounded-full border px-2.5 py-1 ${SC.red}`}>{r.sebep}</span>}
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    {r.sku  && <span className="bg-slate-100 rounded-lg px-2 py-0.5">{r.sku} SKU</span>}
                    {r.adet && <span className="bg-slate-100 rounded-lg px-2 py-0.5">{fmtNum(r.adet)} Adet</span>}
                  </div>
                  {r.not && <div className="text-xs text-slate-400 mt-1.5 italic">{r.not}</div>}
                </div>
                <DelBtn onClick={()=>setYiRows(rs=>rs.filter(x=>x.id!==r.id))} />
              </RowCard>
            ))
          }
        </>}

        {/* ══ İHRACAT ══ */}
        {tab==="ihracat" && <>
          {ihRows.length>0 && (
            <div className="flex gap-3 mb-5">
              <StatCard label="Kritik/Geç"   val={ihSts.filter(s=>s?.renk==="red").length}    color="bg-red-50 border border-red-100 text-red-700" />
              <StatCard label="Devam Ediyor" val={ihSts.filter(s=>s?.renk==="yellow").length} color="bg-amber-50 border border-amber-100 text-amber-700" />
              <StatCard label="Tamamlandı"   val={ihSts.filter(s=>s?.renk==="green").length}  color="bg-emerald-50 border border-emerald-100 text-emerald-700" />
            </div>
          )}

          {ihRows.length===0
            ? <div className="text-center text-slate-400 py-12">
                <div className="text-4xl mb-3">✈️</div>
                <div className="font-semibold text-sm">İhracat siparişi yok</div>
                <div className="text-xs mt-1 opacity-70">İş Talepleri yükleyin veya manuel ekleyin</div>
              </div>
            : ihRows.map(r=>{
              const s=calcStatus(r);
              return (
                <RowCard key={r.id} borderCls={s?SB[s.renk]:"border-l-slate-300"}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {s && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${RENK_DOT[s.renk]}`} />}
                      <span className="font-bold text-slate-800">{r.musteri}</span>
                      {r.ulke && (
                        <span className="text-xs bg-slate-100 text-slate-500 font-semibold rounded-md px-1.5 py-0.5 uppercase">
                          {r.ulke}
                        </span>
                      )}
                    </div>
                    {s && <span className={`text-xs font-semibold rounded-full border px-2.5 py-1 ${SC[s.renk]}`}>{s.durum}</span>}
                    <div className="flex gap-2 mt-2 text-xs text-slate-500">
                      {r.sku  && <span className="bg-slate-100 rounded-lg px-2 py-0.5">{r.sku} SKU</span>}
                      {r.adet && <span className="bg-slate-100 rounded-lg px-2 py-0.5">{fmtNum(r.adet)} Adet</span>}
                      {s      && <span className="bg-slate-100 rounded-lg px-2 py-0.5">Son: {s.sonTermin}</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-1.5">
                      {fmtDate(r.ilkTarih)}{r.cikisTarih?` → ${fmtDate(r.cikisTarih)}`:""}{r.sebep?` · ${r.sebep}`:""}
                    </div>
                    {!r.cikisTarih && (
                      <button onClick={()=>setIhRows(rs=>rs.map(x=>x.id===r.id?{...x,sebep:"GÖNDERİLDİ",cikisTarih:todayStr()}:x))}
                        className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        ✓ Gönderildi olarak işaretle
                      </button>
                    )}
                  </div>
                  <DelBtn onClick={()=>setIhRows(rs=>rs.filter(x=>x.id!==r.id))} />
                </RowCard>
              );
            })
          }

          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-5 mb-5">
            <div className="text-xs font-bold text-[#C8962E] uppercase tracking-widest mb-4">+ Manuel Sipariş Ekle</div>
            <div className="space-y-2.5 mb-4">
              <Inp ph="Müşteri / Alıcı Adı *" val={ihF.musteri} set={v=>setIhF({...ihF,musteri:v})} />
              <Inp ph="Ülke / Şehir" val={ihF.ulke} set={v=>setIhF({...ihF,ulke:v})} />
              <div className="grid grid-cols-2 gap-2.5">
                <div><Lbl c="İlk Sipariş Tarihi" /><Inp tp="date" val={ihF.ilkTarih} set={v=>setIhF({...ihF,ilkTarih:v})} /></div>
                <div><Lbl c="Çıkış Tarihi" /><Inp tp="date" val={ihF.cikisTarih} set={v=>setIhF({...ihF,cikisTarih:v})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Sel val={ihF.sebep} set={v=>setIhF({...ihF,sebep:v})}
                  opts={["GÖNDERİLDİ","TOPLAMADA","ELLEÇLEME","BEKLEMEDE","DİĞER"]} />
                <Inp ph="SKU (Çeşit)" tp="number" val={ihF.sku} set={v=>setIhF({...ihF,sku:v})} />
              </div>
              <Inp ph="Adet" tp="number" val={ihF.adet} set={v=>setIhF({...ihF,adet:v})} />
              {liveS && (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${SC[liveS.renk]}`}>
                  <div className="font-bold">⚡ {liveS.durum}</div>
                  <div className="text-xs mt-0.5 opacity-70">Termin: {liveS.terminGun} gün · Son tarih: {liveS.sonTermin}</div>
                </div>
              )}
            </div>
            <PrimaryBtn onClick={addIh}>Ekle</PrimaryBtn>
          </div>
        </>}

        {/* ══ MAL KABUL ══ */}
        {tab==="malkabul" && <>
          {mkRows.length>0 && (
            <div className="flex gap-3 mb-5">
              <StatCard label="Bekliyor"    val={mkRows.filter(r=>r.durum!=="TAMAMLANDI").length} color="bg-amber-50 border border-amber-100 text-amber-700" />
              <StatCard label="Tamamlandı"  val={mkRows.filter(r=>r.durum==="TAMAMLANDI").length}  color="bg-emerald-50 border border-emerald-100 text-emerald-700" />
              <StatCard label="Toplam Adet" val={fmtNum(mkTot)}                                    color="bg-sky-50 border border-sky-100 text-sky-700" />
            </div>
          )}

          {mkRows.length===0
            ? <div className="text-center text-slate-400 py-12">
                <div className="text-4xl mb-3">📦</div>
                <div className="font-semibold text-sm">Mal kabul kaydı yok</div>
                <div className="text-xs mt-1 opacity-70">İrsaliye yükleyin veya manuel ekleyin</div>
              </div>
            : mkRows.map(r=>{
              const dc = r.durum==="TAMAMLANDI"?"border-l-emerald-500":r.durum==="İŞLEMDE"?"border-l-amber-500":"border-l-slate-400";
              const pk = r.durum==="TAMAMLANDI"?SC.green:r.durum==="İŞLEMDE"?SC.yellow:SC.red;
              return (
                <RowCard key={r.id} borderCls={dc}>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 mb-1.5 leading-tight">{r.firma}</div>
                    <span className={`text-xs font-semibold rounded-full border px-2.5 py-1 ${pk}`}>{r.durum}</span>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
                      <span className="bg-slate-100 rounded-lg px-2 py-0.5">{r.depo}</span>
                      {r.adet  && <span className="bg-slate-100 rounded-lg px-2 py-0.5">{fmtNum(r.adet)} Adet</span>}
                      {r.cesit && <span className="bg-slate-100 rounded-lg px-2 py-0.5">{r.cesit} Çeşit</span>}
                      <span className="bg-slate-100 rounded-lg px-2 py-0.5">{fmtDate(r.tarih)}</span>
                    </div>
                    {(r.belgeNo||r.belgeNo2) && (
                      <div className="text-xs text-slate-400 mt-1.5 font-mono">
                        {r.belgeNo}{r.belgeNo2?` / ${r.belgeNo2}`:""}
                      </div>
                    )}
                  </div>
                  <DelBtn onClick={()=>setMkRows(rs=>rs.filter(x=>x.id!==r.id))} />
                </RowCard>
              );
            })
          }

          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-5 mb-5">
            <div className="text-xs font-bold text-[#C8962E] uppercase tracking-widest mb-4">+ Manuel Mal Kabul</div>
            <div className="space-y-2.5 mb-4">
              <Inp ph="Firma Adı *" val={mkF.firma} set={v=>setMkF({...mkF,firma:v})} />
              <div className="grid grid-cols-2 gap-2.5">
                <Sel val={mkF.depo} set={v=>setMkF({...mkF,depo:v})} opts={["TEM.34","Kartepe","Çatalca","Ankara"]} ph="Depo seçin" />
                <div><Lbl c="Tarih" /><Inp tp="date" val={mkF.tarih} set={v=>setMkF({...mkF,tarih:v})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Inp ph="Belge No" val={mkF.belgeNo} set={v=>setMkF({...mkF,belgeNo:v})} />
                <Inp ph="Belge No 2" val={mkF.belgeNo2} set={v=>setMkF({...mkF,belgeNo2:v})} />
                <Inp ph="Adet" tp="number" val={mkF.adet} set={v=>setMkF({...mkF,adet:v})} />
                <Inp ph="Çeşit (SKU)" tp="number" val={mkF.cesit} set={v=>setMkF({...mkF,cesit:v})} />
              </div>
              <Sel val={mkF.durum} set={v=>setMkF({...mkF,durum:v})}
                opts={["BAŞLAMADI","İŞLEMDE","TAMAMLANDI","ÜRÜN DEPOYA GELMEDİ"]} />
            </div>
            <PrimaryBtn onClick={addMk}>Ekle</PrimaryBtn>
          </div>
        </>}

      </div>

      {/* ── FLOATING GÖNDER ── */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-50 max-w-xl mx-auto">
        <button onClick={shareWA}
          className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400
            active:scale-[0.98] text-white font-black text-base py-4 rounded-2xl shadow-2xl
            transition-all tracking-wide">
          <span className="text-xl">📤</span>
          WhatsApp&apos;a Gönder
        </button>
      </div>

    </div>
  );
}
