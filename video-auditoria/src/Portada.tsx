import React, { useEffect, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";

const BG = "#0A0A0F";
const PURPLE = "#4B2A7B";
const PURPLE_LIGHT = "#8B5CF6";
const YELLOW = "#FDB913";
const RED = "#FF4D5E";
const HEAD = "Anton, 'Impact', sans-serif";
const BODY = "Inter, Arial, sans-serif";

export const Portada: React.FC = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Anton", `url(${staticFile("fonts/anton.woff2")})`),
      new FontFace("Inter", `url(${staticFile("fonts/inter800.woff2")})`, { weight: "800" }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((l) => {
        l.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center" }}>
      <div style={{ position: "absolute", width: 1500, height: 1100, left: -210, bottom: -380, background: `radial-gradient(ellipse at center, ${PURPLE_LIGHT}77 0%, ${PURPLE}66 35%, transparent 70%)` }} />
      <div style={{ position: "absolute", width: 900, height: 600, left: 90, top: -240, background: `radial-gradient(ellipse at center, ${YELLOW}26 0%, transparent 70%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)", backgroundSize: "90px 90px" }} />

      <Img src={staticFile("logo/blanco.png")} style={{ position: "absolute", top: 300, width: 520 }} />

      <div style={{ position: "absolute", top: 590, width: "100%", textAlign: "center", fontFamily: HEAD, textTransform: "uppercase", color: "#fff" }}>
        <div style={{ fontSize: 150, lineHeight: 1 }}>Auditoría de tu</div>
        <div style={{ fontSize: 215, lineHeight: 1, color: YELLOW, textShadow: `0 0 120px ${YELLOW}66` }}>Instagram</div>
      </div>

      <div style={{ position: "absolute", top: 1090, display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ position: "relative", fontFamily: HEAD, fontSize: 150, color: "#ffffff88", whiteSpace: "nowrap" }}>
          US$ 75
          <div style={{ position: "absolute", left: -14, right: -14, top: "54%", height: 14, background: RED, transform: "rotate(-4deg)" }} />
        </div>
        <div style={{ background: YELLOW, color: BG, fontFamily: HEAD, fontSize: 170, textTransform: "uppercase", padding: "0 48px", borderRadius: 24, lineHeight: 1.12 }}>
          Gratis
        </div>
      </div>

      <div style={{ position: "absolute", top: 1360, whiteSpace: "nowrap", fontFamily: BODY, fontWeight: 800, fontSize: 40, letterSpacing: 2, color: "#fff", textTransform: "uppercase", textAlign: "center", lineHeight: 1.5 }}>
        FODA · Contenido · Reels · Plan de 30 días
      </div>
    </AbsoluteFill>
  );
};
