import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, remap, EASE_OUT, EASE_INOUT, springVal, SPRING } from '../utils/animations';

const PRICE_PTS: [number, number][] = [
  [0.00, 0.76], [0.06, 0.74], [0.13, 0.70], [0.20, 0.66],
  [0.27, 0.61], [0.34, 0.56], [0.41, 0.51], [0.47, 0.45],
  [0.50, 0.35], [0.52, 0.22], [0.535, 0.14],
  [0.56, 0.34], [0.60, 0.48], [0.65, 0.55],
  [0.72, 0.61], [0.80, 0.66], [0.88, 0.70], [1.00, 0.76],
];

const HTF_LINE: [number, number][] = [[0.0, 0.45], [1.0, 0.62]];

const LEVELS = [
  { y: 0.76,  label: 'RESISTANCE  $3,720', col: C.gray300 },
  { y: 0.535, label: 'SWEEP  $3,180',      col: C.teal    },
  { y: 0.14,  label: 'WICK LOW  $2,840',   col: C.red     },
];

function smoothPath(pts: [number, number][], W: number, H: number): string {
  const s = pts.map(([x, y]) => [x * W, (1 - y) * H] as [number, number]);
  if (s.length < 2) return '';
  let d = `M ${s[0][0]} ${s[0][1]}`;
  for (let i = 1; i < s.length - 1; i++) {
    const mx = (s[i][0] + s[i + 1][0]) / 2;
    const my = (s[i][1] + s[i + 1][1]) / 2;
    d += ` Q ${s[i][0]} ${s[i][1]}, ${mx} ${my}`;
  }
  d += ` L ${s[s.length - 1][0]} ${s[s.length - 1][1]}`;
  return d;
}

const PATH_LENGTH = 2600;

const Badge: React.FC<{
  x: number; y: number; label: string; color?: string;
  frame: number; startFrame: number; fps: number;
}> = ({ x, y, label, color = C.teal, frame, startFrame, fps }) => {
  const sp = springVal(frame, startFrame, fps, 0, 1, SPRING.snappy);
  const bg = color === C.green ? C.greenDim
           : color === C.red   ? C.redDim
           : C.tealDim;
  return (
    <g transform={`translate(${x}, ${y}) scale(${sp})`} style={{ transformOrigin: 'left center' }}>
      <rect x={0} y={-14} width={label.length * 9 + 20} height={26}
        rx={5} fill={bg} stroke={color} strokeWidth={0.8} opacity={0.9} />
      <text x={10} y={0} fontFamily={FONT} fontSize={13} fontWeight={600}
        fill={color} letterSpacing="0.08em" dominantBaseline="middle">
        {label}
      </text>
    </g>
  );
};

