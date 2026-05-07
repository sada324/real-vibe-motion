import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, EASE_OUT, remap } from '../utils/animations';

const CANDLES = (() => {
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let p = 0.52;
  for (let i = 0; i < 38; i++) {
    const t = i / 38;
    const s1 = Math.sin(i * 1.83 + 2.1), s2 = Math.sin(i * 0.97 + 0.7);
    const body = (s1 * 0.5 + (t < 0.55 ? -0.004 : 0.005)) * 0.06;
    const o = p, c = Math.max(0.05, Math.min(0.95, p + body));
    const wick = Math.abs(s2) * 0.03;
    out.push({ o, c, h: Math.min(Math.max(o, c) + wick, 0.98), l: Math.max(Math.min(o, c) - wick * 0.7, 0.02) });
    p = c;
  }
  const mn = Math.min(...out.map(x => x.l)), mx = Math.max(...out.map(x => x.h)), rng = mx - mn;
  return out.map(x => ({ o:(x.o-mn)/rng*0.9+0.05, c:(x.c-mn)/rng*0.9+0.05, h:(x.h-mn)/rng*0.9+0.05, l:(x.l-mn)/rng*0.9+0.05 }));
})();

const CandleChart: React.FC<{ w: number; h: number; opacity: number }> = ({ w, h, opacity }) => {
  const step = w / CANDLES.length, cw = step * 0.52, pad = h * 0.06, ch = h - pad * 2;
  return (
    <svg width={w} height={h} style={{ display: 'block', opacity }}>
      {CANDLES.map((c, i) => {
        const x = i * step + step / 2, isUp = c.c >= c.o, col = isUp ? C.green : C.red;
        const hy = pad+(1-c.h)*ch, ly = pad+(1-c.l)*ch, oy = pad+(1-c.o)*ch, cy2 = pad+(1-c.c)*ch;
        return (
          <g key={i}>
            <line x1={x} y1={hy} x2={x} y2={ly} stroke={col} strokeWidth={1.2} opacity={0.45}/>
            <rect x={x-cw/2} y={Math.min(oy,cy2)} width={cw} height={Math.max(Math.abs(cy2-oy),2)} fill={col} opacity={0.70} rx={1.5}/>
          </g>
        );
      })}
    </svg>
  );
};

// Scene 1 — 120 frames = 4s
export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const opacity  = sceneFade(f, 120, 15, 100, 20);
  const camScale = remap(f, [0, 120], [1.0, 1.07]);
  const chartOpa = remap(f, [0, 28], [0, 1]) * 0.13;

  const line1O = remap(f, [20, 44], [0, 1], EASE_OUT);
  const line1Y = remap(f, [20, 44], [34, 0], EASE_OUT);
  const line2O = remap(f, [36, 58], [0, 1], EASE_OUT);
  const line2Y = remap(f, [36, 58], [34, 0], EASE_OUT);
  const tickerO = remap(f, [58, 78], [0, 1], EASE_OUT);
  const tickerY = remap(f, [58, 78], [20, 0], EASE_OUT);
  const labelO  = remap(f, [56, 74], [0, 1], EASE_OUT);
  const lineW   = remap(f, [56, 74], [0, 1], EASE_OUT) * 72;

  const TICKERS = [
    { sym: 'BTC', val: '$67,420', chg: '+2.4%', up: true,  emoji: '📈' },
    { sym: 'ETH', val: '$3,518',  chg: '+1.8%', up: true,  emoji: '📊' },
    { sym: 'SOL', val: '$182',    chg: '−0.6%', up: false, emoji: '📉' },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      <AbsoluteFill style={{ transform: `scale(${camScale})`, filter: 'blur(14px)' }}>
        <CandleChart w={1080} h={1920} opacity={chartOpa} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 55% at 50% 50%, transparent 0%, ${C.bg} 76%)` }} />

      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 80px', gap: 0,
      }}>
        <p style={{
          fontFamily: FONT, fontSize: 84, fontWeight: 200, color: C.black,
          letterSpacing: '-0.03em', lineHeight: 1.08, margin: 0, textAlign: 'center',
          opacity: line1O, transform: `translateY(${line1Y}px)`,
        }}>Most traders stare</p>
        <p style={{
          fontFamily: FONT, fontSize: 84, fontWeight: 200, color: C.gray300,
          letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 60px', textAlign: 'center',
          opacity: line2O, transform: `translateY(${line2Y}px)`,
        }}>at candles…</p>

        {/* Animated ticker cards */}
        <div style={{ display: 'flex', gap: 16, opacity: tickerO, transform: `translateY(${tickerY}px)` }}>
          {TICKERS.map((t, i) => {
            return (
              <div key={t.sym} style={{
                background: C.bgSoft, border: `1px solid ${C.panelBorder}`,
                borderRadius: 16, padding: '16px 22px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                boxShadow: C.shadow, minWidth: 148,
              }}>
                <span style={{ fontSize: 28 }}>{t.emoji}</span>
                <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.gray300, letterSpacing: '0.10em' }}>{t.sym}</span>
                <span style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: C.black, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{t.val}</span>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: t.up ? C.green : C.red }}>{t.chg}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 108, gap: 14 }}>
        <div style={{ width: lineW * 2, height: 1, background: C.gray500, opacity: labelO }} />
        <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 400, color: C.gray300, letterSpacing: '0.28em', opacity: labelO }}>HERMES</span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
