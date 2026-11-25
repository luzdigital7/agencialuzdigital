import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";

const YELLOW = "#FBB800";
const INK = "#0B0B0E";
const BG = "#0E0E13";

export const Portada: React.FC<{ variant?: "dark" | "light" }> = ({ variant = "dark" }) => {
  const dark = variant === "dark";
  const fg = dark ? "#fff" : INK;
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Anton", `url(${staticFile("fonts/anton.woff2")})`),
      new FontFace("Poppins", `url(${staticFile("fonts/poppins600.woff2")})`, { weight: "600" }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((l) => {
        l.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: dark ? BG : "#F7F5F2" }}>
      <div style={{ position: "absolute", width: 1100, height: 1300, right: -520, top: -520, background: dark ? "radial-gradient(ellipse at center, #6D3FC4aa 0%, #4B2A7B55 40%, transparent 72%)" : "radial-gradient(ellipse at center, #DCCFF5 0%, #EFE8FA66 45%, transparent 72%)" }} />
      <Img src={staticFile(dark ? "logo/blanco.png" : "logo/color.png")} style={{ position: "absolute", top: 250, left: 0, right: 0, margin: "0 auto", width: 520 }} />
      <div style={{ position: "absolute", left: 70, top: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Poppins", fontWeight: 600, fontSize: 30, letterSpacing: "0.2em", textTransform: "uppercase", color: dark ? "rgba(255,255,255,.6)" : "#6B6878", marginBottom: 22 }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: YELLOW }} /> Oferta de hoy
        </div>
        <div style={{ fontFamily: "Anton", fontSize: 250, lineHeight: 0.98, color: fg, textTransform: "uppercase" }}>AUDITORÍA</div>
        <div style={{ display: "inline-block", fontFamily: "Anton", fontSize: 250, lineHeight: 1.04, color: INK, background: YELLOW, borderRadius: 24, padding: "0 34px", transform: "rotate(-2deg)", textTransform: "uppercase" }}>GRATIS</div>
        <div style={{ fontFamily: "Anton", fontSize: 112, lineHeight: 1.1, color: fg, textTransform: "uppercase", marginTop: 36 }}>de tu Instagram</div>
        <div style={{ marginTop: 40, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["FODA", "Contenido", "Reels", "Plan 30 días"].map((x) => (
            <div key={x} style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 34, padding: "10px 26px", borderRadius: 999, border: `2px solid ${dark ? YELLOW : "#4B2A7B"}`, color: dark ? YELLOW : "#4B2A7B", background: dark ? "transparent" : "#fff" }}>{x}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
