"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  CalendarDays, Bell, HelpCircle, ChevronDown, Share2,
  Truck, Globe, Package, CloudUpload, ClipboardList,
  CheckCircle2, FileText, User, Box, Layers,
  MessageSquare, PlusCircle, Info, Settings, Receipt
} from "lucide-react";

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

interface YIRow { id:string; musteri:string; sebep:string; sku:string; adet:string; not:string; }
interface IHRow { id:string; musteri:string; ulke:string; ilkTarih:string; cikisTarih:string; sebep:string; sku:string; adet:string; }
interface MKRow { id:string; firma:string; depo:string; belgeNo:string; belgeNo2:string; tarih:string; cari:string; adet:string; cesit:string; durum:string; }
type Renk = "green"|"yellow"|"red";
type TabKey = "yurtici"|"ihracat"|"malkabul";

function calcTermin(sku:string,sebep=""):number {
  if(sebep.toUpperCase().includes("ELLEÇLEME"))return 7;
  const n=parseInt(sku)||0;
  if(n<=50)return 1; if(n<=100)return 2; if(n<=250)return 4; return 7;
}
function calcStatus(row:Partial<IHRow>):{durum:string;renk:Renk;terminGun:number;sonTermin:string}|null {
  const{ilkTarih,cikisTarih,sebep="",sku}=row;
  if(!ilkTarih||!sku)return null;
  const g=calcTermin(sku,sebep);
  const ilk=new Date(ilkTarih),son=new Date(ilk); son.setDate(ilk.getDate()+g);
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

const SC:Record<Renk,string>={
  green:"bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow:"bg-amber-50 text-amber-700 border-amber-200",
  red:"bg-red-50 text-red-700 border-red-200",
};
const SB:Record<Renk,string>={
  green:"border-l-emerald-500",yellow:"border-l-amber-500",red:"border-l-red-500",
};

// ─── İkonlu Input ─────────────────────────────────────────────────────────────
function IconInput({icon:Icon,label,placeholder,value,onChange,type="text",color="text-blue-400",bg="bg-blue-50"}:{
  icon:any;label:string;placeholder:string;value:string;onChange:(v:string)=>void;type?:string;color?:string;bg?:string;
}) {
  return (
    <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-3 bg-white focus-within:ring-2 focus-within:ring-[#1B2A4A]/20 focus-within:border-[#1B2A4A] transition-all">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-600 leading-tight">{label}</div>
        <input type={type} inputMode={type==="number"?"numeric":undefined}
          placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent mt-0.5" />
      </div>
    </div>
  );
}

function IconSelect({icon:Icon,label,value,onChange,opts,color="text-blue-400",bg="bg-blue-50"}:{
  icon:any;label:string;value:string;onChange:(v:string)=>void;opts:string[];color?:string;bg?:string;
}) {
  return (
    <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3.5 py-3 bg-white focus-within:ring-2 focus-within:ring-[#1B2A4A]/20 focus-within:border-[#1B2A4A] transition-all">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-600 leading-tight">{label}</div>
        <select value={value} onChange={e=>onChange(e.target.value)}
          className="w-full text-sm text-slate-800 outline-none bg-transparent mt-0.5 appearance-none">
          <option value="">— Seçin —</option>
          {opts.map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <ChevronDown size={15} className="text-slate-400 flex-shrink-0" />
    </div>
  );
}

export default function GunSonuPage() {
  const [tab,setTab]=useState<TabKey>("yurtici");
  const [yiSiparis,setYiSiparis]=useState("");
  const [yiFatura,setYiFatura]=useState("");
  const [yiRows,setYiRows]=useState<YIRow[]>([]);
  const [yiF,setYiF]=useState<Omit<YIRow,"id">>({musteri:"",sebep:"",sku:"",adet:"",not:""});
  const [ihRows,setIhRows]=useState<IHRow[]>([]);
  const [ihF,setIhF]=useState<Omit<IHRow,"id">>({musteri:"",ulke:"",ilkTarih:todayStr(),cikisTarih:"",sebep:"",sku:"",adet:""});
  const [mkRows,setMkRows]=useState<MKRow[]>([]);
  const [mkF,setMkF]=useState<Omit<MKRow,"id">>({firma:"",depo:"TEM.34",belgeNo:"",belgeNo2:"",tarih:todayStr(),cari:"",adet:"",cesit:"",durum:"BAŞLAMADI"});

  type UpSt="idle"|"loading"|"ok"|"err";
  const [stYi,setStYi]=useState<UpSt>("idle"); const [msgYi,setMsgYi]=useState("");
  const [stIh,setStIh]=useState<UpSt>("idle"); const [msgIh,setMsgIh]=useState("");
  const [stIr,setStIr]=useState<UpSt>("idle"); const [msgIr,setMsgIr]=useState("");
  const refYi=useRef<HTMLInputElement>(null);
  const refIh=useRef<HTMLInputElement>(null);
  const refIr=useRef<HTMLInputElement>(null);

  const yiKalan=(parseInt(yiSiparis)||0)-(parseInt(yiFatura)||0);
  const liveS=ihF.sku?calcStatus(ihF):null;
  const ihSts=ihRows.map(r=>calcStatus(r));
  const mkTot=mkRows.reduce((t,r)=>t+(parseInt(r.adet)||0),0);

  async function parseYi(file:File){
    setStYi("loading");
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer());
      const ws=wb.Sheets["data"]??wb.Sheets[wb.SheetNames[0]];
      const data:any[][]=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi=data.findIndex(r=>r.some((c:any)=>sv(c)==="Müşteri"||sv(c)==="SİPARİŞ SAYISI"));
      const hRow=hi>=0?data[hi]:data[0];
      const iMus=hRow.findIndex((c:any)=>sv(c)==="Müşteri"||sv(c).includes("MÜŞTERİ AÇIKLAMA"));
      const iAdt=hRow.findIndex((c:any)=>sv(c)==="Adet"||sv(c)==="ADET");
      const iCes=hRow.findIndex((c:any)=>sv(c)==="Çeşit"||sv(c)==="SKU");
      const iSip=hRow.findIndex((c:any)=>sv(c).includes("SİPARİŞ SAYISI"));
      const iFat=hRow.findIndex((c:any)=>sv(c).includes("FATURA EDİLEN"));
      let fatCount=0, sipCount=0;
      for(let i=(hi>=0?hi+1:1);i<data.length;i++){
        const r=data[i];
        const mus=sv(iMus>=0?r[iMus]:r[3]); if(!mus)continue;
        if(iSip>=0&&r[iSip])sipCount+=(parseInt(sv(r[iSip]))||0);
        if(iFat>=0&&r[iFat])fatCount+=(parseInt(sv(r[iFat]))||0);
        else fatCount++;
      }
      if(sipCount>0)setYiSiparis(String(sipCount));
      setYiFatura(String(fatCount));
      setMsgYi(`${fatCount} fatura`);
      setStYi("ok"); setTab("yurtici");
    }catch(e){setMsgYi("Dosya okunamadı"); setStYi("err");}
  }

  async function parseIh(file:File){
    setStIh("loading");
    try{
      const XLSX=await import("xlsx");
      const wb=XLSX.read(await file.arrayBuffer());
      const ws=wb.Sheets["data"]??wb.Sheets[wb.SheetNames[0]];
      const data:any[][]=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
      const hi=data.findIndex(r=>r.some((c:any)=>sv(c)==="Müşteri"||sv(c).includes("MÜŞTERİ")));
      const hRow=hi>=0?data[hi]:data[0];
      const iMus=hRow.findIndex((c:any)=>sv(c)==="Müşteri"||sv(c).includes("MÜŞTERİ"));
      const iIl=hRow.findIndex((c:any)=>sv(c)==="İl"||sv(c)==="ÜLKE");
      const iTar=hRow.findIndex((c:any)=>sv(c).includes("Tarih")||sv(c).includes("TARİH"));
      const iAdt=hRow.findIndex((c:any)=>sv(c)==="Adet"||sv(c)==="ADET");
      const iCes=hRow.findIndex((c:any)=>sv(c)==="Çeşit"||sv(c)==="SKU");
      const ihNew:IHRow[]=[];
      for(let i=(hi>=0?hi+1:1);i<data.length;i++){
        const r=data[i];
        const mus=sv(iMus>=0?r[iMus]:r[3]); if(!mus)continue;
        const ulke=sv(iIl>=0?r[iIl]:r[4]);
        const tar=parseTrDate(sv(iTar>=0?r[iTar]:r[2]));
        const adt=ns(iAdt>=0?r[iAdt]:r[6]);
        const ces=ns(iCes>=0?r[iCes]:r[7]);
        ihNew.push({id:uid(),musteri:mus,ulke,ilkTarih:tar,cikisTarih:"",sebep:"",sku:ces,adet:adt});
      }
      setIhRows(r=>[...r,...ihNew]);
      setMsgIh(`${ihNew.length} sipariş`);
      setStIh("ok"); setTab("ihracat");
    }catch(e){setMsgIh("Dosya okunamadı"); setStIh("err");}
  }

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

  const longDate=new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});

  // ─── Upload Zone ──────────────────────────────────────────────────────────
  function UpZone({icon:Icon,label,st,msg,onClick}:{icon:any;label:string;st:UpSt;msg:string;onClick:()=>void}){
    const ok=st==="ok",err=st==="err",loading=st==="loading";
    return(
      <button onClick={onClick} disabled={loading}
        className={`flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 text-center transition-all
          ${ok?"border-emerald-300 bg-emerald-50/60":err?"border-red-300 bg-red-50/60":loading?"border-slate-200 bg-slate-50 cursor-wait":"border-slate-200 bg-white/80 hover:border-[#C8962E]/60 hover:bg-amber-50/30"}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ok?"bg-emerald-100":err?"bg-red-100":loading?"bg-slate-100":"bg-amber-50"}`}>
          {ok?<CheckCircle2 size={26} className="text-emerald-600"/>:err?<Info size={26} className="text-red-500"/>:loading?<CloudUpload size={26} className="text-slate-400 animate-pulse"/>:<Icon size={26} className="text-[#C8962E]"/>}
        </div>
        <div>
          <div className={`font-semibold text-sm ${ok?"text-emerald-700":err?"text-red-600":"text-slate-700"}`}>{ok||err?msg:label}</div>
          {!ok&&!err&&<div className="text-xs text-slate-400 mt-0.5">.xlsx / .xls</div>}
        </div>
        {!ok&&!err&&!loading&&(
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors">
            <CloudUpload size={13}/>Dosya Seç
          </div>
        )}
      </button>
    );
  }

  // ─── İçerik ───────────────────────────────────────────────────────────────
  function YurticiContent(){
    return(
      <div className="space-y-4">
        {/* Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CloudUpload size={18} className="text-[#C8962E]"/>
            <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">Zeus&apos;tan Excel Yükleme</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <UpZone icon={ClipboardList} label="Yurtiçi" st={stYi} msg={msgYi} onClick={()=>refYi.current?.click()}/>
            <UpZone icon={Globe} label="İhracat" st={stIh} msg={msgIh} onClick={()=>refIh.current?.click()}/>
            <UpZone icon={Package} label="İrsaliye" st={stIr} msg={msgIr} onClick={()=>refIr.current?.click()}/>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-400">
            <Info size={12}/>Zeus → Rapor Al → Excel kaydet → Buraya yükle
          </div>
          {(stYi==="ok"||stIh==="ok"||stIr==="ok")&&(
            <button onClick={()=>{setStIt("idle");setMsgIt("");setStIr("idle");setMsgIr("");setYiRows([]);setIhRows([]);setMkRows([]);setYiSiparis("");setYiFatura("");}}
              className="mt-2 text-xs text-slate-400 hover:text-red-400 transition-colors">↺ Sıfırla</button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {/* Sipariş Sayısı */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText size={22} className="text-blue-500"/>
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-slate-500 mb-1">Sipariş Sayısı</div>
              <input type="number" inputMode="numeric" placeholder="0" value={yiSiparis}
                onChange={e=>setYiSiparis(e.target.value)}
                className="text-3xl font-black text-slate-800 w-full outline-none bg-transparent tabular-nums leading-none"/>
            </div>
          </div>
          {/* Faturalanan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Receipt size={22} className="text-violet-500"/>
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-slate-500 mb-1">Faturalanan</div>
              <input type="number" inputMode="numeric" placeholder="0" value={yiFatura}
                onChange={e=>setYiFatura(e.target.value)}
                className="text-3xl font-black text-slate-800 w-full outline-none bg-transparent tabular-nums leading-none"/>
            </div>
          </div>
          {/* Kalan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} className={yiKalan>0?"text-red-500":"text-emerald-500"}/>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">Kalan</div>
              <div className={`text-3xl font-black tabular-nums leading-none ${yiKalan>0?"text-red-600":"text-emerald-600"}`}>{yiKalan}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#C8962E] font-bold text-lg leading-none">+</span>
            <span className="text-xs font-bold text-[#C8962E] tracking-widest uppercase">Bekleyen Müşteri Ekle</span>
          </div>
          <div className="space-y-3 mb-4">
            <IconInput icon={User} label="Müşteri Adı *" placeholder="Müşteri adını giriniz"
              value={yiF.musteri} onChange={v=>setYiF({...yiF,musteri:v})}
              color="text-blue-400" bg="bg-blue-50"/>
            <IconSelect icon={Settings} label="Çıkmama Sebebi" value={yiF.sebep}
              onChange={v=>setYiF({...yiF,sebep:v})}
              opts={["TIR İLE SEVK EDİLECEK","CUT OF SONRASI DÜŞEN SİPARİŞ","ELLEÇLEME","KULVARDA","DİĞER"]}
              color="text-slate-400" bg="bg-slate-100"/>
            <div className="grid grid-cols-2 gap-3">
              <IconInput icon={Box} label="SKU" placeholder="SKU"
                value={yiF.sku} onChange={v=>setYiF({...yiF,sku:v})} type="number"
                color="text-blue-400" bg="bg-blue-50"/>
              <IconInput icon={Layers} label="Adet" placeholder="Adet"
                value={yiF.adet} onChange={v=>setYiF({...yiF,adet:v})} type="number"
                color="text-teal-500" bg="bg-teal-50"/>
            </div>
            <IconInput icon={MessageSquare} label="Not (isteğe bağlı)" placeholder="Not giriniz (isteğe bağlı)"
              value={yiF.not} onChange={v=>setYiF({...yiF,not:v})}
              color="text-slate-400" bg="bg-slate-100"/>
          </div>
          <button onClick={addYi}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{background:"#1B2A4A"}}>
            <PlusCircle size={17}/> Ekle
          </button>
        </div>

        {/* Listesi */}
        {yiRows.length===0?(
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={17} className="text-white"/>
            </div>
            <span className="text-sm font-medium text-slate-700">Bekleyen müşteri yok — tüm siparişler faturalandı</span>
          </div>
        ):yiRows.map(r=>(
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-red-400 p-4 flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="font-semibold text-slate-800 mb-1.5">{r.musteri}</div>
              {r.sebep&&<span className="text-xs font-semibold rounded-full border px-2.5 py-0.5 bg-red-50 text-red-700 border-red-200">{r.sebep}</span>}
              <div className="flex gap-2 mt-2">
                {r.sku&&<span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{r.sku} SKU</span>}
                {r.adet&&<span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{fmtN(r.adet)} Adet</span>}
              </div>
              {r.not&&<div className="text-xs text-slate-400 mt-1 italic">{r.not}</div>}
            </div>
            <button onClick={()=>setYiRows(rs=>rs.filter(x=>x.id!==r.id))}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center text-base transition-colors">×</button>
          </div>
        ))}
      </div>
    );
  }

  function IhracatContent(){
    return(
      <div className="space-y-4">
        {ihSts.length>0&&(
          <div className="grid grid-cols-3 gap-4">
            {[
              {l:"Kritik / Geç",   v:ihSts.filter(s=>s?.renk==="red").length,    bg:"bg-red-50",    ico:"text-red-500",   brd:"border-red-200"},
              {l:"Devam Ediyor",   v:ihSts.filter(s=>s?.renk==="yellow").length,  bg:"bg-amber-50",  ico:"text-amber-500", brd:"border-amber-200"},
              {l:"Tamamlandı",     v:ihSts.filter(s=>s?.renk==="green").length,   bg:"bg-emerald-50",ico:"text-emerald-500",brd:"border-emerald-200"},
            ].map(s=>(
              <div key={s.l} className={`bg-white/90 rounded-2xl border ${s.brd} p-4 flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <CheckCircle2 size={22} className={s.ico}/>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">{s.l}</div>
                  <div className="text-3xl font-black text-slate-800 leading-none">{s.v}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {ihRows.length===0?(
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">✈️</div>
            <div className="text-sm font-medium text-slate-500">İhracat siparişi yok — İş Talepleri yükleyin veya manuel ekleyin</div>
          </div>
        ):ihRows.map(r=>{
          const s=calcStatus(r);
          return(
            <div key={r.id} className={`bg-white/90 rounded-2xl border border-slate-200 border-l-4 ${s?SB[s.renk]:"border-l-slate-300"} p-4 flex items-start justify-between gap-3`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-semibold text-slate-800">{r.musteri}</span>
                  {r.ulke&&<span className="text-xs bg-slate-100 text-slate-500 font-bold rounded px-1.5 py-0.5">{r.ulke}</span>}
                </div>
                {s&&<span className={`text-xs font-semibold rounded-full border px-2.5 py-0.5 ${SC[s.renk]}`}>{s.durum}</span>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {r.sku&&<span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{r.sku} SKU</span>}
                  {r.adet&&<span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{fmtN(r.adet)} Adet</span>}
                  {s&&<span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">Son: {s.sonTermin}</span>}
                </div>
                <div className="text-xs text-slate-400 mt-1">{fmtDate(r.ilkTarih)}{r.cikisTarih?` → ${fmtDate(r.cikisTarih)}`:""}{r.sebep?` · ${r.sebep}`:""}</div>
                {!r.cikisTarih&&<button onClick={()=>setIhRows(rs=>rs.map(x=>x.id===r.id?{...x,sebep:"GÖNDERİLDİ",cikisTarih:todayStr()}:x))}
                  className="mt-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">✓ Gönderildi olarak işaretle</button>}
              </div>
              <button onClick={()=>setIhRows(rs=>rs.filter(x=>x.id!==r.id))}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center text-base transition-colors">×</button>
            </div>
          );
        })}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#C8962E] font-bold text-lg leading-none">+</span>
            <span className="text-xs font-bold text-[#C8962E] tracking-widest uppercase">Manuel Sipariş Ekle</span>
          </div>
          <div className="space-y-3 mb-4">
            <IconInput icon={User} label="Müşteri / Alıcı Adı *" placeholder="Müşteri adını giriniz" value={ihF.musteri} onChange={v=>setIhF({...ihF,musteri:v})} color="text-blue-400" bg="bg-blue-50"/>
            <IconInput icon={Layers} label="Ülke / Şehir" placeholder="Ülke veya şehir" value={ihF.ulke} onChange={v=>setIhF({...ihF,ulke:v})} color="text-teal-500" bg="bg-teal-50"/>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1.5">İlk Sipariş Tarihi</div>
                <input type="date" value={ihF.ilkTarih} onChange={e=>setIhF({...ihF,ilkTarih:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 bg-white outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"/>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1.5">Çıkış Tarihi</div>
                <input type="date" value={ihF.cikisTarih} onChange={e=>setIhF({...ihF,cikisTarih:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 bg-white outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"/>
              </div>
            </div>
            <IconSelect icon={Settings} label="Durum" value={ihF.sebep} onChange={v=>setIhF({...ihF,sebep:v})}
              opts={["GÖNDERİLDİ","TOPLAMADA","ELLEÇLEME","BEKLEMEDE","DİĞER"]} color="text-slate-400" bg="bg-slate-100"/>
            <div className="grid grid-cols-2 gap-3">
              <IconInput icon={Box} label="SKU (Çeşit)" placeholder="SKU sayısı" value={ihF.sku} onChange={v=>setIhF({...ihF,sku:v})} type="number" color="text-blue-400" bg="bg-blue-50"/>
              <IconInput icon={Layers} label="Adet" placeholder="Adet" value={ihF.adet} onChange={v=>setIhF({...ihF,adet:v})} type="number" color="text-teal-500" bg="bg-teal-50"/>
            </div>
            {liveS&&<div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${SC[liveS.renk]}`}>⚡ {liveS.durum} · Termin: {liveS.terminGun} gün · Son: {liveS.sonTermin}</div>}
          </div>
          <button onClick={addIh} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 active:scale-[0.98]" style={{background:"#1B2A4A"}}>
            <PlusCircle size={17}/> Ekle
          </button>
        </div>
      </div>
    );
  }

  function MalKabulContent(){
    return(
      <div className="space-y-4">
        {mkRows.length>0&&(
          <div className="grid grid-cols-3 gap-4">
            {[
              {l:"Bekliyor",    v:mkRows.filter(r=>r.durum!=="TAMAMLANDI").length, bg:"bg-amber-50",  ico:"text-amber-500"},
              {l:"Tamamlandı", v:mkRows.filter(r=>r.durum==="TAMAMLANDI").length,  bg:"bg-emerald-50",ico:"text-emerald-500"},
              {l:"Toplam Adet",v:fmtN(mkTot),                                      bg:"bg-sky-50",    ico:"text-sky-500"},
            ].map(s=>(
              <div key={s.l} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Package size={22} className={s.ico}/>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">{s.l}</div>
                  <div className="text-3xl font-black text-slate-800 leading-none">{s.v}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {mkRows.length===0?(
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">📦</div>
            <div className="text-sm font-medium text-slate-500">Mal kabul kaydı yok — İrsaliye yükleyin</div>
          </div>
        ):mkRows.map(r=>{
          const dc=r.durum==="TAMAMLANDI"?"border-l-emerald-500":r.durum==="İŞLEMDE"?"border-l-amber-500":"border-l-slate-400";
          const pk=r.durum==="TAMAMLANDI"?SC.green:r.durum==="İŞLEMDE"?SC.yellow:SC.red;
          return(
            <div key={r.id} className={`bg-white/90 rounded-2xl border border-slate-200 border-l-4 ${dc} p-4 flex items-start justify-between gap-3`}>
              <div>
                <div className="font-semibold text-slate-800 mb-1.5">{r.firma}</div>
                <span className={`text-xs font-semibold rounded-full border px-2.5 py-0.5 ${pk}`}>{r.durum}</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{r.depo}</span>
                  {r.adet&&<span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{fmtN(r.adet)} Adet</span>}
                  {r.cesit&&<span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{r.cesit} Çeşit</span>}
                  <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-2 py-0.5">{fmtDate(r.tarih)}</span>
                </div>
                {(r.belgeNo||r.belgeNo2)&&<div className="text-xs text-slate-400 mt-1 font-mono">{r.belgeNo}{r.belgeNo2?" / "+r.belgeNo2:""}</div>}
              </div>
              <button onClick={()=>setMkRows(rs=>rs.filter(x=>x.id!==r.id))}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center text-base transition-colors">×</button>
            </div>
          );
        })}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#C8962E] font-bold text-lg leading-none">+</span>
            <span className="text-xs font-bold text-[#C8962E] tracking-widest uppercase">Manuel Mal Kabul Ekle</span>
          </div>
          <div className="space-y-3 mb-4">
            <IconInput icon={User} label="Firma Adı *" placeholder="Firma adını giriniz" value={mkF.firma} onChange={v=>setMkF({...mkF,firma:v})} color="text-blue-400" bg="bg-blue-50"/>
            <div className="grid grid-cols-2 gap-3">
              <IconSelect icon={Package} label="Depo" value={mkF.depo} onChange={v=>setMkF({...mkF,depo:v})} opts={["TEM.34","Kartepe","Çatalca","Ankara"]} color="text-violet-400" bg="bg-violet-50"/>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1.5">Tarih</div>
                <input type="date" value={mkF.tarih} onChange={e=>setMkF({...mkF,tarih:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 bg-white outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <IconInput icon={FileText} label="Belge No" placeholder="Belge No" value={mkF.belgeNo} onChange={v=>setMkF({...mkF,belgeNo:v})} color="text-slate-400" bg="bg-slate-100"/>
              <IconInput icon={FileText} label="Belge No 2" placeholder="Belge No 2" value={mkF.belgeNo2} onChange={v=>setMkF({...mkF,belgeNo2:v})} color="text-slate-400" bg="bg-slate-100"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <IconInput icon={Layers} label="Adet" placeholder="Adet" value={mkF.adet} onChange={v=>setMkF({...mkF,adet:v})} type="number" color="text-teal-500" bg="bg-teal-50"/>
              <IconInput icon={Box} label="Çeşit (SKU)" placeholder="SKU sayısı" value={mkF.cesit} onChange={v=>setMkF({...mkF,cesit:v})} type="number" color="text-blue-400" bg="bg-blue-50"/>
            </div>
            <IconSelect icon={Settings} label="Durum" value={mkF.durum} onChange={v=>setMkF({...mkF,durum:v})} opts={["BAŞLAMADI","İŞLEMDE","TAMAMLANDI","ÜRÜN DEPOYA GELMEDİ"]} color="text-slate-400" bg="bg-slate-100"/>
          </div>
          <button onClick={addMk} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 active:scale-[0.98]" style={{background:"#1B2A4A"}}>
            <PlusCircle size={17}/> Ekle
          </button>
        </div>
      </div>
    );
  }

  const TABS:[TabKey,typeof Truck,string][]=[
    ["yurtici",Truck,"Yurtiçi"],["ihracat",Globe,"İhracat"],["malkabul",Package,"Mal Kabul"]
  ];

  return(
    <div className="min-h-screen flex flex-col relative" style={{background:"transparent"}}>
      {/* Arka plan */}
      <div className="fixed inset-0 bg-cover bg-center pointer-events-none" style={{backgroundImage:"url('/hero-bg.jpg')",opacity:0.45,zIndex:0}}/>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 flex items-center justify-between px-8 h-16">
        <div className="flex items-center gap-4">
          <Image src="/logo-full-color.png" alt="Başarı Otomotiv" width={160} height={40} className="h-9 w-auto object-contain" priority/>
        </div>
        <div className="flex items-center gap-2.5">
          <CalendarDays size={18} className="text-slate-400"/>
          <span className="font-semibold text-sm text-slate-800">Gün Sonu İzleme</span>
          <span className="text-slate-300 text-base">·</span>
          <span className="font-semibold text-sm" style={{color:"#C8962E"}}>{longDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <Bell size={18} className="text-slate-500"/>
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">1</span>
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1"/>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <HelpCircle size={18} className="text-slate-500"/>
          </button>
          <button className="flex items-center gap-1.5 ml-1 border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors">
            <span className="font-bold text-sm text-slate-700">BO</span>
            <ChevronDown size={14} className="text-slate-400"/>
          </button>
        </div>
      </header>

      {/* TAB BAR */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 flex items-stretch">
        {TABS.map(([k,Icon,label])=>{
          const active=tab===k;
          return(
            <button key={k} onClick={()=>setTab(k)}
              className={`flex items-center justify-center gap-2.5 px-0 font-semibold text-sm transition-all relative
                ${active?"text-white":"text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
              style={{
                flex:"0 0 auto",
                width:"calc(100% / 3 - 80px)",
                padding:"14px 32px",
                background:active?"#1B3A8A":"transparent",
              }}>
              <Icon size={17}/>
              {label}
              {active&&<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45" style={{background:"#1B3A8A",bottom:"-6px",zIndex:1}}/>}
            </button>
          );
        })}
        <div className="flex-1"/>
        <div className="flex items-center pr-6">
          <button onClick={shareWA}
            className="flex items-center gap-2 px-6 py-2.5 text-white font-bold text-sm rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{background:"#22c55e"}}>
            <Share2 size={16}/> Gönder
          </button>
        </div>
      </div>

      {/* İÇERİK */}
      <main className="flex-1 relative z-10">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {tab==="yurtici"&&<YurticiContent/>}
          {tab==="ihracat"&&<IhracatContent/>}
          {tab==="malkabul"&&<MalKabulContent/>}
        </div>
      </main>

      <input ref={refYi} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e=>{const f=e.target.files?.[0]; if(f)parseYi(f); e.target.value="";}}/>
      <input ref={refIh} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e=>{const f=e.target.files?.[0]; if(f)parseIh(f); e.target.value="";}}/>
      <input ref={refIr} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e=>{const f=e.target.files?.[0]; if(f)parseIr(f); e.target.value="";}}/>
    </div>
  );
}
