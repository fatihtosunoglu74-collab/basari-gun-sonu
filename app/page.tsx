"use client";
import React, { useState } from "react";

export default function BasariGunSonuDashboard() {
  const [activeTab, setActiveTab] = useState("yurtici");

  const today = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  const colors = {
    navy: "#0B2F78", navy2: "#123B91", green: "#22C55E",
    bg: "#F8FAFD", white: "#FFFFFF", text: "#1E293B", muted: "#64748B",
    border: "#E2E8F0", red: "#EF4444", yellow: "#F59E0B",
    softBlue: "#EEF4FF", softGreen: "#ECFDF3", softYellow: "#FFF7E8", softRed: "#FEF2F2",
  };

  const tabs = [
    { id: "yurtici",  label: "Yurtiçi"  },
    { id: "ihracat",  label: "İhracat"  },
    { id: "malKabul", label: "Mal Kabul" },
  ];

  const yurticiData = [
    { no: "YT-001", musteri: "İstanbul Bölge", siparis: 240, faturalanan: 210, kalan: 30 },
    { no: "YT-002", musteri: "Ankara Bölge",   siparis: 190, faturalanan: 165, kalan: 25 },
    { no: "YT-003", musteri: "İzmir Bölge",    siparis: 160, faturalanan: 158, kalan:  2 },
  ];

  const ihracatData = [
    { firma: "Auto Balkan",  ulke: "Bulgaristan", termin: "Bugün 17:00", durum: "ZAMANINDA", type: "green"  },
    { firma: "Global Parts", ulke: "Almanya",     termin: "Bugün 18:30", durum: "RİSKLİ",   type: "yellow" },
    { firma: "MENA Trade",   ulke: "BAE",         termin: "Bugün 16:00", durum: "GECİKTİ",  type: "red"    },
  ];

  const malKabulData = [
    { irsaliye: "IRS-1452", tedarikci: "Martaş Otomotiv",    durum: "BAŞLAMADI",  type: "red"    },
    { irsaliye: "IRS-1453", tedarikci: "Başarı İthalat",     durum: "İŞLEMDE",    type: "yellow" },
    { irsaliye: "IRS-1454", tedarikci: "Arıcıoğlu Otomotiv", durum: "TAMAMLANDI", type: "green"  },
  ];

  const badgeStyle = (type: string): React.CSSProperties => {
    if (type === "green")  return { backgroundColor: colors.softGreen,  color: "#15803D", border: "1px solid #BBF7D0" };
    if (type === "yellow") return { backgroundColor: colors.softYellow, color: "#B45309", border: "1px solid #FDE68A" };
    return { backgroundColor: colors.softRed, color: "#B91C1C", border: "1px solid #FECACA" };
  };

  const S: Record<string, React.CSSProperties> = {
    page:      { minHeight: "100vh", background: colors.bg, padding: "24px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif', color: colors.text },
    container: { maxWidth: "1400px", margin: "0 auto" },
    header:    { background: colors.white, border: `1px solid ${colors.border}`, borderRadius: "22px", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(11,47,120,0.06)", marginBottom: "18px" },
    headerLeft:{ display: "flex", alignItems: "center", gap: "16px" },
    logoWrap:  { width: "180px", height: "54px", borderRadius: "14px", background: "#F3F7FF", border: "1px solid #D7E3FB", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
    titleArea: { display: "flex", flexDirection: "column", gap: "4px" },
    title:     { margin: 0, fontSize: "24px", fontWeight: 900, color: colors.navy, letterSpacing: "-0.5px" },
    subtitle:  { margin: 0, fontSize: "13px", color: colors.muted, fontWeight: 600 },
    headerRight:{ display: "flex", alignItems: "center", gap: "10px" },
    iconBtn:   { width: "42px", height: "42px", borderRadius: "14px", border: `1px solid ${colors.border}`, background: "#F8FBFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", cursor: "pointer", position: "relative" },
    notifBadge:{ position: "absolute", top: -5, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#F59E0B", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" },
    userBox:   { height: "42px", padding: "0 14px", borderRadius: "14px", border: `1px solid ${colors.border}`, background: "#F8FBFF", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 800 },
    userAvatar:{ width: "28px", height: "28px", borderRadius: "50%", background: colors.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 },
    hero:      { background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navy2} 100%)`, borderRadius: "24px", padding: "24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "stretch", gap: "20px", marginBottom: "18px", boxShadow: "0 18px 40px rgba(11,47,120,0.18)" },
    heroLeft:  { flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "180px" },
    heroKicker:{ display: "inline-flex", alignItems: "center", gap: "8px", width: "fit-content", padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", fontSize: "12px", fontWeight: 800 },
    heroTitle: { margin: "16px 0 8px", fontSize: "32px", lineHeight: 1.15, fontWeight: 900, letterSpacing: "-0.8px" },
    heroText:  { margin: 0, maxWidth: "700px", color: "rgba(255,255,255,0.82)", fontSize: "14px", lineHeight: 1.6, fontWeight: 500 },
    heroTags:  { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "18px" },
    heroTag:   { padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", fontSize: "12px", fontWeight: 800 },
    heroRight: { width: "370px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    miniVisual:{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "18px", padding: "16px", minHeight: "84px", display: "flex", flexDirection: "column", justifyContent: "space-between", backdropFilter: "blur(4px)" },
    miniIcon:  { fontSize: "26px", lineHeight: 1 },
    miniLabel: { fontSize: "13px", fontWeight: 800, color: "#fff" },
    topRow:    { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "16px" },
    tabsWrap:  { display: "flex", gap: "8px", background: colors.white, border: `1px solid ${colors.border}`, borderRadius: "18px", padding: "6px", boxShadow: "0 8px 24px rgba(11,47,120,0.04)" },
    tab:       { border: "none", borderRadius: "14px", padding: "12px 22px", fontSize: "14px", fontWeight: 900, cursor: "pointer", fontFamily: "inherit" },
    saveBtn:   { background: colors.green, color: "#fff", border: "none", borderRadius: "16px", padding: "14px 22px", fontWeight: 900, fontSize: "14px", cursor: "pointer", boxShadow: "0 12px 24px rgba(34,197,94,0.22)", whiteSpace: "nowrap", fontFamily: "inherit" },
    uploadBar: { background: colors.white, border: "1px dashed #BFD0EE", borderRadius: "18px", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", boxShadow: "0 8px 24px rgba(11,47,120,0.04)" },
    uploadLeft:{ display: "flex", alignItems: "center", gap: "14px" },
    uploadIcon:{ width: "44px", height: "44px", borderRadius: "14px", background: colors.softBlue, display: "flex", alignItems: "center", justifyContent: "center", color: colors.navy, fontSize: "20px" },
    uploadTitle:{ margin: 0, fontSize: "15px", fontWeight: 900, color: colors.text },
    uploadSub: { margin: "4px 0 0", fontSize: "12px", color: colors.muted, fontWeight: 600 },
    uploadBtn: { border: `1px solid ${colors.navy}`, background: "#fff", color: colors.navy, borderRadius: "12px", padding: "11px 16px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "18px" },
    statCard:  { background: colors.white, border: `1px solid ${colors.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 10px 28px rgba(11,47,120,0.05)" },
    statLabel: { margin: 0, color: colors.muted, fontSize: "13px", fontWeight: 800 },
    statValue: { margin: "10px 0 6px", fontSize: "34px", fontWeight: 900, color: colors.navy, letterSpacing: "-1px" },
    statFoot:  { margin: 0, fontSize: "12px", color: colors.muted, fontWeight: 600 },
    card:      { background: colors.white, border: `1px solid ${colors.border}`, borderRadius: "22px", boxShadow: "0 10px 28px rgba(11,47,120,0.05)", overflow: "hidden" },
    cardHeader:{ padding: "18px 20px", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { margin: 0, fontSize: "18px", fontWeight: 900, color: colors.navy },
    cardInfo:  { fontSize: "12px", color: colors.muted, fontWeight: 700 },
    table:     { width: "100%", borderCollapse: "collapse" },
    th:        { padding: "14px 20px", textAlign: "left", fontSize: "12px", color: colors.muted, fontWeight: 900, borderBottom: `1px solid ${colors.border}`, background: "#FBFCFF" },
    td:        { padding: "16px 20px", fontSize: "14px", fontWeight: 700, borderBottom: `1px solid ${colors.border}` },
    badge:     { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "7px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 900, letterSpacing: "0.3px" },
    grid3:     { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
    infoCard:  { background: colors.white, border: `1px solid ${colors.border}`, borderRadius: "20px", padding: "18px", boxShadow: "0 10px 28px rgba(11,47,120,0.05)" },
    infoTitle: { margin: "0 0 4px", fontSize: "17px", fontWeight: 900, color: colors.text },
    infoSub:   { margin: 0, fontSize: "13px", color: colors.muted, fontWeight: 700 },
    infoRow:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" },
  };

  const uploadText = {
    yurtici:  { title: "Yurtiçi Excel Yükleme",   sub: "Sipariş, faturalanan ve kalan verilerini yükleyin.", icon: "📋" },
    ihracat:  { title: "İhracat Excel Yükleme",   sub: "Termin, müşteri ve durum verilerini yükleyin.",       icon: "✈️" },
    malKabul: { title: "Mal Kabul Excel Yükleme", sub: "İrsaliye, tedarikçi ve işlem verilerini yükleyin.",   icon: "📦" },
  }[activeTab] ?? { title: "", sub: "", icon: "📄" };

  return (
    <main style={S.page}>
      <div style={S.container}>

        {/* HEADER */}
        <header style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.logoWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-full-color.png" alt="Başarı Otomotiv"
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "6px" }}/>
            </div>
            <div style={S.titleArea}>
              <h1 style={S.title}>Gün Sonu İzleme</h1>
              <p style={S.subtitle}>{today} · Operasyon Dashboard</p>
            </div>
          </div>
          <div style={S.headerRight}>
            <div style={{ ...S.iconBtn }}>
              🔔
              <span style={S.notifBadge}>2</span>
            </div>
            <div style={S.userBox}>
              <div style={S.userAvatar}>FT</div>
              Fatih Tosunoğlu
            </div>
          </div>
        </header>

        {/* HERO */}
        <section style={S.hero}>
          <div style={S.heroLeft}>
            <div>
              <div style={S.heroKicker}>🚛 Lojistik · 🚢 İhracat · 🏗️ Mal Kabul</div>
              <h2 style={S.heroTitle}>
                Başarı Otomotiv için sade, güçlü ve modern<br/>gün sonu izleme ekranı
              </h2>
              <p style={S.heroText}>
                Yurtiçi siparişler, ihracat terminleri ve mal kabul süreçleri tek ekranda.
                Fazla makyaj yok, gereksiz artistlik yok; direkt iş yapan, kurumsal ve temiz operasyon paneli.
              </p>
            </div>
            <div style={S.heroTags}>
              {["Başarı Otomotiv", "Tır Operasyonları", "Liman & Gemi", "Gün Sonu Takibi"].map(t => (
                <span key={t} style={S.heroTag}>{t}</span>
              ))}
            </div>
          </div>
          <div style={S.heroRight}>
            {[["🚛","Yurtiçi Sevkiyat"],["🚢","İhracat & Liman"],["🏗️","Mal Kabul Süreci"],["🏁","Gün Sonu Kapanış"]].map(([ic,lb])=>(
              <div key={lb as string} style={S.miniVisual}>
                <div style={S.miniIcon}>{ic}</div>
                <div style={S.miniLabel}>{lb}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TAB + KAYDET */}
        <div style={S.topRow}>
          <div style={S.tabsWrap}>
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ ...S.tab, background: active ? colors.navy : "transparent", color: active ? "#fff" : colors.navy, boxShadow: active ? "0 10px 22px rgba(11,47,120,0.16)" : "none" }}>
                  {tab.label}
                </button>
              );
            })}
          </div>
          <button style={S.saveBtn}>💾 Kaydet ve Paylaş</button>
        </div>

        {/* UPLOAD BAR */}
        <div style={S.uploadBar}>
          <div style={S.uploadLeft}>
            <div style={S.uploadIcon}>{uploadText.icon}</div>
            <div>
              <p style={S.uploadTitle}>{uploadText.title}</p>
              <p style={S.uploadSub}>{uploadText.sub}</p>
            </div>
          </div>
          <button style={S.uploadBtn}>Excel Seç</button>
        </div>

        {/* ─── YURTİÇİ ─── */}
        {activeTab === "yurtici" && <>
          <div style={S.statsGrid}>
            {[
              { label: "Sipariş",    val: 590, note: "Toplam yurtiçi sipariş"        },
              { label: "Faturalanan",val: 533, note: "İşlem tamamlanan sipariş"      },
              { label: "Kalan",      val:  57, note: "Gün sonuna kalan sipariş", red: true },
            ].map(({ label, val, note, red }) => (
              <div key={label} style={S.statCard}>
                <p style={S.statLabel}>{label}</p>
                <p style={{ ...S.statValue, color: red && val > 0 ? "#dc2626" : colors.navy }}>{val.toLocaleString("tr-TR")}</p>
                <p style={S.statFoot}>{note}</p>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={S.cardHeader}>
              <h3 style={S.cardTitle}>Sipariş Listesi</h3>
              <div style={S.cardInfo}>Son güncelleme: {new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <table style={S.table}>
              <thead>
                <tr>
                  {["Sipariş No","Müşteri","Sipariş","Faturalanan","Kalan"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yurticiData.map(item => (
                  <tr key={item.no}>
                    <td style={S.td}>{item.no}</td>
                    <td style={S.td}>{item.musteri}</td>
                    <td style={S.td}>{item.siparis}</td>
                    <td style={S.td}>{item.faturalanan}</td>
                    <td style={{ ...S.td, color: item.kalan > 0 ? "#dc2626" : "#15803d", fontWeight: 900 }}>{item.kalan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {/* ─── İHRACAT ─── */}
        {activeTab === "ihracat" && (
          <div style={S.grid3}>
            {ihracatData.map(item => (
              <div key={item.firma} style={S.infoCard}>
                <h3 style={S.infoTitle}>{item.firma}</h3>
                <p style={S.infoSub}>{item.ulke}</p>
                <div style={S.infoRow}>
                  <div>
                    <div style={{ fontSize: "12px", color: colors.muted, fontWeight: 800 }}>Termin</div>
                    <div style={{ marginTop: "6px", fontWeight: 900, color: colors.navy }}>{item.termin}</div>
                  </div>
                  <span style={{ ...S.badge, ...badgeStyle(item.type) }}>{item.durum}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── MAL KABUL ─── */}
        {activeTab === "malKabul" && (
          <div style={S.grid3}>
            {malKabulData.map(item => (
              <div key={item.irsaliye} style={S.infoCard}>
                <h3 style={S.infoTitle}>{item.irsaliye}</h3>
                <p style={S.infoSub}>{item.tedarikci}</p>
                <div style={S.infoRow}>
                  <div style={{ fontSize: "13px", color: colors.muted, fontWeight: 700 }}>İrsaliye İşlem Durumu</div>
                  <span style={{ ...S.badge, ...badgeStyle(item.type) }}>{item.durum}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
