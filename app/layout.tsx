import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://basari-gun-sonu.vercel.app"),
  title: "Gün Sonu İzleme — Başarı Otomotiv",
  description: "Zeus WMS'ten anlık yurtiçi, ihracat ve mal kabul takibi. Canlı, otomatik güncellenen gün sonu raporu.",
  openGraph: {
    title: "Gün Sonu İzleme — Başarı Otomotiv",
    description: "Zeus WMS'ten anlık yurtiçi, ihracat ve mal kabul takibi. Canlı, otomatik güncellenen gün sonu raporu.",
    url: "https://basari-gun-sonu.vercel.app",
    siteName: "Başarı Otomotiv",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Gün Sonu İzleme — Başarı Otomotiv" }],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gün Sonu İzleme — Başarı Otomotiv",
    description: "Zeus WMS'ten anlık yurtiçi, ihracat ve mal kabul takibi.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
