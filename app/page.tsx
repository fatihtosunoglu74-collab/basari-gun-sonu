"use client";

import { useState, useRef } from "react";

// ─── Türkiye İlleri (Yurtiçi / İhracat ayırımı için) ─────────────────────────
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
interface YIRow  { id:string; musteri:string; sebep:string; sku:string; adet:string; not:string; }
interface IHRow  { id:string; musteri:string; ulke:string; ilkTarih:string; cikisTarih:string; sebep:string; sku:string; adet:string; }
interface MKRow  { id:string; firma:string; depo:string; belgeNo:string; belgeNo2:string; tarih:string; cari:string; adet:string; cesit:string; durum:string; }
type Renk = "green"|"yellow"|"red";
interface Status { durum:string; renk:Renk; terminGun:number; sonTermin:string; }

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────────────
function calcTermin(sku:string, sebep=""):number {
  if (sebep.toUpperCase().includes("ELLEÇLEME")) return 7;
  const n = parseInt(sku)||0;
  if (n<=50) return 1; if (n<=100) return 2; if (n<=250) return 4; return 7;
}

function calcStatus(row:Partial<IHRow>):Status|null {
  const { ilkTarih, cikisTarih, sebep="", sku } = row;
  if (!ilkTarih||!sku) return null;
  const terminGun = calcTermin(sku,sebep);
  const ilk = new Date(ilkTarih);
  const son = new Date(ilk); son.setDate(ilk.getDate()+terminGun);
  const today = new Date(); today.setHours(0,0,0,0);
  const isGnd = sebep==="GÖNDERİLDİ"||!!cikisTarih;
  const cikis = cikisTarih ? new Date(cikisTarih) : today;
  let durum:string, renk:Renk;
  if (isGnd) {
    durum = cikis<=son ? "ZAMANINDA ÇIKTI" : "GEÇ ÇIKTI";
    renk  = cikis<=son ? "green" : "red";
  } else {
    durum = today<=son ? "TERMİN SÜRESİ İÇİNDE" : "TERMİN AŞTI — ACİL";
    renk  = today<=son ? "yellow" : "red";
  }
  return { durum, renk, terminGun, sonTermin: son.toLocaleDateString("tr-TR") };
}

const todayStr = () => new Date().toISOString().split("T")[0];
const uid      = () => Math.random().toString(36).slice(2,10);
const s        = (v:any) => String(v??"").trim();
const ns       = (v:any) => { const n=parseFloat(s(v)); return isNaN(n)?"":String(Math.round(n)); };
const fmtDate  = (d:string) => d ? new Date(d).toLocaleDateString("tr-TR") : "—";

// Excel seri tarihi → YYYY-MM-DD
function xlDate(val:any):string {
  if (!val&&val!==0) return "";
  const serial = Math.floor(typeof val==="number" ? val : parseFloat(s(val)));
  if (isNaN(serial)||serial<1) return "";
  const d = new Date(Math.round((serial-25569)*86400*1000));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
}

// Zeus tarih string → YYYY-MM-DD ("02.07.2026 10:40:05")
function parseTrDate(val:string):string {
  if (!val) return todayStr();
  const m = val.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : todayStr();
}

// ─── Stil Sabitleri ───────────────────────────────────────────────────────────
const SC:Record<Renk,string> = {
  green: "bg-green-50 text-green-700 border-green-200",
  yellow:"bg-amber-50 text-amber-700 border-amber-200",
  red:   "bg-red-50   text-red-700   border-red-200",
};
const SB:Record<Renk,string> = {
  green:"border-l-green-500", yellow:"border-l-amber-500", red:"border-l-red-500",
};

