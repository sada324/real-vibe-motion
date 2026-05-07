import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, remap, EASE_OUT, EASE_INOUT, springVal, SPRING } from '../utils/animations';

// Price path: downtrend → structure break → uptrend
const PRICE_PTS: [number, number][] = [
  [0.00, 0.72], [0.05, 0.80],
  [0.13, 0.58], [0.20, 0.70],
  [0.28, 0.50], [0.35, 0.62],
  [0.40, 0.54],              // ← last lower high before break
  [0.46, 0.44],              // ← sweep low (MSB zone)
  [0.52, 0.68],              // ← impulse break above LH3 → MSB confirmed
  [0.60, 0.58], [0.68, 0.78],
  [0.76, 0.64], [0.84, 0.86],
  [0.91, 0.72], [1.00, 0.90],
];

// Labeled swing points
const SWINGS = [
  { x: 0.05, y: 0.80, label: 'LH',  type: 'bear', above: true  },
  { x: 0.13, y: 0.58, label: 'LL',  type: 'bear', above: false },
  { x: 0.20, y: 0.70, label: 'LH',  type: 'bear', above: true  },
  { x: 0.28, y: 0.50, label: 'LL',  type: 'bear', above: false },
  { x: 0.35, y: 0.62, label: 'LH',  type: 'bear', above: true  },
  { x: 0.46, y: 0.44, label: 'HL ✦', type: 'bull', above: false }, // first HL = bullish shift
  { x: 0.52, y: 0.68, label: 'HH',  type: 'bull', above: true  },
  { x: 0.60, y: 0.58, label: 'HL',  type: 'bull', above: false },
  { x: 0.68, y: 0.78, label: 'HH',  type: 'bull', above: true  },
  { x: 0.76, y: 0.64, label: 'HL',  type: 'bull', above: false },
  { x: 0.84, y: 0.86, label: 'HH',  type: 'bull', above: true  },
];

// Bearish trendline: connecting LH peaks
const BEAR_TL: [number, number][] = [[0.05, 0.80], [0.20, 0.70], [0.35, 0.62], [0.50, 0.54]];
// Bullish trendline: connecting HL troughs
const BULL_TL: [number, number][] = [[0.46, 0.44], [0.60, 0.58], [0.76, 0.64], [0.91, 0.72]];

