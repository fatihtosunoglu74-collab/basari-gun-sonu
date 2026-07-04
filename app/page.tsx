"use client";
import React, { useState } from "react";

const C = {
  navy:"#0B2F78", navy2:"#0d3a91", navyDk:"#081f52",
  green:"#22C55E", greenDk:"#16A34A",
  white:"#FFFFFF", bg:"#F4F7FD",
  text:"#1E293B", muted:"#64748B", border:"#E2E8F0",
  red:"#EF4444", yellow:"#F59E0B",
  softRed:"#FEF2F2", softYellow:"#FFFBEB", softGreen:"#F0FDF4",
};

type Tab = "yurtici"|"ihracat"|"malKabul";

const TABS: {id:Tab; label:string; icon:string}[] = [
  { id:"yurtici",  label:"Yurtiçi",  icon:"🚛" },
  { id:"ihracat",  label:"İhracat",  icon:"🚢" },
  { id:"malKabul", label:"Mal Kabul",icon:"🏭" },
];

// Demo veri
const YI_DATA = [
  {no:"YT-2026-001",musteri:"Başarı Ankara",     tarih:"04.07.2026 08:30",siparis:240,fatura:210,kalan:30, durum:"Devam"},
  {no:"YT-2026-002",musteri:"İstanbul Avrupa",    tarih:"04.07.2026 09:15",siparis:190,fatura:190,kalan:0,  durum:"Tamamlandı"},
  {no:"YT-2026-003",musteri:"Ege Bölge",          tarih:"04.07.2026 10:00",siparis:160,fatura:145,kalan:15, durum:"Devam"},
  {no:"YT-2026-004",musteri:"Kartepe Sevkiyat",   tarih:"04.07.2026 11:20",siparis:89, fatura:89, kalan:0,  durum:"Tamamlandı"},
  {no:"YT-2026-005",musteri:"GooN Tech Ankara",   tarih:"04.07.2026 13:10",siparis:130,fatura:0,  kalan:130,durum:"Başlamadı"},
];
const IH_DATA = [
  {no:"IH-2026-101",firma:"Auto Balkan",    ulke:"Bulgaristan",tarih:"04.07.2026 08:00",adet:420,durum:"ZAMANINDA", type:"green"},
  {no:"IH-2026-102",firma:"Global Parts",   ulke:"Almanya",    tarih:"04.07.2026 09:30",adet:275,durum:"RİSKLİ",   type:"yellow"},
  {no:"IH-2026-103",firma:"MENA Trade",     ulke:"BAE",        tarih:"04.07.2026 07:00",adet:610,durum:"GECİKTİ",  type:"red"},
  {no:"IH-2026-104",firma:"Balkan Motors",  ulke:"Sırbistan",  tarih:"04.07.2026 14:00",adet:180,durum:"ZAMANINDA",type:"green"},
  {no:"IH-2026-105",firma:"East Auto",      ulke:"Kazakistan", tarih:"04.07.2026 16:00",adet:340,durum:"RİSKLİ",  type:"yellow"},
];
const MK_DATA = [
  {no:"IRS-2026-1452",tedarikci:"Martaş Otomotiv",   tarih:"04.07.2026 08:30",durum:"BAŞLAMADI", type:"red",   aciklama:"İşleme alınmadı"},
  {no:"IRS-2026-1453",tedarikci:"Başarı İthalat",    tarih:"04.07.2026 09:15",durum:"İŞLEMDE",   type:"yellow",aciklama:"Kontrol aşamasında"},
  {no:"IRS-2026-1454",tedarikci:"Arıcıoğlu Otomotiv",tarih:"04.07.2026 10:45",durum:"TAMAMLANDI",type:"green", aciklama:"İşlem tamamlandı"},
  {no:"IRS-2026-1455",tedarikci:"Sampa Otomotiv",    tarih:"04.07.2026 11:20",durum:"İŞLEMDE",   type:"yellow",aciklama:"Eksik parça bekleniyor"},
  {no:"IRS-2026-1456",tedarikci:"Kanca Otomotiv",    tarih:"04.07.2026 13:10",durum:"BAŞLAMADI", type:"red",   aciklama:"Henüz başlanmadı"},
];