// ─── Küçük Bileşenler ─────────────────────────────────────────────────────────
const Lbl = ({c}:{c:string}) => <span className="text-xs text-slate-500 font-medium mb-1 block">{c}</span>;
const Inp = ({ph,val,set,tp="text"}:{ph?:string;val:string;set:(v:string)=>void;tp?:string}) => (
  <input type={tp} inputMode={tp==="number"?"numeric":undefined} placeholder={ph} value={val}
    onChange={e=>set(e.target.value)}
    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A]" />
);
const Sel = ({val,set,opts}:{val:string;set:(v:string)=>void;opts:string[]}) => (
  <select value={val} onChange={e=>set(e.target.value)}
    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30">
    <option value="">— Seçin —</option>
    {opts.map(o=><option key={o}>{o}</option>)}
  </select>
);
const AddBtn = ({onClick}:{onClick:()=>void}) => (
  <button onClick={onClick}
    className="w-full bg-[#1B2A4A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#243650] transition-colors">
    Ekle
  </button>
);
const DelBtn = ({onClick}:{onClick:()=>void}) => (
  <button onClick={onClick} className="text-slate-300 hover:text-red-400 transition-colors text-xl leading-none pl-2 flex-shrink-0">×</button>
);
const Card = ({children,cls=""}:{children:React.ReactNode;cls?:string}) => (
  <div className={`bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4 ${cls}`}>{children}</div>
);
const CardTitle = ({c}:{c:string}) => <div className="text-xs font-semibold text-[#C8962E] uppercase tracking-wide mb-3">{c}</div>;
const SumCard = ({label,val,color}:{label:string;val:string|number;color:string}) => (
  <div className={`flex-1 bg-white rounded-xl border border-slate-100 border-l-4 ${color} shadow-sm p-3 text-center`}>
    <div className="text-xl font-bold text-slate-800">{val}</div>
    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
  </div>
);
const Empty = ({t}:{t:string}) => <div className="text-center text-slate-400 py-10 text-sm">{t}</div>;

