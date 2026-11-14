import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";

// ---------- fonts (Inter with latin-ext for ą č ę ė į š ų ū ž) ----------
for (const w of [400, 500, 600, 700, 800]) {
  for (const sub of ["latin", "latin-ext"]) {
    loadFont({
      family: "Inter",
      url: staticFile(`fonts/inter-${sub}-${w}-normal.woff2`),
      weight: String(w),
    });
  }
}

export const FONT = "Inter, sans-serif";

export const C = {
  dark: "#0B0F1A",
  dark2: "#141A2A",
  light: "#F5F2EE",
  ink: "#111317",
  mute: "#7A7F8C",
  red: "#FF3B30",
  orange: "#FF8A3D",
  green: "#3DBE7A",
  yellow: "#E8C94A",
  pink: "#E35BD0",
  gold: "#C9A45C",
  card: "#FFFFFF",
};

export const LEAD = 9; // frames before VO starts in each scene

export const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const prog = (f: number, start: number, dur: number, e = ease) =>
  interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: e,
  });

export const useSpr = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (start: number, damping = 14, mass = 1) =>
    spring({ frame: frame - start, fps, config: { damping, mass } });
};

export const fmt = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// fade + rise in
export const rise = (f: number, start: number, dist = 40, dur = 20) => {
  const p = prog(f, start, dur);
  return { opacity: p, translate: `0px ${(1 - p) * dist}px` } as const;
};

// ---------- ECG line ----------
export const ecgPath = (w: number, h: number, period = 300) => {
  const b = h / 2;
  let d = `M0 ${b}`;
  for (let x = 0; x < w; x += period) {
    const p = (k: number) => x + period * k;
    d += ` L${p(0.35)} ${b} L${p(0.42)} ${b - h * 0.1} L${p(0.48)} ${b} L${p(0.52)} ${b + h * 0.1} L${p(0.56)} ${b - h * 0.48} L${p(0.61)} ${b + h * 0.32} L${p(0.66)} ${b} L${p(0.78)} ${b - h * 0.08} L${p(0.86)} ${b} L${p(1)} ${b}`;
  }
  return d;
};

export const Ecg: React.FC<{
  progress: number;
  color: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  glow?: boolean;
  style?: React.CSSProperties;
}> = ({ progress, color, width = 1920, height = 220, strokeWidth = 5, glow = true, style }) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style}>
    <path
      d={ecgPath(width, height)}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
      style={{ filter: glow ? `drop-shadow(0 0 12px ${color})` : undefined }}
    />
  </svg>
);

// ---------- Logo ----------
export const LogoMark: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.red} />
        <stop offset="1" stopColor={C.orange} />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="100" height="100" rx="28" fill="url(#lg)" />
    <path
      d="M14 54 L34 54 L41 40 L49 70 L58 26 L65 54 L86 54"
      fill="none"
      stroke="#fff"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Logo: React.FC<{ size?: number; color?: string }> = ({ size = 96, color = C.ink }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
    <LogoMark size={size} />
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size * 0.92,
        letterSpacing: -size * 0.03,
        color,
      }}
    >
      GALIA
    </div>
  </div>
);

// ---------- Subtitles (proportional per sentence) ----------
export const Subtitles: React.FC<{ text: string; voDur: number; dark?: boolean }> = ({
  text,
  voDur,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const parts = text.match(/[^.!?:]+[.!?:]?/g)!.map((s) => s.trim()).filter(Boolean);
  const total = parts.reduce((s, p) => s + p.length, 0);
  const t = (frame - LEAD) / fps;
  let acc = 0;
  let cur: string | null = null;
  for (const p of parts) {
    const st = (acc / total) * voDur;
    acc += p.length;
    const en = (acc / total) * voDur;
    if (t >= st && t < en + 0.25) cur = p;
  }
  if (!cur || t < 0) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 54 }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 36,
          color: "#fff",
          background: "rgba(10,12,20,0.72)",
          padding: "12px 28px",
          borderRadius: 18,
          maxWidth: 1500,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {cur}
      </div>
    </AbsoluteFill>
  );
};

