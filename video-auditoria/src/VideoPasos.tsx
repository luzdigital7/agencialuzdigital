import React, { createContext, useContext, useEffect, useState } from "react";
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
import { SENTENCES, TOTAL } from "./timing";

export const FPS = 30;
export const DURATION = Math.ceil(TOTAL * FPS);
const HANDLE = "@AGENCIA.LUZDIGITAL";

/* ---------- Paleta Luz Digital + dos variantes de fondo ---------- */
const YELLOW = "#FBB800";
const PURPLE = "#4B2A7B";
const RED = "#FF5A5F";
const INK = "#0B0B0E";

type Theme = {
  bg: string;
  fg: string;
  muted: string;
  accent: string; // segunda línea de los titulares
  card: string;
  border: string;
  ghost: string;
  logo: string;
  glow: string;
  dim: string;
};

const DARK: Theme = {
  bg: "#0E0E13",
  fg: "#FFFFFF",
  muted: "rgba(255,255,255,.52)",
  accent: YELLOW,
  card: "#17171F",
  border: "rgba(255,255,255,.11)",
  ghost: "rgba(255,255,255,.075)",
  logo: "logo/blanco.png",
  glow: "radial-gradient(ellipse at center, #6D3FC4aa 0%, #4B2A7B55 40%, transparent 72%)",
  dim: "rgba(255,255,255,.28)",
};

const LIGHT: Theme = {
  bg: "#F7F5F2",
  fg: INK,
  muted: "#6B6878",
  accent: PURPLE,
  card: "#FFFFFF",
  border: "#E1DCEA",
  ghost: "rgba(75,42,123,.09)",
  logo: "logo/color.png",
  glow: "radial-gradient(ellipse at center, #DCCFF5 0%, #EFE8FA66 45%, transparent 72%)",
  dim: "rgba(11,11,14,.28)",
};

const ThemeCtx = createContext<Theme>(DARK);
const useTheme = () => useContext(ThemeCtx);

/* Reloj absoluto: cada escena sabe en qué frame global empieza */
const ClockCtx = createContext(0);
const useAbsFrame = () => useCurrentFrame() + useContext(ClockCtx);
const useNow = () => useAbsFrame() / FPS;

const ANTON = "Anton, Impact, sans-serif";
const POP = "Poppins, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, Menlo, 'DejaVu Sans Mono', monospace";

const s = (sec: number) => Math.round(sec * FPS);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const prog = (now: number, a: number, b: number) => clamp01((now - a) / (b - a));

/* spring anclado a un instante absoluto (segundos) */
const useSpringAt = (t: number, dur = 14) => {
  const f = useAbsFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - s(t), fps, config: { damping: 13, stiffness: 190 }, durationInFrames: dur });
};

