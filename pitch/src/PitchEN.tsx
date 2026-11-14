import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { iris } from "@remotion/transitions/iris";
import { pushCut } from "@remotion/transitions/push-cut";
import { S01, S02, S03, S04 } from "./ScenesA_en";
import { S05, S06, S07 } from "./ScenesB_en";
import { S08, S09, S10 } from "./ScenesC_en";
import { SCENES_EN, STARTS_EN, TOTAL_EN, TR } from "./data_en";
import { SpeedProvider } from "./speed";
import { LEAD } from "./lib";

const COMPS = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10];
const W = 1920, H = 1080;
// transition INTO scene i+1
const TRANS = [
  pushCut({ flashColor: "#FF4A2F", flashOpacity: 0.5 }),
  slide({ direction: "from-right" }),
  wipe({ direction: "from-left" }),
  iris({ width: W, height: H }),
  slide({ direction: "from-bottom" }),
  flip({ direction: "from-right" }),
  pushCut({ flashColor: "#ffffff", flashOpacity: 0.7 }),
  clockWipe({ width: W, height: H }),
  wipe({ direction: "from-bottom-right" }),
];

// Camera: punch-in at scene start + slow push.
const Camera: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const f = useCurrentFrame();
  const punch = interpolate(f, [0, 10], [1.06, 1], { extrapolateRight: "clamp" });
  const push = interpolate(f, [0, frames], [1, 1.045]);
  return <AbsoluteFill style={{ scale: String(punch * push) }}>{children}</AbsoluteFill>;
};

const Music: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const vo = SCENES_EN.map((s, i) => [STARTS_EN[i] + LEAD, STARTS_EN[i] + LEAD + s.voDur * 30]);
  return (
    <Audio
      src={staticFile("music/startup.mp3")}
      playbackRate={0.97}
      volume={(f) => {
        let d = Infinity;
        for (const [a, b] of vo) d = Math.min(d, f < a ? a - f : f > b ? f - b : 0);
        const duck = interpolate(d, [0, 12], [0.14, 0.4], { extrapolateRight: "clamp" });
        const fin = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
        const fout = interpolate(f, [durationInFrames - 50, durationInFrames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return duck * fin * fout;
      }}
    />
  );
};

export const PitchEN: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B0F1A" }}>
    <TransitionSeries>
      {SCENES_EN.flatMap((s, i) => {
        const Comp = COMPS[i];
        const seq = (
          <TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={s.frames}>
            <SpeedProvider k={s.k}>
              <Camera frames={s.frames}>
                <Comp />
              </Camera>
            </SpeedProvider>
          </TransitionSeries.Sequence>
        );
        if (i === SCENES_EN.length - 1) return [seq];
        return [
          seq,
          <TransitionSeries.Transition
            key={s.id + "-t"}
            presentation={TRANS[i] as never}
            timing={i % 2 ? springTiming({ config: { damping: 200 }, durationInFrames: TR }) : linearTiming({ durationInFrames: TR })}
          />,
        ];
      })}
    </TransitionSeries>
    <Music />
  </AbsoluteFill>
);
export { TOTAL_EN };