// ---------- UI primitives ----------
export const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ style, children }) => (
  <div
    style={{
      background: C.card,
      borderRadius: 28,
      boxShadow: "0 30px 80px rgba(20,20,40,0.12), 0 2px 6px rgba(20,20,40,0.06)",
      fontFamily: FONT,
      color: C.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{ color: string; label: string; scale?: number; size?: number }> = ({
  color,
  label,
  scale = 1,
  size = 22,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      color,
      fontWeight: 600,
      fontSize: size,
      scale: String(scale),
    }}
  >
    <div style={{ width: size * 0.42, height: size * 0.42, borderRadius: 99, background: color }} />
    {label}
  </div>
);

// Phone in 3D. children = screen content.
export const Phone: React.FC<{
  children?: React.ReactNode;
  rotY?: number;
  rotX?: number;
  style?: React.CSSProperties;
  w?: number;
  h?: number;
}> = ({ children, rotY = -14, rotX = 5, style, w = 440, h = 860 }) => (
  <div style={{ perspective: 1800, ...style }}>
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 72,
        background: "linear-gradient(145deg,#2a2d33,#0d0e10)",
        padding: 14,
        boxShadow: "0 60px 120px rgba(0,0,0,0.35), inset 0 0 0 2px #3a3d44",
        transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 58,
          background: "#F6F6F4",
          overflow: "hidden",
          position: "relative",
          fontFamily: FONT,
          color: C.ink,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            translate: "-50% 0",
            width: 130,
            height: 36,
            borderRadius: 20,
            background: "#000",
            zIndex: 5,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 38,
            fontWeight: 700,
            fontSize: 20,
            zIndex: 4,
          }}
        >
          9:41
        </div>
        <div style={{ position: "absolute", inset: 0, paddingTop: 76 }}>{children}</div>
      </div>
    </div>
  </div>
);

export const Push: React.FC<{ title: string; body: string; p: number; shake?: number; now?: string }> = ({
  title,
  body,
  p,
  shake = 0,
  now = "dabar",
}) => (
  <div
    style={{
      position: "absolute",
      top: 60,
      left: 14,
      right: 14,
      zIndex: 10,
      translate: `${shake}px ${interpolate(p, [0, 1], [-170, 0])}px`,
      opacity: p,
    }}
  >
    <div
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: 26,
        padding: "16px 18px",
        display: "flex",
        gap: 14,
        alignItems: "center",
        boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
        fontFamily: FONT,
      }}
    >
      <LogoMark size={48} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 19 }}>{title}</div>
        <div style={{ fontSize: 17, color: "#555", marginTop: 2 }}>{body}</div>
      </div>
      <div style={{ fontSize: 15, color: "#999", alignSelf: "flex-start" }}>{now}</div>
    </div>
  </div>
);

export const SegBar: React.FC<{ p: number; width?: number; height?: number }> = ({
  p,
  width = 340,
  height = 12,
}) => {
  const segs = [
    { c: C.green, w: 73 / 84 },
    { c: C.yellow, w: 6 / 84 },
    { c: C.pink, w: 5 / 84 },
  ];
  let acc = 0;
  return (
    <div style={{ display: "flex", gap: 6, width }}>
      {segs.map((s, i) => {
        const st = acc;
        acc += s.w;
        const local = interpolate(p, [st, acc], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div key={i} style={{ width: (width - 12) * s.w, height, borderRadius: 99, background: "#ECEBE8" }}>
            <div style={{ width: `${local * 100}%`, height: "100%", borderRadius: 99, background: s.c }} />
          </div>
        );
      })}
    </div>
  );
};

export const Check: React.FC<{ p: number; size?: number; color?: string }> = ({
  p,
  size = 30,
  color = C.green,
}) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <circle cx="15" cy="15" r="14" fill={p > 0 ? color : "none"} stroke={p > 0 ? color : "#C9C9C9"} strokeWidth="2" opacity={p > 0 ? 1 : 1} />
    <path
      d="M8 15.5 L13 20 L22 10"
      fill="none"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
    />
  </svg>
);

export const SceneLabel: React.FC<{ text: string; style?: React.CSSProperties; color?: string }> = ({
  text,
  style,
  color = C.ink,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: 84,
      letterSpacing: -2,
      lineHeight: 1.02,
      color,
      ...style,
    }}
  >
    {text}
  </div>
);
