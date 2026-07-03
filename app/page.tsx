"use client";

// ─── Renkler & Sabitler ───────────────────────────────────────────────────────
const C = {
  navy:    "#0B2F78",
  navyDk:  "#082A5B",
  blue50:  "#EAF3FF",
  pageBg:  "#F8FAFD",
  white:   "#FFFFFF",
  border:  "#E3EAF3",
  green:   "#22C55E",
  greenDk: "#16A34A",
  text:    "#102A43",
  sub:     "#6B7C93",
  amber:   "#D68A1F",
  shadow:  "0 10px 30px rgba(16,42,67,0.08)",
  shadowMd:"0 16px 40px rgba(16,42,67,0.12)",
};

const R = { card:18, btn:12, inp:10 };

type Tab = "yurtici"|"ihracat"|"malkabul";

export default function App() {
  const [tab, setTab] = (require("react") as any).useState<Tab>("yurtici");

  const longDate = new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});

  const styles: Record<string,React.CSSProperties> = {

    /* Sayfa */
    page:{
      minHeight:"100vh", width:"100%",
      background:C.pageBg,
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif",
      color:C.text, overflowX:"hidden",
    },

    /* Arka plan dekoratif */
    bgWrap:{
      position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:0,
      backgroundImage:"url('/background-logistics.jpg')",
      backgroundSize:"cover", backgroundPosition:"center",
      opacity:0.06,
    },
    bgOverlay:{
      position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:1,
      background:`linear-gradient(135deg,rgba(248,250,253,0.96) 0%,rgba(234,243,255,0.92) 50%,rgba(248,250,253,0.94) 100%)`,
    },

    /* Header */
    header:{
      height:90, background:"rgba(255,255,255,0.98)",
      borderBottom:`1px solid ${C.border}`,
      boxShadow:"0 2px 12px rgba(11,47,120,0.06)",
      position:"sticky", top:0, zIndex:100,
    },
    headerInner:{
      maxWidth:1320, margin:"0 auto", height:"100%",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 40px", boxSizing:"border-box",
    },
    headerLeft:{ display:"flex", alignItems:"center", gap:24 },
    logo:{ height:52, width:"auto", objectFit:"contain" },
    hDiv:{ width:1, height:44, background:C.border, flexShrink:0 },
    pageTitle:{
      display:"flex", alignItems:"center", gap:10,
      fontSize:20, fontWeight:700, color:C.text,
    },
    pageDate:{ color:C.amber, fontWeight:800 },
    headerRight:{ display:"flex", alignItems:"center", gap:12 },
    ico:{
      width:44, height:44, borderRadius:"50%",
      border:`1px solid ${C.border}`, background:C.white,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:19, cursor:"pointer", position:"relative",
      color:C.text, fontWeight:700,
    },
    badge:{
      position:"absolute", top:-6, right:-4,
      width:20, height:20, borderRadius:"50%",
      background:"#F59E0B", color:C.white,
      fontSize:11, fontWeight:900,
      display:"flex", alignItems:"center", justifyContent:"center",
    },

    /* Main */
    main:{ position:"relative", zIndex:2, paddingTop:36, paddingBottom:80 },
    container:{ maxWidth:1320, margin:"0 auto", padding:"0 40px", boxSizing:"border-box" },

    /* Tab satırı */
    tabRowWrap:{ maxWidth:1160, margin:"0 auto 32px" },
    tabRow:{
      display:"grid", gridTemplateColumns:"1fr 180px",
      gap:20, alignItems:"stretch", height:72,
    },
    tabsCard:{
      display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
      background:C.white, border:`1px solid ${C.border}`,
      borderRadius:R.card, boxShadow:C.shadow, overflow:"hidden", height:72,
    },
    tab:{
      border:"none", background:"transparent",
      fontSize:16, fontWeight:700, color:C.sub,
      display:"flex", alignItems:"center", justifyContent:"center",
      gap:9, cursor:"pointer", position:"relative",
      fontFamily:"inherit", height:"100%", transition:"all 0.18s",
    },
    tabActive:{
      background:C.navyDk,
      color:C.white,
    },
    tabTriangle:{
      position:"absolute", bottom:-10, left:"50%",
      transform:"translateX(-50%)",
      width:0, height:0,
      borderLeft:"10px solid transparent",
      borderRight:"10px solid transparent",
      borderTop:`10px solid ${C.navyDk}`,
    },
    saveBtn:{
      height:72, width:"100%", border:"none",
      borderRadius:R.card, cursor:"pointer",
      background:`linear-gradient(135deg,${C.green} 0%,${C.greenDk} 100%)`,
      color:C.white, fontSize:17, fontWeight:900,
      display:"flex", alignItems:"center", justifyContent:"center",
      gap:8, boxShadow:"0 14px 28px rgba(22,163,74,0.25)",
      fontFamily:"inherit",
    },

    /* Upload Kartı */
    uploadCard:{
      maxWidth:820, margin:"0 auto 24px",
      background:C.white, border:`1px solid ${C.border}`,
      borderRadius:R.card, boxShadow:C.shadow,
      padding:"28px 32px 20px", boxSizing:"border-box",
    },
    uploadTitle:{
      display:"flex", alignItems:"center", gap:10,
      fontSize:15, fontWeight:800, color:C.navy,
      letterSpacing:0.5, marginBottom:20,
    },
    uploadBox:{
      border:`2px dashed ${C.border}`,
      borderRadius:16, padding:"32px 24px",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:C.blue50, cursor:"pointer",
      gap:4, transition:"border-color 0.2s",
      textAlign:"center",
    },
    uploadIcon:{ fontSize:40, lineHeight:1, marginBottom:12, color:"#B97D0F" },
    uploadName:{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 },
    uploadSub:{ fontSize:13, fontWeight:600, color:C.sub, marginBottom:16 },
    uploadBtn:{
      height:38, padding:"0 24px",
      border:`1px solid ${C.border}`,
      borderRadius:R.btn, background:C.white,
      color:C.navy, fontSize:14, fontWeight:800,
      display:"flex", alignItems:"center", gap:8,
      cursor:"pointer", fontFamily:"inherit",
    },
    uploadHelper:{
      marginTop:16, textAlign:"center",
      color:C.sub, fontSize:13, fontWeight:600,
    },

    /* Stats */
    statsRow:{
      maxWidth:820, margin:"0 auto 24px",
      display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16,
    },
    statCard:{
      background:C.white, border:`1px solid ${C.border}`,
      borderRadius:R.card, boxShadow:C.shadow,
      padding:"20px 24px", boxSizing:"border-box",
      display:"flex", alignItems:"center", gap:18,
    },
    statIcon:{
      width:56, height:56, borderRadius:14,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:26, flexShrink:0,
    },
    statLabel:{ fontSize:14, fontWeight:600, color:C.sub, marginBottom:4 },
    statNum:{ fontSize:40, fontWeight:900, color:C.text, lineHeight:1 },

    /* Form Kartı */
    formCard:{
      maxWidth:820, margin:"0 auto 24px",
      background:C.white, border:`1px solid ${C.border}`,
      borderRadius:R.card, boxShadow:C.shadowMd,
      padding:"24px 28px 20px", boxSizing:"border-box",
    },
    field:{
      height:52, border:`1px solid ${C.border}`,
      borderRadius:R.inp, background:C.white,
      display:"flex", alignItems:"center",
      padding:"0 16px", gap:12, boxSizing:"border-box", marginBottom:10,
    },
    addBtn:{
      height:52, width:"100%", border:"none",
      borderRadius:R.btn,
      background:`linear-gradient(135deg,${C.navy} 0%,${C.navyDk} 100%)`,
      color:C.white, fontSize:16, fontWeight:900,
      display:"flex", alignItems:"center", justifyContent:"center",
      gap:10, marginTop:14, cursor:"pointer", fontFamily:"inherit",
    },

    /* Success */
    successBanner:{
      maxWidth:820, margin:"0 auto",
      minHeight:64, background:"#F0FDF4",
      border:"1px solid #C6F6D5", borderRadius:R.card,
      boxShadow:C.shadow,
      display:"flex", alignItems:"center", justifyContent:"center",
      gap:16, color:C.greenDk, fontSize:17, fontWeight:700,
      padding:"12px 24px",
    },
    checkCircle:{
      width:36, height:36, borderRadius:"50%",
      background:C.green, color:C.white,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontWeight:900, fontSize:20, flexShrink:0,
    },

    /* Boş / Row */
    emptyBox:{
      maxWidth:820, margin:"0 auto 20px",
      background:C.white, border:`1px solid ${C.border}`,
      borderRadius:R.card, boxShadow:C.shadow,
      padding:"40px 24px", textAlign:"center",
      color:C.sub, fontSize:16, fontWeight:600,
    },
    rowCard:{
      maxWidth:820, margin:"0 auto 12px",
      background:C.white, border:`1px solid ${C.border}`,
      borderRadius:14, boxShadow:C.shadow,
      padding:"16px 22px", boxSizing:"border-box",
      display:"flex", alignItems:"flex-start",
      justifyContent:"space-between", gap:16,
    },
  };

  /* Upload içerik — sekmeye göre */
  const uploadContent: Record<Tab,{title:string;icon:string;name:string}> = {
    yurtici:  { title:"YURTİÇİ — ZEUS'TAN EXCEL YÜKLEME",  icon:"📋", name:"Yurtiçi İş Talepleri" },
    ihracat:  { title:"İHRACAT — ZEUS'TAN EXCEL YÜKLEME",  icon:"🌐", name:"İhracat İş Talepleri" },
    malkabul: { title:"MAL KABUL — ZEUS'TAN EXCEL YÜKLEME",icon:"📦", name:"Mal Kabul Exceli" },
  };
  const uc = uploadContent[tab];

  return (
    <div style={styles.page}>
      <div style={styles.bgWrap}/>
      <div style={styles.bgOverlay}/>

      {/* ── HEADER ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full-color.png" alt="Başarı Otomotiv" style={styles.logo}/>
            <div style={styles.hDiv}/>
            <div style={styles.pageTitle}>
              <span style={{fontSize:20}}>📅</span>
              <span>Gün Sonu İzleme</span>
              <span style={{color:C.border,fontSize:18}}>•</span>
              <span style={styles.pageDate}>{longDate}</span>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.ico}>🔔<span style={styles.badge}>1</span></div>
            <div style={styles.ico}>?</div>
            <div style={{...styles.ico,fontSize:14,fontWeight:900,width:48,height:48}}>BO</div>
            <span style={{color:C.sub,fontWeight:900,fontSize:16,cursor:"pointer"}}>⌄</span>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={styles.main}>
        <div style={styles.container}>

          {/* Sekme Satırı */}
          <div style={styles.tabRowWrap}>
            <div style={styles.tabRow}>
              <div style={styles.tabsCard}>
                {([
                  ["yurtici","🚚","Yurtiçi"],
                  ["ihracat","🌐","İhracat"],
                  ["malkabul","📦","Mal Kabul"],
                ] as const).map(([k,ic,lb])=>(
                  <button key={k}
                    onClick={()=>setTab(k as Tab)}
                    style={tab===k?{...styles.tab,...styles.tabActive}:styles.tab}>
                    <span style={{fontSize:22}}>{ic}</span>
                    {lb}
                    {tab===k&&<span style={styles.tabTriangle}/>}
                  </button>
                ))}
              </div>
              <button style={styles.saveBtn}>
                <span style={{fontSize:22}}>💾</span>
                Kaydet ve Paylaş
              </button>
            </div>
          </div>

          {/* ── UPLOAD KARTI — Sekmeye Göre Tek Kutu ── */}
          <div style={styles.uploadCard}>
            <div style={styles.uploadTitle}>
              <span>☁️</span>{uc.title}
            </div>
            <div style={styles.uploadBox}>
              <div style={styles.uploadIcon}>{uc.icon}</div>
              <div style={styles.uploadName}>{uc.name}</div>
              <div style={styles.uploadSub}>.xlsx / .xls</div>
              <button style={styles.uploadBtn}>
                <span>☁️</span> Dosya Seç
              </button>
            </div>
            <div style={styles.uploadHelper}>
              ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle
            </div>
          </div>

          {/* ── YURTİÇİ İÇERİĞİ ── */}
          {tab==="yurtici"&&<>
            {/* Sayaç Kartları */}
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={{...styles.statIcon,background:"#EAF3FF",color:"#1A6FD4"}}>📋</div>
                <div>
                  <div style={styles.statLabel}>Sipariş Sayısı</div>
                  <div style={styles.statNum}>0</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{...styles.statIcon,background:"#F3EEFF",color:"#7C3AED"}}>🧾</div>
                <div>
                  <div style={styles.statLabel}>Faturalanan</div>
                  <div style={styles.statNum}>0</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{...styles.statIcon,background:"#EDFAF2",color:C.greenDk}}>
                  <span style={{fontSize:24,fontWeight:900}}>✓</span>
                </div>
                <div>
                  <div style={styles.statLabel}>Kalan</div>
                  <div style={{...styles.statNum,color:C.greenDk}}>0</div>
                </div>
              </div>
            </div>

            {/* Başarı Mesajı */}
            <div style={styles.successBanner}>
              <span style={styles.checkCircle}>✓</span>
              Bekleyen müşteri yok — tüm siparişler faturalandı
            </div>
          </>}

          {/* ── İHRACAT İÇERİĞİ ── */}
          {tab==="ihracat"&&(
            <div style={styles.emptyBox}>
              <div style={{fontSize:36,marginBottom:12}}>✈️</div>
              <div>İhracat dosyası yüklendiğinde siparişler burada görünecek</div>
            </div>
          )}

          {/* ── MAL KABUL İÇERİĞİ ── */}
          {tab==="malkabul"&&(
            <div style={styles.emptyBox}>
              <div style={{fontSize:36,marginBottom:12}}>📦</div>
              <div>Mal kabul dosyası yüklendiğinde irsaliyeler burada görünecek</div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
