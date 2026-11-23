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

/* ---------- Línea gráfica (propuestas comerciales Luz Digital) ---------- */
const BG = "#F7F5F2";
const INK = "#0B0B0E";
const MUTED = "#5B5868";
const PURPLE = "#4B2A7B";
const YELLOW = "#FBB800";
const RED = "#E5484D";
const WHITE = "#FFFFFF";
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";
const TIGHT = "-0.035em";

const s = (sec: number) => Math.round(sec * FPS);

/* ---------- Fuentes locales ---------- */
const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [600, 700, 800].map(
      (w) => new FontFace("Inter", `url(${staticFile(`fonts/inter${w}.woff2`)})`, { weight: String(w) }),
    );
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
    let chars = 0;
    words.forEach((w, i) => {
      const t = sen.start + ((sen.end - sen.start) * acc) / total;
      acc += w.length + 1;
      if (inGroup > 0 && chars + w.length > 17) {
        group++;
        inGroup = 0;
        chars = 0;
      }
      out.push({ text: w, t, hl: sen.hl.includes(w), group });
      inGroup++;
      chars += w.length + 1;
      if (i === words.length - 1) group++;
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
  const active = SENTENCES.find((sen) => now >= sen.start - 0.05 && now <= sen.end + 0.6);
  if (!active) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 1390,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "6px 24px",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 104,
        letterSpacing: TIGHT,
        lineHeight: 1.08,
        textAlign: "center",
      }}
    >
      {line.map((w, i) => {
        if (w.t > now + 0.02) return null;
        const p = spring({
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
              transform: `scale(${0.75 + 0.25 * p}) translateY(${(1 - p) * 22}px)`,
              opacity: p,
              color: w.hl ? PURPLE : INK,
              backgroundImage: w.hl ? `linear-gradient(transparent 66%, ${YELLOW}AA 66%, ${YELLOW}AA 92%, transparent 92%)` : "none",
              padding: "0 6px",
            }}
          >
            {w.text.replace(/[,.:]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Fondo y cabecera ---------- */
const Background: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div
      style={{
        position: "absolute",
        width: 1400,
        height: 1100,
        right: -500,
        top: -420,
        background: "radial-gradient(ellipse at center, #E4D9F7 0%, #EFE8FA66 45%, transparent 72%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 1100,
        height: 800,
        left: -450,
        bottom: -380,
        background: "radial-gradient(ellipse at center, #FBB80026 0%, transparent 70%)",
      }}
    />
  </AbsoluteFill>
);

const Header: React.FC = () => (
  <div style={{ position: "absolute", left: 64, right: 64, top: 70 }}>
    <Img src={staticFile("logo/color.png")} style={{ width: 300, marginLeft: -48, marginTop: -64, marginBottom: -50 }} />
    <div style={{ position: "relative", height: 8, background: PURPLE, borderRadius: 4, marginTop: 12 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 150, height: 8, background: YELLOW, borderRadius: 4 }} />
    </div>
  </div>
);

const Punch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16, stiffness: 180 }, durationInFrames: 14 });
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1.04 - 0.04 * p})`,
        opacity: interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const pop = (frame: number, fps: number, delay = 0, dur = 16) =>
  spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 190 }, durationInFrames: dur });

/* ---------- Piezas reutilizables ---------- */
const Eyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: 38,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: PURPLE,
      ...style,
    }}
  >
    <span style={{ width: 26, height: 26, borderRadius: 8, background: YELLOW, display: "inline-block" }} />
    {children}
  </div>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; outline?: boolean }> = ({
  children,
  style,
  outline = true,
}) => (
  <div
    style={{
      background: WHITE,
      borderRadius: 44,
      border: outline ? `4px solid ${PURPLE}` : "3px solid #E5E1EC",
      boxShadow: "0 24px 60px rgba(75,42,123,.12)",
      ...style,
    }}
  >
    {children}
  </div>
);

const DarkCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: "#0A0A0C",
      borderRadius: 44,
      borderLeft: `18px solid ${YELLOW}`,
      color: WHITE,
      boxShadow: "0 24px 60px rgba(0,0,0,.22)",
      ...style,
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

const Headline: React.FC<{ a: string; b?: string; size?: number; style?: React.CSSProperties }> = ({
  a,
  b,
  size = 96,
  style,
}) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: TIGHT, lineHeight: 1.02, color: INK, ...style }}>
    {a}
    {b ? <span style={{ color: PURPLE }}> {b}</span> : null}
  </div>
);

/* ---------- ESCENA A: gancho ---------- */
const SceneA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const likes = Math.round(interpolate(frame, [0, 70], [180, 1240], { extrapolateRight: "clamp" }));
  const p = pop(frame, fps, 0, 20);
  const pulse = 0.65 + 0.35 * Math.sin(frame / 5);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
      <div style={{ transform: `scale(${0.88 + 0.12 * p})`, opacity: p }}>
        <Card style={{ width: 880, padding: "44px 48px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 36, fontFamily: FONT }}>
            <div
              style={{
                width: 170,
                height: 170,
                borderRadius: 85,
                background: `linear-gradient(135deg, ${PURPLE}, ${YELLOW})`,
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", gap: 44, textAlign: "center" }}>
              {[
                ["128", "posts"],
                ["4.812", "seguidores"],
                ["301", "siguiendo"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontWeight: 800, fontSize: 52, letterSpacing: TIGHT, color: INK }}>{n}</div>
                  <div style={{ fontSize: 28, fontWeight: 600, color: MUTED }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 42, color: INK, margin: "26px 0 6px" }}>@tunegocio</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 246,
                  height: 210,
                  borderRadius: 18,
                  background: i % 3 === 0 ? "#E9E1F7" : i % 3 === 1 ? "#F3EEE4" : "#E4E1EA",
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 30,
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 44,
              color: INK,
            }}
          >
            <Heart size={48} /> {likes.toLocaleString("es-CO")} me gusta
          </div>
        </Card>
        <DarkCard
          style={{
            width: 880,
            marginTop: 30,
            padding: "36px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, letterSpacing: TIGHT }}>Mensajes nuevos</div>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 130,
              letterSpacing: TIGHT,
              color: YELLOW,
              opacity: frame > 18 ? pulse + 0.25 : 0,
              lineHeight: 1,
            }}
          >
            0
          </div>
        </DarkCard>
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
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 640,
          lineHeight: 0.85,
          letterSpacing: "-0.06em",
          color: PURPLE,
          transform: `scale(${0.5 + 0.5 * p})`,
        }}
      >
        3
      </div>
      <Headline a="errores" b="comunes" size={130} style={{ marginTop: 6, textAlign: "center" }} />
      <div style={{ display: "flex", gap: 22, marginTop: 56 }}>
        {items.map((t, i) => {
          const q = pop(frame, fps, 24 + i * 9, 14);
          return (
            <div key={t} style={{ transform: `scale(${q})`, opacity: q }}>
              <Card outline={false} style={{ borderRadius: 999, padding: "18px 38px", border: `3px solid ${RED}`, boxShadow: "none" }}>
                <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: INK }}>
                  <span style={{ color: RED }}>✕</span> {t}
                </span>
              </Card>
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
  const mark = interpolate(frame, [26, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagP = pop(frame, fps, 40, 14);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
      <Eyebrow style={{ marginBottom: 34, opacity: pop(frame, fps, 0, 12) }}>Error 1 · La bio</Eyebrow>
      <div style={{ transform: `scale(${0.88 + 0.12 * p})`, opacity: p }}>
        <Card style={{ width: 900, padding: "54px 56px 58px", fontFamily: FONT, color: INK, fontSize: 52, lineHeight: 1.5 }}>
          <div style={{ fontWeight: 800, fontSize: 58, letterSpacing: TIGHT }}>Tu Negocio | Servicios</div>
          <div style={{ color: MUTED, fontWeight: 600 }}>Ayudamos a que resaltes tu marca</div>
          <div style={{ color: MUTED, fontWeight: 600 }}>+ 5 años de experiencia</div>
          <div style={{ position: "relative", display: "inline-block", fontWeight: 800 }}>
            <span
              style={{
                position: "absolute",
                left: -10,
                right: -10,
                top: 8,
                bottom: 6,
                background: `${YELLOW}`,
                borderRadius: 10,
                transformOrigin: "left",
                transform: `scaleX(${mark})`,
              }}
            />
            <span style={{ position: "relative" }}>3122194897</span>
          </div>
          <div style={{ color: MUTED, fontWeight: 600 }}>
            C… <span style={{ opacity: 0.6 }}>más</span>
          </div>
        </Card>
      </div>
      <div style={{ marginTop: 44, transform: `scale(${tagP})`, opacity: tagP }}>
        <DarkCard style={{ padding: "26px 46px" }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, letterSpacing: TIGHT }}>
            Un número <span style={{ color: YELLOW }}>no dice qué hacer</span>
          </span>
        </DarkCard>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ESCENA D: feed de una sola cosa ---------- */
const SceneD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
      <Eyebrow style={{ marginBottom: 34, opacity: pop(frame, fps, 0, 12) }}>Error 2 · El feed</Eyebrow>
      <div style={{ display: "flex", flexWrap: "wrap", width: 900, gap: 12 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const q = pop(frame, fps, 4 + i * 2, 12);
          return (
            <div
              key={i}
              style={{
                width: 292,
                height: 214,
                borderRadius: 26,
                background: PURPLE,
                transform: `scale(${q})`,
                opacity: q,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 46,
                letterSpacing: TIGHT,
                color: WHITE,
                boxShadow: "0 14px 30px rgba(75,42,123,.25)",
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
  const node = (label: string, first: boolean, delay: number) => {
    const q = pop(frame, fps, delay, 14);
    return (
      <div
        style={{
          transform: `scale(${q})`,
          width: 300,
          height: 300,
          borderRadius: 150,
          background: first ? WHITE : YELLOW,
          border: first ? `5px solid ${PURPLE}` : "none",
          boxShadow: "0 24px 60px rgba(75,42,123,.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 54,
          letterSpacing: TIGHT,
          color: INK,
        }}
      >
        {label}
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
      <Eyebrow style={{ marginBottom: 56, opacity: pop(frame, fps, 0, 12) }}>Error 3 · El camino</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {node("Seguidor", true, 2)}
        <div style={{ position: "relative", width: 12, height: 300 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 12,
              height: `${draw * 46}%`,
              background: `repeating-linear-gradient(${PURPLE} 0 18px, transparent 18px 34px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -62,
              top: 100,
              width: 136,
              height: 136,
              borderRadius: 68,
              background: RED,
              color: WHITE,
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${brk})`,
              boxShadow: `0 0 50px ${RED}77`,
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
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
      <div style={{ position: "relative", width: 780, height: 1010 }}>
        {PAGES.map((pg, i) => {
          const start = s(pg.from);
          const next = PAGES[i + 1] ? s(PAGES[i + 1].from) : Infinity;
          if (abs < start - 2 || abs >= next + 8) return null;
          const local = abs - start;
          const q = spring({ frame: local, fps, config: { damping: 15, stiffness: 170 }, durationInFrames: 16 });
          const out = abs >= next ? interpolate(abs, [next, next + 8], [1, 0], { extrapolateRight: "clamp" }) : 1;
          const tilt = (i % 2 ? 1 : -1) * 2;
          return (
            <div
              key={pg.src}
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateY(${(1 - q) * 160}px) rotate(${tilt * q}deg) scale(${0.9 + 0.1 * q})`,
                opacity: Math.min(q, out),
                borderRadius: 22,
                overflow: "hidden",
                boxShadow: `0 30px 80px rgba(75,42,123,.28), 0 0 0 4px ${PURPLE}`,
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
              style={{ position: "absolute", left: 0, right: 0, top: -74, display: "flex", justifyContent: "center", transform: `scale(${q})` }}
            >
              <Eyebrow style={{ fontSize: 32, whiteSpace: "nowrap", letterSpacing: "0.12em", background: WHITE, padding: "12px 30px", borderRadius: 999, border: `3px solid ${PURPLE}` }}>
                {pg.label}
              </Eyebrow>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- ESCENA G: lo que incluye + US$ 75 ---------- */
