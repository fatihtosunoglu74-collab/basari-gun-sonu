"use client";
import React, { useState, useRef, useEffect } from "react";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SB_URL = "https://dqoreukmpkxmdputjigy.supabase.co";
const SB_KEY = "sb_publishable_gKwtDDLun7O0UybI4R71cA_xMDT2DX8";
const TABLE  = "gun_sonu_raporlar";

async function sbSave(p: object): Promise<string | null> {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, Prefer: "return=representation" },
      body: JSON.stringify(p),
    });
    const d = await r.json();
    return d[0]?.id ?? null;
  } catch { return null; }
}
async function sbUpdate(id: string, p: object) {
  try {
    await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      body: JSON.stringify(p),
    });
  } catch {}
}
async function sbLoad(id: string) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${TABLE}?id=eq.${id}&select=*`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    });
    const d = await r.json();
    return d[0] ?? null;
  } catch { return null; }
}

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
const sv  = (v: any) => String(v ?? "").trim();
const ns  = (v: any) => { const n = parseFloat(sv(v)); return isNaN(n) ? 0 : Math.round(n); };
const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().split("T")[0];

function xlDate(v: any): string {
  if (!v && v !== 0) return "";
  const s = Math.floor(typeof v === "number" ? v : parseFloat(sv(v)));
  if (isNaN(s) || s < 1) return "";
  const d = new Date(Math.round((s - 25569) * 86400 * 1000));
  return d.toLocaleDateString("tr-TR");
}
function parseTrDate(v: string): string {
  const m = v?.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : todayStr();
}
function terminDurum(ilkTarih: string, sku: number): { durum: string; type: string } {
  if (!ilkTarih) return { durum: "BELİRSİZ", type: "yellow" };
  const gun = sku <= 50 ? 1 : sku <= 100 ? 2 : sku <= 250 ? 4 : 7;
  const son = new Date(ilkTarih); son.setDate(son.getDate() + gun);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (today <= son) return { durum: "ZAMANINDA", type: "green" };
  return { durum: "GECİKTİ", type: "red" };
}

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface YurticiRow { no: string; musteri: string; siparis: number; fatura: number; kalan: number; durum: string; }
interface IhracatRow { firma: string; ulke: string; termin: string; adet: number; durum: string; type: string; }
interface MalKabulRow { irsaliye: string; tedarikci: string; adet: number; lokasyon: string; durum: string; type: string; }

// ─── Varsayılan (demo) veriler ────────────────────────────────────────────────
const DEF_YI: YurticiRow[] = [
  { no: "YT-240701", musteri: "Başarı Ankara",      siparis: 128, fatura: 120, kalan: 8,  durum: "Kısmi"      },
  { no: "YT-240702", musteri: "İstanbul Avrupa",     siparis: 214, fatura: 214, kalan: 0,  durum: "Tamamlandı" },
  { no: "YT-240703", musteri: "Ege Bölge",           siparis: 176, fatura: 149, kalan: 27, durum: "Devam"      },
  { no: "YT-240704", musteri: "Kartepe Sevkiyat",    siparis: 89,  fatura: 66,  kalan: 23, durum: "Devam"      },
];
const DEF_IH: IhracatRow[] = [
  { firma: "Global Auto Parts", ulke: "Almanya",    termin: "Bugün 17:00", adet: 420, durum: "ZAMANINDA", type: "green"  },
  { firma: "Balkan Motors",     ulke: "Bulgaristan", termin: "Bugün 18:30", adet: 275, durum: "RİSKLİ",   type: "yellow" },
  { firma: "MENA Spare",        ulke: "BAE",         termin: "Bugün 16:00", adet: 610, durum: "GECİKTİ",  type: "red"    },
];
const DEF_MK: MalKabulRow[] = [
  { irsaliye: "IRS-2026-1842", tedarikci: "Martaş Otomotiv",      adet: 1280, lokasyon: "TEM34",     durum: "BAŞLAMADI",  type: "red"    },
  { irsaliye: "IRS-2026-1843", tedarikci: "Arıcıoğlu Otomotiv",   adet: 740,  lokasyon: "Kartepe",   durum: "İŞLEMDE",    type: "yellow" },
  { irsaliye: "IRS-2026-1844", tedarikci: "Başarı İthalat",       adet: 960,  lokasyon: "İnovasyon", durum: "TAMAMLANDI", type: "green"  },
];

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function GunSonuIzlemeDashboard() {
  const [activeTab, setActiveTab]   = useState("yurtici");
  const [yurticiOrders, setYurticiOrders] = useState<YurticiRow[]>(DEF_YI);
  const [ihracatTerminleri, setIhracatTerminleri] = useState<IhracatRow[]>(DEF_IH);
  const [malKabulCards, setMalKabulCards] = useState<MalKabulRow[]>(DEF_MK);
  const [stYi, setStYi] = useState<"idle"|"loading"|"ok"|"err">("idle");
  const [stIh, setStIh] = useState<"idle"|"loading"|"ok"|"err">("idle");
  const [stIr, setStIr] = useState<"idle"|"loading"|"ok"|"err">("idle");
  const [msgYi, setMsgYi] = useState("");
  const [msgIh, setMsgIh] = useState("");
  const [msgIr, setMsgIr] = useState("");
  const refYi = useRef<HTMLInputElement>(null);
  const refIh = useRef<HTMLInputElement>(null);
  const refIr = useRef<HTMLInputElement>(null);
  const [raporId, setRaporId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isView, setIsView] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const today = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  // URL'de ?rapor= varsa yükle
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("rapor");
    if (id) {
      setRaporId(id); setIsView(true); loadReport(id);
      const iv = setInterval(() => loadReport(id).then(() => setLastRefresh(new Date())), 30000);
      return () => clearInterval(iv);
    }
  // eslint-disable-next-line
  }, []);

  async function loadReport(id: string) {
    const d = await sbLoad(id);
    if (d) {
      if (d.yurtici_rows?.length)   setYurticiOrders(d.yurtici_rows);
      if (d.ihracat_rows?.length)   setIhracatTerminleri(d.ihracat_rows);
      if (d.malkabul_rows?.length)  setMalKabulCards(d.malkabul_rows);
      setLastRefresh(new Date());
    }
  }

  // ─── Excel Parse ──────────────────────────────────────────────────────────
  async function parseExcel(file: File, mode: "yi" | "ih" | "ir") {
    const setS = mode === "yi" ? setStYi : mode === "ih" ? setStIh : setStIr;
    const setM = mode === "yi" ? setMsgYi : mode === "ih" ? setMsgIh : setMsgIr;
    setS("loading");
    try {
      const XLSX = await import("xlsx");
      const wb   = XLSX.read(await file.arrayBuffer());
      const ws   = wb.Sheets["data"] ?? wb.Sheets[wb.SheetNames[0]];
      const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      const hi   = raw.findIndex(r => r.some((c: any) => sv(c) === "Müşteri" || sv(c) === "Firma" || sv(c).includes("MÜŞTERİ") || sv(c) === "FİRMA"));
      const hRow = hi >= 0 ? raw[hi] : raw[0];
      const col  = (k: string, k2 = "") => hRow.findIndex((c: any) => sv(c) === k || sv(c).includes(k) || (k2 && sv(c).includes(k2)));

      if (mode === "yi") {
        // Yurtiçi İş Talepleri
        const iMus = col("Müşteri", "MÜŞTERİ"), iBno = col("Belge No", "BELGE"), iAdt = col("Adet", "ADET"), iCes = col("Çeşit", "SKU"), iKar = col("Karşılan");
        const rows: YurticiRow[] = [];
        for (let i = (hi >= 0 ? hi + 1 : 1); i < raw.length; i++) {
          const r = raw[i]; const mus = sv(iMus >= 0 ? r[iMus] : r[3]); if (!mus) continue;
          const adet = ns(iAdt >= 0 ? r[iAdt] : r[6]);
          const oran = ns(iKar >= 0 ? r[iKar] : r[10]);
          const fatura = Math.round(adet * Math.min(oran, 100) / 100);
          const kalan  = adet - fatura;
          const durum  = kalan === 0 ? "Tamamlandı" : kalan < adet ? "Kısmi" : "Devam";
          rows.push({ no: sv(iBno >= 0 ? r[iBno] : r[1]) || uid(), musteri: mus, siparis: adet, fatura, kalan, durum });
        }
        setYurticiOrders(rows);
        const totS = rows.reduce((s, r) => s + r.siparis, 0);
        const totF = rows.reduce((s, r) => s + r.fatura, 0);
        setM(`${rows.length} satır · ${totS.toLocaleString("tr-TR")} sipariş`);
        setTab("yurtici");
      } else if (mode === "ih") {
        // İhracat İş Talepleri
        const iMus = col("Müşteri", "MÜŞTERİ"), iIl = col("İl", "ÜLKE"), iTar = col("Tarih", "TARİH"), iAdt = col("Adet", "ADET"), iCes = col("Çeşit", "SKU");
        const rows: IhracatRow[] = [];
        for (let i = (hi >= 0 ? hi + 1 : 1); i < raw.length; i++) {
          const r = raw[i]; const mus = sv(iMus >= 0 ? r[iMus] : r[3]); if (!mus) continue;
          const tarihRaw = sv(iTar >= 0 ? r[iTar] : r[2]);
          const tarih = tarihRaw.includes(".") ? parseTrDate(tarihRaw) : (typeof r[iTar >= 0 ? iTar : 2] === "number" ? xlDate(r[iTar >= 0 ? iTar : 2]) : todayStr());
          const sku  = ns(iCes >= 0 ? r[iCes] : r[7]);
          const adet = ns(iAdt >= 0 ? r[iAdt] : r[6]);
          const { durum, type } = terminDurum(tarih, sku);
          const ulke = sv(iIl >= 0 ? r[iIl] : r[4]);
          rows.push({ firma: mus, ulke: ulke || "—", termin: new Date(tarih).toLocaleDateString("tr-TR"), adet, durum, type });
        }
        setIhracatTerminleri(rows);
        setM(`${rows.length} sipariş`);
        setActiveTab("ihracat");
      } else {
        // İrsaliye (Mal Kabul)
        const iCnm = col("Cari İsmi"), iDep = col("Depo"), iBno = col("BelgeNo"), iAdt = col("Adet"), iCes = col("Çeşit"), iDur = col("Durum");
        const rows: MalKabulRow[] = [];
        for (let i = (hi >= 0 ? hi + 1 : 1); i < raw.length; i++) {
          const r = raw[i]; const fir = sv(iCnm >= 0 ? r[iCnm] : r[6]); if (!fir) continue;
          const raw2 = sv(iDur >= 0 ? r[iDur] : r[9]);
          const durum = raw2 === "Başlamadı" ? "BAŞLAMADI" : raw2 === "İşlemde" ? "İŞLEMDE" : raw2 === "Tamamlandı" ? "TAMAMLANDI" : raw2 || "BAŞLAMADI";
          const type  = durum === "TAMAMLANDI" ? "green" : durum === "İŞLEMDE" ? "yellow" : "red";
          rows.push({ irsaliye: sv(iBno >= 0 ? r[iBno] : r[2]) || uid(), tedarikci: fir, adet: ns(iAdt >= 0 ? r[iAdt] : r[7]), lokasyon: sv(iDep >= 0 ? r[iDep] : r[1]) || "TEM34", durum, type });
        }
        setMalKabulCards(rows);
        const tot = rows.reduce((s, r) => s + r.adet, 0);
        setM(`${rows.length} belge · ${tot.toLocaleString("tr-TR")} adet`);
        setActiveTab("malKabul");
      }
      setS("ok");
    } catch { setM("Dosya okunamadı"); setS("err"); }
  }

  function setTab(t: string) { setActiveTab(t); }

  // ─── Kaydet ve Paylaş ──────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    const p = { tarih: todayStr(), yurtici_rows: yurticiOrders, ihracat_rows: ihracatTerminleri, malkabul_rows: malKabulCards };
    let id = raporId;
    if (id) {
      await sbUpdate(id, p);
    } else {
      id = await sbSave(p);
      if (id) {
        setRaporId(id);
        const u = `${window.location.origin}?rapor=${id}`;
        setShareUrl(u);
        window.history.pushState({}, "", `?rapor=${id}`);
      }
    }
    setSaving(false);
    if (id) {
      const u = shareUrl || `${window.location.origin}?rapor=${id}`;
      const d = new Date().toLocaleDateString("tr-TR");
      window.open(`https://wa.me/?text=${encodeURIComponent(`📋 *GÜN SONU RAPORU — ${d}*\n\nCanlı rapor:\n${u}`)}`, "_blank");
    }
  }

  // ─── ChatGPT Tasarımı (bire bir korundu) ─────────────────────────────────
  const colors = {
    navy: "#0B2F78", navyDark: "#08265F", green: "#22C55E",
    bg: "#F8FAFD", card: "#FFFFFF", text: "#172033", muted: "#6B7280",
    border: "#E5EAF3", softNavy: "#EEF4FF", yellow: "#F59E0B", red: "#EF4444",
    softGreen: "#EAFBF1", softYellow: "#FFF7E6", softRed: "#FEECEC",
  };

  const tabs = [
    { id: "yurtici",  label: "Yurtiçi"  },
    { id: "ihracat",  label: "İhracat"  },
    { id: "malKabul", label: "Mal Kabul" },
  ];

  const getStatusStyle = (type: string) => {
    if (type === "green")  return { backgroundColor: colors.softGreen,  color: "#15803D", border: "1px solid #B7EAC9" };
    if (type === "yellow") return { backgroundColor: colors.softYellow, color: "#B45309", border: "1px solid #FAD58A" };
    return { backgroundColor: colors.softRed, color: "#B91C1C", border: "1px solid #F8B4B4" };
  };

  const getOrderStatusStyle = (durum: string) => {
    if (durum === "Tamamlandı") return getStatusStyle("green");
    if (durum === "Kısmi")      return getStatusStyle("yellow");
    return { backgroundColor: colors.softNavy, color: colors.navy, border: "1px solid #C7D7F7" };
  };

  const styles: Record<string, React.CSSProperties> = {
    page:         { minHeight: "100vh", backgroundColor: colors.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif', color: colors.text, padding: "24px", boxSizing: "border-box" },
    shell:        { maxWidth: "1440px", margin: "0 auto" },
    header:       { height: "82px", backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: "22px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", boxShadow: "0 12px 32px rgba(11,47,120,0.06)", marginBottom: "18px" },
    headerLeft:   { display: "flex", alignItems: "center", gap: "18px" },
    logoBox:      { width: "172px", height: "48px", borderRadius: "14px", backgroundColor: colors.softNavy, border: "1px solid #D6E4FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: colors.navy, letterSpacing: "-0.4px", fontSize: "18px" },
    titleWrap:    { display: "flex", flexDirection: "column", gap: "4px" },
    pageTitle:    { margin: 0, fontSize: "24px", fontWeight: 800, color: colors.navy, letterSpacing: "-0.6px" },
    pageSubtitle: { margin: 0, color: colors.muted, fontSize: "13px", fontWeight: 600 },
    headerRight:  { display: "flex", alignItems: "center", gap: "12px" },
    notification: { width: "42px", height: "42px", borderRadius: "14px", backgroundColor: colors.bg, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.navy, fontSize: "18px", cursor: "pointer", position: "relative" },
    badge2:       { position: "absolute", top: -6, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#F59E0B", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" },
    userCard:     { height: "44px", borderRadius: "16px", backgroundColor: colors.bg, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: "10px", padding: "0 12px 0 8px" },
    avatar:       { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: colors.navy, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px" },
    userName:     { fontSize: "13px", fontWeight: 800, color: colors.text },
    topBar:       { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", gap: "16px" },
    tabs:         { backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: "18px", padding: "6px", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 10px 24px rgba(11,47,120,0.05)" },
    tabButton:    { border: "none", borderRadius: "14px", padding: "13px 28px", fontSize: "14px", fontWeight: 800, cursor: "pointer", transition: "0.2s ease", fontFamily: "inherit" },
    saveButton:   { height: "52px", border: "none", borderRadius: "16px", backgroundColor: colors.green, color: "#FFFFFF", padding: "0 24px", fontSize: "14px", fontWeight: 900, cursor: "pointer", boxShadow: "0 12px 24px rgba(34,197,94,0.24)", display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap", fontFamily: "inherit" },
    uploadStrip:  { backgroundColor: colors.card, border: "1px dashed #B7C6E6", borderRadius: "18px", height: "70px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", marginBottom: "18px", boxShadow: "0 10px 24px rgba(11,47,120,0.04)" },
    uploadLeft:   { display: "flex", alignItems: "center", gap: "14px" },
    uploadIcon:   { width: "42px", height: "42px", borderRadius: "14px", backgroundColor: colors.softNavy, color: colors.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" },
    uploadTitle:  { margin: 0, fontSize: "15px", fontWeight: 900, color: colors.text },
    uploadDesc:   { margin: "3px 0 0", fontSize: "12px", color: colors.muted, fontWeight: 600 },
    uploadButton: { height: "40px", border: `1px solid ${colors.navy}`, color: colors.navy, backgroundColor: "#FFFFFF", borderRadius: "13px", padding: "0 16px", fontSize: "13px", fontWeight: 900, cursor: "pointer", fontFamily: "inherit" },
    statsGrid:    { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "18px" },
    statCard:     { backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: "20px", padding: "20px", boxShadow: "0 12px 28px rgba(11,47,120,0.05)", position: "relative", overflow: "hidden" },
    statAccent:   { position: "absolute", right: "-32px", top: "-32px", width: "110px", height: "110px", borderRadius: "50%", backgroundColor: colors.softNavy },
    statLabel:    { margin: 0, fontSize: "13px", color: colors.muted, fontWeight: 800 },
    statValue:    { margin: "10px 0 0", fontSize: "34px", fontWeight: 900, color: colors.navy, letterSpacing: "-1px" },
    statNote:     { margin: "8px 0 0", fontSize: "12px", color: colors.muted, fontWeight: 600 },
    card:         { backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: "22px", boxShadow: "0 12px 28px rgba(11,47,120,0.05)", overflow: "hidden" },
    sectionHeader:{ height: "62px", padding: "0 20px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
    sectionTitle: { margin: 0, fontSize: "18px", fontWeight: 900, color: colors.navy, letterSpacing: "-0.3px" },
    sectionHint:  { fontSize: "12px", color: colors.muted, fontWeight: 700 },
    table:        { width: "100%", borderCollapse: "collapse" },
    th:           { textAlign: "left", padding: "14px 20px", fontSize: "12px", color: colors.muted, fontWeight: 900, backgroundColor: "#FBFCFF", borderBottom: `1px solid ${colors.border}`, textTransform: "uppercase", letterSpacing: "0.4px" },
    td:           { padding: "16px 20px", fontSize: "14px", fontWeight: 700, borderBottom: `1px solid ${colors.border}`, color: colors.text },
    badge:        { display: "inline-flex", alignItems: "center", justifyContent: "center", height: "28px", borderRadius: "999px", padding: "0 12px", fontSize: "11px", fontWeight: 900, letterSpacing: "0.3px" },
    terminGrid:   { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
    terminCard:   { backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 12px 28px rgba(11,47,120,0.05)" },
    terminTop:    { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "18px" },
    company:      { margin: 0, fontSize: "17px", fontWeight: 900, color: colors.text, letterSpacing: "-0.3px" },
    country:      { margin: "5px 0 0", color: colors.muted, fontSize: "13px", fontWeight: 700 },
    terminInfo:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" },
    miniInfo:     { borderRadius: "16px", backgroundColor: "#FBFCFF", border: `1px solid ${colors.border}`, padding: "14px" },
    miniLabel:    { margin: 0, fontSize: "11px", fontWeight: 800, color: colors.muted, textTransform: "uppercase", letterSpacing: "0.3px" },
    miniValue:    { margin: "7px 0 0", fontSize: "15px", fontWeight: 900, color: colors.navy },
    malKabulGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
    irsaliyeCard: { backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 12px 28px rgba(11,47,120,0.05)" },
    irsaliyeNo:   { margin: 0, fontSize: "18px", fontWeight: 900, color: colors.navy, letterSpacing: "-0.4px" },
    supplier:     { margin: "7px 0 0", color: colors.muted, fontSize: "13px", fontWeight: 700 },
    divider:      { height: "1px", backgroundColor: colors.border, margin: "18px 0" },
    footerGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    shareBanner:  { backgroundColor: "#EFF9FF", border: "1px solid #BAE0FC", borderRadius: "14px", padding: "10px 18px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
    liveBanner:   { backgroundColor: "#F0FDF4", border: "1px solid #C6F6D5", borderRadius: "12px", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
  };

  // ─── Upload şeridini render et ────────────────────────────────────────────
  const renderUploadStrip = () => {
    const cfg = {
      yurtici:  { title: "Yurtiçi Excel Raporu",  desc: "Sipariş, faturalanan ve kalan adetleri güncelle.", icon: "📋", st: stYi, msg: msgYi, ref: refYi, mode: "yi" as const },
      ihracat:  { title: "İhracat Excel Raporu",  desc: "Termin, ülke, müşteri ve sevk durumlarını yükle.", icon: "✈️", st: stIh, msg: msgIh, ref: refIh, mode: "ih" as const },
      malKabul: { title: "Mal Kabul Excel Raporu",desc: "İrsaliye, tedarikçi ve işlem durumlarını yükle.",  icon: "📦", st: stIr, msg: msgIr, ref: refIr, mode: "ir" as const },
    };
    const c = cfg[activeTab as keyof typeof cfg];
    const ok  = c.st === "ok";
    const err = c.st === "err";
    const ld  = c.st === "loading";

    return (
      <>
        <div style={{ ...styles.uploadStrip, borderColor: ok ? "#86efac" : err ? "#fca5a5" : "#B7C6E6", backgroundColor: ok ? "#F0FDF4" : err ? "#FEF2F2" : colors.card }}>
          <div style={styles.uploadLeft}>
            <div style={styles.uploadIcon}>{ok ? "✅" : err ? "❌" : ld ? "⏳" : c.icon}</div>
            <div>
              <p style={styles.uploadTitle}>{ok || err ? c.msg : c.title}</p>
              <p style={styles.uploadDesc}>{ok ? "Dosyayı değiştirmek için tekrar seç" : err ? "Geçerli bir Excel dosyası seç" : c.desc}</p>
            </div>
          </div>
          <button style={styles.uploadButton} onClick={() => c.ref.current?.click()}>
            {ok ? "Değiştir" : "Excel Seç"}
          </button>
        </div>
        <input ref={c.ref} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) parseExcel(f, c.mode); e.target.value = ""; }}/>
      </>
    );
  };

  // ─── Yurtiçi içerik ───────────────────────────────────────────────────────
  const renderYurtici = () => {
    const totS = yurticiOrders.reduce((s, r) => s + r.siparis, 0);
    const totF = yurticiOrders.reduce((s, r) => s + r.fatura,  0);
    const totK = yurticiOrders.reduce((s, r) => s + r.kalan,   0);
    return (
      <>
        <div style={styles.statsGrid}>
          {[
            { label: "Toplam Sipariş",  val: totS, note: "Bugünkü toplam yurtiçi sipariş adedi" },
            { label: "Faturalanan",      val: totF, note: "Gün sonuna kadar faturalanan adet"     },
            { label: "Kalan",            val: totK, note: "Operasyon kapanışı öncesi kalan adet"  },
          ].map(({ label, val, note }) => (
            <div key={label} style={styles.statCard}>
              <div style={styles.statAccent} />
              <p style={styles.statLabel}>{label}</p>
              <p style={{ ...styles.statValue, color: label === "Kalan" && totK > 0 ? "#dc2626" : colors.navy }}>{val.toLocaleString("tr-TR")}</p>
              <p style={styles.statNote}>{note}</p>
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Yurtiçi Sipariş Listesi</h2>
            <span style={styles.sectionHint}>{yurticiOrders.length} kayıt · {new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Sipariş No", "Müşteri / Bölge", "Sipariş", "Faturalanan", "Kalan", "Durum"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yurticiOrders.map((item, i) => (
                <tr key={i}>
                  <td style={styles.td}>{item.no}</td>
                  <td style={styles.td}>{item.musteri}</td>
                  <td style={styles.td}>{item.siparis.toLocaleString("tr-TR")}</td>
                  <td style={styles.td}>{item.fatura.toLocaleString("tr-TR")}</td>
                  <td style={{ ...styles.td, color: item.kalan > 0 ? "#dc2626" : "#15803d", fontWeight: 900 }}>{item.kalan.toLocaleString("tr-TR")}</td>
                  <td style={styles.td}><span style={{ ...styles.badge, ...getOrderStatusStyle(item.durum) }}>{item.durum}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // ─── İhracat içerik ───────────────────────────────────────────────────────
  const renderIhracat = () => (
    <div style={styles.terminGrid}>
      {ihracatTerminleri.map((item, i) => (
        <div key={i} style={styles.terminCard}>
          <div style={styles.terminTop}>
            <div>
              <p style={styles.company}>{item.firma}</p>
              <p style={styles.country}>{item.ulke}</p>
            </div>
            <span style={{ ...styles.badge, ...getStatusStyle(item.type) }}>{item.durum}</span>
          </div>
          <div style={styles.terminInfo}>
            <div style={styles.miniInfo}><p style={styles.miniLabel}>Termin</p><p style={styles.miniValue}>{item.termin}</p></div>
            <div style={styles.miniInfo}><p style={styles.miniLabel}>Adet</p><p style={styles.miniValue}>{item.adet.toLocaleString("tr-TR")}</p></div>
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Mal Kabul içerik ─────────────────────────────────────────────────────
  const renderMalKabul = () => (
    <div style={styles.malKabulGrid}>
      {malKabulCards.map((item, i) => (
        <div key={i} style={styles.irsaliyeCard}>
          <div style={styles.terminTop}>
            <div>
              <p style={styles.irsaliyeNo}>{item.irsaliye}</p>
              <p style={styles.supplier}>{item.tedarikci}</p>
            </div>
            <span style={{ ...styles.badge, ...getStatusStyle(item.type) }}>{item.durum}</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.footerGrid}>
            <div style={styles.miniInfo}><p style={styles.miniLabel}>Adet</p><p style={styles.miniValue}>{item.adet.toLocaleString("tr-TR")}</p></div>
            <div style={styles.miniInfo}><p style={styles.miniLabel}>Lokasyon</p><p style={styles.miniValue}>{item.lokasyon}</p></div>
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main style={styles.page}>
      <div style={styles.shell}>

        {/* Canlı görüntüleme */}
        {isView && (
          <div style={styles.liveBanner}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>
              🔄 Otomatik güncelleniyor (30 sn){lastRefresh && ` · Son: ${lastRefresh.toLocaleTimeString("tr-TR")}`}
            </span>
            <button onClick={() => raporId && loadReport(raporId)}
              style={{ border: "1px solid #86efac", borderRadius: 8, background: "#fff", color: "#15803d", padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              ↺ Yenile
            </button>
          </div>
        )}

        {/* Paylaşım linki */}
        {shareUrl && (
          <div style={styles.shareBanner}>
            <span style={{ fontSize: 18 }}>🔗</span>
            <span style={{ flex: 1, fontSize: 12, color: colors.muted, fontFamily: "monospace", wordBreak: "break-all" }}>{shareUrl}</span>
            <button onClick={async () => { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ border: "1px solid #BAE0FC", borderRadius: 8, background: "#fff", color: colors.navy, padding: "5px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {copied ? "✅ Kopyalandı" : "📋 Kopyala"}
            </button>
          </div>
        )}

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoBox}>BAŞARI OTOMOTİV</div>
            <div style={styles.titleWrap}>
              <h1 style={styles.pageTitle}>Gün Sonu İzleme</h1>
              <p style={styles.pageSubtitle}>Operasyon kapanış dashboardı · {today}</p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={{ ...styles.notification, position: "relative" }}>
              🔔
              <span style={styles.badge2}>2</span>
            </div>
            {raporId && <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "4px 12px" }}>🟢 Canlı</span>}
            <div style={styles.userCard}>
              <div style={styles.avatar}>FT</div>
              <div style={styles.userName}>Fatih Tosunoğlu</div>
            </div>
          </div>
        </header>

        {/* Tab bar */}
        <div style={styles.topBar}>
          <nav style={styles.tabs}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ ...styles.tabButton, backgroundColor: isActive ? colors.navy : "transparent", color: isActive ? "#FFFFFF" : colors.navy, boxShadow: isActive ? "0 10px 20px rgba(11,47,120,0.22)" : "none" }}>
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
            <span>💾</span>
            {saving ? "Kaydediliyor..." : "Kaydet ve Paylaş"}
          </button>
        </div>

        {/* Upload şeridi */}
        {renderUploadStrip()}

        {/* İçerik */}
        {activeTab === "yurtici"  && renderYurtici()}
        {activeTab === "ihracat"  && renderIhracat()}
        {activeTab === "malKabul" && renderMalKabul()}

      </div>
    </main>
  );
}