/* ---------- Fuentes locales ---------- */
const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Anton", `url(${staticFile("fonts/anton.woff2")})`),
      new FontFace("Poppins", `url(${staticFile("fonts/poppins500.woff2")})`, { weight: "500" }),
      new FontFace("Poppins", `url(${staticFile("fonts/poppins600.woff2")})`, { weight: "600" }),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((l) => {
        l.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

/* ---------- Tiempos de escena (derivados del audio) ---------- */
const st = (i: number) => SENTENCES[i].start;
const en = (i: number) => SENTENCES[i].end;
const at = (i: number, frac: number) => st(i) + (en(i) - st(i)) * frac;

/* ---------- Subtítulos ---------- */
type Word = { text: string; t: number; hl: boolean; group: number };

const buildWords = (): Word[] => {
  const out: Word[] = [];
  let group = 0;
  for (const sen of SENTENCES) {
    const words = sen.text.split(" ");
    const total = words.reduce((a, w) => a + w.length + 1, 0);
    let acc = 0;
    let chars = 0;
    let inGroup = 0;
    words.forEach((w) => {
      const t = sen.start + ((sen.end - sen.start) * acc) / total;
      acc += w.length + 1;
      if (inGroup > 0 && chars + w.length > 21) {
        group++;
        chars = 0;
        inGroup = 0;
      }
      out.push({ text: w, t, hl: sen.hl.includes(w.replace(/[,.:¿?]/g, "")), group });
      chars += w.length + 1;
      inGroup++;
    });
    group++;
  }
  return out;
};
const WORDS = buildWords();

const Captions: React.FC = () => {
  const T = useTheme();
  const f = useCurrentFrame();
  const now = f / FPS;
  const spoken = WORDS.filter((w) => w.t <= now + 0.02);
  if (!spoken.length) return null;
  const active = spoken[spoken.length - 1];
  const sen = SENTENCES.find((x) => now >= x.start - 0.05 && now <= x.end + 0.5);
  if (!sen) return null;
  const line = WORDS.filter((w) => w.group === active.group);
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: 1330,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "10px 16px",
        fontFamily: POP,
        fontWeight: 600,
        fontSize: 60,
        lineHeight: 1.15,
        textAlign: "center",
      }}
    >
      {line.map((w, i) => {
        const isActive = w === active;
        const isPast = w.t < active.t;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              padding: "2px 16px",
              borderRadius: 16,
              background: isActive && w.hl ? YELLOW : "transparent",
              color: isActive && w.hl ? INK : isActive ? T.fg : isPast ? T.fg : T.dim,
              transform: isActive ? "scale(1.06)" : "scale(1)",
              transition: "none",
              textShadow: "none",
            }}
          >
            {w.text.replace(/[,.:¿?]/g, "")}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Fondo ---------- */
const Background: React.FC = () => {
  const T = useTheme();
  const f = useCurrentFrame();
  const drift = Math.sin(f / 70) * 30;
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <div style={{ position: "absolute", width: 1100, height: 1300, right: -520, top: -520 + drift, background: T.glow, filter: "blur(10px)" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 700,
          opacity: 0.5,
          backgroundImage: `linear-gradient(${T.ghost} 1px, transparent 1px), linear-gradient(90deg, ${T.ghost} 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Piezas ---------- */
const IG: React.FC<{ size?: number; color?: string }> = ({ size = 34, color }) => {
  const T = useTheme();
  const c = color ?? T.fg;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill={c} stroke="none" />
    </svg>
  );
};

const Handle: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const T = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: ANTON, fontSize: 28, letterSpacing: "0.04em", color: T.muted, ...style }}>
      <IG size={36} /> {HANDLE}
    </div>
  );
};

const Dot: React.FC<{ color?: string }> = ({ color = YELLOW }) => (
  <span style={{ width: 14, height: 14, borderRadius: 7, background: color, display: "inline-block" }} />
);

const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const T = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: POP, fontWeight: 600, fontSize: 26, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, ...style }}>
      <Dot /> {children}
    </div>
  );
};

const Spark: React.FC<{ size?: number; rot?: number }> = ({ size = 120, rot = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${rot}deg)` }}>
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x="46" y="2" width="8" height="34" rx="4" fill={YELLOW} transform={`rotate(${i * 30} 50 50)`} />
    ))}
  </svg>
);

const Headline: React.FC<{ a: string; b: string; size?: number; t: number }> = ({ a, b, size = 140, t }) => {
  const T = useTheme();
  const p = useSpringAt(t, 16);
  const style = (n: number): React.CSSProperties => ({
    fontFamily: ANTON,
    fontSize: size,
    lineHeight: 1.0,
    textTransform: "uppercase",
    transform: `translateX(${(1 - Math.min(1, p * (1 + n * 0.0))) * -60}px)`,
    opacity: p,
  });
  return (
    <div>
      <div style={{ ...style(0), color: T.fg }}>{a}</div>
      <div style={{ ...style(1), color: T.accent }}>{b}</div>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const T = useTheme();
  return (
    <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 36, boxShadow: "0 30px 80px rgba(0,0,0,.28)", ...style }}>
      {children}
    </div>
  );
};

/* Marco común de los pasos: progreso, número fantasma, titular */
const StepFrame: React.FC<{ n: number; label: string; a: string; b: string; of?: number; t0: number }> = ({ n, label, a, b, of = 3, t0 }) => {
  const T = useTheme();
  const num = String(n).padStart(2, "0");
  return (
    <>
      <div style={{ position: "absolute", right: -30, top: 150, fontFamily: ANTON, fontSize: 620, lineHeight: 1, color: "transparent", WebkitTextStroke: `3px ${T.ghost}` }}>{num}</div>
      {of > 0 ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 140 }}>
          <div style={{ textAlign: "center", fontFamily: POP, fontWeight: 500, fontSize: 24, letterSpacing: "0.3em", color: T.muted, marginBottom: 16 }}>
            PASO {n} DE {of}
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {Array.from({ length: of }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < n ? YELLOW : T.ghost }} />
            ))}
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 70, top: 262 }}>
        <Chip style={{ marginBottom: 20 }}>{label}</Chip>
        <Headline a={a} b={b} t={t0} />
      </div>
      <Handle style={{ position: "absolute", right: 70, top: 640 }} />
    </>
  );
};