const SceneG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 15, stiffness: 140 }, durationInFrames: 20 });
  const rows = ["Diagnóstico del perfil", "Matriz FODA", "Propuesta de contenido", "Optimización de bio y destacados", "Plan de 30 días"];
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
      <div style={{ transform: `translateY(${(1 - p) * 400}px)`, opacity: p }}>
        <Card style={{ width: 900, padding: "48px 56px 44px" }}>
          <Eyebrow style={{ fontSize: 34 }}>Qué incluye</Eyebrow>
          <div style={{ marginTop: 22 }}>
            {rows.map((r, i) => {
              const q = pop(frame, fps, 10 + i * 6, 10);
              return (
                <div
                  key={r}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                    margin: "20px 0",
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 46,
                    letterSpacing: "-0.02em",
                    color: INK,
                    opacity: q,
                    transform: `translateX(${(1 - q) * 40}px)`,
                  }}
                >
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                  {r}
                </div>
              );
            })}
          </div>
        </Card>
        <DarkCard
          style={{
            width: 900,
            marginTop: 30,
            padding: "30px 52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: pop(frame, fps, 44, 10),
          }}
        >
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 36, letterSpacing: "0.16em", textTransform: "uppercase", color: "#cfc8e0" }}>
            Precio de la auditoría
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 110, letterSpacing: TIGHT, color: YELLOW }}>US$ 75</div>
        </DarkCard>
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
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
      <Eyebrow style={{ marginBottom: 20 }}>Precio regular</Eyebrow>
      <div
        style={{
          position: "relative",
          whiteSpace: "nowrap",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 230,
          letterSpacing: TIGHT,
          color: "#B9B4C6",
        }}
      >
        US$ 75
        <div
          style={{
            position: "absolute",
            left: -20,
            right: -20,
            top: "54%",
            height: 20,
            background: RED,
            borderRadius: 10,
            transformOrigin: "left",
            transform: `scaleX(${strike}) rotate(-4deg)`,
          }}
        />
      </div>
      <div style={{ transform: `scale(${zero})`, marginTop: 40 }}>
        <DarkCard style={{ padding: "14px 70px 24px 60px" }}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 250,
              letterSpacing: "-0.05em",
              whiteSpace: "nowrap",
              color: YELLOW,
              lineHeight: 1.05,
            }}
          >
            US$ 0
          </div>
        </DarkCard>
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
  const pulse = 1 + 0.025 * Math.sin(frame / 4);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 220 }}>
      <Img src={staticFile("logo/color.png")} style={{ width: 920, transform: `scale(${logoP})` }} />
      <div style={{ position: "relative", width: 760, height: 8, background: PURPLE, borderRadius: 4, marginTop: -30, opacity: logoP }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 190, height: 8, background: YELLOW, borderRadius: 4 }} />
      </div>
      <div style={{ marginTop: 70, transform: `scale(${btn * pulse})` }}>
        <div
          style={{
            background: YELLOW,
            color: INK,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 100,
            letterSpacing: TIGHT,
            padding: "34px 70px",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 26,
            boxShadow: `0 24px 60px ${YELLOW}77`,
          }}
        >
          <svg width="84" height="84" viewBox="0 0 24 24" fill={INK}>
            <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          </svg>
          Comenta
        </div>
      </div>
      <div style={{ marginTop: 30, opacity: pop(frame, fps, 26, 14) }}>
        <Headline a="" b="AUDITORÍA" size={150} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Composición principal ---------- */
const SCENES: { from: number; to: number; C: React.FC; header?: boolean }[] = [
  { from: 0, to: 3.2, C: SceneA, header: true },
  { from: 3.2, to: 6.0, C: SceneB, header: true },
  { from: 6.0, to: 9.5, C: SceneC, header: true },
  { from: 9.5, to: 12.2, C: SceneD, header: true },
  { from: 12.2, to: 15.0, C: SceneE, header: true },
  { from: 15.0, to: 22.6, C: SceneF, header: true },
  { from: 22.6, to: 25.4, C: SceneG, header: true },
  { from: 25.4, to: 27.1, C: SceneH, header: true },
  { from: 27.1, to: 31.5, C: SceneI },
];

export const AuditoriaVideo: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Background />
      {SCENES.map(({ from, to, C, header }, i) => (
        <Sequence key={i} from={s(from)} durationInFrames={s(to) - s(from)} name={`Escena ${i + 1}`}>
          {header ? <Header /> : null}
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
