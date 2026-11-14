import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useF, useSprF } from "./speed";
import { SceneShell } from "./ScenesA_en";
import { C, Card, Check, FONT, fmt, LogoMark, Phone, Pill, prog, Push, rise, SceneLabel, SegBar } from "./lib";

const LightBg: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at 70% 40%, #FFFFFF 0%, #F5F2EE 55%, #ECE6DE 100%)",
    }}
  />
);

const Tag: React.FC<{ text: string; color?: string; style?: React.CSSProperties }> = ({ text, color = C.orange, style }) => (
  <div
    style={{
      display: "inline-block",
      background: color,
      color: "#fff",
      fontWeight: 700,
      fontSize: 34,
      padding: "10px 24px",
      borderRadius: 99,
      ...style,
    }}
  >
    {text}
  </div>
);

// ---------- Body twin ----------
const BodyTwin: React.FC<{ f: number; start: number }> = ({ f, start }) => {
  const dots = [
    { x: 100, y: 128, c: C.pink, heart: true },
    { x: 100, y: 52, c: C.green },
    { x: 78, y: 170, c: C.yellow },
    { x: 122, y: 175, c: C.green },
    { x: 100, y: 210, c: C.green },
    { x: 60, y: 120, c: C.green },
    { x: 140, y: 120, c: C.green },
    { x: 84, y: 300, c: C.green },
    { x: 116, y: 300, c: C.green },
  ];
  return (
    <svg width={260} height={520} viewBox="0 0 200 400">
      <g fill="#E4E2DE">
        <circle cx="100" cy="40" r="26" />
        <rect x="64" y="72" width="72" height="150" rx="30" />
        <rect x="34" y="80" width="26" height="140" rx="13" />
        <rect x="140" y="80" width="26" height="140" rx="13" />
        <rect x="70" y="210" width="28" height="170" rx="14" />
        <rect x="102" y="210" width="28" height="170" rx="14" />
      </g>
      {dots.map((d, i) => {
        const p = prog(f, start + i * 5, 12);
        const pulse = d.heart ? 1 + Math.max(0, Math.sin(f / 4)) * 0.5 : 1;
        return (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={(d.heart ? 11 : 8) * p * pulse}
            fill={d.c}
            opacity={0.85}
            style={{ filter: `drop-shadow(0 0 6px ${d.c})` }}
          />
        );
      })}
    </svg>
  );
};

const Spark: React.FC<{ color: string; up?: boolean }> = ({ color, up = true }) => (
  <svg width={130} height={40} viewBox="0 0 130 40">
    <polyline
      points={up ? "5,32 45,28 85,20 125,8" : "5,8 45,14 85,24 125,30"}
      fill="none"
      stroke={color}
      strokeWidth="3"
    />
    <circle cx="125" cy={up ? 8 : 30} r="5" fill={color} />
  </svg>
);