const Body: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 700 }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top, height: 580 }}>{children}</div>
);

const Tag: React.FC<{ children: React.ReactNode; color: string; fg?: string; style?: React.CSSProperties }> = ({ children, color, fg = INK, style }) => (
  <div style={{ display: "inline-block", fontFamily: POP, fontWeight: 600, fontSize: 28, letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 24px", borderRadius: 999, background: color, color: fg, ...style }}>
    {children}
  </div>
);

/* ================= ESCENAS ================= */

/* ---- GANCHO ---- */
const Hook: React.FC = () => {
  const T = useTheme();
  const now = useNow();
  const t0 = 0;
  const chip = useSpringAt(t0, 12);
  const l1 = "TU INSTAGRAM";
  const typed = Math.floor(prog(now, 0.1, 1.1) * l1.length);
  const l2 = useSpringAt(1.2, 14);
  const l3 = useSpringAt(1.6, 14);
  const pill = useSpringAt(at(1, 0.5), 12);
  const rot = (now * 90) % 360;
  return (
    <AbsoluteFill>
      <Img src={staticFile(T.logo)} style={{ position: "absolute", top: 70, left: 0, right: 0, margin: "0 auto", width: 380 }} />
      <div style={{ position: "absolute", left: 70, top: 380 }}>
        <Chip style={{ marginBottom: 26, opacity: chip }}>Auditoría gratis</Chip>
        <div style={{ fontFamily: ANTON, fontSize: 176, lineHeight: 1.0, color: T.fg, textTransform: "uppercase" }}>
          {l1.slice(0, typed)}
          <span style={{ opacity: typed < l1.length ? 1 : 0, color: YELLOW }}>|</span>
        </div>
        <div style={{ fontFamily: ANTON, fontSize: 176, lineHeight: 1.0, color: T.fg, textTransform: "uppercase", transform: `translateY(${(1 - l2) * 40}px)`, opacity: l2 }}>
          PIERDE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 30, transform: `translateY(${(1 - l3) * 40}px)`, opacity: l3 }}>
          <div style={{ background: YELLOW, color: INK, fontFamily: ANTON, fontSize: 176, lineHeight: 1.05, padding: "0 26px", borderRadius: 18, textTransform: "uppercase", transform: "rotate(-2deg)" }}>
            CLIENTES
          </div>
        </div>
        <div style={{ position: "absolute", right: -10, top: 470, opacity: l3 }}>
          <Spark size={130} rot={rot} />
        </div>
        <div style={{ marginTop: 36, opacity: pill, transform: `scale(${0.8 + 0.2 * pill})`, transformOrigin: "left" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, fontFamily: POP, fontWeight: 600, fontSize: 30, letterSpacing: "0.12em", textTransform: "uppercase", padding: "14px 32px", borderRadius: 999, background: "rgba(251,184,0,.16)", color: YELLOW, border: `2px solid ${YELLOW}` }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="2.4" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            3 pasos
          </div>
        </div>
      </div>
      <Handle style={{ position: "absolute", right: 70, top: 1250 }} />
    </AbsoluteFill>
  );
};

/* ---- PASO 1: la bio ---- */
const Paso1: React.FC = () => {
  const T = useTheme();
  const now = useNow();
  const t0 = st(2);
  const fix = at(3, 0.58);
  const card = useSpringAt(t0 + 0.5, 16);
  const mark = prog(now, at(3, 0.12), at(3, 0.3));
  const swap = prog(now, fix, fix + 0.3);
  const fixed = swap > 0.5;
  const tag = useSpringAt(fix, 12);
  return (
    <AbsoluteFill>
      <StepFrame n={1} label="Paso 01" a="REVISA" b="TU BIO" t0={t0} />
      <Body>
        <div style={{ transform: `scale(${0.9 + 0.1 * card})`, opacity: card }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Tag color={fixed ? YELLOW : "transparent"} fg={fixed ? INK : RED} style={{ border: fixed ? "none" : `3px solid ${RED}` }}>
              {fixed ? "Después ✓" : "Antes ✕"}
            </Tag>
          </div>
          <Card style={{ padding: "44px 52px", fontFamily: POP, color: T.fg, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, fontSize: 52 }}>Tu Negocio | Servicios</div>
            <div style={{ fontWeight: 500, fontSize: 40, color: T.muted }}>Ayudamos a que resaltes tu marca</div>
            <div style={{ fontWeight: 500, fontSize: 40, color: T.muted }}>+ 5 años de experiencia</div>
            <div style={{ position: "relative", marginTop: 4, height: 72 }}>
              <div style={{ position: "absolute", left: 0, top: 0, opacity: 1 - swap, transform: `scaleY(${1 - swap})`, fontWeight: 600, fontSize: 48, whiteSpace: "nowrap" }}>
                <span style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: -8, right: -8, bottom: 2, height: 8, background: RED, borderRadius: 4, transformOrigin: "left", transform: `scaleX(${mark})` }} />
                  <span style={{ position: "relative" }}>3122194897</span>
                </span>
              </div>
              <div style={{ position: "absolute", left: 0, top: 0, opacity: swap, transform: `scale(${0.9 + 0.1 * tag})`, transformOrigin: "left", fontWeight: 600, fontSize: 46, color: YELLOW, whiteSpace: "nowrap" }}>
                → Escríbenos y agenda hoy
              </div>
            </div>
            <div style={{ fontWeight: 500, fontSize: 40, color: T.muted }}>
              {fixed ? "wa.link/auditoria" : <>C… <span style={{ opacity: 0.6 }}>más</span></>}
            </div>
          </Card>
        </div>
      </Body>
    </AbsoluteFill>
  );
};

