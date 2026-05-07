import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, EASE_OUT, remap } from '../utils/animations';

const CANDLES = (() => {
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let p = 0.52;
  for (let i = 0; i < 38; i++) {
    const t = i / 38;
    const trend = t < 0.55 ? -0.004 : 0.005;
    const s1 = Math.sin(i * 1.83 + 2.1);
    const s2 = Math.sin(i * 0.97 + 0.7);
    const body = (s1 * 0.5 + trend) * 0.06;
    const o = p, c = Math.max(0.05, Math.min(0.95, p + body));
    const wick = Math.abs(s2) * 0.03;
    const h = Math.max(o, c) + wick;
    const l = Math.min(o, c) - wick * 0.7;
    out.push({ o, c, h: Math.min(h, 0.98), l: Math.max(l, 0.02) });
    p = c;
  }
  const allH = out.map(x => x.h), allL = out.map(x => x.l);
  const mn = Math.min(...allL), mx = Math.max(...allH), rng = mx - mn;
  return out.map(x => ({
    o: (x.o - mn) / rng * 0.9 + 0.05,
    c: (x.c - mn) / rng * 0.9 + 0.05,
    h: (x.h - mn) / rng * 0.9 + 0.05,
    l: (x.l - mn) / rng * 0.9 + 0.05,
  }));
})();

const CandleChart: React.FC<{ w: number; h: number; opacity: number }> = ({ w, h, opacity }) => {
  const n = CANDLES.length;
  const step = w / n;
  const cw = step * 0.52;
  const pad = h * 0.06;
  const ch = h - pad * 2;
  return (
    <svg width={w} height={h} style={{ display: 'block', opacity }}>
      {CANDLES.map((c, i) => {
        const x = i * step + step / 2;
        const isGreen = c.c >= c.o;
        const col = isGreen ? C.green : C.red;
        const hy = pad + (1 - c.h) * ch;
        const ly = pad + (1 - c.l) * ch;
        const oy = pad + (1 - c.o) * ch;
        const cy2 = pad + (1 - c.c) * ch;
        const bodyT = Math.min(oy, cy2);
        const bodyH = Math.max(Math.abs(cy2 - oy), 2);
        return (
          <g key={i}>
            <line x1={x} y1={hy} x2={x} y2={ly} stroke={col} strokeWidth={1.2} opacity={0.45} />
            <rect x={x - cw / 2} y={bodyT} width={cw} height={bodyH}
              fill={col} opacity={0.70} rx={1.5} />
          </g>
        );
      })}
    </svg>
  );
};

// Scene 1 — 105 frames = 3.5s
export const Scene1: React.FC = () => {
  const f = useCurrentFrame();

  const opacity  = sceneFade(f, 105, 15, 87, 18);
  const camScale = remap(f, [0, 105], [1.0, 1.07]);
  const chartOpa = remap(f, [0, 28], [0, 1]) * 0.14;

  // Main headline
  const line1Y = remap(f, [20, 44], [34, 0], EASE_OUT);
  const line1O = remap(f, [20, 44], [0, 1],  EASE_OUT);
  const line2Y = remap(f, [34, 58], [34, 0], EASE_OUT);
  const line2O = remap(f, [34, 58], [0, 1],  EASE_OUT);

  // Ticker row that slides in below the headline
  const tickerO = remap(f, [55, 72], [0, 1], EASE_OUT);
  const tickerY = remap(f, [55, 72], [16, 0], EASE_OUT);

  // Bottom wordmark
  const labelO = remap(f, [52, 70], [0, 1], EASE_OUT);
  const lineW  = remap(f, [52, 70], [0, 1], EASE_OUT) * 72;

  const TICKERS = [
    { sym: 'BTC', val: '$67,420', chg: '+2.4%', up: true },
    { sym: 'ETH', val: '$3,518',  chg: '+1.8%', up: true },
    { sym: 'SOL', val: '$182',    chg: '−0.6%', up: false },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Faint candle chart */}
      <AbsoluteFill style={{
        transform: `scale(${camScale})`,
        transformOrigin: 'center center',
        filter: 'blur(14px)',
      }}>
        <CandleChart w={1080} h={1920} opacity={chartOpa} />
      </AbsoluteFill>

      {/* White vignette */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 75% 55% at 50% 50%, transparent 0%, ${C.bg} 76%)`,
      }} />

      {/* Hero text */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 96px',
        gap: 0,
      }}>
        <p style={{
          fontFamily: FONT, fontSize: 82, fontWeight: 200,
          color: C.black, letterSpacing: '-0.03em', lineHeight: 1.1,
          margin: 0, textAlign: 'center',
          opacity: line1O, transform: `translateY(${line1Y}px)`,
        }}>
          Most traders stare
        </p>
        <p style={{
          fontFamily: FONT, fontSize: 82, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.03em', lineHeight: 1.1,
          margin: '0 0 52px', textAlign: 'center',
          opacity: line2O, transform: `translateY(${line2Y}px)`,
        }}>
          at candles…
        </p>

        {/* Live ticker row */}
        <div style={{
          display: 'flex', gap: 16,
          opacity: tickerO, transform: `translateY(${tickerY}px)`,
        }}>
          {TICKERS.map(t => (
            <div key={t.sym} style={{
              background: C.bgSoft,
              border: `1px solid ${C.panelBorder}`,
              borderRadius: 14,
              padding: '14px 22px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              boxShadow: C.shadow,
              minWidth: 140,
            }}>
              <span style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 600,
                color: C.gray300, letterSpacing: '0.10em',
              }}>{t.sym}</span>
              <span style={{
                fontFamily: FONT, fontSize: 24, fontWeight: 600,
                color: C.black, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>{t.val}</span>
              <span style={{
                fontFamily: FONT, fontSize: 14, fontWeight: 500,
                color: t.up ? C.green : C.red,
                letterSpacing: '-0.01em',
              }}>{t.chg}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* Bottom wordmark */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end', paddingBottom: 108, gap: 14,
      }}>
        <div style={{
          width: lineW * 2, height: 1,
          background: C.gray500, opacity: labelO,
        }} />
        <span style={{
          fontFamily: FONT, fontSize: 18, fontWeight: 400,
          color: C.gray300, letterSpacing: '0.28em', opacity: labelO,
        }}>
          HERMES
        </span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
