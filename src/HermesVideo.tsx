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
  Frame layout  (30 fps, 750 frames = 25 s)
  Cross-fade overlap: 15 frames (0.5 s) between each scene.
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │  Scene 1   │  from=0,   dur=120  │  0.0s –  4.0s  ticker opener            │
  │  Scene 2   │  from=105, dur=150  │  3.5s –  8.5s  macro data panels        │
  │  Scene 3   │  from=240, dur=150  │  8.0s – 13.0s  market structure chart   │
  │  Scene 4   │  from=375, dur=150  │ 12.5s – 17.5s  ETH trade setup          │
  │  Scene 5   │  from=510, dur=120  │ 17.0s – 21.0s  150 traders social proof │
  │  Scene 6   │  from=615, dur=135  │ 20.5s – 25.0s  finale                   │
  └──────────────────────────────────────────────────────────────────────────────┘
*/

export const HermesVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={120} name="Scene1"><Scene1 /></Sequence>
    <Sequence from={105} durationInFrames={150} name="Scene2"><Scene2 /></Sequence>
    <Sequence from={240} durationInFrames={150} name="Scene3"><Scene3 /></Sequence>
    <Sequence from={375} durationInFrames={150} name="Scene4"><Scene4 /></Sequence>
    <Sequence from={510} durationInFrames={120} name="Scene5"><Scene5 /></Sequence>
    <Sequence from={615} durationInFrames={135} name="Scene6"><Scene6 /></Sequence>

    <GrainOverlay opacity={0.010} />
  </AbsoluteFill>
);
