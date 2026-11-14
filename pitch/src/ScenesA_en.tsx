import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { useF, useSprF } from "./speed";
import { Audio } from "@remotion/media";
import { SCENES_EN as SCENES } from "./data_en";
import { C, Ecg, FONT, LEAD, Logo, LogoMark, prog, rise, Subtitles, fmt } from "./lib";

export const SceneShell: React.FC<{ idx: number; bg: string; children?: React.ReactNode }> = ({
  idx,
  bg,
  children,
}) => {
  const s = SCENES[idx];
  return (
    <AbsoluteFill style={{ background: bg, fontFamily: FONT, overflow: "hidden" }}>
      {children}
      <Sequence from={LEAD} layout="none">
        <Audio src={staticFile(s.vo)} />
      </Sequence>
      <Subtitles text={s.text} voDur={s.voDur} />
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at 50% 40%, rgba(40,52,90,0.55) 0%, rgba(11,15,26,0) 60%)",
    }}
  />
);

// ---------------- 1. Herojus ----------------
export const S01: React.FC = () => {
  const f = useF();
  const spr = useSprF();
  const name = "Tomas, 41";
  const typed = Math.floor(interpolate(f, [10, 45], [0, name.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const turn = prog(f, 150, 14);
  const ecgColor = turn < 0.5 ? C.green : C.red;
  const glitch = f > 150 && f < 166 ? Math.sin(f * 7.3) * 14 : 0;
  const chips = ["Works out", "Feels great"];
  return (
    <SceneShell idx={0} bg={C.dark}>
      <Vignette />
      <div
        style={{
          position: "absolute",
          top: 200,
          width: "100%",
          textAlign: "center",
          color: "#fff",
          fontWeight: 800,
          fontSize: 170,
          letterSpacing: -5,
        }}
      >
        {name.slice(0, typed)}
        <span style={{ opacity: f % 30 < 15 && f < 70 ? 1 : 0, color: C.green }}>|</span>
      </div>
      <div style={{ position: "absolute", top: 440, width: "100%", display: "flex", justifyContent: "center", gap: 28 }}>
        {chips.map((c, i) => {
          const p = spr(70 + i * 26, 16);
          return (
            <div
              key={c}
              style={{
                opacity: p * interpolate(turn, [0, 1], [1, 0.3]),
                scale: String(0.8 + p * 0.2),
                border: `3px solid ${C.green}`,
                color: C.green,
                padding: "14px 34px",
                borderRadius: 99,
                fontSize: 46,
                fontWeight: 700,
              }}
            >
              ✓ {c}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 600, left: 0, translate: `${glitch}px 0px` }}>
        <Ecg progress={prog(f, 0, 160)} color={ecgColor} height={240} />
      </div>
      {[
        { t: "ApoB ↑", x: 820, d: 178 },
        { t: "LDL ↑", x: 1120, d: 192 },
      ].map((l) => (
        <div
          key={l.t}
          style={{
            position: "absolute",
            top: 560,
            left: l.x,
            color: C.red,
            fontSize: 48,
            fontWeight: 800,
            ...rise(f, l.d, 24),
          }}
        >
          {l.t}
        </div>
      ))}
    </SceneShell>
  );
};

// ---------------- 2. Problema ----------------
export const S02: React.FC = () => {
  const f = useF();
  const spr = useSprF();
  const dim = interpolate(f, [301, 340], [1, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pct = interpolate(f, [12, 70], [0, 52], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const R = 190;
  const circ = 2 * Math.PI * R;
  const barP = prog(f, 160, 45);
  const maxH = 460;
  const badge = spr(225, 11);
  return (
    <SceneShell idx={1} bg={C.dark}>
      <Vignette />
      <div style={{ opacity: dim }}>
        {/* donut */}
        <div style={{ position: "absolute", left: 230, top: 150, width: 520, ...rise(f, 4, 30) }}>
          <svg width={460} height={460} viewBox="0 0 460 460" style={{ rotate: "-90deg" }}>
            <circle cx="230" cy="230" r={R} fill="none" stroke="#25304A" strokeWidth="44" />
            <circle
              cx="230"
              cy="230"
              r={R}
              fill="none"
              stroke={C.red}
              strokeWidth="44"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div style={{ position: "absolute", top: 150, width: 460, textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 140, letterSpacing: -4 }}>
            {Math.round(pct)}%
          </div>
          <div style={{ width: 460, textAlign: "center", color: "#C8CFDF", fontSize: 40, fontWeight: 600, marginTop: 30, lineHeight: 1.25 }}>
            of deaths: heart & vascular disease
          </div>
        </div>
        {/* bars */}
        <div style={{ position: "absolute", left: 1010, top: 120, width: 760, height: 760, opacity: prog(f, 150, 18) }}>
          <div style={{ color: "#C8CFDF", fontSize: 40, fontWeight: 600 }}>Preventable deaths per 100,000</div>
          <div style={{ position: "absolute", bottom: 80, left: 40, display: "flex", gap: 90, alignItems: "flex-end" }}>
            {[
              { l: "Lithuania", v: 222, c: C.red },
              { l: "OECD avg.", v: 145, c: "#4A5672" },
            ].map((b) => (
              <div key={b.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 240 }}>
                <div style={{ color: "#fff", fontSize: 72, fontWeight: 800, marginBottom: 14 }}>{fmt(b.v * barP)}</div>
                <div style={{ width: 200, height: (b.v / 222) * maxH * barP, background: b.c, borderRadius: "22px 22px 6px 6px" }} />
                <div style={{ color: "#C8CFDF", fontSize: 40, fontWeight: 700, marginTop: 18 }}>{b.l}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 150,
              background: C.red,
              color: "#fff",
              fontWeight: 800,
              fontSize: 64,
              padding: "14px 30px",
              borderRadius: 24,
              scale: String(badge),
              opacity: badge,
            }}
          >
            +50%
          </div>
        </div>
      </div>
      {/* silent dot */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: prog(f, 330, 20) }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 99,
            background: C.red,
            boxShadow: `0 0 ${30 + Math.sin(f / 6) * 18}px ${C.red}`,
          }}
        />
      </AbsoluteFill>
    </SceneShell>
  );
};

// ---------------- 3/4. Two ways layout ----------------
const NUMS = ["GLU 5.9", "CHOL 6.2", "TSH 2.1", "ALT 34", "LDL 3.9", "Fe 12.4", "CRP 3.1", "HGB 148", "UA 7.1", "B12 310"];

export const TwoWays: React.FC<{ f: number; leftAt: number; rightAt: number; qAt: number; static?: boolean }> = ({
  f,
  leftAt,
  rightAt,
  qAt,
}) => {
  const spr = useSprF();
  const axis = prog(f, 0, 30);
  const blur = interpolate(f, [leftAt + 40, leftAt + 120], [0, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lp = spr(leftAt, 15);
  const rp = spr(rightAt, 15);
  const qp = prog(f, qAt, 16);
  const cardTop = 190;
  return (
    <>
      {/* axis */}
      <div style={{ position: "absolute", top: 640, left: 180, height: 6, width: 1560 * axis, background: "#2C3654", borderRadius: 9 }} />
      {[{ x: 380, p: lp, t: "~€50–400" }, { x: 960, p: qp, t: "?" }, { x: 1540, p: rp, t: "~€3,000" }].map((d) => (
        <React.Fragment key={d.x}>
          <div style={{ position: "absolute", top: 628, left: d.x - 15, width: 30, height: 30, borderRadius: 99, background: d.t === "?" ? C.orange : "#fff", scale: String(d.p) }} />
          <div style={{ position: "absolute", top: 676, left: d.x - 200, width: 400, textAlign: "center", color: "#fff", fontSize: 52, fontWeight: 800, opacity: d.p }}>
            {d.t === "?" ? "" : d.t}
          </div>
        </React.Fragment>
      ))}
      {/* left card */}
      <div
        style={{
          position: "absolute",
          top: cardTop,
          left: 180,
          width: 400,
          height: 400,
          background: "#1B2236",
          border: "2px solid #2F3A58",
          borderRadius: 32,
          padding: 30,
          opacity: lp,
          translate: `0px ${(1 - lp) * 60}px`,
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 800 }}>DIY lab panel</div>
        <div style={{ marginTop: 18, background: "#F1EFEA", borderRadius: 14, padding: 16, filter: `blur(${blur}px)` }}>
          {NUMS.slice(0, 8).map((n) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", color: "#333", fontSize: 22, fontWeight: 600, lineHeight: 1.45, fontFamily: "monospace" }}>
              <span>{n.split(" ")[0]}</span>
              <span>{n.split(" ")[1]}</span>
            </div>
          ))}
        </div>
      </div>
      {/* right card */}
      <div
        style={{
          position: "absolute",
          top: cardTop,
          left: 1340,
          width: 400,
          height: 400,
          background: "linear-gradient(160deg,#3A2E14,#1A1508)",
          border: `2px solid ${C.gold}`,
          borderRadius: 32,
          padding: 30,
          opacity: rp,
          translate: `0px ${(1 - rp) * 60}px`,
          color: "#F4E3BC",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>Longevity program</div>
        {["Personal doctor", "Concierge", "Premium clinic"].map((t) => (
          <div key={t} style={{ fontSize: 30, fontWeight: 600, marginTop: 26 }}>
            ◆ {t}
          </div>
        ))}
      </div>
      {/* middle slot */}
      <div
        style={{
          position: "absolute",
          top: cardTop + 20,
          left: 960 - 180,
          width: 360,
          height: 360,
          borderRadius: 32,
          border: `4px dashed ${C.orange}`,
          opacity: qp,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: C.orange,
          fontSize: 200,
          fontWeight: 800,
        }}
      >
        <span style={{ scale: String(1 + Math.sin(f / 5) * 0.06) }}>?</span>
      </div>
    </>
  );
};

export const S03: React.FC = () => {
  const f = useF();
  return (
    <SceneShell idx={2} bg={C.dark}>
      <Vignette />
      <TwoWays f={f} leftAt={77} rightAt={236} qAt={355} />
    </SceneShell>
  );
};

// ---------------- 4. Atskleidimas ----------------
export const S04: React.FC = () => {
  const f = useF();
  const spr = useSprF();
  const drop = spr(40, 10);
  const reveal = prog(f, 62, 40);
  const logoIn = spr(64, 14);
  return (
    <SceneShell idx={3} bg={C.dark}>
      <Vignette />
      <TwoWays f={400} leftAt={0} rightAt={0} qAt={0} />
      {/* mark drops into slot */}
      <div
        style={{
          position: "absolute",
          top: 210 + 180 - 110,
          left: 960 - 110,
          translate: `0px ${interpolate(drop, [0, 1], [-700, 0])}px`,
          boxShadow: `0 0 ${80 * drop}px ${C.orange}`,
          borderRadius: 60,
        }}
      >
        <LogoMark size={220} />
      </div>
      {/* circular reveal to light */}
      <AbsoluteFill
        style={{
          background: C.light,
          clipPath: `circle(${reveal * 1300}px at 960px 390px)`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ scale: String(0.7 + logoIn * 0.3), opacity: logoIn }}>
          <Logo size={190} />
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
