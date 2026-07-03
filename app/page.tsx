"use client";
import { useState } from "react";

type Tab = "yurtici" | "ihracat" | "malkabul";

// ─── Stil Nesnesi ─────────────────────────────────────────────────────────────
const D: Record<string, React.CSSProperties> = {
  // 15. min-height:100vh, overflow yok
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#F7FAFF",
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif",
    color: "#0B214A",
    position: "relative",
  },

  // 5-6. Arka plan overlay + opacity:0.38, blur yok
  bgFixed: {
    position: "fixed",
    top: 96,          // 4. header 96px
    left: 0, right: 0, bottom: 0,
    backgroundImage:
      "linear-gradient(90deg,rgba(247,250,255,0.78),rgba(247,250,255,0.88),rgba(247,250,255,0.72)),url('/background-logistics.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.38,   // 6.
    zIndex: 0,
  },

  // 4. Header 96px
  header: {
    height: 96,
    background: "rgba(255,255,255,0.96)",
    borderBottom: "1px solid #E6ECF5",
    boxShadow: "0 4px 20px rgba(11,33,74,0.07)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  // 2. Header içeriği max-width:1320px ortalı
  headerInner: {
    maxWidth: 1320,
    margin: "0 auto",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    boxSizing: "border-box",
  },

  headerLeft: { display: "flex", alignItems: "center", gap: 28 },

  // 3. Logo 54px
  logo: { height: 54, width: "auto", objectFit: "contain" },

  hdivider: { width: 1, height: 46, background: "#D9E2EF", flexShrink: 0 },

  // 19. Başlık font-weight:800
  pageTitle: {
    display: "flex", alignItems: "center", gap: 10,
    fontSize: 21, fontWeight: 800, color: "#0B214A",
  },
  pageDate: { color: "#D38314", fontWeight: 800 },

  headerRight: { display: "flex", alignItems: "center", gap: 14 },

  icoCircle: {
    width: 44, height: 44, borderRadius: "50%", border: "1px solid #D9E2EF",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#FFFFFF", position: "relative",
    fontWeight: 700, color: "#0B214A", fontSize: 19, cursor: "pointer",
  },

  badge: {
    position: "absolute", top: -7, right: -4, width: 22, height: 22,
    borderRadius: "50%", background: "#E4A13A", color: "#FFFFFF",
    fontSize: 11, fontWeight: 900,
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  main: { position: "relative", zIndex: 2 },

  // 1. padding-top:40px  20. padding-bottom:80px
  container: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "40px 36px 80px",
    boxSizing: "border-box",
  },

  // 7-8. Tab satırı: margin-top:22px, max-width:1160px ortalı
  tabRow: {
    display: "grid",
    gridTemplateColumns: "1fr 164px",
    gap: 24,
    alignItems: "stretch",
    marginTop: 22,
    marginBottom: 0,
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: 1160,
    height: 70,
  },

  tabsCard: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid #DCE5F1",
    borderRadius: 18,    // 18.
    boxShadow: "0 16px 40px rgba(11,33,74,0.10)",   // 16.
    overflow: "hidden",
    height: 70,
  },

  // 19. Normal yazılar font-weight:600
  tabBtn: {
    border: "none", background: "transparent",
    fontSize: 17, fontWeight: 700, color: "#5A7299",
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, cursor: "pointer", position: "relative",
    fontFamily: "inherit", height: "100%",
  },

  // 17. Aktif tab gradient
  tabActive: {
    background: "linear-gradient(135deg,#0E9EF8 0%,#064A9B 100%)",
    color: "#FFFFFF",
    boxShadow: "0 12px 26px rgba(0,72,152,0.22)",
  },

  tabTriangle: {
    position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
    width: 0, height: 0,
    borderLeft: "10px solid transparent",
    borderRight: "10px solid transparent",
    borderTop: "10px solid #064A9B",
  },

  sendBtn: {
    height: 70, width: "100%", border: "none", borderRadius: 18,
    background: "linear-gradient(135deg,#25C964 0%,#0DA044 100%)",
    color: "#FFFFFF", fontSize: 19, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, boxShadow: "0 14px 28px rgba(13,160,68,0.28)",
    cursor: "pointer", fontFamily: "inherit",
  },

  // 9-10. Upload kartı margin-top:28px, width:820px, 16. shadow, 18. radius
  uploadCard: {
    width: 820,
    margin: "28px auto 20px",
    background: "rgba(255,255,255,0.97)",
    border: "1px solid #E2E9F3",
    borderRadius: 18,
    boxShadow: "0 16px 40px rgba(11,33,74,0.10)",
    padding: "26px 30px 18px",
    boxSizing: "border-box",
  },

  // 19. Section başlık 800
  secTitle: {
    display: "flex", alignItems: "center", gap: 10,
    color: "#0B3A75", fontSize: 17, fontWeight: 800, marginBottom: 18,
  },

  // 11. 2 kutu — 2 kolon
  uploadGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },

  uploadBox: {
    height: 154, border: "2px dashed #C9D5E5", borderRadius: 16,
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", background: "rgba(255,255,255,0.75)",
    cursor: "default", gap: 2,
  },

  uIcon:  { fontSize: 36, color: "#D48A20", lineHeight: 1, marginBottom: 8 },
  uTitle: { fontSize: 17, fontWeight: 800, color: "#0B214A", marginBottom: 2 },
  uSub:   { fontSize: 13, color: "#2B68A5", marginBottom: 12 },

  uBtn: {
    height: 34, padding: "0 20px", borderRadius: 8,
    border: "1px solid #BFD0E6", background: "#FFFFFF", color: "#0B3A75",
    fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center",
    gap: 7, cursor: "pointer", fontFamily: "inherit",
  },

  helper: {
    marginTop: 14, textAlign: "center", color: "#3D6E9E",
    fontSize: 14, fontWeight: 600,
  },

  // 12. Stats 820px, 16. shadow, 18. radius
  statsRow: {
    width: 820,
    margin: "0 auto 20px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
  },

  statCard: {
    minHeight: 100,
    background: "rgba(255,255,255,0.97)",
    border: "1px solid #E1E9F4",
    borderRadius: 18,
    boxShadow: "0 16px 40px rgba(11,33,74,0.10)",
    display: "flex", alignItems: "center",
    padding: "0 26px", gap: 22, boxSizing: "border-box",
  },

  statIcon: {
    width: 58, height: 58, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 28, fontWeight: 900, flexShrink: 0,
  },

  statLabel: { fontSize: 15, color: "#27527E", fontWeight: 600, marginBottom: 4 },
  statNum:   { fontSize: 40, color: "#071E42", fontWeight: 900, lineHeight: 1 },

  // 14. Form kartı width:820px, padding:22px, 16. shadow, 18. radius
  formCard: {
    width: 820,
    margin: "0 auto 20px",
    background: "rgba(255,255,255,0.97)",
    border: "1px solid #E1E9F4",
    borderRadius: 18,
    boxShadow: "0 16px 40px rgba(11,33,74,0.10)",
    padding: 22,
    boxSizing: "border-box",
  },

  formTitle: {
    color: "#D48415", fontSize: 17, fontWeight: 800, marginBottom: 16,
    display: "flex", alignItems: "center", gap: 8,
  },

  // 13. input yüksekliği 48px
  field: {
    height: 48, border: "1px solid #C9D7E8", borderRadius: 11,
    background: "#FFFFFF", display: "flex", alignItems: "center",
    padding: "0 16px", gap: 12, boxSizing: "border-box", marginBottom: 10,
  },

  fLabel: { color: "#31567F", fontSize: 13, fontWeight: 700, lineHeight: 1.1 },
  fSub:   { color: "#8A99AF", fontSize: 14, marginTop: 1 },
  row2:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  addBtn: {
    height: 50, width: "100%", border: "none", borderRadius: 10,
    background: "linear-gradient(135deg,#082A5B 0%,#001C40 100%)",
    color: "#FFFFFF", fontSize: 17, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, marginTop: 10, cursor: "pointer", fontFamily: "inherit",
  },

  // 18. radius, 16. shadow
  successBanner: {
    width: 820, margin: "0 auto 16px", minHeight: 62,
    background: "rgba(245,255,249,0.97)", border: "1px solid #CDECD8",
    borderRadius: 18, boxShadow: "0 16px 40px rgba(11,33,74,0.10)",
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 16, color: "#0B8F3C", fontSize: 17, fontWeight: 800,
    padding: "12px 24px",
  },

  checkCircle: {
    width: 36, height: 36, borderRadius: "50%", background: "#2FC35E",
    color: "#FFFFFF", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 900, fontSize: 20, flexShrink: 0,
  },
};

