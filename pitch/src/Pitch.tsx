import React from "react";
import { Series } from "remotion";
import { SCENES } from "./data";
import { S01, S02, S03, S04 } from "./ScenesA";
import { S05, S06, S07 } from "./ScenesB";
import { S08, S09, S10 } from "./ScenesC";

export const SCENE_COMPONENTS = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10];

export const Pitch: React.FC = () => (
  <Series>
    {SCENES.map((s, i) => {
      const Comp = SCENE_COMPONENTS[i];
      return (
        <Series.Sequence key={s.id} name={s.id} durationInFrames={s.frames}>
          <Comp />
        </Series.Sequence>
      );
    })}
  </Series>
);
