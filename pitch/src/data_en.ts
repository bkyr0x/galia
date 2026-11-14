import { SCENES as LT } from "./data";
const VO = [7.55, 11.39, 12.51, 2.59, 13.87, 11.0, 3.71, 11.39, 10.37, 10.37];
const EXTRA = [0, 0, 0, 15, 15, 0, 15, 0, 0, 60];
const TEXT = [
  "Meet Tomas. Forty-one. He runs, he feels great. But his blood tells a different story.",
  "In Lithuania, one in two deaths comes from heart disease. Preventable deaths run 50% above the OECD average. It starts silently, and we find out too late.",
  "Today, Tomas has two options. A cheap lab panel, and a sheet of numbers he has to decode alone. Or a €3,000 longevity program. There is nothing in between.",
  "Until now. Meet GALIA.",
  "One blood draw. Over 100 biomarkers. A week later: 84 markers, 5 out of range. Elevated ApoB and LDL. Things a standard panel usually doesn't even measure.",
  "A doctor approves his plan: three priorities, two actions today. Got a question? Tomas asks the GALIA assistant, in his own language, any time.",
  "Six months later, he retests, and sees the change.",
  "The model is proven. In the US, Superpower has 64,000 members and a half-billion-dollar valuation. In Lithuania, nothing like it exists.",
  "What could cost €3,000 is €149 a year with GALIA. Add genome testing for €249. For individuals and employers.",
  "At this hackathon, we will ship a working prototype: lab upload, plain-language results, and a personal plan. Because health is your superpower.",
];
export const TR = 12; // transition frames
export const SCENES_EN = LT.map((s, i) => {
  const frames = Math.ceil(9 + VO[i] * 30 + 15 + EXTRA[i]);
  return { ...s, id: s.id + "-EN", vo: `vo_en/${String(i + 1).padStart(2, "0")}.mp3`, voDur: VO[i], text: TEXT[i], frames, k: s.frames / frames };
});
export const TOTAL_EN = SCENES_EN.reduce((a, s) => a + s.frames, 0) - TR * (SCENES_EN.length - 1);
export const STARTS_EN = SCENES_EN.map((_, i) => SCENES_EN.slice(0, i).reduce((a, s) => a + s.frames, 0) - TR * i);
