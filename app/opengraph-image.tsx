import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Gün Sonu İzleme — Başarı Otomotiv";
export const size = { width: 1254, height: 1254 };
export const contentType = "image/jpeg";

export default async function Image() {
  const [bgData, fontData] = await Promise.all([
    fetch(new URL("./gun-sonu-banner-base.jpg", import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL("./poppins-bold.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
  ]);

  const today = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const bgBase64 = `data:image/jpeg;base64,${Buffer.from(bgData).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgBase64}
          width={1254}
          height={1254}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        {/* Orijinal görseldeki tarih kutusunun üstünü kaplayan, o günün tarihiyle güncellenen kutu */}
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 812,
            width: 655,
            height: 148,
            background: "linear-gradient(180deg, #1E63C9 0%, #0A3A93 55%, #072B70 100%)",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 26px rgba(4,20,60,0.45)",
            border: "2px solid rgba(255,255,255,0.35)",
          }}
        >
          <span
            style={{
              color: "#FFFFFF",
              fontSize: 78,
              fontWeight: 700,
              letterSpacing: 3,
              fontFamily: "Poppins",
            }}
          >
            {today}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Poppins", data: fontData, weight: 700, style: "normal" }],
    }
  );
}