// ─── Upload Butonu ────────────────────────────────────────────────────────────
type UpSt = "idle"|"ok"|"err"|"loading";
function UploadZone({label,icon,st,msg,onClick}:{label:string;icon:string;st:UpSt;msg:string;onClick:()=>void}) {
  return (
    <button onClick={onClick}
      className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center text-sm font-medium transition-all min-w-0
        ${st==="loading" ? "border-slate-200 text-slate-400 cursor-wait"
        : st==="ok"      ? "border-green-400 bg-green-50 text-green-700"
        : st==="err"     ? "border-red-300 bg-red-50 text-red-600"
        : "border-[#1B2A4A]/25 hover:border-[#C8962E] hover:bg-amber-50 text-slate-600"}`}>
      <div className="text-xl mb-1">{st==="ok"?"✅":st==="err"?"❌":icon}</div>
      <div className="font-semibold">{st==="ok"||st==="err" ? msg : label}</div>
      {st==="idle" && <div className="text-xs text-slate-400 mt-1">.xlsx / .xls</div>}
    </button>
  );
}

// ─── ANA SAYFA ────────────────────────────────────────────────────────────────
export default function GunSonuPage() {
  type TabKey = "yurtici"|"ihracat"|"malkabul";
  const [tab, setTab] = useState<TabKey>("yurtici");

  // Yurtiçi
  const [yiSiparis, setYiSiparis] = useState("");
  const [yiFatura,  setYiFatura]  = useState("");
  const [yiRows,    setYiRows]    = useState<YIRow[]>([]);
  const [yiF, setYiF] = useState<Omit<YIRow,"id">>({musteri:"",sebep:"",sku:"",adet:"",not:""});

  // İhracat
  const [ihRows, setIhRows] = useState<IHRow[]>([]);
  const [ihF, setIhF] = useState<Omit<IHRow,"id">>({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});

  // Mal Kabul
  const [mkRows, setMkRows] = useState<MKRow[]>([]);
  const [mkF, setMkF] = useState<Omit<MKRow,"id">>({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),cari:"",adet:"",cesit:"",durum:"İŞLEMDE"});

  // Upload state
  const [stIt, setStIt] = useState<UpSt>("idle"); const [msgIt, setMsgIt] = useState("");
  const [stIr, setStIr] = useState<UpSt>("idle"); const [msgIr, setMsgIr] = useState("");
  const refIt = useRef<HTMLInputElement>(null);
  const refIr = useRef<HTMLInputElement>(null);

  const yiKalan = (parseInt(yiSiparis)||0)-(parseInt(yiFatura)||0);
  const liveS   = ihF.sku ? calcStatus(ihF) : null;

  // ─── İş Talepleri Parse (Yurtiçi + İhracat) ─────────────────────────────
  async function parseIsTalepleri(file:File) {
    setStIt("loading");
    try {
      const XLSX = await import("xlsx");
      const data:any[][] = XLSX.utils.sheet_to_json(
        XLSX.read(await file.arrayBuffer()).Sheets["data"] ??
        XLSX.read(await file.arrayBuffer()).Sheets[Object.keys(XLSX.read(await file.arrayBuffer()).Sheets)[0]],
        { header:1, defval:"" }
      );
      // Başlık satırını bul
      const hi = data.findIndex(r=>r.some((c:any)=>s(c)==="Müşteri"));
      const hRow = hi>=0 ? data[hi] : data[0];
      const iMus = hRow.findIndex((c:any)=>s(c)==="Müşteri");
      const iIl  = hRow.findIndex((c:any)=>s(c)==="İl");
      const iTar = hRow.findIndex((c:any)=>s(c).includes("Tarih"));
      const iAdt = hRow.findIndex((c:any)=>s(c)==="Adet");
      const iCes = hRow.findIndex((c:any)=>s(c)==="Çeşit");
      const start = hi>=0 ? hi+1 : 1;

      const yiNew:YIRow[] = [];
      const ihNew:IHRow[] = [];
      let yiFatCount = 0;

      for (let i=start; i<data.length; i++) {
        const r   = data[i];
        const mus = s(iMus>=0 ? r[iMus] : r[3]);
        if (!mus) continue;
        const il  = s(iIl>=0 ? r[iIl] : r[4]).toUpperCase();
        const tar = parseTrDate(s(iTar>=0 ? r[iTar] : r[2]));
        const adt = ns(iAdt>=0 ? r[iAdt] : r[6]);
        const ces = ns(iCes>=0 ? r[iCes] : r[7]);

        if (TR_ILLER.has(il)) {
          // Yurtiçi — fatura edilen listesi
          yiFatCount++;
          // Yurtiçi'de tamamlananları ayrıca listeleme, sadece say
        } else if (il) {
          // İhracat
          ihNew.push({
            id:uid(), musteri:mus, ulke:il,
            ilkTarih:tar, cikisTarih:"", sebep:"", sku:ces, adet:adt,
          });
        }
      }

      setYiFatura(String(yiFatCount));
      setIhRows(r=>[...r,...ihNew]);
      setMsgIt(`${yiFatCount} Yurtiçi + ${ihNew.length} İhracat kaydı okundu`);
      setStIt("ok");
      setTab("yurtici");
    } catch(e) {
      console.error(e);
      setMsgIt("Dosya okunamadı — Zeus formatı kontrol edin");
      setStIt("err");
    }
  }

  // ─── İrsaliye Parse (Mal Kabul) ──────────────────────────────────────────
  async function parseIrsaliye(file:File) {
    setStIr("loading");
    try {
      const XLSX = await import("xlsx");
      const wb   = XLSX.read(await file.arrayBuffer());
      const ws   = wb.Sheets["data"] ?? wb.Sheets[wb.SheetNames[0]];
      const data:any[][] = XLSX.utils.sheet_to_json(ws, {header:1, defval:""});
      const hi   = data.findIndex(r=>r.some((c:any)=>s(c)==="Firma"||s(c)==="FİRMA"));
      const hRow = hi>=0 ? data[hi] : data[0];
      // Zeus sütun isimleri: Firma Depo BelgeNo BelgeNo2 Tarih Cari CariİsMi Adet Çeşit Durum
      const iDep  = hRow.findIndex((c:any)=>s(c)==="Depo");
      const iBno  = hRow.findIndex((c:any)=>s(c)==="BelgeNo");
      const iBn2  = hRow.findIndex((c:any)=>s(c)==="BelgeNo2");
      const iTar  = hRow.findIndex((c:any)=>s(c)==="Tarih");
      const iCar  = hRow.findIndex((c:any)=>s(c)==="Cari"&&!s(hRow[hRow.indexOf(c)+1]).includes("İsmi"));
      const iCnm  = hRow.findIndex((c:any)=>s(c).includes("Cari İsmi")||s(c)==="Cari İsmi");
      const iAdt  = hRow.findIndex((c:any)=>s(c)==="Adet");
      const iCes  = hRow.findIndex((c:any)=>s(c)==="Çeşit");
      const iDur  = hRow.findIndex((c:any)=>s(c)==="Durum");
      const start = hi>=0 ? hi+1 : 1;

      const rows:MKRow[] = [];
      for (let i=start; i<data.length; i++) {
        const r = data[i];
        // Gerçek firma = Cari İsmi (tedarikçi), Firma kolonu her zaman "Başarı Otomotiv"
        const firma = s(iCnm>=0 ? r[iCnm] : r[6]);
        if (!firma) continue;
        const rawDur = s(iDur>=0 ? r[iDur] : r[9]);
        const durum = rawDur==="Başlamadı"||rawDur==="BAŞLAMADI" ? "BAŞLAMADI"
                    : rawDur==="İşlemde"||rawDur==="İŞLEMDE"     ? "İŞLEMDE"
                    : rawDur==="Tamamlandı"||rawDur==="TAMAMLANDI"? "TAMAMLANDI"
                    : rawDur||"BAŞLAMADI";
        rows.push({
          id:uid(), firma,
          depo:    s(iDep>=0 ? r[iDep] : r[1])||"TEM.34",
          belgeNo: s(iBno>=0 ? r[iBno] : r[2]),
          belgeNo2:s(iBn2>=0 ? r[iBn2] : r[3]),
          tarih:   xlDate(iTar>=0 ? r[iTar] : r[4])||todayStr(),
          cari:    s(iCar>=0 ? r[iCar] : r[5]),
          adet:    ns(iAdt>=0 ? r[iAdt] : r[7]),
          cesit:   ns(iCes>=0 ? r[iCes] : r[8]),
          durum,
        });
      }
      setMkRows(rows);
      setMsgIr(`${rows.length} irsaliye kaydı okundu`);
      setStIr("ok");
      setTab("malkabul");
    } catch(e) {
      console.error(e);
      setMsgIr("Dosya okunamadı — Zeus formatı kontrol edin");
      setStIr("err");
    }
  }

  // ─── Ekle / Sil ──────────────────────────────────────────────────────────
  const addYi = ()=>{if(!yiF.musteri.trim())return; setYiRows(r=>[...r,{...yiF,id:uid()}]); setYiF({musteri:"",sebep:"",sku:"",adet:"",not:""});};
  const addIh = ()=>{if(!ihF.musteri.trim())return; setIhRows(r=>[...r,{...ihF,id:uid()}]); setIhF({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});};
  const addMk = ()=>{if(!mkF.firma.trim())return;   setMkRows(r=>[...r,{...mkF,id:uid()}]); setMkF({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),cari:"",adet:"",cesit:"",durum:"İŞLEMDE"});};

  // ─── WhatsApp ─────────────────────────────────────────────────────────────
  function shareWA() {
    const d = new Date().toLocaleDateString("tr-TR");
    let msg = `📋 *GÜN SONU RAPORU — ${d}*\n\n`;
    msg += `*🚚 YURTİÇİ*\nSipariş: ${yiSiparis||0} | Faturalanan: ${yiFatura||0} | Kalan: ${yiKalan}\n`;
    if (yiRows.length>0) yiRows.forEach(r=>{
      msg += `• ${r.musteri} — ${r.sebep}`;
      if (r.sku)  msg += ` | ${r.sku} SKU`;
      if (r.adet) msg += ` | ${r.adet} Adet`;
      if (r.not)  msg += ` | ${r.not}`;
      msg += "\n";
    }); else msg += "Tüm siparişler faturalandı ✅\n";
    msg += `\n*✈️ İHRACAT*\n`;
    if (ihRows.length===0) msg+="Kayıt yok\n";
    else ihRows.forEach(r=>{
      const st=calcStatus(r);
      const e=st?.renk==="green"?"🟢":st?.renk==="yellow"?"🟡":"🔴";
      msg+=`${e} ${r.musteri} (${r.ulke||"?"}) — ${st?.durum||r.sebep||"—"} | ${r.sku} SKU | ${r.adet} Adet\n`;
    });
    msg += `\n*📦 MAL KABUL*\n`;
    const tot = mkRows.reduce((s,r)=>s+(parseInt(r.adet)||0),0);
    if (mkRows.length===0) msg+="Kayıt yok\n";
    else {
      msg+=`${mkRows.length} belge — ${tot.toLocaleString("tr-TR")} adet toplam\n`;
      mkRows.forEach(r=>msg+=`• ${r.firma} | ${r.depo} | ${r.adet} Adet | ${r.durum}\n`);
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  }

  const ihSts = ihRows.map(r=>calcStatus(r));
  const mkTot = mkRows.reduce((t,r)=>t+(parseInt(r.adet)||0),0);
  const TABS:[TabKey,string][] = [["yurtici","🚚 Yurtiçi"],["ihracat","✈️ İhracat"],["malkabul","📦 Mal Kabul"]];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-[#1B2A4A] px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div>
          <div className="text-[#C8962E] font-bold text-base tracking-wide">BAŞARI OTOMOTİV</div>
          <div className="text-slate-400 text-xs mt-0.5">
            Gün Sonu İzleme · {new Date().toLocaleDateString("tr-TR",{day:"2-digit",month:"long",year:"numeric"})}
          </div>
        </div>
        <button onClick={shareWA}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors">
          📤 Gönder
        </button>
      </header>

      {/* TABS */}
      <div className="flex bg-white border-b-2 border-[#C8962E] sticky top-14 z-40">
        {TABS.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab===k?"bg-[#C8962E] text-white":"text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="max-w-xl mx-auto p-4 pb-10">

        {/* ── ZEUS UPLOAD ── */}
        <Card>
          <CardTitle c="📊 Zeus'tan Excel Yükleme" />
          <div className="flex gap-3">
            <UploadZone label="İş Talepleri" icon="📋" st={stIt} msg={msgIt} onClick={()=>refIt.current?.click()} />
            <UploadZone label="İrsaliye" icon="📦" st={stIr} msg={msgIr} onClick={()=>refIr.current?.click()} />
          </div>
          <input ref={refIt} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e=>{const f=e.target.files?.[0]; if(f) parseIsTalepleri(f); e.target.value="";}} />
          <input ref={refIr} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e=>{const f=e.target.files?.[0]; if(f) parseIrsaliye(f);   e.target.value="";}} />
          {(stIt==="ok"||stIr==="ok") && (
            <button onClick={()=>{setStIt("idle");setMsgIt("");setStIr("idle");setMsgIr("");
              setYiRows([]);setIhRows([]);setMkRows([]);setYiSiparis("");setYiFatura("");}}
              className="mt-3 text-xs text-slate-400 hover:text-red-400 w-full text-center">
              Temizle ve sıfırla
            </button>
          )}
          {stIt==="idle"&&stIr==="idle" && (
            <p className="text-xs text-slate-400 mt-3 text-center">
              Zeus → Rapor Al → Excel kaydet → Buraya yükle
            </p>
          )}
        </Card>

        {/* ══ YURTİÇİ ══ */}
        {tab==="yurtici" && <>
          <div className="flex gap-3 mb-4">
            {[{l:"Sipariş Sayısı",v:yiSiparis,sv:setYiSiparis},{l:"Faturalanan",v:yiFatura,sv:setYiFatura}].map(f=>(
              <div key={f.l} className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-3">
                <Lbl c={f.l} />
                <input type="number" inputMode="numeric" placeholder="0" value={f.v}
                  onChange={e=>f.sv(e.target.value)}
                  className="text-2xl font-bold text-slate-700 w-full border-none outline-none bg-transparent" />
              </div>
            ))}
            <div className={`flex-1 rounded-xl border-l-4 shadow-sm p-3 ${yiKalan>0?"bg-red-50 border-l-red-500 border border-red-100":"bg-green-50 border-l-green-500 border border-green-100"}`}>
              <Lbl c="Kalan" />
              <div className={`text-2xl font-bold ${yiKalan>0?"text-red-600":"text-green-600"}`}>{yiKalan}</div>
            </div>
          </div>

          <Card>
            <CardTitle c="+ Bekleyen Müşteri Ekle" />
            <div className="space-y-2 mb-3">
              <Inp ph="Müşteri Adı *" val={yiF.musteri} set={v=>setYiF({...yiF,musteri:v})} />
              <Sel val={yiF.sebep} set={v=>setYiF({...yiF,sebep:v})}
                opts={["TIR İLE SEVK EDİLECEK","CUT OF SONRASI DÜŞEN SİPARİŞ","ELLEÇLEME","KULVARDA","DİĞER"]} />
              <div className="grid grid-cols-2 gap-2">
                <Inp ph="SKU" tp="number" val={yiF.sku} set={v=>setYiF({...yiF,sku:v})} />
                <Inp ph="Adet" tp="number" val={yiF.adet} set={v=>setYiF({...yiF,adet:v})} />
              </div>
              <Inp ph="Not (isteğe bağlı)" val={yiF.not} set={v=>setYiF({...yiF,not:v})} />
            </div>
            <AddBtn onClick={addYi} />
          </Card>

          {yiRows.length===0
            ? <Empty t="Bekleyen müşteri yok — tüm siparişler faturalandı ✅" />
            : yiRows.map(r=>(
              <div key={r.id} className="bg-white rounded-xl border border-slate-100 border-l-4 border-l-red-500 shadow-sm p-3 mb-3 flex justify-between items-start">
                <div>
                  <div className="font-semibold text-slate-800 mb-1">{r.musteri}</div>
                  {r.sebep&&<span className={`text-xs rounded-full border px-2 py-0.5 ${SC.red}`}>{r.sebep}</span>}
                  <div className="text-xs text-slate-500 mt-1.5">
                    {r.sku&&`${r.sku} SKU`}{r.sku&&r.adet?" · ":""}{r.adet&&`${parseInt(r.adet).toLocaleString("tr-TR")} Adet`}
                  </div>
                  {r.not&&<div className="text-xs text-slate-400 mt-0.5">{r.not}</div>}
                </div>
                <DelBtn onClick={()=>setYiRows(rs=>rs.filter(x=>x.id!==r.id))} />
              </div>
            ))
          }
        </>}

        {/* ══ İHRACAT ══ */}
        {tab==="ihracat" && <>
          {ihRows.length>0 && (
            <div className="flex gap-3 mb-4">
              <SumCard label="Kritik / Geç"  val={ihSts.filter(s=>s?.renk==="red").length}    color="border-l-red-500" />
              <SumCard label="Süreci Devam"  val={ihSts.filter(s=>s?.renk==="yellow").length} color="border-l-amber-500" />
              <SumCard label="Tamamlandı"    val={ihSts.filter(s=>s?.renk==="green").length}  color="border-l-green-500" />
            </div>
          )}

          {ihRows.length===0 ? <Empty t="İhracat siparişi yok — İş Talepleri yükleyin veya manuel ekleyin" />
            : ihRows.map(r=>{
              const st=calcStatus(r);
              return (
                <div key={r.id} className={`bg-white rounded-xl border border-slate-100 border-l-4 ${st?SB[st.renk]:"border-l-slate-300"} shadow-sm p-3 mb-3 flex justify-between items-start`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800">{r.musteri}</span>
                      {r.ulke&&<span className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{r.ulke}</span>}
                    </div>
                    {st&&<span className={`text-xs rounded-full border px-2 py-0.5 ${SC[st.renk]}`}>{st.durum}</span>}
                    <div className="text-xs text-slate-500 mt-1.5">
                      {r.sku} SKU · {r.adet&&parseInt(r.adet).toLocaleString("tr-TR")+" Adet"}
                      {st&&` · Son: ${st.sonTermin}`}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {fmtDate(r.ilkTarih)}{r.cikisTarih?` → ${fmtDate(r.cikisTarih)}`:""}{r.sebep?` · ${r.sebep}`:""}
                    </div>
                    {/* Hızlı gönderildi işaretleme */}
                    {!r.cikisTarih && (
                      <button onClick={()=>setIhRows(rs=>rs.map(x=>x.id===r.id?{...x,sebep:"GÖNDERİLDİ",cikisTarih:todayStr()}:x))}
                        className="mt-1.5 text-xs text-green-600 hover:text-green-700 font-medium">
                        ✓ Gönderildi olarak işaretle
                      </button>
                    )}
                  </div>
                  <DelBtn onClick={()=>setIhRows(rs=>rs.filter(x=>x.id!==r.id))} />
                </div>
              );
            })
          }

          <Card>
            <CardTitle c="+ Manuel Sipariş Ekle" />
            <div className="space-y-2 mb-3">
              <Inp ph="Müşteri / Alıcı Adı *" val={ihF.musteri} set={v=>setIhF({...ihF,musteri:v})} />
              <Inp ph="Ülke / Şehir" val={ihF.ulke} set={v=>setIhF({...ihF,ulke:v})} />
              <div className="grid grid-cols-2 gap-2">
                <div><Lbl c="İlk Sipariş Tarihi"/><Inp tp="date" val={ihF.ilkTarih} set={v=>setIhF({...ihF,ilkTarih:v})} /></div>
                <div><Lbl c="Çıkış Tarihi"/><Inp tp="date" val={ihF.cikisTarih} set={v=>setIhF({...ihF,cikisTarih:v})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Sel val={ihF.sebep} set={v=>setIhF({...ihF,sebep:v})}
                  opts={["GÖNDERİLDİ","TOPLAMADA","ELLEÇLEME","BEKLEMEDE","DİĞER"]} />
                <Inp ph="SKU (Çeşit)" tp="number" val={ihF.sku} set={v=>setIhF({...ihF,sku:v})} />
              </div>
              <Inp ph="Adet" tp="number" val={ihF.adet} set={v=>setIhF({...ihF,adet:v})} />
              {liveS&&(
                <div className={`rounded-lg border px-3 py-2 text-sm ${SC[liveS.renk]}`}>
                  <div className="font-semibold">⚡ {liveS.durum}</div>
                  <div className="text-xs mt-0.5 opacity-80">Termin: {liveS.terminGun} gün · Son: {liveS.sonTermin}</div>
                </div>
              )}
            </div>
            <AddBtn onClick={addIh} />
          </Card>
        </>}

        {/* ══ MAL KABUL ══ */}
        {tab==="malkabul" && <>
          {mkRows.length>0&&(
            <div className="flex gap-3 mb-4">
              <SumCard label="Başlamadı/İşlemde" val={mkRows.filter(r=>r.durum!=="TAMAMLANDI").length} color="border-l-amber-500" />
              <SumCard label="Tamamlandı"         val={mkRows.filter(r=>r.durum==="TAMAMLANDI").length} color="border-l-green-500" />
              <SumCard label="Toplam Adet"         val={mkTot.toLocaleString("tr-TR")}                  color="border-l-[#C8962E]" />
            </div>
          )}

          {mkRows.length===0 ? <Empty t="Mal kabul kaydı yok — İrsaliye yükleyin" />
            : mkRows.map(r=>{
              const dc=r.durum==="TAMAMLANDI"?"border-l-green-500":r.durum==="İŞLEMDE"?"border-l-amber-500":"border-l-slate-400";
              const pk=r.durum==="TAMAMLANDI"?SC.green:r.durum==="İŞLEMDE"?SC.yellow:SC.red;
              return (
                <div key={r.id} className={`bg-white rounded-xl border border-slate-100 border-l-4 ${dc} shadow-sm p-3 mb-3 flex justify-between items-start`}>
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">{r.firma}</div>
                    <span className={`text-xs rounded-full border px-2 py-0.5 ${pk}`}>{r.durum}</span>
                    <div className="text-xs text-slate-500 mt-1.5">
                      {r.depo}{r.adet?` · ${parseInt(r.adet).toLocaleString("tr-TR")} Adet`:""}
                      {r.cesit?` · ${r.cesit} çeşit`:""}
                      {` · ${fmtDate(r.tarih)}`}
                    </div>
                    {(r.belgeNo||r.belgeNo2)&&(
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        {r.belgeNo}{r.belgeNo2?` / ${r.belgeNo2}`:""}
                      </div>
                    )}
                  </div>
                  <DelBtn onClick={()=>setMkRows(rs=>rs.filter(x=>x.id!==r.id))} />
                </div>
              );
            })
          }

          <Card>
            <CardTitle c="+ Manuel Mal Kabul Ekle" />
            <div className="space-y-2 mb-3">
              <Inp ph="Firma Adı *" val={mkF.firma} set={v=>setMkF({...mkF,firma:v})} />
              <div className="grid grid-cols-2 gap-2">
                <select value={mkF.depo} onChange={e=>setMkF({...mkF,depo:e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30">
                  {["TEM.34","Kartepe","Çatalca","Ankara"].map(o=><option key={o}>{o}</option>)}
                </select>
                <div><Lbl c="Tarih"/><Inp tp="date" val={mkF.tarih} set={v=>setMkF({...mkF,tarih:v})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Inp ph="Belge No" val={mkF.belgeNo} set={v=>setMkF({...mkF,belgeNo:v})} />
                <Inp ph="Belge No 2" val={mkF.belgeNo2} set={v=>setMkF({...mkF,belgeNo2:v})} />
                <Inp ph="Adet" tp="number" val={mkF.adet} set={v=>setMkF({...mkF,adet:v})} />
                <Inp ph="Çeşit (SKU)" tp="number" val={mkF.cesit} set={v=>setMkF({...mkF,cesit:v})} />
              </div>
              <Sel val={mkF.durum} set={v=>setMkF({...mkF,durum:v})}
                opts={["BAŞLAMADI","İŞLEMDE","TAMAMLANDI","ÜRÜN DEPOYA GELMEDİ"]} />
            </div>
            <AddBtn onClick={addMk} />
          </Card>
        </>}

      </div>
    </div>
  );
}
