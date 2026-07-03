"use client";

import { useState, useRef } from "react";
import {
  CalendarDays, Bell, HelpCircle, ChevronDown, Share2,
  Truck, Globe, Package, LayoutDashboard, BarChart3,
  ShoppingCart, FileCheck, Receipt, Users, Archive,
  Settings, CloudUpload, ClipboardList, CheckCircle2,
  FileText, User, Box, Layers, MessageSquare, PlusCircle,
  Info, CloudDownload, Building2
} from "lucide-react";

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
type TabKey = "yurtici"|"ihracat"|"malkabul";

// ─── Yardımcılar ─────────────────────────────────────────────────────────────
function calcTermin(sku:string,sebep=""):number {
  if (sebep.toUpperCase().includes("ELLEÇLEME")) return 7;
  const n=parseInt(sku)||0;
  if(n<=50)return 1; if(n<=100)return 2; if(n<=250)return 4; return 7;
}
function calcStatus(row:Partial<IHRow>):{durum:string;renk:Renk;terminGun:number;sonTermin:string}|null {
  const{ilkTarih,cikisTarih,sebep="",sku}=row;
  if(!ilkTarih||!sku)return null;
  const g=calcTermin(sku,sebep);
  const ilk=new Date(ilkTarih),son=new Date(ilk);
  son.setDate(ilk.getDate()+g);
  const today=new Date(); today.setHours(0,0,0,0);
  const isG=sebep==="GÖNDERİLDİ"||!!cikisTarih;
  const cikis=cikisTarih?new Date(cikisTarih):today;
  const durum=isG?(cikis<=son?"ZAMANINDA ÇIKTI":"GEÇ ÇIKTI"):(today<=son?"TERMİN SÜRESİ İÇİNDE":"TERMİN AŞTI — ACİL");
  const renk:Renk=isG?(cikis<=son?"green":"red"):(today<=son?"yellow":"red");
  return{durum,renk,terminGun:g,sonTermin:son.toLocaleDateString("tr-TR")};
}
const todayStr=()=>new Date().toISOString().split("T")[0];
const uid=()=>Math.random().toString(36).slice(2,10);
const sv=(v:any)=>String(v??"").trim();
const ns=(v:any)=>{const n=parseFloat(sv(v));return isNaN(n)?"":String(Math.round(n));};
const fmtDate=(d:string)=>d?new Date(d).toLocaleDateString("tr-TR"):"—";
const fmtN=(v:string|number)=>{const n=parseInt(String(v));return isNaN(n)?"0":n.toLocaleString("tr-TR");};
function xlDate(val:any):string {
  if(!val&&val!==0)return"";
  const s=Math.floor(typeof val==="number"?val:parseFloat(sv(val)));
  if(isNaN(s)||s<1)return"";
  const d=new Date(Math.round((s-25569)*86400*1000));
  return`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
}
function parseTrDate(val:string):string{
  const m=val?.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return m?`${m[3]}-${m[2]}-${m[1]}`:todayStr();
}

// ─── Renk Haritaları ─────────────────────────────────────────────────────────
const SC:Record<Renk,string>={
  green:"bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow:"bg-amber-50 text-amber-700 border-amber-200",
  red:"bg-red-50 text-red-700 border-red-200",
};
const SB:Record<Renk,string>={
  green:"border-l-emerald-500",yellow:"border-l-amber-500",red:"border-l-red-500",
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const NAV_MAIN = [
  {key:"gunsonu",  label:"Gün Sonu İzleme", icon:LayoutDashboard},
  {key:"yurtici",  label:"Yurtiçi",          icon:Truck},
  {key:"ihracat",  label:"İhracat",           icon:Globe},
  {key:"malkabul", label:"Mal Kabul",         icon:Package},
];
const NAV_EXTRA = [
  {label:"Raporlar",    icon:BarChart3},
  {label:"Siparişler",  icon:ShoppingCart},
  {label:"İrsaliyeler", icon:FileCheck},
  {label:"Faturalar",   icon:Receipt},
  {label:"Müşteriler",  icon:Users},
  {label:"Ürünler",     icon:Archive},
];

function Sidebar({activeTab,setTab}:{activeTab:TabKey;setTab:(t:TabKey)=>void}) {
  const tabToKey:Record<TabKey,string>={yurtici:"yurtici",ihracat:"ihracat",malkabul:"malkabul"};
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col z-20 relative"
      style={{background:"rgba(22,30,50,0.97)"}}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* BO mark */}
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{background:"linear-gradient(135deg,#2563eb,#1d4ed8)"}}>
            <span className="text-white font-black text-sm tracking-tighter">BO</span>
          </div>
          <span className="text-white font-bold text-base tracking-tight">Başarı Otomotiv</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_MAIN.map(item=>{
          const active = item.key==="gunsonu"||tabToKey[activeTab]===item.key;
          const Icon = item.icon;
          return (
            <button key={item.key}
              onClick={()=>{
                if(item.key==="yurtici")  setTab("yurtici");
                if(item.key==="ihracat")  setTab("ihracat");
                if(item.key==="malkabul") setTab("malkabul");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all
                ${item.key==="gunsonu"
                  ? "text-white"
                  : active
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white/80 hover:bg-white/5"}`}
              style={item.key==="gunsonu"?{background:"rgba(200,150,46,0.25)",borderLeft:"3px solid #C8962E"}:{borderLeft:"3px solid transparent"}}>
              <Icon size={18} className={item.key==="gunsonu"?"text-[#C8962E]":active?"text-white/90":"text-white/50"} />
              {item.label}
            </button>
          );
        })}

        <div className="my-3 border-t border-white/10" />

        {NAV_EXTRA.map(item=>{
          const Icon=item.icon;
          return (
            <button key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left
                text-white/50 hover:text-white/70 hover:bg-white/5 transition-all"
              style={{borderLeft:"3px solid transparent"}}>
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-5 py-3.5 text-white/50 hover:text-white/70 transition-colors text-sm">
          <Settings size={17} />
          Ayarlar
        </button>
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white/80 text-xs font-bold truncate">BAŞARI OTOMOTİV</div>
            <div className="text-white/40 text-[10px] truncate">Lojistik Yönetim Sistemi</div>
          </div>
          <ChevronDown size={14} className="text-white/40 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function TopBar() {
  const d = new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <CalendarDays size={18} className="text-slate-400" />
        <span className="text-slate-800 font-semibold text-sm">Gün Sonu İzleme</span>
        <span className="text-slate-300">·</span>
        <span className="font-semibold text-sm" style={{color:"#C8962E"}}>{d}</span>
      </div>
      <div className="flex items-center gap-1">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">1</span>
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
          <HelpCircle size={18} className="text-slate-500" />
        </button>
        <button className="flex items-center gap-1.5 ml-1 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{background:"#1B2A4A"}}>BO</div>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────
function TabBar({tab,setTab,onShare}:{tab:TabKey;setTab:(t:TabKey)=>void;onShare:()=>void}) {
  const tabs:[TabKey,typeof Truck,string][] = [
    ["yurtici",  Truck,   "Yurtiçi"],
    ["ihracat",  Globe,   "İhracat"],
    ["malkabul", Package, "Mal Kabul"],
  ];
  return (
    <div className="flex items-stretch bg-white border-b border-slate-200 flex-shrink-0 z-10">
      {tabs.map(([key,Icon,label])=>(
        <button key={key} onClick={()=>setTab(key)}
          className={`flex items-center gap-2.5 px-10 py-4 font-semibold text-sm transition-all border-b-2 relative
            ${tab===key
              ? "border-b-0 text-white"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
          style={tab===key ? {background:"#C8962E"} : {}}>
          <Icon size={17} />
          {label}
          {tab===key && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-3 h-3 rotate-45"
            style={{background:"#C8962E",zIndex:1}} />}
        </button>
      ))}
      <div className="flex-1" />
      <div className="flex items-center pr-4">
        <button onClick={onShare}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-lg shadow-sm transition-all hover:opacity-90 active:scale-95"
          style={{background:"#22c55e"}}>
          <Share2 size={16} />
          Gönder
        </button>
      </div>
    </div>
  );
}

// ─── İkonlu Input ─────────────────────────────────────────────────────────────
function IconInput({icon:Icon,label,placeholder,value,onChange,type="text",iconColor="text-slate-400"}:{
  icon:any;label?:string;placeholder:string;value:string;
  onChange:(v:string)=>void;type?:string;iconColor?:string;
}) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>}
      <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-[#1B2A4A]/20 focus-within:border-[#1B2A4A] transition-all">
        <Icon size={16} className={`flex-shrink-0 ${iconColor}`} />
        <input type={type} inputMode={type==="number"?"numeric":undefined} placeholder={placeholder} value={value}
          onChange={e=>onChange(e.target.value)}
          className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent" />
      </div>
    </div>
  );
}

// ─── İkonlu Select ───────────────────────────────────────────────────────────
function IconSelect({icon:Icon,placeholder,value,onChange,opts,iconColor="text-slate-400"}:{
  icon:any;placeholder:string;value:string;onChange:(v:string)=>void;opts:string[];iconColor?:string;
}) {
  return (
    <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-[#1B2A4A]/20 focus-within:border-[#1B2A4A] transition-all">
      <Icon size={16} className={`flex-shrink-0 ${iconColor}`} />
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="flex-1 text-sm text-slate-700 outline-none bg-transparent appearance-none">
        <option value="">{placeholder}</option>
        {opts.map(o=><option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
    </div>
  );
}

// ─── Kart Sarmalayıcı ─────────────────────────────────────────────────────────
function DCard({children,cls=""}:{children:React.ReactNode;cls?:string}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${cls}`}>{children}</div>
  );
}

// ─── ANA SAYFA ────────────────────────────────────────────────────────────────
export default function GunSonuPage() {
  const [tab, setTab] = useState<TabKey>("yurtici");

  const [yiSiparis, setYiSiparis] = useState("");
  const [yiFatura,  setYiFatura]  = useState("");
  const [yiRows,    setYiRows]    = useState<YIRow[]>([]);
  const [yiF, setYiF] = useState<Omit<YIRow,"id">>({musteri:"",sebep:"",sku:"",adet:"",not:""});

  const [ihRows, setIhRows] = useState<IHRow[]>([]);
  const [ihF, setIhF] = useState<Omit<IHRow,"id">>({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});

  const [mkRows, setMkRows] = useState<MKRow[]>([]);
  const [mkF, setMkF] = useState<Omit<MKRow,"id">>({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),cari:"",adet:"",cesit:"",durum:"BAŞLAMADI"});

  type UpSt="idle"|"loading"|"ok"|"err";
  const [stIt, setStIt] = useState<UpSt>("idle"); const [msgIt, setMsgIt] = useState("");
  const [stIr, setStIr] = useState<UpSt>("idle"); const [msgIr, setMsgIr] = useState("");
  const refIt = useRef<HTMLInputElement>(null);
  const refIr = useRef<HTMLInputElement>(null);

  const yiKalan=(parseInt(yiSiparis)||0)-(parseInt(yiFatura)||0);
  const liveS=ihF.sku?calcStatus(ihF):null;
  const ihSts=ihRows.map(r=>calcStatus(r));
  const mkTot=mkRows.reduce((t,r)=>t+(parseInt(r.adet)||0),0);

  // Parse İş Talepleri
  async function parseIt(file:File){
    setStIt("loading");
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer());
      const ws=wb.Sheets["data"]??wb.Sheets[wb.SheetNames[0]];
      const data:any[][]=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi=data.findIndex(r=>r.some((c:any)=>sv(c)==="Müşteri"));
      const hRow=hi>=0?data[hi]:data[0];
      const iMus=hRow.findIndex((c:any)=>sv(c)==="Müşteri");
      const iIl=hRow.findIndex((c:any)=>sv(c)==="İl");
      const iTar=hRow.findIndex((c:any)=>sv(c).includes("Tarih"));
      const iAdt=hRow.findIndex((c:any)=>sv(c)==="Adet");
      const iCes=hRow.findIndex((c:any)=>sv(c)==="Çeşit");
      let fatCount=0; const ihNew:IHRow[]=[];
      for(let i=(hi>=0?hi+1:1);i<data.length;i++){
        const r=data[i];
        const mus=sv(iMus>=0?r[iMus]:r[3]); if(!mus)continue;
        const il=sv(iIl>=0?r[iIl]:r[4]).toUpperCase();
        const tar=parseTrDate(sv(iTar>=0?r[iTar]:r[2]));
        const adt=ns(iAdt>=0?r[iAdt]:r[6]);
        const ces=ns(iCes>=0?r[iCes]:r[7]);
        if(TR_ILLER.has(il)){fatCount++;}
        else if(il){ihNew.push({id:uid(),musteri:mus,ulke:il,ilkTarih:tar,cikisTarih:"",sebep:"",sku:ces,adet:adt});}
      }
      setYiFatura(String(fatCount));
      setIhRows(r=>[...r,...ihNew]);
      setMsgIt(`${fatCount} Yurtiçi · ${ihNew.length} İhracat`);
      setStIt("ok"); setTab("yurtici");
    }catch(e){setMsgIt("Dosya okunamadı"); setStIt("err");}
  }

  // Parse İrsaliye
  async function parseIr(file:File){
    setStIr("loading");
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer());
      const ws=wb.Sheets["data"]??wb.Sheets[wb.SheetNames[0]];
      const data:any[][]=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi=data.findIndex(r=>r.some((c:any)=>sv(c)==="Firma"||sv(c)==="FİRMA"));
      const hRow=hi>=0?data[hi]:data[0];
      const iDep=hRow.findIndex((c:any)=>sv(c)==="Depo");
      const iBno=hRow.findIndex((c:any)=>sv(c)==="BelgeNo");
      const iBn2=hRow.findIndex((c:any)=>sv(c)==="BelgeNo2");
      const iTar=hRow.findIndex((c:any)=>sv(c)==="Tarih");
      const iCar=hRow.findIndex((c:any)=>sv(c)==="Cari"&&!sv(c).includes("İsmi"));
      const iCnm=hRow.findIndex((c:any)=>sv(c).includes("Cari İsmi"));
      const iAdt=hRow.findIndex((c:any)=>sv(c)==="Adet");
      const iCes=hRow.findIndex((c:any)=>sv(c)==="Çeşit");
      const iDur=hRow.findIndex((c:any)=>sv(c)==="Durum");
      const rows:MKRow[]=[];
      for(let i=(hi>=0?hi+1:1);i<data.length;i++){
        const r=data[i];
        const fir=sv(iCnm>=0?r[iCnm]:r[6]); if(!fir)continue;
        const raw=sv(iDur>=0?r[iDur]:r[9]);
        const dur=raw==="Başlamadı"?"BAŞLAMADI":raw==="İşlemde"?"İŞLEMDE":raw==="Tamamlandı"?"TAMAMLANDI":raw||"BAŞLAMADI";
        rows.push({id:uid(),firma:fir,
          depo:sv(iDep>=0?r[iDep]:r[1])||"TEM.34",
          belgeNo:sv(iBno>=0?r[iBno]:r[2]),
          belgeNo2:sv(iBn2>=0?r[iBn2]:r[3]),
          tarih:xlDate(iTar>=0?r[iTar]:r[4])||todayStr(),
          cari:sv(iCar>=0?r[iCar]:r[5]),
          adet:ns(iAdt>=0?r[iAdt]:r[7]),
          cesit:ns(iCes>=0?r[iCes]:r[8]),
          durum:dur,
        });
      }
      setMkRows(rows);
      const tot=rows.reduce((s,r)=>s+(parseInt(r.adet)||0),0);
      setMsgIr(`${rows.length} belge · ${tot.toLocaleString("tr-TR")} adet`);
      setStIr("ok"); setTab("malkabul");
    }catch(e){setMsgIr("Dosya okunamadı"); setStIr("err");}
  }

  const addYi=()=>{if(!yiF.musteri.trim())return; setYiRows(r=>[...r,{...yiF,id:uid()}]); setYiF({musteri:"",sebep:"",sku:"",adet:"",not:""});};
  const addIh=()=>{if(!ihF.musteri.trim())return; setIhRows(r=>[...r,{...ihF,id:uid()}]); setIhF({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});};
  const addMk=()=>{if(!mkF.firma.trim())return;   setMkRows(r=>[...r,{...mkF,id:uid()}]); setMkF({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),cari:"",adet:"",cesit:"",durum:"BAŞLAMADI"});};

  function shareWA(){
    const d=new Date().toLocaleDateString("tr-TR");
    let msg=`📋 *GÜN SONU RAPORU — ${d}*\n\n`;
    msg+=`*🚚 YURTİÇİ*\nSipariş: ${yiSiparis||0} | Faturalanan: ${yiFatura||0} | Kalan: ${yiKalan}\n`;
    if(yiRows.length>0) yiRows.forEach(r=>{
      msg+=`• ${r.musteri} — ${r.sebep}`;
      if(r.sku)msg+=` | ${r.sku} SKU`;
      if(r.adet)msg+=` | ${r.adet} Adet`;
      if(r.not)msg+=` | ${r.not}`;
      msg+="\n";
    }); else msg+="Tüm siparişler faturalandı ✅\n";
    msg+=`\n*✈️ İHRACAT*\n`;
    if(!ihRows.length)msg+="Kayıt yok\n";
    else ihRows.forEach(r=>{
      const s=calcStatus(r);
      const e=s?.renk==="green"?"🟢":s?.renk==="yellow"?"🟡":"🔴";
      msg+=`${e} ${r.musteri} (${r.ulke||"?"}) — ${s?.durum||r.sebep||"—"} | ${r.sku} SKU | ${r.adet} Adet\n`;
    });
    msg+=`\n*📦 MAL KABUL*\n`;
    if(!mkRows.length)msg+="Kayıt yok\n";
    else{
      msg+=`${mkRows.length} belge — ${mkTot.toLocaleString("tr-TR")} adet\n`;
      mkRows.forEach(r=>msg+=`• ${r.firma} | ${r.depo} | ${r.adet} Adet | ${r.durum}\n`);
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  }

  const resetAll=()=>{
    setStIt("idle");setMsgIt("");setStIr("idle");setMsgIr("");
    setYiRows([]);setIhRows([]);setMkRows([]);
    setYiSiparis("");setYiFatura("");
  };

  // ── Upload Zonu ─────────────────────────────────────────────────────────────
  type UpSt2="idle"|"loading"|"ok"|"err";
  function UpZone({label,icon:Icon,st,msg,onClick}:{label:string;icon:any;st:UpSt2;msg:string;onClick:()=>void}) {
    const isOk=st==="ok", isErr=st==="err", isLoading=st==="loading";
    return (
      <button onClick={onClick} disabled={isLoading}
        className={`flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 text-center transition-all
          ${isOk?"border-emerald-300 bg-emerald-50/50"
          :isErr?"border-red-300 bg-red-50/50"
          :isLoading?"border-slate-200 bg-slate-50 cursor-wait"
          :"border-slate-200 bg-white hover:border-[#C8962E]/50 hover:bg-amber-50/30"}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center
          ${isOk?"bg-emerald-100":isErr?"bg-red-100":isLoading?"bg-slate-100":"bg-amber-50"}`}>
          {isOk
            ? <CheckCircle2 size={24} className="text-emerald-600" />
            : isErr
            ? <Info size={24} className="text-red-500" />
            : isLoading
            ? <CloudDownload size={24} className="text-slate-400 animate-pulse" />
            : <Icon size={24} className="text-[#C8962E]" />}
        </div>
        <div>
          <div className={`font-semibold text-sm ${isOk?"text-emerald-700":isErr?"text-red-600":"text-slate-700"}`}>
            {isOk||isErr ? msg : label}
          </div>
          {!isOk && !isErr && <div className="text-xs text-slate-400 mt-0.5">.xlsx / .xls</div>}
        </div>
        {!isOk && !isErr && !isLoading && (
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50">
            <CloudUpload size={13} /> Dosya Seç
          </div>
        )}
      </button>
    );
  }

  // ── İçerik bölümü ─────────────────────────────────────────────────────────
  function Content() {
    if (tab==="yurtici") return (
      <div className="space-y-4">
        {/* Upload */}
        <DCard cls="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CloudUpload size={18} className="text-[#C8962E]" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Zeus&apos;tan Excel Yükleme</span>
          </div>
          <div className="flex gap-4">
            <UpZone label="İş Talepleri" icon={ClipboardList} st={stIt} msg={msgIt} onClick={()=>refIt.current?.click()} />
            <UpZone label="İrsaliye"    icon={Package}       st={stIr} msg={msgIr} onClick={()=>refIr.current?.click()} />
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-400">
            <Info size={12} />
            Zeus → Rapor Al → Excel kaydet → Buraya yükle
          </div>
          {(stIt==="ok"||stIr==="ok") && (
            <button onClick={resetAll} className="mt-2 text-xs text-slate-400 hover:text-red-400 transition-colors">↺ Sıfırla</button>
          )}
        </DCard>

        {/* Stats */}
        <div className="flex gap-4">
          {/* Sipariş Sayısı */}
          <DCard cls="flex-1 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-500 mb-0.5">Sipariş Sayısı</div>
              <input type="number" inputMode="numeric" placeholder="0" value={yiSiparis}
                onChange={e=>setYiSiparis(e.target.value)}
                className="text-2xl font-black text-slate-800 w-full outline-none bg-transparent tabular-nums" />
            </div>
          </DCard>
          {/* Faturalanan */}
          <DCard cls="flex-1 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Receipt size={20} className="text-violet-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-500 mb-0.5">Faturalanan</div>
              <input type="number" inputMode="numeric" placeholder="0" value={yiFatura}
                onChange={e=>setYiFatura(e.target.value)}
                className="text-2xl font-black text-slate-800 w-full outline-none bg-transparent tabular-nums" />
            </div>
          </DCard>
          {/* Kalan */}
          <div className={`flex-1 rounded-2xl border shadow-sm p-4 flex items-center gap-3
            ${yiKalan>0?"bg-white border-emerald-200 border-l-4 border-l-emerald-500":"bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-500"}`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} className={yiKalan>0?"text-red-500":"text-emerald-600"} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-0.5">Kalan</div>
              <div className={`text-2xl font-black tabular-nums ${yiKalan>0?"text-red-600":"text-emerald-700"}`}>{yiKalan}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <DCard cls="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#C8962E] font-bold">+</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Bekleyen Müşteri Ekle</span>
          </div>
          <div className="space-y-3 mb-4">
            <IconInput icon={User} placeholder="Müşteri adını giriniz" value={yiF.musteri}
              onChange={v=>setYiF({...yiF,musteri:v})} label="Müşteri Adı *" />
            <IconSelect icon={Settings} placeholder="— Seçin —" value={yiF.sebep}
              onChange={v=>setYiF({...yiF,sebep:v})}
              opts={["TIR İLE SEVK EDİLECEK","CUT OF SONRASI DÜŞEN SİPARİŞ","ELLEÇLEME","KULVARDA","DİĞER"]} />
            <div className="grid grid-cols-2 gap-3">
              <IconInput icon={Box} placeholder="SKU" value={yiF.sku}
                onChange={v=>setYiF({...yiF,sku:v})} type="number" label="SKU" />
              <IconInput icon={Layers} placeholder="Adet" value={yiF.adet}
                onChange={v=>setYiF({...yiF,adet:v})} type="number" label="Adet" />
            </div>
            <IconInput icon={MessageSquare} placeholder="Not giriniz (isteğe bağlı)" value={yiF.not}
              onChange={v=>setYiF({...yiF,not:v})} label="Not (isteğe bağlı)" />
          </div>
          <button onClick={addYi}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{background:"#1B2A4A"}}>
            <PlusCircle size={16} /> Ekle
          </button>
        </DCard>

        {/* Liste */}
        {yiRows.length===0 ? (
          <DCard cls="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <span className="text-sm text-slate-600 font-medium">Bekleyen müşteri yok — tüm siparişler faturalandı</span>
          </DCard>
        ) : yiRows.map(r=>(
          <DCard key={r.id} cls={`p-4 border-l-4 border-l-red-400 flex items-start justify-between gap-3`}>
            <div className="flex-1">
              <div className="font-semibold text-slate-800 mb-1.5">{r.musteri}</div>
              {r.sebep && <span className="text-xs font-semibold rounded-full border px-2.5 py-0.5 bg-red-50 text-red-700 border-red-200">{r.sebep}</span>}
              <div className="flex gap-2 mt-2">
                {r.sku && <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{r.sku} SKU</span>}
                {r.adet && <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{fmtN(r.adet)} Adet</span>}
              </div>
              {r.not && <div className="text-xs text-slate-400 mt-1 italic">{r.not}</div>}
            </div>
            <button onClick={()=>setYiRows(rs=>rs.filter(x=>x.id!==r.id))}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center text-base transition-colors">×</button>
          </DCard>
        ))}
      </div>
    );

    if (tab==="ihracat") return (
      <div className="space-y-4">
        {ihSts.length>0 && (
          <div className="flex gap-4">
            {[
              {l:"Kritik/Geç",   v:ihSts.filter(s=>s?.renk==="red").length,    cls:"bg-red-50 border-red-200 text-red-700",   icls:"bg-red-100",ic:"text-red-500"},
              {l:"Devam Ediyor", v:ihSts.filter(s=>s?.renk==="yellow").length,  cls:"bg-amber-50 border-amber-200 text-amber-700", icls:"bg-amber-100",ic:"text-amber-500"},
              {l:"Tamamlandı",   v:ihSts.filter(s=>s?.renk==="green").length,   cls:"bg-emerald-50 border-emerald-200 text-emerald-700",icls:"bg-emerald-100",ic:"text-emerald-500"},
            ].map(s=>(
              <div key={s.l} className={`flex-1 rounded-2xl border p-4 flex items-center gap-3 shadow-sm ${s.cls}`}>
                <div className={`w-10 h-10 rounded-xl ${s.icls} flex items-center justify-center`}>
                  <CheckCircle2 size={20} className={s.ic} />
                </div>
                <div>
                  <div className="text-2xl font-black">{s.v}</div>
                  <div className="text-xs font-semibold opacity-70">{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {ihRows.length===0
          ? <DCard cls="p-12 text-center"><div className="text-3xl mb-2">✈️</div><div className="text-sm text-slate-500 font-medium">İhracat siparişi yok — İş Talepleri yükleyin veya manuel ekleyin</div></DCard>
          : ihRows.map(r=>{
            const s=calcStatus(r);
            return (
              <DCard key={r.id} cls={`p-4 border-l-4 ${s?SB[s.renk]:"border-l-slate-300"} flex items-start justify-between gap-3`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-semibold text-slate-800">{r.musteri}</span>
                    {r.ulke && <span className="text-xs bg-slate-100 text-slate-500 font-bold rounded px-1.5 py-0.5">{r.ulke}</span>}
                  </div>
                  {s && <span className={`text-xs font-semibold rounded-full border px-2.5 py-0.5 ${SC[s.renk]}`}>{s.durum}</span>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {r.sku && <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{r.sku} SKU</span>}
                    {r.adet && <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{fmtN(r.adet)} Adet</span>}
                    {s && <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">Son: {s.sonTermin}</span>}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {fmtDate(r.ilkTarih)}{r.cikisTarih?` → ${fmtDate(r.cikisTarih)}`:""}{r.sebep?` · ${r.sebep}`:""}
                  </div>
                  {!r.cikisTarih && (
                    <button onClick={()=>setIhRows(rs=>rs.map(x=>x.id===r.id?{...x,sebep:"GÖNDERİLDİ",cikisTarih:todayStr()}:x))}
                      className="mt-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">✓ Gönderildi olarak işaretle</button>
                  )}
                </div>
                <button onClick={()=>setIhRows(rs=>rs.filter(x=>x.id!==r.id))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center text-base transition-colors">×</button>
              </DCard>
            );
          })
        }

        <DCard cls="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#C8962E] font-bold">+</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Manuel Sipariş Ekle</span>
          </div>
          <div className="space-y-3 mb-4">
            <IconInput icon={User} placeholder="Müşteri / alıcı adı" value={ihF.musteri} onChange={v=>setIhF({...ihF,musteri:v})} label="Müşteri *" />
            <IconInput icon={Globe} placeholder="Ülke veya şehir" value={ihF.ulke} onChange={v=>setIhF({...ihF,ulke:v})} label="Ülke / Şehir" />
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">İlk Sipariş Tarihi</label>
                <div className="border border-slate-200 rounded-xl px-4 py-3 bg-white"><input type="date" value={ihF.ilkTarih} onChange={e=>setIhF({...ihF,ilkTarih:e.target.value})} className="text-sm text-slate-700 outline-none bg-transparent w-full" /></div></div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Çıkış Tarihi</label>
                <div className="border border-slate-200 rounded-xl px-4 py-3 bg-white"><input type="date" value={ihF.cikisTarih} onChange={e=>setIhF({...ihF,cikisTarih:e.target.value})} className="text-sm text-slate-700 outline-none bg-transparent w-full" /></div></div>
            </div>
            <IconSelect icon={Settings} placeholder="— Durum —" value={ihF.sebep} onChange={v=>setIhF({...ihF,sebep:v})}
              opts={["GÖNDERİLDİ","TOPLAMADA","ELLEÇLEME","BEKLEMEDE","DİĞER"]} />
            <div className="grid grid-cols-2 gap-3">
              <IconInput icon={Box} placeholder="SKU sayısı" value={ihF.sku} onChange={v=>setIhF({...ihF,sku:v})} type="number" label="SKU (Çeşit)" />
              <IconInput icon={Layers} placeholder="Adet" value={ihF.adet} onChange={v=>setIhF({...ihF,adet:v})} type="number" label="Adet" />
            </div>
            {liveS && (
              <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${SC[liveS.renk]}`}>
                ⚡ {liveS.durum} · Termin: {liveS.terminGun} gün · Son: {liveS.sonTermin}
              </div>
            )}
          </div>
          <button onClick={addIh} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold hover:opacity-90 active:scale-[0.98]" style={{background:"#1B2A4A"}}>
            <PlusCircle size={16}/> Ekle
          </button>
        </DCard>
      </div>
    );

    // MAL KABUL
    return (
      <div className="space-y-4">
        {mkRows.length>0 && (
          <div className="flex gap-4">
            {[
              {l:"Bekliyor",    v:mkRows.filter(r=>r.durum!=="TAMAMLANDI").length, cls:"bg-amber-50 border-amber-200 text-amber-700",   icls:"bg-amber-100",  ic:"text-amber-500"},
              {l:"Tamamlandı", v:mkRows.filter(r=>r.durum==="TAMAMLANDI").length,  cls:"bg-emerald-50 border-emerald-200 text-emerald-700",icls:"bg-emerald-100",ic:"text-emerald-500"},
              {l:"Toplam Adet",v:fmtN(mkTot),                                      cls:"bg-sky-50 border-sky-200 text-sky-700",          icls:"bg-sky-100",    ic:"text-sky-500"},
            ].map(s=>(
              <div key={s.l} className={`flex-1 rounded-2xl border p-4 flex items-center gap-3 shadow-sm ${s.cls}`}>
                <div className={`w-10 h-10 rounded-xl ${s.icls} flex items-center justify-center`}>
                  <Package size={20} className={s.ic} />
                </div>
                <div><div className="text-2xl font-black">{s.v}</div><div className="text-xs font-semibold opacity-70">{s.l}</div></div>
              </div>
            ))}
          </div>
        )}

        {mkRows.length===0
          ? <DCard cls="p-12 text-center"><div className="text-3xl mb-2">📦</div><div className="text-sm text-slate-500 font-medium">Mal kabul kaydı yok — İrsaliye yükleyin</div></DCard>
          : mkRows.map(r=>{
            const dc=r.durum==="TAMAMLANDI"?"border-l-emerald-500":r.durum==="İŞLEMDE"?"border-l-amber-500":"border-l-slate-400";
            const pk=r.durum==="TAMAMLANDI"?SC.green:r.durum==="İŞLEMDE"?SC.yellow:SC.red;
            return (
              <DCard key={r.id} cls={`p-4 border-l-4 ${dc} flex items-start justify-between gap-3`}>
                <div>
                  <div className="font-semibold text-slate-800 mb-1.5">{r.firma}</div>
                  <span className={`text-xs font-semibold rounded-full border px-2.5 py-0.5 ${pk}`}>{r.durum}</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{r.depo}</span>
                    {r.adet && <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{fmtN(r.adet)} Adet</span>}
                    {r.cesit && <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{r.cesit} Çeşit</span>}
                    <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{fmtDate(r.tarih)}</span>
                  </div>
                  {(r.belgeNo||r.belgeNo2) && <div className="text-xs text-slate-400 mt-1 font-mono">{r.belgeNo}{r.belgeNo2?" / "+r.belgeNo2:""}</div>}
                </div>
                <button onClick={()=>setMkRows(rs=>rs.filter(x=>x.id!==r.id))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center text-base transition-colors">×</button>
              </DCard>
            );
          })
        }

        <DCard cls="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#C8962E] font-bold">+</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Manuel Mal Kabul Ekle</span>
          </div>
          <div className="space-y-3 mb-4">
            <IconInput icon={Building2} placeholder="Firma adı" value={mkF.firma} onChange={v=>setMkF({...mkF,firma:v})} label="Firma *" />
            <div className="grid grid-cols-2 gap-3">
              <IconSelect icon={Package} placeholder="Depo seçin" value={mkF.depo} onChange={v=>setMkF({...mkF,depo:v})}
                opts={["TEM.34","Kartepe","Çatalca","Ankara"]} />
              <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Tarih</label>
                <div className="border border-slate-200 rounded-xl px-4 py-3 bg-white"><input type="date" value={mkF.tarih} onChange={e=>setMkF({...mkF,tarih:e.target.value})} className="text-sm text-slate-700 outline-none bg-transparent w-full" /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <IconInput icon={FileText} placeholder="Belge No" value={mkF.belgeNo} onChange={v=>setMkF({...mkF,belgeNo:v})} label="Belge No" />
              <IconInput icon={FileText} placeholder="Belge No 2" value={mkF.belgeNo2} onChange={v=>setMkF({...mkF,belgeNo2:v})} label="Belge No 2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <IconInput icon={Layers} placeholder="Adet" type="number" value={mkF.adet} onChange={v=>setMkF({...mkF,adet:v})} label="Adet" />
              <IconInput icon={Box} placeholder="SKU" type="number" value={mkF.cesit} onChange={v=>setMkF({...mkF,cesit:v})} label="Çeşit (SKU)" />
            </div>
            <IconSelect icon={Settings} placeholder="— Durum seçin —" value={mkF.durum} onChange={v=>setMkF({...mkF,durum:v})}
              opts={["BAŞLAMADI","İŞLEMDE","TAMAMLANDI","ÜRÜN DEPOYA GELMEDİ"]} />
          </div>
          <button onClick={addMk} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold hover:opacity-90 active:scale-[0.98]" style={{background:"#1B2A4A"}}>
            <PlusCircle size={16}/> Ekle
          </button>
        </DCard>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Arka plan */}
      <div className="fixed inset-0 bg-cover bg-center" style={{backgroundImage:"url('/hero-bg.jpg')",opacity:0.12}} />

      {/* Sidebar */}
      <Sidebar activeTab={tab} setTab={setTab} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <TabBar tab={tab} setTab={setTab} onShare={shareWA} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{background:"rgba(248,250,252,0.94)"}}>
          <div className="max-w-3xl mx-auto p-6">
            <Content />
          </div>
        </main>
      </div>

      {/* Hidden file inputs */}
      <input ref={refIt} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e=>{const f=e.target.files?.[0]; if(f)parseIt(f); e.target.value="";}} />
      <input ref={refIr} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e=>{const f=e.target.files?.[0]; if(f)parseIr(f); e.target.value="";}} />
    </div>
  );
}