function durum_badge(type:string,label:string) {
  const bg = type==="green"?C.softGreen:type==="yellow"?C.softYellow:C.softRed;
  const cl = type==="green"?"#15803D":type==="yellow"?"#B45309":"#B91C1C";
  const br = type==="green"?"#BBF7D0":type==="yellow"?"#FDE68A":"#FECACA";
  return (
    <span style={{display:"inline-flex",alignItems:"center",padding:"5px 12px",borderRadius:"999px",fontSize:"11px",fontWeight:900,letterSpacing:"0.3px",background:bg,color:cl,border:`1px solid ${br}`}}>
      {label}
    </span>
  );
}

function StatCircle({type,label,val,sub}:{type:string;label:string;val:number;sub:string}){
  const cl = type==="red"?C.red:type==="yellow"?C.yellow:C.green;
  const ic = type==="red"?"✕":type==="yellow"?"◷":"✓";
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      <div style={{width:80,height:80,borderRadius:"50%",border:`3px solid ${cl}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:cl,background:`${cl}15`}}>
        {ic}
      </div>
      <div style={{fontSize:13,fontWeight:900,color:cl,letterSpacing:0.5}}>{label}</div>
      <div style={{fontSize:38,fontWeight:900,color:C.text,lineHeight:1}}>{val}</div>
      <div style={{fontSize:13,fontWeight:600,color:C.muted}}>{sub}</div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("malKabul");
  const today = new Date().toLocaleDateString("tr-TR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});

  // Upload durumu (sekmeye göre)
  const uploadLabel:{[k:string]:{title:string;sub:string}} = {
    yurtici: {title:"Yurtiçi Sipariş Exceli Yükle",    sub:"Sipariş, faturalanan ve kalan verilerini yükleyin."},
    ihracat: {title:"İhracat Excel Dosyası Yükle",      sub:"Termin, müşteri ve durum verilerini yükleyin."},
    malKabul:{title:"Mal Kabul Excel Dosyası Yükle",    sub:"İrsaliye, tedarikçi ve işlem verilerini yükleyin."},
  };

  // Yurtiçi özetler
  const yi_tot = YI_DATA.reduce((s,r)=>s+r.siparis,0);
  const yi_fat = YI_DATA.reduce((s,r)=>s+r.fatura,0);
  const yi_kal = YI_DATA.reduce((s,r)=>s+r.kalan,0);
  const yi_bas = YI_DATA.filter(r=>r.kalan===r.siparis).length;
  const yi_dev = YI_DATA.filter(r=>r.kalan>0&&r.kalan<r.siparis).length;
  const yi_tam = YI_DATA.filter(r=>r.kalan===0).length;

  // İhracat özetler
  const ih_zam = IH_DATA.filter(r=>r.type==="green").length;
  const ih_ris = IH_DATA.filter(r=>r.type==="yellow").length;
  const ih_gec = IH_DATA.filter(r=>r.type==="red").length;

  // Mal kabul özetler
  const mk_bas = MK_DATA.filter(r=>r.type==="red").length;
  const mk_isl = MK_DATA.filter(r=>r.type==="yellow").length;
  const mk_tam = MK_DATA.filter(r=>r.type==="green").length;
  const mk_tot = MK_DATA.length;

  const S:Record<string,React.CSSProperties> = {
    th:{padding:"12px 16px",textAlign:"left",fontSize:"12px",fontWeight:900,color:C.muted,background:"#F8FAFF",borderBottom:`1px solid ${C.border}`,textTransform:"uppercase",letterSpacing:"0.4px"},
    td:{padding:"14px 16px",fontSize:"13px",fontWeight:700,borderBottom:`1px solid ${C.border}`,color:C.text},
    sideCard:{background:C.navy,borderRadius:18,padding:"20px",color:"#fff",marginBottom:14},
    sideRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.1)"},
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',color:C.text}}>

      {/* ── HEADER ── */}
      <header style={{background:C.navy,height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon-white.png" alt="BO" style={{height:36,width:"auto",objectFit:"contain"}}
            onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full-color.png" alt="Başarı Otomotiv" style={{height:32,width:"auto",objectFit:"contain",filter:"brightness(0) invert(1)"}}
            onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
          <div style={{width:1,height:32,background:"rgba(255,255,255,0.25)",margin:"0 8px"}}/>
          <span style={{color:"#fff",fontSize:20,fontWeight:900,letterSpacing:-0.5}}>Gün Sonu İzleme</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,color:"rgba(255,255,255,0.85)",fontSize:14,fontWeight:700}}>
          <span>📅</span>
          <span>{today}</span>
          <div style={{width:1,height:24,background:"rgba(255,255,255,0.2)",margin:"0 4px"}}/>
          <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",border:"1px solid rgba(255,255,255,0.25)"}}>FT</div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <div style={{position:"relative",height:190,overflow:"hidden"}}>
        {/* Arka plan */}
        <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${C.navyDk} 0%,${C.navy} 40%,#1a4f9e 70%,${C.navyDk} 100%)`}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"url('/background-logistics.jpg')",backgroundSize:"cover",backgroundPosition:"center",opacity:0.22}}/>
        {/* Mavi tint overlay */}
        <div style={{position:"absolute",inset:0,background:"rgba(11,31,82,0.55)"}}/>
        {/* İçerik */}
        <div style={{position:"relative",zIndex:2,maxWidth:1400,margin:"0 auto",height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px"}}>
          {/* Sol: büyük araç emoji ve brand */}
          <div style={{display:"flex",alignItems:"center",gap:24}}>
            <div style={{fontSize:90,lineHeight:1,filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.4))"}}>🚛</div>
            <div style={{color:"#fff"}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-full-color.png" alt="Başarı Otomotiv" style={{height:28,filter:"brightness(0) invert(1)",marginBottom:8,display:"block"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.6)",letterSpacing:1}}>OTOMOTİV YEDEK PARÇA</div>
            </div>
          </div>
          {/* Orta: başlık */}
          <div style={{textAlign:"center",color:"#fff"}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:3,color:"rgba(255,255,255,0.6)",marginBottom:8,textTransform:"uppercase"}}>Başarı Otomotiv · Operasyon Merkezi</div>
            <div style={{fontSize:38,fontWeight:900,letterSpacing:-1,lineHeight:1.1,textShadow:"0 2px 12px rgba(0,0,0,0.4)"}}>GÜÇLÜ LOJİSTİK</div>
            <div style={{fontSize:22,fontWeight:700,color:"rgba(255,255,255,0.82)",letterSpacing:1,marginTop:4}}>GÜVENİLİR TESLİMAT</div>
          </div>
          {/* Sağ: uçak + gemi */}
          <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{fontSize:54,lineHeight:1,filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.4))"}}>✈️</div>
              <div style={{fontSize:72,lineHeight:1,filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.4))"}}>🚢</div>
            </div>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",letterSpacing:1}}>BAŞARI OTOMOTİV</div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{background:"#fff",borderBottom:`1px solid ${C.border}`,boxShadow:"0 4px 16px rgba(11,47,120,0.06)"}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:66}}>
          <div style={{display:"flex",height:"100%"}}>
            {TABS.map(t=>{
              const act=tab===t.id;
              return(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"0 28px",height:"100%",border:"none",borderBottom:act?`3px solid ${C.navy}`:"3px solid transparent",background:act?`linear-gradient(180deg,rgba(11,47,120,0.04) 0%,rgba(11,47,120,0.09) 100%)`:"transparent",color:act?C.navy:C.muted,fontSize:16,fontWeight:act?900:700,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",borderRadius:"0 0 0 0"}}>
                  <span style={{fontSize:22}}>{t.icon}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
          <button style={{display:"flex",alignItems:"center",gap:8,background:C.green,color:"#fff",border:"none",borderRadius:12,padding:"11px 22px",fontWeight:900,fontSize:14,cursor:"pointer",boxShadow:"0 8px 20px rgba(34,197,94,0.25)",fontFamily:"inherit"}}>
            <span style={{fontSize:18}}>⇧</span> Kaydet ve Paylaş
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{maxWidth:1400,margin:"0 auto",padding:"24px 32px"}}>

        {/* UPLOAD BAR */}
        <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:16,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,boxShadow:"0 4px 16px rgba(11,47,120,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,borderRadius:12,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:"1px solid #C8E6C9"}}>
              <span style={{color:"#2E7D32",fontWeight:900,fontSize:18}}>X</span>
            </div>
            <div>
              <div style={{fontWeight:900,fontSize:15,color:C.text}}>{uploadLabel[tab].title}</div>
              <div style={{fontSize:12,color:C.muted,fontWeight:600,marginTop:3}}>{uploadLabel[tab].sub}</div>
            </div>
          </div>
          <button style={{display:"flex",alignItems:"center",gap:8,border:`1.5px solid ${C.navy}`,color:C.navy,background:"#fff",borderRadius:12,padding:"10px 20px",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            <span>↑</span> Excel Seç
          </button>
        </div>

        {/* İÇERİK */}
        {tab==="yurtici"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
            {/* Sol */}
            <div>
              {/* Stat kartları */}
              <div style={{display:"flex",gap:16,marginBottom:20}}>
                <StatCircle type="red"    label="BAŞLAMADI"  val={yi_bas} sub="Sipariş"/>
                <StatCircle type="yellow" label="DEVAM EDİYOR" val={yi_dev} sub="Sipariş"/>
                <StatCircle type="green"  label="TAMAMLANDI" val={yi_tam} sub="Sipariş"/>
              </div>
              {/* Tablo */}
              <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 16px rgba(11,47,120,0.05)"}}>
                <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:900,fontSize:16,color:C.navy}}>
                    <span>📋</span> SİPARİŞ LİSTESİ
                  </div>
                  <div style={{fontSize:12,color:C.muted,fontWeight:700}}>{YI_DATA.length} kayıt · {new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Sipariş No","Müşteri","Giriş Tarihi","Sipariş","Faturalanan","Kalan","Durum"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {YI_DATA.map((r,i)=>(
                      <tr key={i} style={{background:i%2===0?"#fff":"#FBFCFF"}}>
                        <td style={{...S.td,fontWeight:800,color:C.navy}}>{r.no}</td>
                        <td style={S.td}>{r.musteri}</td>
                        <td style={S.td}>{r.tarih}</td>
                        <td style={S.td}>{r.siparis.toLocaleString("tr-TR")}</td>
                        <td style={S.td}>{r.fatura.toLocaleString("tr-TR")}</td>
                        <td style={{...S.td,color:r.kalan>0?C.red:C.green,fontWeight:900}}>{r.kalan}</td>
                        <td style={S.td}>{durum_badge(r.kalan===0?"green":r.kalan===r.siparis?"red":"yellow",r.durum)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Sağ */}
            <div>
              <div style={S.sideCard}>
                <div style={{fontWeight:900,fontSize:15,marginBottom:16,letterSpacing:0.5}}>GÜN SONU ÖZETİ</div>
                {[["Toplam Sipariş",yi_tot,"#fff"],["Başlamadı",yi_bas,C.red],["Devam",yi_dev,C.yellow],["Tamamlandı",yi_tam,C.green]].map(([l,v,c])=>(
                  <div key={l as string} style={S.sideRow}>
                    <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.75)"}}>{l}</span>
                    <span style={{fontSize:16,fontWeight:900,color:c as string}}>{(v as number).toLocaleString("tr-TR")}</span>
                  </div>
                ))}
                <div style={{marginTop:12,fontSize:22,opacity:0.3,textAlign:"center"}}>🚛 🏭 🚛</div>
              </div>
              <ContactCard/>
            </div>
          </div>
        )}

        {tab==="ihracat"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
            <div>
              <div style={{display:"flex",gap:16,marginBottom:20}}>
                <StatCircle type="green"  label="ZAMANINDA" val={ih_zam} sub="Sevkiyat"/>
                <StatCircle type="yellow" label="RİSKLİ"    val={ih_ris} sub="Sevkiyat"/>
                <StatCircle type="red"    label="GECİKTİ"   val={ih_gec} sub="Sevkiyat"/>
              </div>
              <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 16px rgba(11,47,120,0.05)"}}>
                <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:900,fontSize:16,color:C.navy}}><span>✈️</span> İHRACAT SEVKİYAT LİSTESİ</div>
                  <div style={{fontSize:12,color:C.muted,fontWeight:700}}>{IH_DATA.length} kayıt</div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Sipariş No","Firma","Ülke","Termin","Adet","Durum"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {IH_DATA.map((r,i)=>(
                      <tr key={i} style={{background:i%2===0?"#fff":"#FBFCFF"}}>
                        <td style={{...S.td,fontWeight:800,color:C.navy}}>{r.no}</td>
                        <td style={S.td}>{r.firma}</td>
                        <td style={S.td}>{r.ulke}</td>
                        <td style={S.td}>{r.tarih}</td>
                        <td style={S.td}>{r.adet.toLocaleString("tr-TR")}</td>
                        <td style={S.td}>{durum_badge(r.type,r.durum)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div style={S.sideCard}>
                <div style={{fontWeight:900,fontSize:15,marginBottom:16,letterSpacing:0.5}}>GÜN SONU ÖZETİ</div>
                {[["Toplam Sevkiyat",IH_DATA.length,"#fff"],["Zamanında",ih_zam,C.green],["Riskli",ih_ris,C.yellow],["Gecikti",ih_gec,C.red]].map(([l,v,c])=>(
                  <div key={l as string} style={S.sideRow}>
                    <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.75)"}}>{l}</span>
                    <span style={{fontSize:16,fontWeight:900,color:c as string}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:12,fontSize:22,opacity:0.3,textAlign:"center"}}>🚢 ✈️ 🚢</div>
              </div>
              <ContactCard/>
            </div>
          </div>
        )}

        {tab==="malKabul"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
            <div>
              <div style={{display:"flex",gap:16,marginBottom:20}}>
                <StatCircle type="red"    label="BAŞLAMADI"  val={mk_bas} sub="İrsaliye"/>
                <StatCircle type="yellow" label="İŞLEMDE"    val={mk_isl} sub="İrsaliye"/>
                <StatCircle type="green"  label="TAMAMLANDI" val={mk_tam} sub="İrsaliye"/>
              </div>
              <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 16px rgba(11,47,120,0.05)"}}>
                <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:900,fontSize:16,color:C.navy}}><span>📦</span> İRSALİYE LİSTESİ</div>
                  <div style={{fontSize:12,color:C.muted,fontWeight:700}}>{MK_DATA.length} kayıt</div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["İrsaliye No","Tedarikçi","Giriş Tarihi","Durum","Açıklama",""].map((h,i)=><th key={i} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {MK_DATA.map((r,i)=>(
                      <tr key={i} style={{background:i%2===0?"#fff":"#FBFCFF"}}>
                        <td style={{...S.td,fontWeight:800,color:C.navy}}>{r.no}</td>
                        <td style={S.td}>{r.tedarikci}</td>
                        <td style={S.td}>{r.tarih}</td>
                        <td style={S.td}>{durum_badge(r.type,r.durum)}</td>
                        <td style={{...S.td,color:C.muted,fontWeight:600}}>{r.aciklama}</td>
                        <td style={{...S.td,textAlign:"center",color:C.muted,cursor:"pointer",fontSize:18}}>⋮</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div style={S.sideCard}>
                <div style={{fontWeight:900,fontSize:15,marginBottom:16,letterSpacing:0.5}}>GÜN SONU ÖZETİ</div>
                {[["Toplam İrsaliye",mk_tot,"#fff"],["Başlamadı",mk_bas,C.red],["İşlemde",mk_isl,C.yellow],["Tamamlandı",mk_tam,C.green]].map(([l,v,c])=>(
                  <div key={l as string} style={S.sideRow}>
                    <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.75)"}}>{l}</span>
                    <span style={{fontSize:16,fontWeight:900,color:c as string}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:12,fontSize:22,opacity:0.3,textAlign:"center"}}>🏭 📦 🏭</div>
              </div>
              <ContactCard/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactCard(){
  return(
    <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:16,padding:"16px 18px",boxShadow:"0 4px 16px rgba(11,47,120,0.05)"}}>
      {[
        {icon:"📍",text:"Akçaburgaz Mah. 3126. Sk. No: 10/1 DMN Plaza Kat:2 Esenyurt / İSTANBUL"},
        {icon:"📞",text:"+90 537 952 06 13"},
        {icon:"📠",text:"+90 212 632 59 65 (Fax)"},
        {icon:"💬",text:"90 537 952 06 13"},
        {icon:"✉️",text:"info@basariotomotive.com"},
      ].map(({icon,text},i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",borderBottom:i<4?"1px solid #F1F5F9":"none"}}>
          <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{icon}</span>
          <span style={{fontSize:12,fontWeight:600,color:"#475569",lineHeight:1.4}}>{text}</span>
        </div>
      ))}
    </div>
  );
}
