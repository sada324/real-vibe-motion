import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { C } from './utils/colors';
import { GrainOverlay } from './components/GrainOverlay';
import { Scene1 } from './scenes/Scene1';
import { Scene2 } from './scenes/Scene2';
import { Scene3 } from './scenes/Scene3';
import { Scene4 } from './scenes/Scene4';
import { Scene5 } from './scenes/Scene5';
import { Scene6 } from './scenes/Scene6';

/*
  Frame layout  (30 fps, 600 frames = 20 s)
  Cross-fade overlap: 15 frames (0.5 s) between each scene.
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Scene 1   │  from=0,   dur=105  │  0.0s –  3.5s  candle opener    │
  │  Scene 2   │  from=90,  dur=120  │  3.0s –  7.0s  macro panels     │
  │  Scene 3   │  from=195, dur=120  │  6.5s – 10.5s  liquidity net    │
  │  Scene 4   │  from=300, dur=135  │ 10.0s – 14.5s  ETH chart        │
  │  Scene 5   │  from=420, dur=90   │ 14.0s – 17.0s  150 traders ✦   │
  │  Scene 6   │  from=495, dur=105  │ 16.5s – 20.0s  finale           │
  └──────────────────────────────────────────────────────────────────────┘
*/

export const HermesVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={105} name="Scene1"><Scene1 /></Sequence>
    <Sequence from={90}  durationInFrames={120} name="Scene2"><Scene2 /></Sequence>
    <Sequence from={195} durationInFrames={120} name="Scene3"><Scene3 /></Sequence>
    <Sequence from={300} durationInFrames={135} name="Scene4"><Scene4 /></Sequence>
    <Sequence from={420} durationInFrames={90}  name="Scene5"><Scene5 /></Sequence>
    <Sequence from={495} durationInFrames={105} name="Scene6"><Scene6 /></Sequence>

    <GrainOverlay opacity={0.010} />
  </AbsoluteFill>
);
