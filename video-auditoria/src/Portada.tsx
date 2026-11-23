import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";

const BG = "#F7F5F2";
const INK = "#0B0B0E";
const PURPLE = "#4B2A7B";
const YELLOW = "#FBB800";
const RED = "#E5484D";
const FONT = "Inter, Arial, sans-serif";
const TIGHT = "-0.04em";

export const Portada: React.FC = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [700, 800].map(
      (w) => new FontFace("Inter", `url(${staticFile(`fonts/inter${w}.woff2`)})`, { weight: String(w) }),
    );
    Promise.all(faces.map((f) => f.load()))
      .then((l) => {
        l.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center" }}>
      <div style={{ position: "absolute", width: 1500, height: 1200, right: -550, top: -450, background: "radial-gradient(ellipse at center, #E4D9F7 0%, #EFE8FA66 45%, transparent 72%)" }} />
      <div style={{ position: "absolute", width: 1200, height: 900, left: -500, bottom: -420, background: "radial-gradient(ellipse at center, #FBB80030 0%, transparent 70%)" }} />

      <Img src={staticFile("logo/color.png")} style={{ position: "absolute", top: 250, width: 700 }} />
      <div style={{ position: "absolute", top: 520, width: 760, height: 10, background: PURPLE, borderRadius: 5 }}>
        <div style={{ width: 190, height: 10, background: YELLOW, borderRadius: 5 }} />
      </div>

      <div style={{ position: "absolute", top: 610, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, letterSpacing: TIGHT, color: INK }}>
        <div style={{ fontSize: 138, lineHeight: 1.02 }}>Auditoría de tu</div>
        <div style={{ fontSize: 200, lineHeight: 1.0, color: PURPLE }}>Instagram</div>
      </div>

      <div style={{ position: "absolute", top: 1060, display: "flex", alignItems: "center", gap: 30 }}>
        <div style={{ position: "relative", fontFamily: FONT, fontWeight: 800, fontSize: 96, letterSpacing: TIGHT, color: "#B9B4C6", whiteSpace: "nowrap" }}>
          US$ 75
          <div style={{ position: "absolute", left: -14, right: -14, top: "54%", height: 14, background: RED, borderRadius: 7, transform: "rotate(-4deg)" }} />
        </div>
        <div style={{ background: "#0A0A0C", borderLeft: `18px solid ${YELLOW}`, borderRadius: 40, padding: "6px 40px 14px 34px", color: YELLOW, fontFamily: FONT, fontWeight: 800, fontSize: 118, letterSpacing: TIGHT, lineHeight: 1.1, boxShadow: "0 24px 60px rgba(0,0,0,.22)" }}>
          GRATIS
        </div>
      </div>

      <div style={{ position: "absolute", top: 1330, display: "flex", alignItems: "center", gap: 18, fontFamily: FONT, fontWeight: 800, fontSize: 31, letterSpacing: "0.1em", textTransform: "uppercase", color: PURPLE, whiteSpace: "nowrap" }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: YELLOW, display: "inline-block" }} />
        FODA · Contenido · Reels · Plan de 30 días
      </div>
    </AbsoluteFill>
  );
};