// Scene 4 — 135 frames = 4.5s (unchanged duration)
export const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(f, 135, 15, 117, 18);

  const cardSp = springVal(f, 8, fps, 0, 1, SPRING.cinematic);
  const cardY  = (1 - cardSp) * 60;

  const CW = 880, CH = 380;
  const PAD = { left: 56, right: 24, top: 24, bottom: 36 };
  const pw = CW - PAD.left - PAD.right;
  const ph = CH - PAD.top  - PAD.bottom;

  const drawProgress = remap(f, [20, 88], [0, 1], EASE_INOUT);
  const dashOffset   = PATH_LENGTH * (1 - drawProgress);
  const htfOpa       = remap(f, [35, 55], [0, 1], EASE_OUT);
  const levelOpa     = remap(f, [45, 65], [0, 1], EASE_OUT);
  const zoneOpa      = remap(f, [60, 80], [0, 1], EASE_OUT);

  const ann = [
    { x: pw * 0.01,  y: ph * (1 - 0.80), label: 'HTF TREND ↑', color: C.gray300, sf: 38 },
    { x: pw * 0.43,  y: ph * (1 - 0.44), label: 'SWEEP',        color: C.teal,    sf: 70 },
    { x: pw * 0.57,  y: ph * (1 - 0.58), label: 'ENTRY',        color: C.green,   sf: 82 },
    { x: pw * 0.62,  y: ph * (1 - 0.64), label: 'CONFIRM',      color: C.green,   sf: 92 },
  ];

  // Trade result card (appears after annotations)
  const tradeCardSp = springVal(f, 100, fps, 0, 1, SPRING.snappy);
  const tradeCardO  = remap(f, [100, 116], [0, 1], EASE_OUT);

  const XTICKS = ['', '1D', '3D', '1W', '2W', ''];
  const t1O = remap(f, [90, 112], [0, 1], EASE_OUT);
  const t1Y = remap(f, [90, 112], [24, 0], EASE_OUT);
  const t2O = remap(f, [102, 124], [0, 1], EASE_OUT);
  const t2Y = remap(f, [102, 124], [24, 0], EASE_OUT);

  const htfPath   = smoothPath(HTF_LINE, pw, ph);
  const pricePath = smoothPath(PRICE_PTS, pw, ph);
  const postSweepPts = PRICE_PTS.filter(([x]) => x >= 0.535);
  const greenPath = smoothPath(postSweepPts, pw, ph);
  const x0 = 0.535 * pw;

  return (
    <AbsoluteFill style={{ background: C.bgSoft, overflow: 'hidden', opacity }}>
      {/* Chart card */}
      <AbsoluteFill style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 148 + cardY,
      }}>
        <div style={{
          width: CW, opacity: cardSp,
          background: C.bgCard, borderRadius: 22,
          padding: '28px 0 24px', boxShadow: C.shadow,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px 20px',
            borderBottom: `1px solid ${C.panelBorder}`, marginBottom: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{
                fontFamily: FONT, fontSize: 26, fontWeight: 700,
                color: C.black, letterSpacing: '-0.02em',
              }}>ETH / USDT</span>
              <span style={{
                fontFamily: FONT, fontSize: 17, fontWeight: 300,
                color: C.gray300, letterSpacing: '0.04em',
              }}>MULTI-TF</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['1H', '4H', '1D'].map((tf, i) => (
                <span key={i} style={{
                  fontFamily: FONT, fontSize: 15, fontWeight: i === 2 ? 700 : 400,
                  color: i === 2 ? C.teal : C.gray300,
                  padding: '4px 12px',
                  background: i === 2 ? C.tealDim : 'transparent',
                  border: i === 2 ? `1px solid rgba(90,200,250,0.30)` : '1px solid transparent',
                  borderRadius: 7, letterSpacing: '0.04em',
                }}>{tf}</span>
              ))}
            </div>
          </div>

          {/* SVG chart */}
          <div style={{ padding: `0 0 0 ${PAD.left}px`, overflow: 'hidden' }}>
            <svg width={pw + PAD.right} height={CH} style={{ display: 'block', overflow: 'visible' }}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C.green} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={C.green} stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C.red} stopOpacity="0.00" />
                  <stop offset="100%" stopColor={C.red} stopOpacity="0.08" />
                </linearGradient>
                <clipPath id="chartClip"><rect x={0} y={0} width={pw} height={ph + PAD.bottom} /></clipPath>
                <clipPath id="postSweepClip"><rect x={x0} y={0} width={pw - x0} height={ph + PAD.bottom} /></clipPath>
                <clipPath id="preSweepClip"><rect x={0} y={0} width={x0} height={ph + PAD.bottom} /></clipPath>
              </defs>

              <g transform={`translate(0, ${PAD.top})`} clipPath="url(#chartClip)">
                {[0.25, 0.5, 0.75].map((y, i) => (
                  <line key={i} x1={0} y1={ph * y} x2={pw} y2={ph * y}
                    stroke={C.gray500} strokeWidth={0.6} opacity={0.8} />
                ))}

                {LEVELS.map((lv, i) => (
                  <g key={i} opacity={levelOpa}>
                    <line x1={0} y1={ph * (1 - lv.y)} x2={pw} y2={ph * (1 - lv.y)}
                      stroke={lv.col} strokeWidth={0.8} strokeDasharray="5 6" opacity={0.65} />
                    <text x={pw + 6} y={ph * (1 - lv.y)}
                      fontFamily={FONT} fontSize={12} fontWeight={500}
                      fill={lv.col} opacity={0.85}
                      dominantBaseline="middle" textAnchor="start">
                      {lv.label}
                    </text>
                  </g>
                ))}

                {/* Green recovery fill */}
                <path d={greenPath + ` L ${pw} ${ph} L ${x0} ${ph} Z`}
                  fill="url(#greenGrad)"
                  opacity={zoneOpa * drawProgress}
                  clipPath="url(#postSweepClip)" />

                {/* Red sell-off tint */}
                <path d={pricePath + ` L ${x0} ${ph} L 0 ${ph} Z`}
                  fill="url(#redGrad)"
                  opacity={drawProgress * 0.5}
                  clipPath="url(#preSweepClip)" />

                {zoneOpa > 0.1 && (
                  <line x1={x0} y1={0} x2={x0} y2={ph}
                    stroke={C.teal} strokeWidth={1}
                    strokeDasharray="4 6" opacity={zoneOpa * 0.55} />
                )}

                <path d={htfPath} fill="none"
                  stroke={C.gray300} strokeWidth={1.2}
                  strokeDasharray="7 5" opacity={htfOpa * 0.7} />

                <path d={pricePath} fill="none"
                  stroke={C.black} strokeWidth={2}
                  strokeDasharray={PATH_LENGTH}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round" opacity={0.85} />

                {drawProgress > 0.72 && (
                  <line
                    x1={0.535 * pw} y1={ph * (1 - 0.535)}
                    x2={0.535 * pw} y2={ph * (1 - 0.14)}
                    stroke={C.red} strokeWidth={1.5} opacity={0.65}
                    strokeDasharray="3 4" />
                )}

                {ann.map((a, i) => (
                  <Badge key={i} x={a.x} y={a.y}
                    label={a.label} color={a.color}
                    frame={f} startFrame={a.sf} fps={fps} />
                ))}
              </g>

              {XTICKS.map((label, i) => (
                <text key={i}
                  x={(i / (XTICKS.length - 1)) * pw}
                  y={PAD.top + ph + 26}
                  fontFamily={FONT} fontSize={13} fontWeight={400}
                  fill={C.gray300} textAnchor="middle" opacity={levelOpa * 0.8}>
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </AbsoluteFill>

      {/* Trade result pill — springs in after annotations */}
      <AbsoluteFill style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 570,
      }}>
        <div style={{
          opacity: tradeCardO,
          transform: `scale(${0.7 + tradeCardSp * 0.3})`,
          display: 'flex', gap: 16,
        }}>
          {[
            { label: 'Entry',  value: '$2,840', color: C.teal  },
            { label: 'Target', value: '$3,720', color: C.green },
            { label: 'Stop',   value: '$2,640', color: C.red   },
            { label: 'R:R',    value: '4.4×',   color: C.black },
          ].map(item => (
            <div key={item.label} style={{
              background: C.bgCard, borderRadius: 14,
              padding: '14px 20px', textAlign: 'center',
              boxShadow: C.shadow,
              border: `1px solid ${C.panelBorder}`,
            }}>
              <div style={{
                fontFamily: FONT, fontSize: 11, fontWeight: 600,
                color: C.gray300, letterSpacing: '0.12em',
                marginBottom: 6,
              }}>{item.label.toUpperCase()}</div>
              <div style={{
                fontFamily: FONT, fontSize: 24, fontWeight: 700,
                color: item.color, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>{item.value}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* Bottom text */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 96px 230px',
      }}>
        <p style={{
          fontFamily: FONT, fontSize: 56, fontWeight: 200,
          color: C.black, letterSpacing: '-0.025em', lineHeight: 1.25,
          margin: 0, textAlign: 'center',
          opacity: t1O, transform: `translateY(${t1Y}px)`,
        }}>
          Not every move matters.
        </p>
        <p style={{
          fontFamily: FONT, fontSize: 56, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.025em', lineHeight: 1.25,
          margin: 0, textAlign: 'center',
          opacity: t2O, transform: `translateY(${t2Y}px)`,
        }}>
          Only the{' '}
          <span style={{ color: C.green, fontWeight: 400 }}>high probability</span> ones.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