// ---------------- 5. Rezultatai ----------------
export const S05: React.FC = () => {
  const f = useF();
  const spr = useSprF();
  const phoneIn = spr(0, 16);
  const toTablet = prog(f, 310, 22);
  const pushP = prog(f, 122, 14);
  const pushOut = prog(f, 175, 12);
  const shake = f > 136 && f < 146 ? Math.sin(f * 3.1) * 4 : 0;
  const results = f >= 150;
  const cnt = (v: number) => fmt(interpolate(f, [155, 200], [0, v], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const pop = spr(245, 13);
  const labels = [
    { from: 0, to: 120, t: "1 blood draw.\n100+ biomarkers." },
    { from: 120, to: 316, t: "Results\nin a week." },
  ];
  const steps = ["Ordered", "Blood drawn · 10 min", "Analyzing"];
  return (
    <SceneShell idx={4} bg={C.light}>
      <LightBg />
      {/* phone part */}
      <div style={{ opacity: 1 - toTablet }}>
        {labels.map((l) => (
          <div
            key={l.t}
            style={{
              position: "absolute",
              left: 140,
              top: 300,
              whiteSpace: "pre-line",
              opacity: prog(f, l.from + 4, 16) * (1 - prog(f, l.to - 10, 10)),
              translate: `0px ${(1 - prog(f, l.from + 4, 16)) * 40}px`,
            }}
          >
            <SceneLabel text={l.t} style={{ fontSize: 96 }} />
          </div>
        ))}
        <Phone
          style={{ position: "absolute", left: 1160, top: 70, translate: `0px ${(1 - phoneIn) * 900}px` }}
          rotY={interpolate(f, [0, 300], [-20, -8])}
        >
          {!results ? (
            <div style={{ padding: "10px 26px" }}>
              <div style={{ fontSize: 34, fontWeight: 800 }}>Hi, Tomas</div>
              <div style={{ color: C.mute, fontSize: 20, marginTop: 4 }}>Your blood test</div>
              <div style={{ marginTop: 24, background: "#fff", borderRadius: 24, padding: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 700, fontSize: 24 }}>100+ biomarkers</div>
                <div style={{ color: C.mute, fontSize: 18, marginBottom: 16 }}>One blood draw</div>
                {steps.map((s, i) => {
                  const p = prog(f, 20 + i * 28, 14);
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, opacity: 0.35 + p * 0.65 }}>
                      <Check p={i < 2 ? p : 0} size={30} />
                      <div style={{ fontSize: 21, fontWeight: 600 }}>{s}</div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 18, height: 8, background: "#ECEBE8", borderRadius: 9 }}>
                  <div style={{ width: `${prog(f, 80, 60) * 100}%`, height: "100%", background: C.orange, borderRadius: 9 }} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "10px 22px", opacity: prog(f, 150, 10) }}>
              <div style={{ background: "#fff", borderRadius: 22, padding: 18, display: "flex", gap: 12, alignItems: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <div style={{ background: C.orange, color: "#fff", fontWeight: 800, fontSize: 13, borderRadius: 8, padding: "8px 6px" }}>PDF</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>Blood panel results</div>
                  <div style={{ color: C.mute, fontSize: 16 }}>84 results saved</div>
                </div>
              </div>
              <div style={{ marginTop: 14, background: "#fff", borderRadius: 22, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>Biomarkers</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  {[["84", "Total"], ["73", "Optimal"], ["6", "Normal"], ["5", "Out of range"]].map(([v, l], i) => (
                    <div key={l}>
                      <div style={{ fontSize: 32, fontWeight: 700, color: i === 0 ? C.ink : "#888" }}>{cnt(Number(v))}</div>
                      <div style={{ fontSize: 15, color: "#999" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14 }}>
                  <SegBar p={prog(f, 170, 50)} width={340} />
                </div>
              </div>
              <div style={{ marginTop: 14, background: "#fff", borderRadius: 22, padding: "18px 20px", display: "flex", justifyContent: "space-between", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", ...rise(f, 210, 20) }}>
                <div style={{ fontWeight: 600, fontSize: 20 }}>Vitamin D</div>
                <Pill color={C.pink} label="Low" size={20} />
              </div>
              <div style={{ marginTop: 14, background: "#fff", borderRadius: 22, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", ...rise(f, 228, 20) }}>
                <div style={{ fontWeight: 800, fontSize: 24 }}>GALIA score</div>
                <div style={{ fontSize: 46, fontWeight: 600, marginTop: 6 }}>
                  87 <span style={{ fontSize: 22, color: "#999" }}>/ 100</span>
                </div>
                <div style={{ color: "#999", fontSize: 17 }}>Generally healthy</div>
              </div>
            </div>
          )}
          <Push now="now" title="Your results are ready" body="84 biomarkers, 73 optimal" p={pushP * (1 - pushOut)} shake={shake} />
        </Phone>
        {/* card pops out of the screen */}
        <Card
          style={{
            position: "absolute",
            left: 560,
            top: 560,
            width: 520,
            padding: 30,
            opacity: pop,
            scale: String(0.7 + pop * 0.3),
            translate: `${(1 - pop) * 400}px 0px`,
            boxShadow: `0 ${40 * pop}px ${100 * pop}px rgba(20,20,40,0.2)`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 28 }}>Biomarkers</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            {[["84", "Total", C.ink], ["73", "Optimal", C.green], ["6", "Normal", "#B79A1E"], ["5", "Out of range", C.pink]].map(([v, l, c]) => (
              <div key={l}>
                <div style={{ fontSize: 50, fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: 20, color: "#888" }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <SegBar p={1} width={460} height={14} />
          </div>
        </Card>
      </div>

      {/* tablet dashboard */}
      <AbsoluteFill style={{ opacity: toTablet, justifyContent: "center", alignItems: "center", perspective: 2200 }}>
        <div
          style={{
            width: 1640,
            height: 740,
            marginTop: -130,
            borderRadius: 48,
            background: "linear-gradient(145deg,#2a2d33,#0d0e10)",
            padding: 16,
            transform: `rotateX(${interpolate(f, [310, 566], [10, 4])}deg) rotateY(${interpolate(f, [310, 566], [-6, -2])}deg) scale(${0.92 + toTablet * 0.06})`,
            boxShadow: "0 60px 140px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: 34, background: "#F7F6F3", display: "flex", padding: 34, gap: 30, fontFamily: FONT, color: C.ink }}>
            {/* left panel */}
            <div style={{ width: 560, display: "flex", gap: 10 }}>
              <div style={{ width: 290 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <LogoMark size={36} />
                  <div style={{ fontWeight: 800, fontSize: 26 }}>GALIA</div>
                </div>
                {[["Heart & vascular", "B", C.yellow], ["Metabolic health", "B", C.yellow], ["Hormones", "A", C.green], ["Thyroid", "A", C.green], ["Inflammation", "A", C.green], ["Liver", "B", C.yellow], ["Kidneys", "A", C.green], ["Nutrients", "B", C.yellow], ["Energy", "A", C.green]].map(([t, g, c], i) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, ...rise(f, 325 + i * 4, 16) }}>
                    <div style={{ width: 30, height: 30, borderRadius: 99, border: `2px solid ${c}`, color: c, fontSize: 16, fontWeight: 800, display: "flex", justifyContent: "center", alignItems: "center" }}>{g}</div>
                    <div style={{ fontSize: 21, fontWeight: 500 }}>{t}</div>
                  </div>
                ))}
              </div>
              <BodyTwin f={f} start={330} />
            </div>
            {/* right panel */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 20 }}>
                <Card style={{ flex: 1, padding: 24, boxShadow: "0 4px 18px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontWeight: 700, fontSize: 24 }}>GALIA score</div>
                  <div style={{ fontSize: 56, fontWeight: 600 }}>87<span style={{ fontSize: 26, color: "#999" }}> / 100</span></div>
                  <div style={{ color: "#999", fontSize: 20 }}>Generally healthy</div>
                </Card>
                <Card style={{ flex: 1, padding: 24, boxShadow: "0 4px 18px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontWeight: 700, fontSize: 24 }}>Biological age</div>
                  <div style={{ fontSize: 56, fontWeight: 600 }}>44<span style={{ fontSize: 26, color: "#999" }}> / 41</span></div>
                  <div style={{ color: C.pink, fontSize: 20, fontWeight: 600 }}>3 years older</div>
                </Card>
              </div>
              <Card style={{ padding: 24, boxShadow: "0 4px 18px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
                  {[["84", "Total"], ["73", "Optimal"], ["6", "Normal"], ["5", "Out of range"]].map(([v, l]) => (
                    <div key={l}>
                      <div style={{ fontSize: 40, fontWeight: 700 }}>{v}</div>
                      <div style={{ fontSize: 18, color: "#999" }}>{l}</div>
                    </div>
                  ))}
                  <SegBar p={1} width={420} />
                </div>
              </Card>
              {[
                { n: "ApoB", v: "92 mg/dL", at: 345 },
                { n: "LDL cholesterol", v: "109 mg/dL", at: 380 },
              ].map((r) => {
                const p = spr(r.at, 9);
                return (
                  <Card key={r.n} style={{ padding: "22px 28px", display: "flex", alignItems: "center", boxShadow: "0 4px 18px rgba(0,0,0,0.06)", scale: String(0.96 + p * 0.04), opacity: 0.3 + p * 0.7 }}>
                    <div style={{ width: 340, fontSize: 30, fontWeight: 700 }}>{r.n}</div>
                    <div style={{ width: 240 }}>
                      <Pill color={C.pink} label="High" size={26} scale={interpolate(p, [0, 0.6, 1], [1, 1.2, 1])} />
                    </div>
                    <div style={{ width: 200, fontSize: 26, color: "#666" }}>{r.v}</div>
                    <Spark color={C.pink} />
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 70,
          ...rise(f, 430, 20),
        }}
      >
        <Tag text="Usually not measured in standard panels" color={C.pink} />
      </div>
    </SceneShell>
  );
};

// ---------------- 6. Planas + DI ----------------
const CHAT_Q = "Can I keep running with high ApoB?";
const CHAT_A =
  "Yes – aerobic training actually helps. Let's add 30 min of easy running and omega-3 today. We'll recheck ApoB in 3 months.";

export const S06: React.FC = () => {
  const f = useF();
  const spr = useSprF();
  const chat = f >= 170;
  const pushP = prog(f, 10, 14) * (1 - prog(f, 70, 12));
  const qChars = Math.floor(interpolate(f, [185, 240], [0, CHAT_Q.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const aWords = CHAT_A.split(" ");
  const aN = Math.floor(interpolate(f, [275, 370], [0, aWords.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const typing = f > 245 && f < 275;
  const prio = [
    { n: "1", t: "Optimize cardiovascular health", c: C.red, bg: "#FCEDEB" },
    { n: "2", t: "Metabolic health", c: C.orange, bg: "#FCF0E7" },
    { n: "3", t: "Address vitamin D deficiency", c: "#5B8DEF", bg: "#EBF1FC" },
  ];
  return (
    <SceneShell idx={5} bg={C.light}>
      <LightBg />
      {[
        { from: 0, to: 170, tag: "Done for you", t: "A plan,\napproved\nby a doctor." },
        { from: 170, to: 999, tag: "Done with you", t: "AI assistant.\nIn your language.\n24/7." },
      ].map((l) => {
        const p = prog(f, l.from + 4, 16) * (1 - prog(f, l.to - 10, 10));
        return (
          <div key={l.tag} style={{ position: "absolute", left: 140, top: 250, opacity: p, translate: `0px ${(1 - prog(f, l.from + 4, 16)) * 40}px` }}>
            <Tag text={l.tag} color={l.from === 0 ? C.orange : C.green} />
            <div style={{ whiteSpace: "pre-line", marginTop: 30 }}>
              <SceneLabel text={l.t} style={{ fontSize: 96 }} />
            </div>
          </div>
        );
      })}
      <Phone style={{ position: "absolute", left: 1160, top: 70 }} rotY={interpolate(f, [0, 411], [-12, -6])}>
        {!chat ? (
          <div style={{ padding: "10px 24px" }}>
            <div style={{ fontWeight: 800, fontSize: 28 }}>Today</div>
            {["Omega-3 EPA/DHA", "Vitamin D3 + K2"].map((t, i) => (
              <div key={t} style={{ marginTop: 12, background: "#fff", borderRadius: 20, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}>
                <Check p={prog(f, 85 + i * 22, 14)} size={32} />
                <div style={{ fontSize: 21, fontWeight: 600 }}>{t}</div>
              </div>
            ))}
            <div style={{ fontWeight: 800, fontSize: 28, marginTop: 26 }}>What we're working on</div>
            {prio.map((p, i) => {
              const s = spr(100 + i * 14, 14);
              return (
                <div key={p.n} style={{ marginTop: 12, background: p.bg, borderRadius: 20, padding: "16px 18px", display: "flex", alignItems: "center", gap: 18, opacity: s, translate: `${(1 - s) * 120}px 0px` }}>
                  <div style={{ fontSize: 48, fontWeight: 300, color: p.c, width: 30 }}>{p.n}</div>
                  <div style={{ fontSize: 21, fontWeight: 500 }}>{p.t}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "6px 20px", height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: "1px solid #E6E4E0" }}>
              <LogoMark size={44} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 21 }}>GALIA assistant</div>
                <div style={{ color: C.green, fontSize: 15, fontWeight: 600 }}>● online · sees your results</div>
              </div>
            </div>
            <div style={{ alignSelf: "flex-end", marginTop: 26, maxWidth: 320, background: C.ink, color: "#fff", borderRadius: "22px 22px 6px 22px", padding: "14px 18px", fontSize: 21, lineHeight: 1.35, opacity: qChars > 0 ? 1 : 0 }}>
              {CHAT_Q.slice(0, qChars)}
            </div>
            {typing && (
              <div style={{ marginTop: 18, background: "#fff", borderRadius: 20, padding: "16px 20px", width: 90, display: "flex", gap: 8, boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: 9, background: "#AAA", translate: `0px ${Math.sin(f / 3 + i) * 3}px` }} />
                ))}
              </div>
            )}
            {aN > 0 && (
              <div style={{ marginTop: 18, maxWidth: 340, background: "#fff", borderRadius: "22px 22px 22px 6px", padding: "14px 18px", fontSize: 21, lineHeight: 1.4, boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
                {aWords.slice(0, aN).join(" ")}
              </div>
            )}
            <div style={{ marginTop: 16, ...rise(f, 375, 20) }}>
              <div style={{ display: "inline-block", border: `2px solid ${C.ink}`, borderRadius: 99, padding: "10px 18px", fontSize: 18, fontWeight: 700 }}>
                Talk to a doctor →
              </div>
            </div>
          </div>
        )}
        <Push now="now" title="Your plan is ready" body="Reviewed by your doctor. 2 actions today" p={pushP} />
      </Phone>
    </SceneShell>
  );
};

// ---------------- 7. Pokytis ----------------
export const S07: React.FC = () => {
  const f = useF();
  const spr = useSprF();
  const c = (a: number, b: number) => Math.round(interpolate(f, [45, 110], [a, b], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const line = prog(f, 40, 70);
  const ok = f > 112;
  const cards = [0, 1, 2].map((i) => spr(8 + i * 8, 15));
  return (
    <SceneShell idx={6} bg={C.light}>
      <LightBg />
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", ...rise(f, 2, 30) }}>
        <SceneLabel text="6 months later" />
      </div>
      <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", justifyContent: "center", gap: 40 }}>
        <Card style={{ width: 440, padding: 36, opacity: cards[0], translate: `0px ${(1 - cards[0]) * 80}px` }}>
          <div style={{ fontWeight: 700, fontSize: 32 }}>GALIA score</div>
          <div style={{ fontSize: 120, fontWeight: 700, color: ok ? C.green : C.ink }}>
            {c(87, 91)}
            <span style={{ fontSize: 40, color: "#999" }}> / 100</span>
          </div>
          <div style={{ fontSize: 30, color: C.green, fontWeight: 700 }}>↗ +4</div>
        </Card>
        <Card style={{ width: 440, padding: 36, opacity: cards[1], translate: `0px ${(1 - cards[1]) * 80}px` }}>
          <div style={{ fontWeight: 700, fontSize: 32 }}>Biological age</div>
          <div style={{ fontSize: 120, fontWeight: 700, color: ok ? C.green : C.ink }}>
            {c(44, 38)}
            <span style={{ fontSize: 40, color: "#999" }}> / 41</span>
          </div>
          <div style={{ fontSize: 30, color: C.green, fontWeight: 700 }}>↘ 3 years younger</div>
        </Card>
        <Card style={{ width: 520, padding: 36, opacity: cards[2], translate: `0px ${(1 - cards[2]) * 80}px` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 32 }}>ApoB</div>
            <Pill color={ok ? C.green : C.pink} label={ok ? "Optimal" : "High"} size={28} scale={ok ? interpolate(f, [112, 120, 128], [1, 1.2, 1], { extrapolateRight: "clamp" }) : 1} />
          </div>
          <svg width={450} height={210} viewBox="0 0 450 210" style={{ marginTop: 16 }}>
            <line x1="0" y1="120" x2="450" y2="120" stroke="#E5E3DF" strokeDasharray="6 6" strokeWidth="2" />
            <text x="440" y="112" fontSize="18" fill="#AAA" textAnchor="end" fontFamily={FONT}>optimal</text>
            <path d="M30 40 C 140 50, 230 120, 420 160" fill="none" stroke={C.green} strokeWidth="6" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} strokeLinecap="round" />
            <circle cx="30" cy="40" r="11" fill={C.pink} />
            <circle cx="420" cy="160" r={11 * prog(f, 108, 8)} fill={C.green} />
            <text x="30" y="20" fontSize="22" fontWeight="700" fill={C.pink} fontFamily={FONT}>92</text>
            <text x="400" y="200" fontSize="22" fontWeight="700" fill={C.green} fontFamily={FONT} opacity={prog(f, 108, 8)}>71</text>
          </svg>
        </Card>
      </div>
    </SceneShell>
  );
};
