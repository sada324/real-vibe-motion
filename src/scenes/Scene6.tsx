import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { remap, osc, EASE_OUT, springVal, SPRING } from '../utils/animations';

// Scene 6 — 105 frames = 3.5s  (finale)
export const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = remap(f, [0, 15], [0, 1], EASE_OUT);

  const ctx1Sp = springVal(f, 10, fps, 0, 1, SPRING.cinematic);
  const ctx1O  = remap(f, [10, 30], [0, 1], EASE_OUT);
  const ctx1Y  = (1 - ctx1Sp) * 36;

  const ctx2Sp = springVal(f, 24, fps, 0, 1, SPRING.cinematic);
  const ctx2O  = remap(f, [24, 44], [0, 1], EASE_OUT);
  const ctx2Y  = (1 - ctx2Sp) * 36;

  const divW  = remap(f, [40, 62], [0, 1], EASE_OUT) * 240;

  const logoSp = springVal(f, 52, fps, 0, 1, SPRING.snappy);
  const logoO  = remap(f, [52, 72], [0, 1], EASE_OUT);
  const logoSc = 0.72 + logoSp * 0.28;
  const tagO   = remap(f, [66, 82], [0, 1], EASE_OUT);

  // Stats spring in staggered
  const statsO = remap(f, [60, 78], [0, 1], EASE_OUT);
  const statsY = remap(f, [60, 78], [16, 0], EASE_OUT);

  // Breathing teal hint
  const glowPulse = osc(f, 0.04, 50) + 1.0;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Very subtle teal breath at center */}
      <div style={{
        position: 'absolute',
        left: 540 - 280, top: 960 - 280,
        width: 560, height: 560, borderRadius: '50%',
        background: C.teal,
        opacity: 0.03 * glowPulse,
        filter: 'blur(180px)',
      }} />

      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 80px',
      }}>
        {/* "Trade with context." */}
        <p style={{
          fontFamily: FONT, fontSize: 78, fontWeight: 200,
          color: C.black, letterSpacing: '-0.03em', lineHeight: 1.12,
          margin: 0, textAlign: 'center',
          opacity: ctx1O, transform: `translateY(${ctx1Y}px)`,
        }}>
          Trade with context.
        </p>

        {/* "Not emotion." */}
        <p style={{
          fontFamily: FONT, fontSize: 78, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.03em', lineHeight: 1.12,
          margin: '0 0 56px', textAlign: 'center',
          opacity: ctx2O, transform: `translateY(${ctx2Y}px)`,
        }}>
          Not emotion.
        </p>

        {/* Growing hairline */}
        <div style={{
          width: divW * 2, height: 1,
          background: `linear-gradient(to right, transparent, ${C.teal} 30%, ${C.gray500} 50%, ${C.teal} 70%, transparent)`,
          marginBottom: 56,
        }} />

        {/* PnL stats card */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 60,
          background: C.bgSoft,
          border: `1px solid ${C.panelBorder}`,
          borderRadius: 20, overflow: 'hidden',
          opacity: statsO, transform: `translateY(${statsY}px)`,
          boxShadow: C.shadow,
        }}>
          {[
            { label: 'WIN RATE', value: '74%',   color: C.green },
            { label: 'AVG R:R',  value: '2.8×',  color: C.teal  },
            { label: 'MAX DD',   value: '−6.2%', color: C.red   },
            { label: 'MEMBERS',  value: '150+',  color: C.black },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              textAlign: 'center', padding: '22px 34px',
              borderRight: i < arr.length - 1 ? `1px solid ${C.panelBorder}` : 'none',
            }}>
              <div style={{
                fontFamily: FONT, fontSize: 32, fontWeight: 800,
                color: stat.color, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>{stat.value}</div>
              <div style={{
                fontFamily: FONT, fontSize: 11, fontWeight: 600,
                color: C.gray300, letterSpacing: '0.12em', marginTop: 5,
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* HERMES logo block */}
        <div style={{
          opacity: logoO,
          transform: `scale(${logoSc})`,
          transformOrigin: 'center center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <svg width="46" height="38" viewBox="0 0 46 38">
            <defs>
              <linearGradient id="hGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={C.teal}  />
                <stop offset="100%" stopColor={C.black} />
              </linearGradient>
            </defs>
            <rect x="0"  y="0" width="7" height="38" rx="2" fill="url(#hGrad)" />
            <rect x="19" y="15" width="8" height="8" rx="1.5" fill="url(#hGrad)" opacity="0.55" />
            <rect x="39" y="0" width="7" height="38" rx="2" fill="url(#hGrad)" />
          </svg>

          <p style={{
            fontFamily: FONT, fontSize: 50, fontWeight: 300,
            color: C.black, letterSpacing: '0.30em',
            margin: 0, textAlign: 'center',
          }}>
            HERMES
          </p>

          <p style={{
            fontFamily: FONT, fontSize: 18, fontWeight: 400,
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
