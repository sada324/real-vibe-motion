import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { GlowOrb } from '../components/GlowOrb';
import { remap, osc, EASE_OUT, springVal, SPRING } from '../utils/animations';

// ─── Scene 5 ─────────────────────────────────────────────────────────────────
// Sequence duration: 75 frames (local 0–75)
export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = remap(f, [0, 15], [0, 1], EASE_OUT); // final scene — fade in only

  // "Trade with context." — first line
  const ctx1Sp = springVal(f, 10, fps, 0, 1, SPRING.cinematic);
  const ctx1O  = remap(f, [10, 30], [0, 1], EASE_OUT);
  const ctx1Y  = (1 - ctx1Sp) * 40;

  // "Not emotion." — second line, delayed
  const ctx2Sp = springVal(f, 24, fps, 0, 1, SPRING.cinematic);
  const ctx2O  = remap(f, [24, 44], [0, 1], EASE_OUT);
  const ctx2Y  = (1 - ctx2Sp) * 40;

  // Divider line: draws from center outward
  const divW = remap(f, [38, 58], [0, 1], EASE_OUT) * 280;

  // "HERMES" logo — springs in last
  const logoSp = springVal(f, 48, fps, 0, 1, SPRING.snappy);
  const logoO  = remap(f, [48, 68], [0, 1], EASE_OUT);
  const logoSc = 0.7 + logoSp * 0.3;

  // Glow pulse behind HERMES
  const pulse = osc(f, 0.08, 45) + 1.0;
  const glowOpa = 0.10 * pulse;
  const glowSize = 420 + osc(f, 30, 50);

  // Tagline under HERMES
  const tagO = remap(f, [62, 75], [0, 1], EASE_OUT);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Background glow — centered, breathing */}
      <GlowOrb x={540} y={920} size={glowSize} color={C.blue} opacity={glowOpa} blur={160} />
      <GlowOrb x={540} y={920} size={300}     color={C.cyan} opacity={0.04}   blur={100} />

      {/* Subtle radial vignette */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 65% 50% at 50% 50%, transparent 0%, ${C.bg} 80%)`,
      }} />

      {/* Content centered */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 80px',
      }}>
        {/* "Trade with context." */}
        <p style={{
          fontFamily: FONT, fontSize: 72, fontWeight: 200,
          color: C.white, letterSpacing: '-0.025em', lineHeight: 1.2,
          margin: 0, textAlign: 'center',
          opacity: ctx1O, transform: `translateY(${ctx1Y}px)`,
        }}>
          Trade with context.
        </p>

        {/* "Not emotion." */}
        <p style={{
          fontFamily: FONT, fontSize: 72, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.025em', lineHeight: 1.2,
          margin: '0 0 56px', textAlign: 'center',
          opacity: ctx2O, transform: `translateY(${ctx2Y}px)`,
        }}>
          Not emotion.
        </p>

        {/* Horizontal divider, grows from center */}
        <div style={{
          width: divW * 2, height: 1,
          background: `linear-gradient(to right, transparent, ${C.blue} 30%, ${C.cyan} 50%, ${C.blue} 70%, transparent)`,
          marginBottom: 52,
        }} />

        {/* HERMES logo mark */}
        <div style={{
          opacity: logoO,
          transform: `scale(${logoSc})`,
          transformOrigin: 'center center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          {/* Logo icon: simple geometric H */}
          <svg width="52" height="42" viewBox="0 0 52 42">
            <defs>
              <linearGradient id="hGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={C.blue} />
                <stop offset="100%" stopColor={C.cyan} />
              </linearGradient>
            </defs>
            <rect x="0"  y="0"  width="8" height="42" rx="2" fill="url(#hGrad)" />
            <rect x="22" y="17" width="8" height="8"  rx="1" fill="url(#hGrad)" opacity="0.7" />
            <rect x="44" y="0"  width="8" height="42" rx="2" fill="url(#hGrad)" />
          </svg>

          {/* Wordmark */}
          <p style={{
            fontFamily: FONT, fontSize: 52, fontWeight: 300,
            color: C.white, letterSpacing: '0.30em',
            margin: 0, textAlign: 'center',
          }}>
            HERMES
          </p>

          {/* Tagline */}
          <p style={{
            fontFamily: FONT, fontSize: 22, fontWeight: 300,
            color: C.gray300, letterSpacing: '0.16em',
            margin: 0, textAlign: 'center',
            opacity: tagO,
          }}>
            INSTITUTIONAL SWING INTELLIGENCE
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
