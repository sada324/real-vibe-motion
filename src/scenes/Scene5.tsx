import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { remap, osc, EASE_OUT, springVal, SPRING } from '../utils/animations';

export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = remap(f, [0, 15], [0, 1], EASE_OUT);

  const ctx1Sp = springVal(f, 10, fps, 0, 1, SPRING.cinematic);
  const ctx1O  = remap(f, [10, 30], [0, 1], EASE_OUT);
  const ctx1Y  = (1 - ctx1Sp) * 36;

  const ctx2Sp = springVal(f, 24, fps, 0, 1, SPRING.cinematic);
  const ctx2O  = remap(f, [24, 44], [0, 1], EASE_OUT);
  const ctx2Y  = (1 - ctx2Sp) * 36;

  // Divider grows from center
  const divW = remap(f, [38, 58], [0, 1], EASE_OUT) * 260;

  // Logo springs in last
  const logoSp = springVal(f, 48, fps, 0, 1, SPRING.snappy);
  const logoO  = remap(f, [48, 68], [0, 1], EASE_OUT);
  const logoSc = 0.72 + logoSp * 0.28;

  // Breathing teal glow
  const pulse    = osc(f, 0.06, 48) + 1.0;
  const glowOpa  = 0.06 * pulse;
  const glowSize = 380 + osc(f, 24, 50);

  const tagO = remap(f, [62, 75], [0, 1], EASE_OUT);

  // PnL stats that appear alongside logo
  const statsO = remap(f, [55, 72], [0, 1], EASE_OUT);
  const statsY = remap(f, [55, 72], [16, 0], EASE_OUT);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Teal glow — centered, breathing */}
      <div style={{
        position: 'absolute',
        left: 540 - glowSize / 2,
        top:  920 - glowSize / 2,
        width: glowSize, height: glowSize,
        borderRadius: '50%',
        background: C.teal, opacity: glowOpa, filter: 'blur(140px)',
      }} />

      {/* Radial vignette */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 70% 55% at 50% 50%, transparent 0%, ${C.bg} 82%)`,
      }} />

      {/* Content */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 80px',
      }}>
        {/* "Trade with context." */}
        <p style={{
          fontFamily: FONT, fontSize: 74, fontWeight: 200,
          color: C.white, letterSpacing: '-0.03em', lineHeight: 1.18,
          margin: 0, textAlign: 'center',
          opacity: ctx1O, transform: `translateY(${ctx1Y}px)`,
        }}>
          Trade with context.
        </p>

        {/* "Not emotion." */}
        <p style={{
          fontFamily: FONT, fontSize: 74, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.03em', lineHeight: 1.18,
          margin: '0 0 52px', textAlign: 'center',
          opacity: ctx2O, transform: `translateY(${ctx2Y}px)`,
        }}>
          Not emotion.
        </p>

        {/* Hairline divider — grows from center */}
        <div style={{
          width: divW * 2, height: 1,
          background: `linear-gradient(to right, transparent, ${C.teal} 30%, rgba(255,255,255,0.5) 50%, ${C.teal} 70%, transparent)`,
          marginBottom: 48,
        }} />

        {/* PnL stats row */}
        <div style={{
          display: 'flex', gap: 52, marginBottom: 52,
          opacity: statsO, transform: `translateY(${statsY}px)`,
        }}>
          {[
            { label: 'WIN RATE', value: '74%',    color: C.green },
            { label: 'AVG R:R',  value: '2.8×',   color: C.teal  },
            { label: 'MAX DD',   value: '−6.2%',  color: C.red   },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: FONT, fontSize: 34, fontWeight: 500,
                color: stat.color, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 400,
                color: C.gray300, letterSpacing: '0.12em',
                marginTop: 4,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* HERMES logo */}
        <div style={{
          opacity: logoO,
          transform: `scale(${logoSc})`,
          transformOrigin: 'center center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          {/* Geometric H mark */}
          <svg width="48" height="40" viewBox="0 0 48 40">
            <defs>
              <linearGradient id="hGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={C.teal}  />
                <stop offset="100%" stopColor={C.white} />
              </linearGradient>
            </defs>
            <rect x="0"  y="0"  width="7" height="40" rx="2" fill="url(#hGrad)" />
            <rect x="20" y="16" width="8" height="8"  rx="1" fill="url(#hGrad)" opacity="0.6" />
            <rect x="41" y="0"  width="7" height="40" rx="2" fill="url(#hGrad)" />
          </svg>

          {/* Wordmark */}
          <p style={{
            fontFamily: FONT, fontSize: 50, fontWeight: 300,
            color: C.white, letterSpacing: '0.32em',
            margin: 0, textAlign: 'center',
          }}>
            HERMES
          </p>

          {/* Tagline */}
          <p style={{
            fontFamily: FONT, fontSize: 20, fontWeight: 300,
            color: C.gray300, letterSpacing: '0.18em',
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
