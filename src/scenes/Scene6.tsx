import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { remap, osc, EASE_OUT, springVal, SPRING } from '../utils/animations';

// Scene 6 — 135 frames = 4.5s (finale)
export const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = remap(f, [0, 15], [0, 1], EASE_OUT);

  const ctx1Sp = springVal(f, 12, fps, 0, 1, SPRING.cinematic);
  const ctx1O  = remap(f, [12, 32], [0, 1], EASE_OUT);
  const ctx1Y  = (1 - ctx1Sp) * 36;

  const ctx2Sp = springVal(f, 26, fps, 0, 1, SPRING.cinematic);
  const ctx2O  = remap(f, [26, 46], [0, 1], EASE_OUT);
  const ctx2Y  = (1 - ctx2Sp) * 36;

  const divW   = remap(f, [44, 66], [0, 1], EASE_OUT) * 240;
  const statsO = remap(f, [62, 82], [0, 1], EASE_OUT);
  const statsY = remap(f, [62, 82], [16, 0], EASE_OUT);

  const logoSp = springVal(f, 74, fps, 0, 1, SPRING.snappy);
  const logoO  = remap(f, [74, 94], [0, 1], EASE_OUT);
  const logoSc = 0.72 + logoSp * 0.28;
  const tagO   = remap(f, [90, 110], [0, 1], EASE_OUT);

  // Gentle violet pulse behind logo
  const pulse = osc(f, 0.04, 52) + 1.0;

  const STATS = [
    { label: 'WIN RATE', value: '74%',   color: C.green, emoji: '✅' },
    { label: 'AVG R:R',  value: '2.8×',  color: C.accent, emoji: '⚖️' },
    { label: 'MAX DD',   value: '−6.2%', color: C.red,   emoji: '🛡️' },
    { label: 'MEMBERS',  value: '150+',  color: C.black, emoji: '👥' },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Violet breath */}
      <div style={{
        position: 'absolute', left: 540 - 280, top: 960 - 280,
        width: 560, height: 560, borderRadius: '50%',
        background: C.accent, opacity: 0.04 * pulse, filter: 'blur(180px)',
      }} />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px' }}>
        <p style={{ fontFamily: FONT, fontSize: 78, fontWeight: 200, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.12, margin: 0, textAlign: 'center', opacity: ctx1O, transform: `translateY(${ctx1Y}px)` }}>
          Trade with context.
        </p>
        <p style={{ fontFamily: FONT, fontSize: 78, fontWeight: 200, color: C.gray300, letterSpacing: '-0.03em', lineHeight: 1.12, margin: '0 0 56px', textAlign: 'center', opacity: ctx2O, transform: `translateY(${ctx2Y}px)` }}>
          Not emotion.
        </p>

        {/* Hairline grows from center */}
        <div style={{ width: divW * 2, height: 1, background: `linear-gradient(to right, transparent, ${C.accent} 30%, ${C.gray500} 50%, ${C.accent} 70%, transparent)`, marginBottom: 52 }} />

        {/* 4-stat card */}
        <div style={{
          display: 'flex', width: '100%', marginBottom: 64,
          background: C.bgSoft, border: `1px solid ${C.panelBorder}`,
          borderRadius: 22, overflow: 'hidden', boxShadow: C.shadow,
          opacity: statsO, transform: `translateY(${statsY}px)`,
        }}>
          {STATS.map((stat, i) => {
            const es = 1 + osc(f, 0.10, 28, i * 1.6);
            return (
              <div key={stat.label} style={{ flex: 1, textAlign: 'center', padding: '22px 12px', borderRight: i < STATS.length - 1 ? `1px solid ${C.panelBorder}` : 'none' }}>
                <span style={{ fontSize: 22, display: 'inline-block', transform: `scale(${es})`, marginBottom: 8 }}>{stat.emoji}</span>
                <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: stat.color, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{stat.value}</div>
                <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.gray300, letterSpacing: '0.12em', marginTop: 5 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* HERMES logo */}
        <div style={{ opacity: logoO, transform: `scale(${logoSc})`, transformOrigin: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <svg width="46" height="38" viewBox="0 0 46 38">
            <defs>
              <linearGradient id="hGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={C.accent} />
                <stop offset="100%" stopColor={C.black} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="7" height="38" rx="2" fill="url(#hGrad)" />
            <rect x="19" y="15" width="8" height="8" rx="1.5" fill="url(#hGrad)" opacity="0.55" />
            <rect x="39" y="0" width="7" height="38" rx="2" fill="url(#hGrad)" />
          </svg>
          <p style={{ fontFamily: FONT, fontSize: 50, fontWeight: 300, color: C.black, letterSpacing: '0.30em', margin: 0, textAlign: 'center' }}>HERMES</p>
          <p style={{ fontFamily: FONT, fontSize: 17, fontWeight: 400, color: C.gray300, letterSpacing: '0.18em', margin: 0, textAlign: 'center', opacity: tagO }}>
            INSTITUTIONAL SWING INTELLIGENCE
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
