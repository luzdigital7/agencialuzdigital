import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";

export const FPS = 30;
export const DURATION = Math.round(31.5 * FPS);

const BG = "#0A0A0F";
const PURPLE = "#4B2A7B";
const PURPLE_LIGHT = "#8B5CF6";
const YELLOW = "#FDB913";
const RED = "#FF4D5E";
const WHITE = "#FFFFFF";

const HEAD = "Anton, 'Impact', sans-serif";
const BODY = "Inter, 'Helvetica Neue', Arial, sans-serif";

const s = (sec: number) => Math.round(sec * FPS);

/* ---------- Fuentes locales ---------- */
const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Anton", `url(${staticFile("fonts/anton.woff2")})`, {
        weight: "400",
      }),
      new FontFace("Inter", `url(${staticFile("fonts/inter600.woff2")})`, {
        weight: "600",
      }),
      new FontFace("Inter", `url(${staticFile("fonts/inter800.woff2")})`, {
        weight: "800",
      }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

/* ---------- Subtítulos sincronizados con la voz ---------- */
type Sentence = { start: number; end: number; text: string; hl: string[] };

const SENTENCES: Sentence[] = [
  { start: 0.0, end: 2.85, text: "Publicas en Instagram… y nadie te escribe.", hl: ["nadie"] },
  { start: 3.0, end: 5.83, text: "Casi siempre es una de estas tres cosas.", hl: ["tres"] },
  { start: 6.16, end: 9.28, text: "Una bio que termina en un número, y no en una acción.", hl: ["número,", "acción."] },
  { start: 9.67, end: 11.95, text: "Un feed que habla de una sola cosa.", hl: ["sola"] },
  { start: 12.38, end: 14.62, text: "Y ningún camino de seguidor a cliente.", hl: ["camino"] },
  {
    start: 15.15,
    end: 22.42,
    text: "En Luz Digital revisamos tu perfil completo: matriz FODA, propuesta de contenido, Reels y plan de 30 días.",
    hl: ["FODA,", "contenido,", "Reels", "30"],
  },
  { start: 22.73, end: 25.27, text: "Esta auditoría vale 75 dólares.", hl: ["75"] },
  { start: 25.56, end: 26.91, text: "Hoy te la hacemos gratis.", hl: ["gratis."] },
  { start: 27.16, end: 30.28, text: "Comenta AUDITORÍA y analizamos tu Instagram.", hl: ["AUDITORÍA"] },
];

type Word = { text: string; t: number; hl: boolean; group: number };

const buildWords = (): Word[] => {
  const out: Word[] = [];
  let group = 0;
  for (const sen of SENTENCES) {
    const words = sen.text.split(" ");
    const total = words.reduce((a, w) => a + w.length + 1, 0);
    let acc = 0;
    let inGroup = 0;
    words.forEach((w, i) => {
      const t = sen.start + ((sen.end - sen.start) * acc) / total;
      acc += w.length + 1;
      if (inGroup >= 4 || (inGroup >= 3 && w.length > 7)) {
        group++;
        inGroup = 0;
      }
      out.push({ text: w, t, hl: sen.hl.includes(w), group });
      inGroup++;
      if (i === words.length - 1) {
        group++;
      }
    });
  }
  return out;
};
const WORDS = buildWords();

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;
  const shown = WORDS.filter((w) => w.t <= now + 0.02);
  if (!shown.length) return null;
  const currentGroup = shown[shown.length - 1].group;
  const line = WORDS.filter((w) => w.group === currentGroup);
  // si el grupo ya terminó hace rato, ocultar
  const lastOfSentence = SENTENCES.find((sen) => now >= sen.start - 0.05 && now <= sen.end + 0.6);
  if (!lastOfSentence) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 1370,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "10px 22px",
        fontFamily: HEAD,
        fontSize: 118,
        lineHeight: 1.05,
        textTransform: "uppercase",
        textAlign: "center",
      }}
    >
      {line.map((w, i) => {
        if (w.t > now + 0.02) return null;
        const pop = spring({
          frame: frame - Math.round(w.t * fps),
          fps,
          config: { damping: 14, stiffness: 220 },
          durationInFrames: 12,
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `scale(${0.7 + 0.3 * pop}) translateY(${(1 - pop) * 24}px)`,
              opacity: pop,
              color: w.hl ? BG : WHITE,
              background: w.hl ? YELLOW : "transparent",
              padding: w.hl ? "0 18px" : 0,
              borderRadius: 14,
              textShadow: w.hl ? "none" : "0 6px 30px rgba(0,0,0,.8)",
            }}
          >
            {w.text.replace(/[,.:]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Utilidades visuales ---------- */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 60) * 40;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 1100,
          left: -210,
          bottom: -420 + drift,
          background: `radial-gradient(ellipse at center, ${PURPLE_LIGHT}66 0%, ${PURPLE}55 35%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 600,
          left: 90,
          top: -260,
          background: `radial-gradient(ellipse at center, ${YELLOW}22 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          maskImage: "linear-gradient(to bottom, transparent 55%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 55%, black 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const Punch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16, stiffness: 180 }, durationInFrames: 14 });
  return (
    <AbsoluteFill style={{ transform: `scale(${1.05 - 0.05 * p})`, opacity: interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" }) }}>
      {children}
    </AbsoluteFill>
  );
};

const pop = (frame: number, fps: number, delay = 0, dur = 16) =>
  spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 190 }, durationInFrames: dur });

const Tag: React.FC<{ children: React.ReactNode; color?: string; fg?: string; style?: React.CSSProperties }> = ({
  children,
  color = RED,
  fg = WHITE,
  style,
}) => (
  <div
    style={{
      display: "inline-block",
      background: color,
      color: fg,
      fontFamily: BODY,
      fontWeight: 800,
      fontSize: 38,
      letterSpacing: 2,
      textTransform: "uppercase",
      padding: "14px 30px",
      borderRadius: 999,
      ...style,
    }}
  >
    {children}
  </div>
);

const Phone: React.FC<{ children: React.ReactNode; width?: number; height?: number }> = ({
  children,
  width = 700,
  height = 1000,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 80,
      background: "#101016",
      border: "3px solid #2c2c3a",
      boxShadow: `0 40px 120px rgba(0,0,0,.7), 0 0 80px ${PURPLE_LIGHT}33`,
      overflow: "hidden",
      position: "relative",
    }}
  >
    {children}
  </div>
);

const Heart: React.FC<{ size?: number; color?: string }> = ({ size = 40, color = RED }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.6 5 6 5c2 0 3.5 1.1 4.5 2.6.3.4.7.4 1 0C12.5 6.1 14 5 16 5c3.4 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z" />
  </svg>
);

/* ---------- ESCENA A: gancho ---------- */
const SceneA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const likes = Math.round(interpolate(frame, [0, 70], [180, 1240], { extrapolateRight: "clamp" }));
  const p = pop(frame, fps, 0, 20);
  const emptyPulse = 0.6 + 0.4 * Math.sin(frame / 5);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Img src={staticFile("logo/blanco.png")} style={{ width: 360, marginTop: 40 }} />
      <div style={{ marginTop: 20, transform: `scale(${0.85 + 0.15 * p})` }}>
        <Phone width={720} height={940}>
          <div style={{ padding: 44, fontFamily: BODY, color: WHITE }}>
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 75,
                  background: `linear-gradient(135deg, ${PURPLE_LIGHT}, ${YELLOW})`,
                  flexShrink: 0,
                }}
              />
              <div style={{ display: "flex", gap: 36, fontSize: 30, textAlign: "center" }}>
                {[
                  ["128", "posts"],
                  ["4.812", "seguidores"],
                  ["301", "siguiendo"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontWeight: 800, fontSize: 40 }}>{n}</div>
                    <div style={{ opacity: 0.7, fontSize: 24 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 34, marginTop: 28 }}>@tunegocio</div>
            <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap" }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 190,
                    height: 190,
                    borderRadius: 14,
                    background: `linear-gradient(${135 + i * 20}deg, ${i % 2 ? PURPLE : "#2a2a36"}, ${i % 3 ? "#1b1b24" : PURPLE_LIGHT}55)`,
                  }}
                />
              ))}
            </div>
          </div>
          {/* likes */}
          <div
            style={{
              position: "absolute",
              left: 44,
              right: 44,
              bottom: 44,
              borderRadius: 30,
              background: "#1b1b25",
              padding: "26px 34px",
              fontFamily: BODY,
              color: WHITE,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 800 }}>
              <Heart /> {likes.toLocaleString("es-CO")} me gusta
            </div>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 36,
                fontWeight: 800,
                color: RED,
                opacity: frame > 20 ? emptyPulse + 0.2 : 0,
              }}
            >
              <span>Mensajes nuevos</span>
              <span style={{ fontFamily: HEAD, fontSize: 64 }}>0</span>
            </div>
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ESCENA B: tres errores ---------- */
const SceneB: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, 0, 18);
  const items = ["Bio", "Feed", "Camino"];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 170 }}>
      <div
        style={{
          fontFamily: HEAD,
          fontSize: 760,
          lineHeight: 0.9,
          color: YELLOW,
          transform: `scale(${0.5 + 0.5 * p})`,
          textShadow: `0 0 120px ${YELLOW}55`,
        }}
      >
        3
      </div>
      <div style={{ fontFamily: HEAD, fontSize: 130, color: WHITE, textTransform: "uppercase", marginTop: -10 }}>
        errores
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 40 }}>
        {items.map((t, i) => {
          const q = pop(frame, fps, 24 + i * 9, 14);
          return (
            <div key={t} style={{ transform: `scale(${q})`, opacity: q }}>
              <Tag color="#1d1d28" fg={WHITE} style={{ border: `3px solid ${RED}`, fontSize: 40 }}>
                ✕ {t}
              </Tag>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ESCENA C: bio sin acción ---------- */
const SceneC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, 0, 18);
  const lineP = interpolate(frame, [26, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagP = pop(frame, fps, 40, 14);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
      <Tag color={RED} style={{ marginBottom: 36, transform: `scale(${pop(frame, fps, 0, 12)})` }}>
        Error 1 · La bio
      </Tag>
      <div style={{ transform: `scale(${0.85 + 0.15 * p})` }}>
        <div
          style={{
            width: 880,
            background: "#14141b",
            borderRadius: 40,
            border: "3px solid #2c2c3a",
            padding: "56px 56px 60px",
            fontFamily: BODY,
            color: WHITE,
            fontSize: 50,
            lineHeight: 1.45,
            boxShadow: "0 40px 120px rgba(0,0,0,.6)",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 56 }}>Tu Negocio | Servicios</div>
          <div style={{ opacity: 0.9 }}>Ayudamos a que resaltes tu marca</div>
          <div style={{ opacity: 0.9 }}>+ 5 años de experiencia</div>
          <div style={{ position: "relative", display: "inline-block", fontWeight: 800 }}>
            3122194897
            <div
              style={{
                position: "absolute",
                left: -12,
                right: -12,
                bottom: 2,
                height: 8,
                borderRadius: 4,
                background: RED,
                transformOrigin: "left",
                transform: `scaleX(${lineP})`,
              }}
            />
          </div>
          <div style={{ opacity: 0.9 }}>
            C… <span style={{ opacity: 0.55 }}>más</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 46, transform: `scale(${tagP})`, opacity: tagP }}>
        <Tag color={YELLOW} fg={BG} style={{ fontSize: 46 }}>
          Un número no dice qué hacer
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ESCENA D: feed de una sola cosa ---------- */
const SceneD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
      <Tag color={RED} style={{ marginBottom: 36, transform: `scale(${pop(frame, fps, 0, 12)})` }}>
        Error 2 · El feed
      </Tag>
      <div style={{ display: "flex", flexWrap: "wrap", width: 900, gap: 12 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const q = pop(frame, fps, 4 + i * 2, 12);
          return (
            <div
              key={i}
              style={{
                width: 292,
                height: 232,
                borderRadius: 18,
                background: `linear-gradient(145deg, ${PURPLE_LIGHT}, ${PURPLE})`,
                transform: `scale(${q})`,
                opacity: q,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: HEAD,
                fontSize: 58,
                color: WHITE,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Lo mismo
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ESCENA E: sin camino ---------- */
const SceneE: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brk = pop(frame, fps, 42, 10);
  const node = (label: string, left: boolean, delay: number) => {
    const q = pop(frame, fps, delay, 14);
    return (
      <div
        style={{
          transform: `scale(${q})`,
          width: 300,
          height: 300,
          borderRadius: 150,
          background: left ? "#1d1d28" : `linear-gradient(145deg, ${YELLOW}, #e69b00)`,
          border: left ? `4px solid ${PURPLE_LIGHT}` : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: HEAD,
          fontSize: 70,
          textTransform: "uppercase",
          color: left ? WHITE : BG,
        }}
      >
        {label}
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
      <Tag color={RED} style={{ marginBottom: 90, transform: `scale(${pop(frame, fps, 0, 12)})` }}>
        Error 3 · El camino
      </Tag>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        {node("Seguidor", true, 2)}
        <div style={{ position: "relative", width: 12, height: 330 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 12,
              height: `${draw * 46}%`,
              background: `repeating-linear-gradient(${PURPLE_LIGHT} 0 18px, transparent 18px 34px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -62,
              top: 110,
              width: 136,
              height: 136,
              borderRadius: 68,
              background: RED,
              color: WHITE,
              fontFamily: HEAD,
              fontSize: 96,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${brk})`,
              boxShadow: `0 0 60px ${RED}99`,
            }}
          >
            ✕
          </div>
        </div>
        {node("Cliente", false, 8)}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ESCENA F: páginas reales de la auditoría ---------- */
const PAGES: { src: string; label: string; from: number }[] = [
  { src: "pdf/p1-01.png", label: "Auditoría estratégica", from: 15.0 },
  { src: "pdf/p11-11.png", label: "Matriz FODA", from: 17.9 },
  { src: "pdf/p9-09.png", label: "Propuesta de contenido", from: 19.4 },
  { src: "pdf/p10-10.png", label: "10 Reels para empezar", from: 20.95 },
  { src: "pdf/p12-12.png", label: "Plan de 30 días", from: 21.75 },
];

const SceneF: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneStart = s(15.0);
  const abs = frame + sceneStart;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
      <div style={{ position: "relative", width: 800, height: 1034 }}>
        {PAGES.map((pg, i) => {
          const start = s(pg.from);
          const next = PAGES[i + 1] ? s(PAGES[i + 1].from) : Infinity;
          if (abs < start - 2 || abs >= next + 8) return null;
          const local = abs - start;
          const q = spring({ frame: local, fps, config: { damping: 15, stiffness: 170 }, durationInFrames: 16 });
          const out = abs >= next ? interpolate(abs, [next, next + 8], [1, 0], { extrapolateRight: "clamp" }) : 1;
          const tilt = (i % 2 ? 1 : -1) * 2.2;
          return (
            <div
              key={pg.src}
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateY(${(1 - q) * 160}px) rotate(${tilt * q}deg) scale(${0.9 + 0.1 * q})`,
                opacity: Math.min(q, out),
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: `0 40px 120px rgba(0,0,0,.75), 0 0 0 3px ${PURPLE_LIGHT}55`,
                background: WHITE,
              }}
            >
              <Img src={staticFile(pg.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          );
        })}
        {PAGES.map((pg, i) => {
          const start = s(pg.from);
          const next = PAGES[i + 1] ? s(PAGES[i + 1].from) : Infinity;
          if (abs < start || abs >= next) return null;
          const q = pop(frame, fps, start - sceneStart, 12);
          return (
            <div
              key={pg.label}
              style={{ position: "absolute", left: 0, right: 0, top: -64, display: "flex", justifyContent: "center", transform: `scale(${q})` }}
            >
              <Tag color={YELLOW} fg={BG} style={{ fontSize: 40 }}>
                {pg.label}
              </Tag>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ESCENA G: recibo US$ 75 ---------- */
const SceneG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 15, stiffness: 140 }, durationInFrames: 20 });
  const rows = [
    "Diagnóstico del perfil",
    "Matriz FODA",
    "Propuesta de contenido",
    "Optimización de bio y destacados",
    "Plan de 30 días",
  ];
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
      <div
        style={{
          width: 840,
          background: "#F6F3EC",
          color: "#1a1a1f",
          fontFamily: "'Courier New', monospace",
          padding: "56px 56px 50px",
          transform: `rotate(${-4 + (1 - p) * -10}deg) translateY(${(1 - p) * 500}px)`,
          boxShadow: "0 40px 120px rgba(0,0,0,.7)",
        }}
      >
        <div style={{ fontFamily: BODY, fontWeight: 800, letterSpacing: 4, fontSize: 30, color: PURPLE }}>
          LUZ DIGITAL · CREATIVE AGENCY
        </div>
        <div style={{ fontFamily: HEAD, fontSize: 84, textTransform: "uppercase", margin: "10px 0 6px" }}>
          Auditoría de Instagram
        </div>
        <div style={{ borderTop: "3px dashed #1a1a1f55", margin: "20px 0" }} />
        {rows.map((r, i) => {
          const q = pop(frame, fps, 12 + i * 6, 10);
          return (
            <div key={r} style={{ fontSize: 36, margin: "16px 0", opacity: q, transform: `translateX(${(1 - q) * 40}px)` }}>
              ✓ {r}
            </div>
          );
        })}
        <div style={{ borderTop: "3px dashed #1a1a1f55", margin: "26px 0 16px" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontFamily: HEAD,
            fontSize: 110,
            opacity: pop(frame, fps, 46, 10),
          }}
        >
          <span style={{ fontSize: 64 }}>TOTAL</span>
          <span style={{ color: PURPLE }}>US$ 75</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ESCENA H: de 75 a 0 ---------- */
const SceneH: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const zero = spring({ frame: frame - 14, fps, config: { damping: 9, stiffness: 160 }, durationInFrames: 22 });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 260 }}>
      <div style={{ position: "relative", whiteSpace: "nowrap", fontFamily: HEAD, fontSize: 250, color: "#ffffff88" }}>
        US$ 75
        <div
          style={{
            position: "absolute",
            left: -20,
            right: -20,
            top: "52%",
            height: 20,
            background: RED,
            transformOrigin: "left",
            transform: `scaleX(${strike}) rotate(-4deg)`,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: HEAD,
          fontSize: 430,
          whiteSpace: "nowrap",
          color: YELLOW,
          lineHeight: 1,
          marginTop: 30,
          transform: `scale(${zero})`,
          textShadow: `0 0 160px ${YELLOW}88`,
        }}
      >
        US$ 0
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ESCENA I: CTA ---------- */
const SceneI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoP = pop(frame, fps, 0, 18);
  const btn = pop(frame, fps, 16, 16);
  const pulse = 1 + 0.03 * Math.sin(frame / 4);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
      <Img src={staticFile("logo/blanco.png")} style={{ width: 880, transform: `scale(${logoP})` }} />
      <div style={{ marginTop: 30, transform: `scale(${btn * pulse})` }}>
        <div
          style={{
            background: YELLOW,
            color: BG,
            fontFamily: HEAD,
            fontSize: 96,
            textTransform: "uppercase",
            padding: "30px 64px",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 24,
            boxShadow: `0 0 100px ${YELLOW}66`,
          }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill={BG}>
            <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          </svg>
          Comenta
        </div>
      </div>
      <div style={{ marginTop: 28, opacity: pop(frame, fps, 26, 14) }}>
        <div style={{ fontFamily: HEAD, fontSize: 120, color: WHITE, textTransform: "uppercase" }}>Auditoría</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Composición principal ---------- */
const SCENES: { from: number; to: number; C: React.FC }[] = [
  { from: 0, to: 3.2, C: SceneA },
  { from: 3.2, to: 6.0, C: SceneB },
  { from: 6.0, to: 9.5, C: SceneC },
  { from: 9.5, to: 12.2, C: SceneD },
  { from: 12.2, to: 15.0, C: SceneE },
  { from: 15.0, to: 22.6, C: SceneF },
  { from: 22.6, to: 25.4, C: SceneG },
  { from: 25.4, to: 27.1, C: SceneH },
  { from: 27.1, to: 31.5, C: SceneI },
];

export const AuditoriaVideo: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Background />
      {SCENES.map(({ from, to, C }, i) => (
        <Sequence key={i} from={s(from)} durationInFrames={s(to) - s(from)} name={C.name || `Escena ${i + 1}`}>
          <Punch>
            <C />
          </Punch>
        </Sequence>
      ))}
      <Captions />
      <Audio src={staticFile("voz/voz.mp3")} />
    </AbsoluteFill>
  );
};
