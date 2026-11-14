import React from "react";
import { Composition, Folder } from "remotion";
import { Pitch, SCENE_COMPONENTS } from "./Pitch";
import { SCENES, TOTAL } from "./data";
import { PitchEN, TOTAL_EN } from "./PitchEN";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="GaliaPitch" component={Pitch} width={1920} height={1080} fps={30} durationInFrames={TOTAL} />
    <Composition id="GaliaPitchEN" component={PitchEN} width={1920} height={1080} fps={30} durationInFrames={TOTAL_EN} />
    <Folder name="Scenes">
      {SCENES.map((s, i) => (
        <Composition key={s.id} id={s.id} component={SCENE_COMPONENTS[i]} width={1920} height={1080} fps={30} durationInFrames={s.frames} />
      ))}
    </Folder>
  </>
);
