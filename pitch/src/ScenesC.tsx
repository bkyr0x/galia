import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "./ScenesA";
import { C, Card, Check, Ecg, fmt, Logo, prog, rise, SceneLabel, useSpr } from "./lib";

const LightBg: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 40%, #FFFFFF 0%, #F5F2EE 55%, #ECE6DE 100%)" }} />
);

// ---------------- 8. Įrodymas ----------------
export const S08: React.FC = () => {
  const f = useCurrentFrame();
  const spr = useSpr();
  const a = spr(28, 15);
  const b = spr(80, 15);
  const lt = spr(255, 14);
  const fill = prog(f, 300, 22);
  return (
    <SceneShell idx={7} bg={C.light}>
      <LightBg />
      <div style={{ position: "absolute", left: 140, top: 130, ...rise(f, 2, 30) }}>
        <SceneLabel text="Modelis patikrintas" />
        <div style={{ fontSize: 40, color: C.mute, fontWeight: 600, marginTop: 14 }}>Superpower, JAV</div>
      </div>
      <div style={{ position: "absolute", left: 140, top: 400, display: "flex", gap: 36 }}>
        <Card style={{ width: 560, padding: 40, opacity: a, translate: `0px ${(1 - a) * 80}px` }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -3, whiteSpace: "nowrap" }}>
            {fmt(interpolate(f, [30, 95], [0, 64000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}+
          </div>
          <div style={{ fontSize: 40, color: C.mute, fontWeight: 600 }}>narių</div>
        </Card>
        <Card style={{ width: 560, padding: 40, opacity: b, translate: `0px ${(1 - b) * 80}px` }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -3, whiteSpace: "nowrap" }}>
            ${Math.round(interpolate(f, [82, 145], [0, 500], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}M+
          </div>
          <div style={{ fontSize: 40, color: C.mute, fontWeight: 600 }}>įmonės vertė</div>
        </Card>
      </div>
      {/* Lithuania tile */}
      <div
        style={{
          position: "absolute",
          left: 1400,
          top: 360,
          width: 400,
          height: 420,
          borderRadius: 40,
          border: `5px dashed ${interpolate(fill, [0, 1], [0, 1]) > 0.5 ? "transparent" : C.mute}`,
          background: `linear-gradient(135deg, rgba(255,59,48,${fill}), rgba(255,138,61,${fill}))`,
          opacity: lt,
          scale: String(0.85 + lt * 0.15),
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: `0 40px 100px rgba(255,90,40,${0.35 * fill})`,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 800, color: fill > 0.5 ? "#fff" : C.ink }}>Lietuva</div>
        <div style={{ position: "relative", height: 200, width: 400 }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 190, fontWeight: 800, color: C.mute, opacity: 1 - fill }}>0</div>
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", opacity: fill, scale: String(0.8 + fill * 0.2) }}>
            <Logo size={86} color="#fff" />
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

// ---------------- 9. Pasiūlymas ----------------
const FEATURES = [
  ["100+ rodiklių kraujo tyrimas", "Ankstyvieji ligų požymiai"],
  ["Sveikatos duomenų įkėlimas", "Ankstesni tyrimai vienoje vietoje"],
  ["Biologinis amžius", ""],
  ["Asmeninis planas", "Mityba, gyvenimo būdas, papildai"],
  ["Išmaniųjų įrenginių prijungimas", "Apple Health, Whoop, Oura"],
  ["Pažangus DI pokalbis", "Žino tavo sveikatos kontekstą"],
  ["Medikų komanda 24/7", "Klausk bet kada"],
  ["Papildomi tyrimai", "Žarnynas, toksinai, vėžio patikra"],
  ["Geriausi maisto papildai", ""],
  ["Elektroniniai receptai", "Per GALIA gydytoją"],
];

export const S09: React.FC = () => {
  const f = useCurrentFrame();
  const spr = useSpr();
  const strike = prog(f, 62, 16);
  const now = spr(118, 10);
  const listOut = prog(f, 236, 16);
  const plans = spr(244, 15);
  const sel = f > 272;
  const cursorP = prog(f, 285, 30);
  const press = interpolate(f, [318, 324, 332], [1, 0.95, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chips = [spr(356, 13), spr(372, 13)];
  return (
    <SceneShell idx={8} bg={C.light}>
      <LightBg />
      {/* headline */}
      <div style={{ position: "absolute", left: 130, top: 170, width: 820 }}>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.mute, ...rise(f, 4, 30) }}>Tai, kas galėtų kainuoti</div>
        <div style={{ position: "relative", display: "inline-block", fontSize: 150, fontWeight: 800, letterSpacing: -5, color: C.mute, ...rise(f, 14, 30) }}>
          3 000 €
          <div style={{ position: "absolute", left: -8, top: "52%", height: 12, width: `${strike * 104}%`, background: C.red, borderRadius: 9, rotate: "-6deg" }} />
        </div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 10, opacity: now }}>dabar –</div>
        <div
          style={{
            fontSize: 230,
            fontWeight: 800,
            letterSpacing: -8,
            lineHeight: 1,
            background: `linear-gradient(90deg, ${C.red}, ${C.orange})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
            scale: String(0.6 + now * 0.4),
            transformOrigin: "left center",
            opacity: now,
          }}
        >
          149 €
        </div>
        <div style={{ fontSize: 44, fontWeight: 600, color: C.mute, opacity: now }}>per metus</div>
        <div style={{ display: "flex", gap: 20, marginTop: 40 }}>
          {["Žmonės", "Darbdaviai"].map((t, i) => (
            <div key={t} style={{ opacity: chips[i], scale: String(0.8 + chips[i] * 0.2), background: C.ink, color: "#fff", fontSize: 44, fontWeight: 700, padding: "14px 34px", borderRadius: 99 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
      {/* feature list */}
      <Card
        style={{
          position: "absolute",
          left: 1000,
          top: 80,
          width: 800,
          padding: "28px 36px",
          opacity: prog(f, 70, 16) * (1 - listOut),
          translate: `${listOut * 200 + (1 - prog(f, 70, 16)) * 120}px 0px`,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 6, ...rise(f, 80, 20) }}>Narystė apima:</div>
        {FEATURES.map(([a, b], i) => {
          const st = 92 + i * 12;
          return (
            <div key={a} style={{ display: "flex", alignItems: "center", gap: 16, padding: "11px 0", borderTop: i ? "1px solid #EEE" : "none", ...rise(f, st, 20, 14) }}>
              <Check p={prog(f, st + 4, 10)} size={32} />
              <div style={{ width: 380, fontSize: 25, fontWeight: 700 }}>{a}</div>
              <div style={{ fontSize: 21, color: "#888" }}>{b}</div>
            </div>
          );
        })}
      </Card>
      {/* plans */}
      <div style={{ position: "absolute", left: 1010, top: 130, width: 780, opacity: plans, translate: `${(1 - plans) * 200}px 0px` }}>
        <div style={{ borderRadius: 34, background: C.ink, padding: "18px 0 0 0", boxShadow: "0 30px 80px rgba(20,20,40,0.18)" }}>
          <div style={{ color: "#fff", textAlign: "center", fontSize: 28, fontWeight: 600, paddingBottom: 16 }}>Ribotas pasiūlymas · pirmiesiems nariams −40 %</div>
          <Card style={{ padding: 34, border: `4px solid ${sel ? C.ink : "transparent"}`, borderRadius: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: 99, border: `3px solid ${C.ink}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ width: 20, height: 20, borderRadius: 99, background: C.ink, scale: String(sel ? 1 : 0) }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 700 }}>Kraujas + genomas</div>
                <div style={{ fontSize: 22, color: "#888" }}>Narystė + kraujo tyrimas + genomo tyrimas</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 58, fontWeight: 800 }}>249 €<span style={{ fontSize: 24, color: "#999" }}>/m.</span></div>
                <div style={{ fontSize: 22 }}>
                  <span style={{ textDecoration: "line-through", color: "#999" }}>398 €</span>{" "}
                  <span style={{ color: C.orange, fontWeight: 700 }}>Sutaupai 149 €</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 18, borderTop: "1px solid #EEE", paddingTop: 12 }}>
              {["100+ rodiklių vienu kraujo paėmimu", "115 DNR įžvalgų su tepinėliu namuose", "Asmeninis planas + nuolatinė pagalba"].map((t) => (
                <div key={t} style={{ fontSize: 24, marginTop: 8 }}>✓ {t}</div>
              ))}
            </div>
          </Card>
        </div>
        <Card style={{ marginTop: 22, padding: "28px 34px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 38, height: 38, borderRadius: 99, border: `3px solid #BBB` }} />
          <div style={{ flex: 1, fontSize: 36, fontWeight: 700 }}>Tik narystė</div>
          <div style={{ fontSize: 58, fontWeight: 800 }}>149 €<span style={{ fontSize: 24, color: "#999" }}>/m.</span></div>
        </Card>
        <div style={{ marginTop: 26, background: C.ink, color: "#fff", textAlign: "center", fontSize: 38, fontWeight: 700, padding: "26px 0", borderRadius: 99, scale: String(press) }}>
          Gauti narystę
        </div>
      </div>
      {/* cursor */}
      <div
        style={{
          position: "absolute",
          left: interpolate(cursorP, [0, 1], [1700, 1420]),
          top: interpolate(cursorP, [0, 1], [980, 870]),
          opacity: prog(f, 280, 8) * (1 - prog(f, 360, 10)),
          scale: String(press),
        }}
      >
        <svg width="54" height="54" viewBox="0 0 24 24">
          <path d="M4 2 L4 20 L9 15 L12.5 22 L15.5 20.5 L12 13.5 L19 13.5 Z" fill="#111" stroke="#fff" strokeWidth="1.4" />
        </svg>
      </div>
    </SceneShell>
  );
};

