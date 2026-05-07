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
            <line x1={x} y1={hy} x2={x} y2={ly} stroke={col} strokeWidth={1.2} opacity={0.5} />
            <rect x={x - cw / 2} y={bodyT} width={cw} height={bodyH}
              fill={col} opacity={0.75} rx={1.5} />
          </g>
        );
      })}
    </svg>
  );
};

export const Scene1: React.FC = () => {
  const f = useCurrentFrame();

  const opacity  = sceneFade(f, 90, 15, 72, 18);
  const camScale = remap(f, [0, 90], [1.0, 1.06]);
  const chartOpa = remap(f, [0, 25], [0, 1]) * 0.13;

  const line1Y = remap(f, [18, 42], [32, 0], EASE_OUT);
  const line1O = remap(f, [18, 42], [0, 1],  EASE_OUT);
  const line2Y = remap(f, [32, 56], [32, 0], EASE_OUT);
  const line2O = remap(f, [32, 56], [0, 1],  EASE_OUT);
  const labelO = remap(f, [50, 68], [0, 1],  EASE_OUT);
  const lineW  = remap(f, [50, 68], [0, 1],  EASE_OUT) * 72;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Faint candle chart background */}
      <AbsoluteFill style={{
        transform: `scale(${camScale})`,
        transformOrigin: 'center center',
        filter: 'blur(12px)',
      }}>
        <CandleChart w={1080} h={1920} opacity={chartOpa} />
      </AbsoluteFill>

      {/* White vignette to fade edges */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 75% 55% at 50% 50%, transparent 0%, ${C.bg} 78%)`,
      }} />

      {/* Hero text */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 96px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: FONT, fontSize: 82, fontWeight: 200,
            color: C.black, letterSpacing: '-0.03em', lineHeight: 1.1,
            margin: 0,
            opacity: line1O, transform: `translateY(${line1Y}px)`,
          }}>
            Most traders stare
          </p>
          <p style={{
            fontFamily: FONT, fontSize: 82, fontWeight: 200,
            color: C.gray300, letterSpacing: '-0.03em', lineHeight: 1.1,
            margin: 0,
            opacity: line2O, transform: `translateY(${line2Y}px)`,
          }}>
            at candles…
          </p>
        </div>
      </AbsoluteFill>

      {/* Bottom wordmark */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end', paddingBottom: 112, gap: 14,
      }}>
        <div style={{
          width: lineW * 2, height: 1,
          background: C.gray500,
          opacity: labelO,
        }} />
        <span style={{
          fontFamily: FONT, fontSize: 18, fontWeight: 400,
          color: C.gray300, letterSpacing: '0.28em',
          opacity: labelO,
        }}>
          HERMES
        </span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