/* ---- PASO 2: el feed ---- */
const FEED = [
  { t: "Educa", bg: PURPLE, fg: "#fff" },
  { t: "Autoridad", bg: YELLOW, fg: INK },
  { t: "Casos", bg: "#FFFFFF", fg: INK },
  { t: "Prueba", bg: "#7B4FD6", fg: "#fff" },
  { t: "Humaniza", bg: "#26262F", fg: "#fff" },
  { t: "Vende", bg: YELLOW, fg: INK },
];

const Paso2: React.FC = () => {
  const now = useNow();
  const t0 = st(4);
  const fix = at(5, 0.6);
  const lab = useSpringAt(fix, 12);
  const fixed = now > fix + 0.15;
  return (
    <AbsoluteFill>
      <StepFrame n={2} label="Paso 02" a="MIRA" b="TU FEED" t0={t0} />
      <Body>
        <div style={{ marginBottom: 20, opacity: useSpringAt(t0 + 0.4, 12) }}>
          <Tag color={fixed ? YELLOW : "transparent"} fg={fixed ? INK : RED} style={{ border: fixed ? "none" : `3px solid ${RED}`, transform: `scale(${fixed ? 0.9 + 0.1 * lab : 1})` }}>
            {fixed ? "Después ✓" : "Antes ✕"}
          </Tag>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, width: 940 }}>
          {FEED.map((tile, i) => {
            const pin = useSpringAt(t0 + 0.5 + i * 0.07, 12);
            const p = prog(now, fix + i * 0.09, fix + i * 0.09 + 0.36);
            const showNew = p > 0.5;
            const sx = Math.abs(1 - 2 * p);
            return (
              <div
                key={i}
                style={{
                  width: 300,
                  height: 250,
                  borderRadius: 28,
                  background: showNew ? tile.bg : PURPLE,
                  color: showNew ? tile.fg : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: ANTON,
                  fontSize: 56,
                  textTransform: "uppercase",
                  transform: `scale(${pin}) scaleX(${p > 0 && p < 1 ? sx : 1})`,
                  opacity: pin,
                  border: showNew && tile.bg === "#FFFFFF" ? "2px solid #E1DCEA" : "none",
                }}
              >
                {showNew ? tile.t : "Lo mismo"}
              </div>
            );
          })}
        </div>
      </Body>
    </AbsoluteFill>
  );
};

/* ---- PASO 3: el camino ---- */
const NODES = ["Seguidor", "Bio", "Destacados", "WhatsApp", "Cliente"];

