import React, { createContext, useContext } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
export const SpeedCtx = createContext(1);
export const useF = () => useCurrentFrame() * useContext(SpeedCtx);
export const useSprF = () => {
  const f = useF();
  const { fps } = useVideoConfig();
  return (start: number, damping = 14, mass = 1) => spring({ frame: f - start, fps, config: { damping, mass } });
};
export const SpeedProvider: React.FC<{ k: number; children: React.ReactNode }> = ({ k, children }) => (
  <SpeedCtx.Provider value={k}>{children}</SpeedCtx.Provider>
);
