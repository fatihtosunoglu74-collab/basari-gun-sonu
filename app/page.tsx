"use client";

export default function App() {
  const longDate = new Date().toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });

  /* ─────────── STİLLER ─────────── */
  const D: Record<string, React.CSSProperties> = {

    /* Sayfa kökü */
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "#F7FAFF",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Arial, sans-serif",
      color: "#0B214A",
      position: "relative",
      overflowX: "hidden",
    },

    /* Arka plan: blur yok, opacity 0.38, overlay gradient */
    bgImage: {
      position: "fixed",
      top: 96,           /* header yüksekliği */
      left: 0, right: 0, bottom: 0,
      backgroundImage: "url('/background-logistics.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: 0.38,     /* req #6 */
      zIndex: 0,
    },
    bgOverlay: {
      position: "fixed",
      top: 96,
      left: 0, right: 0, bottom: 0,
      background: "linear-gradient(90deg, rgba(247,250,255,0.78), rgba(247,250,255,0.88), rgba(247,250,255,0.72))",   /* req #5 */
      zIndex: 1,
    },

    /* Header — 96px (req #4) */
    header: {
      height: 96,
      background: "rgba(255,255,255,0.97)",
      borderBottom: "1px solid #E6ECF5",
      boxShadow: "0 4px 18px rgba(11,33,74,0.06)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    /* Header içeriği 1320px ortalı (req #2) */
    headerInner: {
      maxWidth: 1320,
      margin: "0 auto",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 36px",
      boxSizing: "border-box",
    },
    headerLeft: { display: "flex", alignItems: "center", gap: 28 },
    logo: { height: 54, width: "auto", objectFit: "contain" },   /* req #3 */
    hdivider: { width: 1, height: 44, background: "#D9E2EF", flexShrink: 0 },
    pageTitle: {
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 21, fontWeight: 800, color: "#0B214A",
    },
    pageDate: { color: "#D38314", fontWeight: 800 },
    headerRight: { display: "flex", alignItems: "center", gap: 14 },
    icoCircle: {
      width: 44, height: 44, borderRadius: "50%",
      border: "1px solid #D9E2EF",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#FFFFFF", position: "relative",
      fontWeight: 700, color: "#0B214A", fontSize: 19, cursor: "pointer",
    },
    badge: {
      position: "absolute", top: -7, right: -4,
      width: 22, height: 22, borderRadius: "50%",
      background: "#E4A13A", color: "#FFFFFF",
      fontSize: 11, fontWeight: 900,
      display: "flex", alignItems: "center", justifyContent: "center",
    },

    /* Main — padding-top 40px, padding-bottom 80px (req #1, #20) */
    main: {
      position: "relative",
      zIndex: 2,
      paddingTop: 40,
      paddingBottom: 80,
    },

    /* Genel içerik container */
    container: {
      maxWidth: 1320,
      margin: "0 auto",
      padding: "0 36px",
      boxSizing: "border-box",
    },

    /* Tab satırı: 1160px ortalı (req #8), margin-top 22px (req #7) */
    tabRowWrap: {
      maxWidth: 1160,
      margin: "22px auto 28px",
    },
    tabRow: {
      display: "grid",
      gridTemplateColumns: "1fr 164px",
      gap: 22,
      alignItems: "stretch",
      height: 70,
    },
    tabsCard: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      background: "rgba(255,255,255,0.93)",
      border: "1px solid #DCE5F1",
      borderRadius: 18,             /* req #18 */
      boxShadow: "0 16px 40px rgba(11,33,74,0.10)",  /* req #16 */
      overflow: "hidden",
      height: 70,
    },
    tab: {
      border: "none", background: "transparent",
      fontSize: 17, fontWeight: 800,    /* req #19 */
      color: "#5A7299",
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 10, cursor: "pointer", position: "relative",
      fontFamily: "inherit", height: "100%",
    },
    tabActive: {
      background: "linear-gradient(135deg, #0E9EF8 0%, #064A9B 100%)",  /* req #17 */
      color: "#FFFFFF",
      boxShadow: "0 12px 26px rgba(0,72,152,0.22)",
    },
    tabTriangle: {
      position: "absolute", bottom: -10, left: "50%",
      transform: "translateX(-50%)",
      width: 0, height: 0,
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: "10px solid #064A9B",
    },
    sendBtn: {
      height: 70, width: "100%", border: "none",
      borderRadius: 18,
      background: "linear-gradient(135deg, #25C964 0%, #0DA044 100%)",
      color: "#FFFFFF", fontSize: 19, fontWeight: 900,
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 10,
      boxShadow: "0 14px 28px rgba(13,160,68,0.28)",
      cursor: "pointer", fontFamily: "inherit",
    },

    /* Upload kartı — 820px, margin-top 28px (req #9, #10) */
    uploadCard: {
      width: 820,
      margin: "28px auto 20px",
      background: "rgba(255,255,255,0.97)",
      border: "1px solid #E2E9F3",
      borderRadius: 18,               /* req #18 */
      boxShadow: "0 16px 40px rgba(11,33,74,0.10)",  /* req #16 */
      padding: "24px 28px 18px",
      boxSizing: "border-box",
    },
    secTitle: {
      display: "flex", alignItems: "center", gap: 10,
      color: "#0B3A75", fontSize: 16, fontWeight: 800,   /* req #19 */
      marginBottom: 18,
    },
    /* 2 kutu grid (req #11) */
    uploadGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18,
    },
    uploadBox: {
      height: 154,
      border: "2px dashed #C9D5E5",
      borderRadius: 14,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "rgba(255,255,255,0.75)",
      cursor: "pointer", gap: 2,
    },
    uIcon: { fontSize: 36, color: "#D48A20", lineHeight: 1, marginBottom: 8 },
    uTitle: { fontSize: 17, fontWeight: 800, color: "#0B214A", marginBottom: 2 },  /* req #19 */
    uSub: { fontSize: 13, fontWeight: 600, color: "#2B68A5", marginBottom: 12 },
    uBtn: {
      height: 34, padding: "0 20px", borderRadius: 8,
      border: "1px solid #BFD0E6", background: "#FFFFFF",
      color: "#0B3A75", fontSize: 14, fontWeight: 800,
      display: "flex", alignItems: "center", gap: 7,
      cursor: "pointer", fontFamily: "inherit",
    },
    helper: {
      marginTop: 14, textAlign: "center",
      color: "#3D6E9E", fontSize: 14, fontWeight: 600,
    },

    /* Stats — 820px (req #12) */
    statsRow: {
      width: 820,
      margin: "0 auto 20px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 16,
    },
    statCard: {
      height: 104,
      background: "rgba(255,255,255,0.97)",
      border: "1px solid #E1E9F4",
      borderRadius: 18,               /* req #18 */
      boxShadow: "0 16px 40px rgba(11,33,74,0.10)",  /* req #16 */
      display: "flex", alignItems: "center",
      padding: "0 24px", gap: 20, boxSizing: "border-box",
    },
    statIcon: {
      width: 58, height: 58, borderRadius: 14,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 28, fontWeight: 900, flexShrink: 0,
    },
    statLabel: { fontSize: 15, color: "#27527E", fontWeight: 600, marginBottom: 4 },  /* req #19 */
    statNum: { fontSize: 40, color: "#071E42", fontWeight: 900, lineHeight: 1 },

    /* Form kartı — 820px, padding 22px (req #14) */
    formCard: {
      width: 820,
      margin: "0 auto 20px",
      background: "rgba(255,255,255,0.97)",
      border: "1px solid #E1E9F4",
      borderRadius: 18,               /* req #18 */
      boxShadow: "0 16px 40px rgba(11,33,74,0.10)",  /* req #16 */
      padding: 22,                    /* req #14 */
      boxSizing: "border-box",
    },
    formTitle: {
      color: "#D48415", fontSize: 17, fontWeight: 800,   /* req #19 */
      marginBottom: 16,
      display: "flex", alignItems: "center", gap: 8,
    },
    /* input yüksekliği 48px (req #13) */
    field: {
      height: 48,
      border: "1px solid #C9D7E8",
      borderRadius: 10,
      background: "#FFFFFF",
      display: "flex", alignItems: "center",
      padding: "0 16px", gap: 12,
      boxSizing: "border-box", marginBottom: 10,
    },
    fLabel: { color: "#31567F", fontSize: 12, fontWeight: 800, lineHeight: 1.1 },
    fSub: { color: "#8A99AF", fontSize: 14, fontWeight: 600, marginTop: 1 },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    addBtn: {
      height: 52, width: "100%", border: "none",
      borderRadius: 10,
      background: "linear-gradient(135deg, #082A5B 0%, #001C40 100%)",
      color: "#FFFFFF", fontSize: 17, fontWeight: 900,
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 10, marginTop: 12, cursor: "pointer", fontFamily: "inherit",
    },

    /* Başarı banner */
    successBanner: {
      width: 820,
      margin: "0 auto",
      minHeight: 64,
      background: "rgba(245,255,249,0.97)",
      border: "1px solid #CDECD8",
      borderRadius: 18,
      boxShadow: "0 16px 40px rgba(11,33,74,0.10)",
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 16, color: "#0B8F3C", fontSize: 18, fontWeight: 800,
      padding: "12px 24px",
    },
    checkCircle: {
      width: 36, height: 36, borderRadius: "50%",
      background: "#2FC35E", color: "#FFFFFF",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 900, fontSize: 20, flexShrink: 0,
    },
  };

  return (
    <div style={D.page}>
      {/* Arka plan görseli — opacity 0.38, blur yok */}
      <div style={D.bgImage} />
      {/* Gradient overlay */}
      <div style={D.bgOverlay} />

      {/* ── HEADER ── */}
      <header style={D.header}>
        <div style={D.headerInner}>
          <div style={D.headerLeft}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full-color.png" alt="Başarı Otomotiv" style={D.logo} />
            <div style={D.hdivider} />
            <div style={D.pageTitle}>
              <span>📅</span>
              <span>Gün Sonu İzleme</span>
              <span style={{ color: "#CBD5E1" }}>•</span>
              <span style={D.pageDate}>{longDate}</span>
            </div>
          </div>
          <div style={D.headerRight}>
            <div style={D.icoCircle}>
              🔔<span style={D.badge}>1</span>
            </div>
            <div style={D.icoCircle}>?</div>
            <div style={D.icoCircle} style={{ ...D.icoCircle, fontSize: 15 }}>BO</div>
            <span style={{ color: "#0B214A", fontWeight: 900, fontSize: 18, cursor: "pointer" }}>⌄</span>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={D.main}>
        <div style={D.container}>

          {/* Sekme satırı — 1160px ortalı */}
          <div style={D.tabRowWrap}>
            <div style={D.tabRow}>
              <div style={D.tabsCard}>
                {/* Aktif: Yurtiçi */}
                <button style={{ ...D.tab, ...D.tabActive }}>
                  <span style={{ fontSize: 22 }}>🚚</span>Yurtiçi
                  <span style={D.tabTriangle} />
                </button>
                <button style={D.tab}>
                  <span style={{ fontSize: 22 }}>🌐</span>İhracat
                </button>
                <button style={D.tab}>
                  <span style={{ fontSize: 22 }}>📦</span>Mal Kabul
                </button>
              </div>
              <button style={D.sendBtn}>
                <span style={{ fontSize: 26 }}>⇧</span>Gönder
              </button>
            </div>
          </div>

          {/* Excel yükleme kartı — 820px, 2 kutu */}
          <section style={D.uploadCard}>
            <div style={D.secTitle}>
              <span>☁️</span>ZEUS'TAN EXCEL YÜKLEME
            </div>
            <div style={D.uploadGrid}>
              {/* İş Talepleri */}
              <div style={D.uploadBox}>
                <div style={D.uIcon}>📋</div>
                <div style={D.uTitle}>İş Talepleri</div>
                <div style={D.uSub}>.xlsx / .xls</div>
                <button style={D.uBtn}>☁️ Dosya Seç</button>
              </div>
              {/* İrsaliye */}
              <div style={D.uploadBox}>
                <div style={D.uIcon}>📦</div>
                <div style={D.uTitle}>İrsaliye</div>
                <div style={D.uSub}>.xlsx / .xls</div>
                <button style={D.uBtn}>☁️ Dosya Seç</button>
              </div>
            </div>
            <div style={D.helper}>ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle</div>
          </section>

          {/* Sayaç kartları — 820px */}
          <div style={D.statsRow}>
            <div style={D.statCard}>
              <div style={{ ...D.statIcon, background: "#EAF4FF", color: "#0878E8" }}>📋</div>
              <div>
                <div style={D.statLabel}>Sipariş Sayısı</div>
                <div style={D.statNum}>0</div>
              </div>
            </div>
            <div style={D.statCard}>
              <div style={{ ...D.statIcon, background: "#F2ECFF", color: "#7C4DFF" }}>🧾</div>
              <div>
                <div style={D.statLabel}>Faturalanan</div>
                <div style={D.statNum}>0</div>
              </div>
            </div>
            <div style={D.statCard}>
              <div style={{ ...D.statIcon, background: "#EAF9EF", color: "#16A34A", fontSize: 26, fontWeight: 900 }}>✓</div>
              <div>
                <div style={D.statLabel}>Kalan</div>
                <div style={{ ...D.statNum, color: "#16A34A" }}>0</div>
              </div>
            </div>
          </div>

          {/* Form kartı — 820px, padding 22px, input 48px */}
          <section style={D.formCard}>
            <div style={D.formTitle}>
              <span>＋</span>BEKLEYEN MÜŞTERİ EKLE
            </div>

            {/* Müşteri */}
            <div style={D.field}>
              <span style={{ fontSize: 20 }}>👤</span>
              <div style={{ flex: 1 }}>
                <div style={D.fLabel}>Müşteri Adı *</div>
                <div style={D.fSub}>Müşteri adını giriniz</div>
              </div>
            </div>

            {/* Seçin */}
            <div style={{ ...D.field, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <span style={{ fontSize: 20 }}>📦</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#8A99AF" }}>— Seçin —</span>
              </div>
              <span style={{ color: "#0B214A", fontWeight: 900, fontSize: 16 }}>⌄</span>
            </div>

            {/* SKU + Adet */}
            <div style={D.row2}>
              <div style={D.field}>
                <span style={{ fontSize: 20 }}>◇</span>
                <div style={{ flex: 1 }}>
                  <div style={D.fLabel}>SKU</div>
                  <div style={D.fSub}>SKU</div>
                </div>
              </div>
              <div style={D.field}>
                <span style={{ fontSize: 20 }}>▤</span>
                <div style={{ flex: 1 }}>
                  <div style={D.fLabel}>Adet</div>
                  <div style={D.fSub}>Adet</div>
                </div>
              </div>
            </div>

            {/* Not */}
            <div style={D.field}>
              <span style={{ fontSize: 20 }}>▣</span>
              <div style={{ flex: 1 }}>
                <div style={D.fLabel}>Not (isteğe bağlı)</div>
                <div style={D.fSub}>Not giriniz (isteğe bağlı)</div>
              </div>
            </div>

            <button style={D.addBtn}>
              <span style={{ color: "#F2AD32", fontSize: 22 }}>⊕</span>Ekle
            </button>
          </section>

          {/* Başarı banner */}
          <div style={D.successBanner}>
            <span style={D.checkCircle}>✓</span>
            Bekleyen müşteri yok — tüm siparişler faturalandı
          </div>

        </div>
      </main>
    </div>
  );
}