const Paso3: React.FC = () => {
  const T = useTheme();
  const now = useNow();
  const t0 = st(6);
  const times = [at(7, 0.05), at(7, 0.64), at(7, 0.74), at(7, 0.9), en(7) + 0.25];
  const draw = prog(now, t0 + 0.4, t0 + 1.6);
  const total = 5;
  const lastDone = times.filter((x) => now >= x).length;
  const fillW = lastDone <= 1 ? 0 : (lastDone - 1) / (total - 1);
  const dot = prog(now, times[0], times[4]);
  return (
    <AbsoluteFill>
      <StepFrame n={3} label="Paso 03" a="TRAZA" b="EL CAMINO" t0={t0} />
      <Body top={760}>
        <div style={{ position: "relative", height: 330, marginTop: 40 }}>
          {/* línea base */}
          <div style={{ position: "absolute", left: 80, right: 80, top: 82, height: 6, borderRadius: 3, background: T.ghost, transformOrigin: "left", transform: `scaleX(${draw})` }} />
          <div style={{ position: "absolute", left: 80, top: 82, width: 780 * fillW, height: 6, borderRadius: 3, background: YELLOW }} />
          {NODES.map((n, i) => {
            const p = useSpringAt(times[i], 12);
            const last = i === NODES.length - 1;
            const left = i * (940 - 160) / 4;
            const done = now >= times[i];
            return (
              <div key={n} style={{ position: "absolute", left, top: 0, width: 160, textAlign: "center" }}>
                <div
                  style={{
                    width: 164,
                    height: 164,
                    borderRadius: 82,
                    background: done ? (last ? YELLOW : T.card) : "transparent",
                    border: done ? (last ? "none" : `4px solid ${YELLOW}`) : `3px dashed ${T.dim}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${done ? 0.7 + 0.3 * p : 1})`,
                    boxShadow: done ? "0 20px 50px rgba(0,0,0,.3)" : "none",
                  }}
                >
                  {done ? (
                    <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke={last ? INK : YELLOW} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                  ) : null}
                </div>
                <div style={{ marginTop: 22, fontFamily: ANTON, fontSize: 36, textTransform: "uppercase", color: done ? T.fg : T.muted, whiteSpace: "nowrap", marginLeft: -20, marginRight: -20 }}>
                  {n}
                </div>
              </div>
            );
          })}
          {/* punto viajero */}
          {now >= times[0] && now < times[4] + 0.1 ? (
            <div style={{ position: "absolute", top: 72, left: 80 + 780 * dot - 13, width: 26, height: 26, borderRadius: 13, background: YELLOW, boxShadow: `0 0 30px ${YELLOW}` }} />
          ) : null}
        </div>
      </Body>
    </AbsoluteFill>
  );
};

/* ---- EXTRA: auditoría completa ---- */
const LINES = ["diagnóstico del perfil", "matriz FODA", "propuesta de contenido", "10 ideas de Reels", "plan de 30 días"];