// ---------------- 10. Prašymas ----------------
export const S10: React.FC = () => {
  const f = useCurrentFrame();
  const spr = useSpr();
  const out = prog(f, 240, 18);
  const logo = spr(252, 12);
  const items = ["Tyrimų įkėlimas", "Paaiškinimas lietuviškai", "Asmeninis planas"];
  return (
    <SceneShell idx={9} bg={C.light}>
      <LightBg />
      <div style={{ opacity: 1 - out, scale: String(1 - out * 0.08) }}>
        <div style={{ position: "absolute", left: 220, top: 170, display: "flex", alignItems: "center", gap: 30, ...rise(f, 4, 30) }}>
          <SceneLabel text="Per hakatoną" />
          <div style={{ background: C.orange, color: "#fff", fontSize: 56, fontWeight: 800, padding: "10px 30px", borderRadius: 99 }}>48 val.</div>
        </div>
        <div style={{ position: "absolute", left: 220, top: 340, fontSize: 52, fontWeight: 600, color: C.mute, ...rise(f, 20, 30) }}>
          → veikiantis prototipas
        </div>
        <div style={{ position: "absolute", left: 220, top: 470, display: "flex", flexDirection: "column", gap: 26 }}>
          {items.map((t, i) => {
            const st = 55 + i * 50;
            return (
              <Card key={t} style={{ display: "flex", alignItems: "center", gap: 26, padding: "26px 36px", width: 900, ...rise(f, st, 40) }}>
                <Check p={prog(f, st + 10, 14)} size={58} />
                <div style={{ fontSize: 56, fontWeight: 700 }}>{t}</div>
              </Card>
            );
          })}
        </div>
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 40, marginTop: -120 }}>
        <div style={{ opacity: logo, scale: String(0.7 + logo * 0.3) }}>
          <Logo size={170} />
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2, color: C.ink, ...rise(f, 272, 30) }}>
          Sveikata – tavo supergalia.
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 760, left: 0, opacity: prog(f, 262, 10) }}>
        <Ecg progress={prog(f, 262, 120)} color={C.green} height={160} strokeWidth={4} glow={false} />
      </div>
    </SceneShell>
  );
};
