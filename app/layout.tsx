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
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gün Sonu İzleme — Başarı Otomotiv",
    description: "Zeus WMS'ten anlık yurtiçi, ihracat ve mal kabul takibi.",
    images: ["/opengraph-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