const Oferta: React.FC = () => {
  const T = useTheme();
  const now = useNow();
  const t0 = st(8);
  const card = useSpringAt(t0 + 0.35, 16);
  const stamp1 = useSpringAt(at(10, 0.02), 12);
  const strike = prog(now, at(10, 0.6), at(10, 0.6) + 0.2);
  const stamp2 = useSpringAt(at(10, 0.64), 10);
  const page = useSpringAt(at(9, 0.1), 16);
  const lineT = (i: number) => at(9, 0.08 + i * 0.17);
  return (
    <AbsoluteFill>
      <StepFrame n={4} of={0} label="Extra · Gratis" a="AUDITORÍA" b="COMPLETA" t0={t0} />
      <Body top={730}>
        <div style={{ position: "relative", height: 620 }}>
          <div style={{ position: "absolute", right: -30, top: -20, transform: `translateX(${(1 - page) * 160}px) rotate(5deg)`, opacity: page, width: 360, borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.45)", background: "#fff" }}>
            <Img src={staticFile("pdf/p11-11.png")} style={{ width: "100%", display: "block" }} />
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, width: 700, transform: `scale(${0.92 + 0.08 * card})`, opacity: card, transformOrigin: "left top" }}>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 26px", borderBottom: `2px solid ${T.border}`, fontFamily: MONO, fontSize: 24, color: T.muted }}>
                <span style={{ width: 14, height: 14, borderRadius: 7, background: T.ghost }} />
                <span style={{ width: 14, height: 14, borderRadius: 7, background: T.ghost }} />
                <span style={{ width: 14, height: 14, borderRadius: 7, background: T.ghost }} />
                <span style={{ marginLeft: 14 }}>auditoria-instagram.pdf</span>
              </div>
              <div style={{ padding: "24px 34px 26px", fontFamily: MONO, fontSize: 31, color: T.fg, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700 }}># Auditoría de Instagram</div>
                {LINES.map((l, i) => {
                  const shown = now >= lineT(i);
                  const p = prog(now, lineT(i), lineT(i) + 0.25);
                  return (
                    <div key={l} style={{ opacity: shown ? 1 : 0, transform: `translateX(${(1 - p) * 20}px)`, whiteSpace: "nowrap" }}>
                      <span style={{ color: YELLOW }}>-</span> {l} <span style={{ color: YELLOW }}>✓</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          {/* sello de precio */}
          <div style={{ position: "absolute", left: 10, top: 440, transform: `rotate(-5deg) scale(${stamp1})`, opacity: stamp1 }}>
            <div style={{ position: "relative", fontFamily: ANTON, whiteSpace: "nowrap", fontSize: 78, textTransform: "uppercase", color: RED, border: `6px solid ${RED}`, borderRadius: 18, padding: "4px 30px", background: "rgba(14,14,19,.0)" }}>
              Vale US$ 75
              <div style={{ position: "absolute", left: -12, right: -12, top: "52%", height: 12, background: T.fg, borderRadius: 6, transformOrigin: "left", transform: `scaleX(${strike})`, opacity: strike > 0 ? 1 : 0 }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 440, top: 430, transform: `rotate(-4deg) scale(${stamp2})`, opacity: stamp2 }}>
            <div style={{ whiteSpace: "nowrap", fontFamily: ANTON, fontSize: 88, textTransform: "uppercase", background: YELLOW, color: INK, borderRadius: 20, padding: "2px 36px", boxShadow: "0 24px 60px rgba(251,184,0,.4)" }}>
              100% Gratis
            </div>
          </div>
        </div>
      </Body>
    </AbsoluteFill>
  );
};

/* ---- CTA ---- */
const Cta: React.FC = () => {
  const T = useTheme();
  const now = useNow();
  const t0 = st(11);
  const endAt = en(11) + 0.5;
  const fadeEnd = prog(now, endAt, endAt + 0.4);
  const head = useSpringAt(t0, 14);
  const pill = useSpringAt(t0 + 0.4, 12);
  const typeStart = t0 + 0.9;
  const word = "AUDITORÍA";
  const typed = Math.floor(prog(now, typeStart, typeStart + 0.9) * word.length);
  const posted = now > typeStart + 1.5;
  const post = useSpringAt(typeStart + 1.5, 12);
  const dm = useSpringAt(typeStart + 2.0, 14);
  const unlocked = now > typeStart + 2.6;
  const endCard = useSpringAt(endAt + 0.2, 16);
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - fadeEnd }}>
        <Img src={staticFile(T.logo)} style={{ position: "absolute", top: 70, left: 0, right: 0, margin: "0 auto", width: 340 }} />
        <div style={{ position: "absolute", left: 70, top: 300 }}>
          <div style={{ fontFamily: ANTON, fontSize: 200, lineHeight: 1.0, color: T.fg, transform: `translateY(${(1 - head) * 40}px)`, opacity: head }}>COMENTA</div>
          <div style={{ display: "inline-block", fontFamily: ANTON, fontSize: 200, lineHeight: 1.05, color: INK, background: YELLOW, borderRadius: 18, padding: "0 24px", transform: `rotate(-2deg) translateY(${(1 - head) * 40}px)`, opacity: head }}>AUDITORÍA</div>
          <div style={{ marginTop: 30, opacity: pill, display: "flex", alignItems: "center", gap: 24 }}>
            <Tag color={T.card} fg={YELLOW} style={{ border: `2px solid ${YELLOW}` }}>Auditoría gratis</Tag>
            <Handle />
          </div>
        </div>
        <div style={{ position: "absolute", left: 70, right: 70, top: 880 }}>
          <Card style={{ padding: "26px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: POP, fontWeight: 600, fontSize: 26, color: T.muted, marginBottom: 16 }}>
              <IG size={30} color={YELLOW} /> Comentarios
            </div>
            {posted ? (
              <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: POP, fontWeight: 600, fontSize: 34, color: T.fg, transform: `scale(${0.95 + 0.05 * post})`, transformOrigin: "left", opacity: post, marginBottom: 6 }}>
                <span style={{ color: T.muted, fontWeight: 500, fontSize: 26 }}>tú · ahora</span>
                <span style={{ background: YELLOW, color: INK, padding: "2px 16px", borderRadius: 10 }}>{word}</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `2px solid ${T.border}`, borderRadius: 999, padding: "14px 26px", fontFamily: POP, fontWeight: 600, fontSize: 34, color: T.fg }}>
                <span>
                  {typed > 0 ? <span style={{ background: YELLOW, color: INK, padding: "0 12px", borderRadius: 8 }}>{word.slice(0, typed)}</span> : <span style={{ color: T.muted, fontWeight: 500 }}>Añade un comentario…</span>}
                  <span style={{ color: YELLOW }}>|</span>
                </span>
                <span style={{ width: 52, height: 52, borderRadius: 26, background: YELLOW, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={INK}><path d="M3 11.5L21 3l-8.5 18-2.2-7.3z" /></svg>
                </span>
              </div>
            )}
          </Card>
          <div style={{ marginTop: 22, opacity: dm, transform: `translateY(${(1 - dm) * 30}px)` }}>
            <Card style={{ padding: "22px 30px", display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill={INK}><path d="M6 3h9l5 5v13H6z" opacity=".25" /><path d="M14 3v6h6" fill="none" stroke={INK} strokeWidth="2" /><path d="M8 13h8M8 17h6" stroke={INK} strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
              <div style={{ flex: 1, fontFamily: POP }}>
                <div style={{ fontWeight: 600, fontSize: 32, color: T.fg }}>Auditoría gratis de tu Instagram</div>
                <div style={{ fontWeight: 500, fontSize: 24, color: T.muted }}>Te escribimos por mensaje directo</div>
              </div>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke={unlocked ? YELLOW : T.muted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2.5" />
                <path d={unlocked ? "M8 11V8a4 4 0 0 1 7.5-2" : "M8 11V8a4 4 0 0 1 8 0v3"} />
              </svg>
            </Card>
          </div>
        </div>
      </div>
      {/* tarjeta final */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeEnd, transform: `scale(${0.92 + 0.08 * endCard})` }}>
        <Img src={staticFile(T.logo)} style={{ width: 860 }} />
        <div style={{ marginTop: 40 }}>
          <Handle style={{ fontSize: 40 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Composición ---------- */
const PAD = 0.12;
const SCENES: { from: number; to: number; C: React.FC; name: string }[] = [
  { from: 0, to: st(2) - PAD, C: Hook, name: "Gancho" },
  { from: st(2) - PAD, to: st(4) - PAD, C: Paso1, name: "Paso 1 · Bio" },
  { from: st(4) - PAD, to: st(6) - PAD, C: Paso2, name: "Paso 2 · Feed" },
  { from: st(6) - PAD, to: st(8) - PAD, C: Paso3, name: "Paso 3 · Camino" },
  { from: st(8) - PAD, to: st(11) - PAD, C: Oferta, name: "Extra · Auditoría" },
  { from: st(11) - PAD, to: TOTAL, C: Cta, name: "CTA" },
];

const Punch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f, fps, config: { damping: 16, stiffness: 180 }, durationInFrames: 12 });
  return (
    <AbsoluteFill style={{ transform: `scale(${1.035 - 0.035 * p})`, opacity: interpolate(f, [0, 4], [0, 1], { extrapolateRight: "clamp" }) }}>
      {children}
    </AbsoluteFill>
  );
};

export type Props = { variant: "dark" | "light"; sfx?: boolean };

export const AuditoriaPasos: React.FC<Props> = ({ variant, sfx = true }) => {
  useFonts();
  const T = variant === "light" ? LIGHT : DARK;
  return (
    <ThemeCtx.Provider value={T}>
      <AbsoluteFill style={{ background: T.bg }}>
        <Background />
        {SCENES.map(({ from, to, C, name }, i) => (
          <ClockCtx.Provider key={i} value={s(from)}>
            <Sequence from={s(from)} durationInFrames={Math.max(1, s(to) - s(from))} name={name}>
              <Punch>
                <C />
              </Punch>
            </Sequence>
          </ClockCtx.Provider>
        ))}
        <Captions />
        <Audio src={staticFile("voz2/voz.mp3")} />
        {sfx ? <Audio src={staticFile("voz2/sfx.wav")} volume={0.5} /> : null}
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};