function linePath(pts: [number, number][], W: number, H: number): string {
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x * W} ${(1 - y) * H}`).join(' ');
}

function smoothPath(pts: [number, number][], W: number, H: number): string {
  const s = pts.map(([x, y]) => [x * W, (1 - y) * H] as [number, number]);
  let d = `M ${s[0][0]} ${s[0][1]}`;
  for (let i = 1; i < s.length - 1; i++) {
    const mx = (s[i][0] + s[i + 1][0]) / 2, my = (s[i][1] + s[i + 1][1]) / 2;
    d += ` Q ${s[i][0]} ${s[i][1]}, ${mx} ${my}`;
  }
  d += ` L ${s[s.length-1][0]} ${s[s.length-1][1]}`;
  return d;
}

const PATH_LEN = 2800;

// Scene 3 — 150 frames = 5s  MARKET STRUCTURE chart
export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(f, 150, 15, 130, 20);

  // Chart dimensions (sits in the upper 62% of the 1080×1920 canvas)
  const CW = 1080, CH = 880, CY = 100;
  const PAD = { l: 64, r: 180, t: 40, b: 60 };
  const pw = CW - PAD.l - PAD.r;
  const ph = CH - PAD.t - PAD.b;

  const drawP  = remap(f, [10, 90], [0, 1], EASE_INOUT);
  const tlOpa  = remap(f, [55, 75], [0, 1], EASE_OUT);
  const msbOpa = remap(f, [68, 82], [0, 1], EASE_OUT);
  const msbX   = 0.49 * pw; // MSB vertical line x

  // Volume bar heights (arbitrary variation for visual texture)
  const VOLS = PRICE_PTS.map(([,y], i) => 0.3 + Math.abs(Math.sin(i * 1.7 + 0.3)) * 0.7);
  const VOL_H = 60; // height budget for volume area

  const pricePath = smoothPath(PRICE_PTS, pw, ph);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Card container */}
      <div style={{
        position: 'absolute', left: 0, top: CY, width: CW, height: CH,
        background: C.bg,
      }}>
        {/* Chart label */}
        <div style={{
          position: 'absolute', left: PAD.l, top: 0,
          display: 'flex', alignItems: 'center', gap: 12,
          opacity: remap(f, [8, 24], [0, 1], EASE_OUT),
        }}>
          <span style={{ fontSize: 22 }}>📐</span>
          <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.gray300, letterSpacing: '0.14em' }}>MARKET STRUCTURE  ·  BTC / USDT  ·  1D</span>
        </div>

        <svg width={CW} height={CH} style={{ display: 'block', overflow: 'visible', position: 'absolute', left: 0, top: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={C.accent} stopOpacity="0.08" />
              <stop offset="100%" stopColor={C.accent} stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={C.green}  stopOpacity="0.12" />
              <stop offset="100%" stopColor={C.green}  stopOpacity="0.00" />
            </linearGradient>
            <clipPath id="priceClip"><rect x={0} y={0} width={pw * drawP} height={ph + PAD.b} /></clipPath>
            <clipPath id="postMSB"><rect x={msbX} y={0} width={pw - msbX} height={ph + PAD.b} /></clipPath>
            <clipPath id="preMSB"><rect x={0} y={0} width={msbX} height={ph + PAD.b} /></clipPath>
          </defs>

          <g transform={`translate(${PAD.l}, ${PAD.t})`}>
            {/* Horizontal grid */}
            {[0.2, 0.4, 0.6, 0.8].map((y, i) => (
              <line key={i} x1={0} y1={ph * y} x2={pw} y2={ph * y}
                stroke={C.gray500} strokeWidth={0.5} opacity={0.7} />
            ))}

            {/* Bearish phase area (pre-MSB) */}
            <path
              d={pricePath + ` L ${Math.min(msbX, pw * drawP)} ${ph} L 0 ${ph} Z`}
              fill="url(#areaGrad)" clipPath="url(#preMSB)" opacity={drawP}
            />

            {/* Bullish phase area (post-MSB) */}
            <path
              d={pricePath + ` L ${pw} ${ph} L ${msbX} ${ph} Z`}
              fill="url(#greenArea)" clipPath="url(#postMSB)" opacity={drawP * msbOpa}
            />

            {/* Bearish trendline */}
            <path d={linePath(BEAR_TL, pw, ph)} fill="none"
              stroke={C.red} strokeWidth={1.2} strokeDasharray="8 6"
              opacity={tlOpa * 0.65} clipPath="url(#priceClip)" />

            {/* Bullish trendline */}
            <path d={linePath(BULL_TL, pw, ph)} fill="none"
              stroke={C.green} strokeWidth={1.2} strokeDasharray="8 6"
              opacity={tlOpa * msbOpa * 0.7} clipPath="url(#postMSB)" />

            {/* MSB vertical */}
            <line x1={msbX} y1={0} x2={msbX} y2={ph}
              stroke={C.accent} strokeWidth={1.5}
              strokeDasharray="5 5" opacity={msbOpa * 0.7} />

            {/* MSB label */}
            <g opacity={msbOpa} transform={`translate(${msbX + 8}, 8)`}>
              <rect x={0} y={0} width={82} height={26} rx={5}
                fill={C.accentDim} stroke={C.accent} strokeWidth={0.8} />
              <text x={41} y={13} textAnchor="middle"
                fontFamily={FONT} fontSize={12} fontWeight={700}
                fill={C.accent} letterSpacing="0.08em" dominantBaseline="middle">
                MSB ⚡
              </text>
            </g>

            {/* Price line — draws in */}
            <path d={pricePath} fill="none" stroke={C.black} strokeWidth={2.2}
              strokeDasharray={PATH_LEN} strokeDashoffset={PATH_LEN * (1 - drawP)}
              strokeLinecap="round" opacity={0.88} />

            {/* Swing point dots + labels — spring in staggered */}
            {SWINGS.map((sw, i) => {
              const sp = springVal(f, 20 + i * 5, fps, 0, 1, SPRING.snappy);
              const nx = sw.x * pw, ny = (1 - sw.y) * ph;
              const col = sw.type === 'bull' ? C.green : C.red;
              const labelY = sw.above ? ny - 28 : ny + 38;
              return (
                <g key={i} opacity={sp}>
                  {/* Ring */}
                  <circle cx={nx} cy={ny} r={8 * sp} fill="none" stroke={col} strokeWidth={1.5} opacity={0.4} />
                  {/* Core dot */}
                  <circle cx={nx} cy={ny} r={5 * sp} fill={col} opacity={0.9} />
                  {/* Label badge */}
                  <g transform={`translate(${nx}, ${labelY}) scale(${sp})`} style={{ transformOrigin: 'center' }}>
                    <rect x={-26} y={-13} width={52} height={24} rx={5}
                      fill={sw.type === 'bull' ? C.greenDim : C.redDim}
                      stroke={col} strokeWidth={0.8} />
                    <text x={0} y={0} textAnchor="middle"
                      fontFamily={FONT} fontSize={12} fontWeight={700}
                      fill={col} letterSpacing="0.06em" dominantBaseline="middle">
                      {sw.label}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Volume bars at the bottom */}
            {PRICE_PTS.map(([x, y], i) => {
              if (i >= PRICE_PTS.length - 1) return null;
              const bw = (pw / PRICE_PTS.length) * 0.55;
              const bx = x * pw;
              const bh = VOLS[i] * VOL_H;
              const isBull = i >= 7; // post-MSB
              return (
                <rect key={i} x={bx - bw / 2} y={ph + PAD.b - bh - 2} width={bw} height={bh}
                  fill={isBull ? C.green : C.red}
                  opacity={drawP * 0.30} rx={2} />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Bottom text — in lower 30% of canvas */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 80px 100px',
      }}>
        <p style={{
          fontFamily: FONT, fontSize: 54, fontWeight: 200,
          color: C.black, letterSpacing: '-0.025em', lineHeight: 1.25,
          margin: 0, textAlign: 'center',
          opacity: remap(f, [80, 102], [0, 1], EASE_OUT),
          transform: `translateY(${remap(f, [80, 102], [24, 0], EASE_OUT)}px)`,
        }}>
          Swing trading is understanding
        </p>
        <p style={{
          fontFamily: FONT, fontSize: 54, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.025em', lineHeight: 1.25,
          margin: 0, textAlign: 'center',
          opacity: remap(f, [94, 116], [0, 1], EASE_OUT),
          transform: `translateY(${remap(f, [94, 116], [24, 0], EASE_OUT)}px)`,
        }}>
          the <span style={{ color: C.accent, fontWeight: 500 }}>structure</span>…
          and reading the <span style={{ color: C.green, fontWeight: 500 }}>shift</span>.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
