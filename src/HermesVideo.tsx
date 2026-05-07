import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { C } from './utils/colors';
import { GrainOverlay } from './components/GrainOverlay';
import { Scene1 } from './scenes/Scene1';
import { Scene2 } from './scenes/Scene2';
import { Scene3 } from './scenes/Scene3';
import { Scene4 } from './scenes/Scene4';
import { Scene5 } from './scenes/Scene5';

/*
  Frame layout (30fps, 450 frames = 15 s)
  ┌───────────────────────────────────────────────────────────────┐
  │  Scene 1   │  from=0,   dur=90   │ 0s – 3s   (2s + 1s xfade)│
  │  Scene 2   │  from=75,  dur=105  │ 2.5s – 6s                 │
  │  Scene 3   │  from=165, dur=105  │ 5.5s – 9s                 │
  │  Scene 4   │  from=255, dur=135  │ 8.5s – 13s                │
  │  Scene 5   │  from=375, dur=75   │ 12.5s – 15s               │
  └───────────────────────────────────────────────────────────────┘
  Cross-fade overlap: 15 frames (0.5s) between each scene.
  Each scene manages its own fadeIn(0, 15) and fadeOut(dur-17, 17) internally.
*/

export const HermesVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}  name="Scene1"><Scene1 /></Sequence>
    <Sequence from={75}  durationInFrames={105} name="Scene2"><Scene2 /></Sequence>
    <Sequence from={165} durationInFrames={105} name="Scene3"><Scene3 /></Sequence>
    <Sequence from={255} durationInFrames={135} name="Scene4"><Scene4 /></Sequence>
    <Sequence from={375} durationInFrames={75}  name="Scene5"><Scene5 /></Sequence>

    {/* Film grain — persists across all scenes */}
    <GrainOverlay opacity={0.010} />
  </AbsoluteFill>
);
