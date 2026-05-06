import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const GrainOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.032 }) => {
  const frame = useCurrentFrame();
  // Shift grain seed every 2 frames → subtle animated noise without flicker
  const seed = Math.floor(frame / 2) * 13;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 9999 }}>
      <svg width="100%" height="100%" style={{ display: 'block' }}>
        <defs>
          <filter id={`g${seed}`} x="0%" y="0%" width="100%" height="100%"
            colorInterpolationFilters="linearRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="4"
              seed={seed}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
            <feBlend in="SourceGraphic" in2="gray" mode="overlay" result="blended" />
            <feComponentTransfer in="blended">
              <feFuncA type="linear" slope={opacity} />
            </feComponentTransfer>
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} fill="white" />
      </svg>
    </AbsoluteFill>
  );
};