// ─── Statik Upload Kutusu ─────────────────────────────────────────────────────
function UpBox({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={D.uploadBox}>
      <div style={D.uIcon}>{icon}</div>
      <div style={D.uTitle}>{title}</div>
      <div style={D.uSub}>.xlsx / .xls</div>
      <button style={D.uBtn}>☁️ Dosya Seç</button>
    </div>
  );
}

// ─── Statik Form Alanı ────────────────────────────────────────────────────────
function FField({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div style={D.field}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={D.fLabel}>{label}</div>
        <div style={D.fSub}>{sub}</div>
      </div>
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>("yurtici");
  const longDate = new Date().toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={D.page}>
      {/* Sabit arka plan */}
      <div style={D.bgFixed} />

      {/* HEADER — 96px */}
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
            <div style={D.icoCircle}>🔔<span style={D.badge}>1</span></div>
            <div style={D.icoCircle}>?</div>
            <div style={D.icoCircle}>BO</div>
            <span style={{ color: "#0B214A", fontWeight: 900, fontSize: 18, cursor: "pointer" }}>⌄</span>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <main style={D.main}>
        <div style={D.container}>

          {/* SEKME SATIRI — max-width:1160px, margin-top:22px */}
          <div style={D.tabRow}>
            <div style={D.tabsCard}>
              {([ ["yurtici","🚚","Yurtiçi"], ["ihracat","🌐","İhracat"], ["malkabul","📦","Mal Kabul"] ] as const).map(([k, ic, lb]) => (
                <button key={k} onClick={() => setTab(k as Tab)}
                  style={tab === k ? { ...D.tabBtn, ...D.tabActive } : D.tabBtn}>
                  <span style={{ fontSize: 22 }}>{ic}</span>
                  {lb}
                  {tab === k && <span style={D.tabTriangle} />}
                </button>
              ))}
            </div>
            <button style={D.sendBtn}>
              <span style={{ fontSize: 26 }}>⇧</span>Gönder
            </button>
          </div>

          {/* ══ YURTİÇİ ══ */}
          {tab === "yurtici" && <>

            {/* Upload — 820px, 2 kutu */}
            <div style={D.uploadCard}>
              <div style={D.secTitle}><span>☁️</span>ZEUS'TAN EXCEL YÜKLEME</div>
              {/* 11. Sadece 2 kutu: İş Talepleri + İrsaliye */}
              <div style={D.uploadGrid2}>
                <UpBox icon="📋" title="İş Talepleri" />
                <UpBox icon="📦" title="İrsaliye" />
              </div>
              <div style={D.helper}>ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle</div>
            </div>

            {/* Sayaçlar — 820px */}
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
                <div style={{ ...D.statIcon, background: "#EAF9EF", color: "#16A34A", fontSize: 26 }}>✓</div>
                <div>
                  <div style={D.statLabel}>Kalan</div>
                  <div style={{ ...D.statNum, color: "#16A34A" }}>0</div>
                </div>
              </div>
            </div>

            {/* Form — 820px, padding:22px */}
            <div style={D.formCard}>
              <div style={D.formTitle}><span>＋</span>BEKLEYEN MÜŞTERİ EKLE</div>
              <FField icon="👤" label="Müşteri Adı *" sub="Müşteri adını giriniz" />
              {/* Dropdown */}
              <div style={{ ...D.field, justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>📦</span>
                  <div style={{ ...D.fSub, color: "#0B214A", fontWeight: 700 }}>— Seçin —</div>
                </div>
                <span style={{ color: "#0B214A", fontWeight: 900, fontSize: 18 }}>⌄</span>
              </div>
              <div style={D.row2}>
                <FField icon="◇" label="SKU" sub="SKU" />
                <FField icon="▤" label="Adet" sub="Adet" />
              </div>
              <FField icon="▣" label="Not (isteğe bağlı)" sub="Not giriniz (isteğe bağlı)" />
              <button style={D.addBtn}>
                <span style={{ color: "#F2AD32", fontSize: 22 }}>⊕</span>Ekle
              </button>
            </div>

            {/* Success */}
            <div style={D.successBanner}>
              <span style={D.checkCircle}>✓</span>
              Bekleyen müşteri yok — tüm siparişler faturalandı
            </div>
          </>}

          {/* ══ İHRACAT ══ */}
          {tab === "ihracat" && <>
            <div style={D.uploadCard}>
              <div style={D.secTitle}><span>☁️</span>ZEUS'TAN EXCEL YÜKLEME</div>
              <div style={D.uploadGrid2}>
                <UpBox icon="🌐" title="İhracat İş Talepleri" />
                <UpBox icon="📦" title="İrsaliye" />
              </div>
              <div style={D.helper}>ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle</div>
            </div>
            <div style={{ ...D.successBanner, color: "#6b7280", background: "rgba(255,255,255,0.97)", border: "1px solid #E1E9F4" }}>
              <span style={{ fontSize: 30 }}>✈️</span>İhracat siparişi yok
            </div>
            <div style={D.formCard}>
              <div style={D.formTitle}><span>＋</span>MANUEL SİPARİŞ EKLE</div>
              <FField icon="👤" label="Müşteri / Alıcı Adı *" sub="Müşteri adını giriniz" />
              <FField icon="🌍" label="Ülke / Şehir" sub="Ülke veya şehir" />
              <div style={D.row2}>
                <FField icon="◇" label="SKU (Çeşit)" sub="SKU sayısı" />
                <FField icon="▤" label="Adet" sub="Adet" />
              </div>
              <button style={D.addBtn}><span style={{ color: "#F2AD32", fontSize: 22 }}>⊕</span>Ekle</button>
            </div>
          </>}

          {/* ══ MAL KABUL ══ */}
          {tab === "malkabul" && <>
            <div style={D.uploadCard}>
              <div style={D.secTitle}><span>☁️</span>ZEUS'TAN EXCEL YÜKLEME</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
                <UpBox icon="📦" title="İrsaliye" />
              </div>
              <div style={D.helper}>ⓘ Zeus → Rapor Al → Excel kaydet → Buraya yükle</div>
            </div>
            <div style={{ ...D.successBanner, color: "#6b7280", background: "rgba(255,255,255,0.97)", border: "1px solid #E1E9F4" }}>
              <span style={{ fontSize: 30 }}>📦</span>Mal kabul kaydı yok
            </div>
            <div style={D.formCard}>
              <div style={D.formTitle}><span>＋</span>MANUEL MAL KABUL EKLE</div>
              <FField icon="🏭" label="Firma Adı *" sub="Firma adını giriniz" />
              <div style={D.row2}>
                <FField icon="🏠" label="Depo" sub="Depo seçin" />
                <FField icon="📅" label="Tarih" sub="Tarih seçin" />
              </div>
              <div style={D.row2}>
                <FField icon="📄" label="Belge No" sub="Belge No" />
                <FField icon="▤" label="Adet" sub="Adet" />
              </div>
              <FField icon="◇" label="Durum" sub="Durum seçin" />
              <button style={D.addBtn}><span style={{ color: "#F2AD32", fontSize: 22 }}>⊕</span>Ekle</button>
            </div>
          </>}

        </div>
      </main>
    </div>
  );
}
