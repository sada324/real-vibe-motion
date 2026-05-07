import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { remap, EASE_OUT, springVal, SPRING } from '../utils/animations';

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

  const divW  = remap(f, [38, 58], [0, 1], EASE_OUT) * 240;

  const logoSp = springVal(f, 48, fps, 0, 1, SPRING.snappy);
  const logoO  = remap(f, [48, 68], [0, 1], EASE_OUT);
  const logoSc = 0.72 + logoSp * 0.28;
  const tagO   = remap(f, [62, 75], [0, 1], EASE_OUT);

  const statsO = remap(f, [55, 72], [0, 1], EASE_OUT);
  const statsY = remap(f, [55, 72], [16, 0], EASE_OUT);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Very subtle teal tint centered */}
      <div style={{
        position: 'absolute', left: 540 - 300, top: 920 - 300,
        width: 600, height: 600, borderRadius: '50%',
        background: C.teal, opacity: 0.04, filter: 'blur(180px)',
      }} />

      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 80px',
      }}>
        {/* "Trade with context." */}
        <p style={{
          fontFamily: FONT, fontSize: 76, fontWeight: 200,
          color: C.black, letterSpacing: '-0.03em', lineHeight: 1.15,
          margin: 0, textAlign: 'center',
          opacity: ctx1O, transform: `translateY(${ctx1Y}px)`,
        }}>
          Trade with context.
        </p>

        {/* "Not emotion." */}
        <p style={{
          fontFamily: FONT, fontSize: 76, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.03em', lineHeight: 1.15,
          margin: '0 0 52px', textAlign: 'center',
          opacity: ctx2O, transform: `translateY(${ctx2Y}px)`,
        }}>
          Not emotion.
        </p>

        {/* Hairline divider */}
        <div style={{
          width: divW * 2, height: 1,
          background: `linear-gradient(to right, transparent, ${C.teal} 30%, ${C.gray500} 50%, ${C.teal} 70%, transparent)`,
          marginBottom: 52,
        }} />

        {/* PnL stats */}
        <div style={{
          display: 'flex', gap: 48, marginBottom: 56,
          opacity: statsO, transform: `translateY(${statsY}px)`,
          background: C.bgSoft,
          border: `1px solid ${C.panelBorder}`,
          borderRadius: 18,
          padding: '24px 40px',
        }}>
          {[
            { label: 'WIN RATE', value: '74%',   color: C.green },
            { label: 'AVG R:R',  value: '2.8×',  color: C.teal  },
            { label: 'MAX DD',   value: '−6.2%', color: C.red   },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: FONT, fontSize: 34, fontWeight: 700,
                color: stat.color, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 500,
                color: C.gray300, letterSpacing: '0.12em',
                marginTop: 5,
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
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          {/* Geometric H */}
          <svg width="46" height="38" viewBox="0 0 46 38">
            <defs>
              <linearGradient id="hGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={C.teal} />
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
