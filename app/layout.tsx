import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gün Sonu İzleme — Başarı Otomotiv",
  description: "Zeus WMS → Gün Sonu Raporu → WhatsApp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
