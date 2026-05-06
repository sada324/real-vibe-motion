import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { GlowOrb } from '../components/GlowOrb';
import { sceneFade, remap, EASE_OUT, EASE_INOUT, springVal, SPRING } from '../utils/animations';

// ─── ETH price story arc (x: 0-1 time, y: 0-1 price) ───────────────────────
const PRICE_PTS: [number, number][] = [
  [0.00, 0.76], [0.06, 0.74], [0.13, 0.70], [0.20, 0.66],
  [0.27, 0.61], [0.34, 0.56], [0.41, 0.51], [0.47, 0.45],
  // liquidity sweep down
  [0.50, 0.35], [0.52, 0.22], [0.535, 0.14],
  // quick recovery
  [0.56, 0.34], [0.60, 0.48], [0.65, 0.55],
  // uptrend
  [0.72, 0.61], [0.80, 0.66], [0.88, 0.70], [1.00, 0.76],
];

// HTF trend line: bullish bias across the full chart
const HTF_LINE: [number, number][] = [[0.0, 0.45], [1.0, 0.62]];

// Key horizontal levels (y values)
const LEVELS = [
  { y: 0.76, label: 'RESISTANCE', col: C.gray300 },
  { y: 0.535, label: 'SUPPORT / SWEEP', col: C.cyan },
  { y: 0.14, label: 'WICK LOW', col: C.red },
];

// Catmull-Rom → SVG smooth path
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

// Approximate total path pixel length for dash animation
const PATH_LENGTH = 2600;

// ─── Annotation badge ────────────────────────────────────────────────────────
const Badge: React.FC<{
  x: number; y: number; label: string; color?: string;
  frame: number; startFrame: number; fps: number;
}> = ({ x, y, label, color = C.cyan, frame, startFrame, fps }) => {
  const sp = springVal(frame, startFrame, fps, 0, 1, SPRING.snappy);
  return (
    <g transform={`translate(${x}, ${y}) scale(${sp})`} style={{ transformOrigin: 'left center' }}>
      <rect x={0} y={-14} width={label.length * 10 + 20} height={26}
        rx={4} fill="none" stroke={color} strokeWidth={1} opacity={0.7} />
      <text x={10} y={0} fontFamily={FONT} fontSize={16} fontWeight={500}
        fill={color} letterSpacing="0.08em" dominantBaseline="middle">
        {label}
      </text>
    </g>
  );
};

// Entry zone shading: triangular region around the sweep
const EntryZone: React.FC<{ W: number; H: number; opacity: number }> = ({ W, H, opacity }) => {
  const x1 = 0.47 * W, x2 = 0.65 * W;
  const yTop = (1 - 0.56) * H, yBot = (1 - 0.10) * H;
  return (
    <rect x={x1} y={yTop} width={x2 - x1} height={yBot - yTop}
      fill={C.cyan} opacity={opacity * 0.07} rx={2} />
  );
};

// ─── Scene 4 ─────────────────────────────────────────────────────────────────
// Sequence duration: 135 frames (local 0–135)
export const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = sceneFade(f, 135, 15, 118, 17);

  // Chart card entrance
  const cardSp = springVal(f, 8, fps, 0, 1, SPRING.cinematic);
  const cardY  = (1 - cardSp) * 60;

  // Chart metrics (pixels within the card)
  const CW = 880, CH = 380;
  const PAD = { left: 56, right: 24, top: 24, bottom: 36 };
  const pw = CW - PAD.left - PAD.right;
  const ph = CH - PAD.top  - PAD.bottom;

  // Price line draw-in animation
  const drawProgress = remap(f, [20, 85], [0, 1], EASE_INOUT);
  const dashOffset = PATH_LENGTH * (1 - drawProgress);

  // HTF line entrance
  const htfOpa = remap(f, [35, 55], [0, 1], EASE_OUT);

  // Level lines entrance
  const levelOpa = remap(f, [45, 65], [0, 1], EASE_OUT);

  // Entry zone fill
  const zoneOpa = remap(f, [60, 80], [0, 1], EASE_OUT);

  // Annotations
  const ann = [
    { x: pw * 0.01,  y: ph * (1 - 0.76) - 24, label: 'HTF TREND ↑', color: C.blueLight, sf: 38, },
    { x: pw * 0.43,  y: ph * (1 - 0.46) + 16,  label: 'SWEEP',       color: C.cyan,      sf: 70, },
    { x: pw * 0.57,  y: ph * (1 - 0.56) - 22,  label: 'ENTRY',       color: C.green,     sf: 82, },
    { x: pw * 0.62,  y: ph * (1 - 0.62) - 22,  label: 'CONFIRM',     color: C.white,     sf: 92, },
  ];

  // X-axis tick labels
  const XTICKS = ['', '1D', '3D', '1W', '2W', ''];

  // Text block
  const t1O = remap(f, [90, 112], [0, 1], EASE_OUT);
  const t1Y = remap(f, [90, 112], [24, 0], EASE_OUT);
  const t2O = remap(f, [102, 124], [0, 1], EASE_OUT);
  const t2Y = remap(f, [102, 124], [24, 0], EASE_OUT);

  const htfPath = smoothPath(
    HTF_LINE.map(([x, y]) => [x, y] as [number, number]),
    pw, ph,
  );
  const pricePath = smoothPath(PRICE_PTS, pw, ph);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      <GlowOrb x={540} y={700}  size={700} color={C.blue} opacity={0.08} blur={200} />
      <GlowOrb x={160} y={1400} size={400} color={C.cyan} opacity={0.05} blur={140} />

      {/* Chart card */}
      <AbsoluteFill style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 160 + cardY,
      }}>
        <div style={{
          width: CW, opacity: cardSp,
          background: C.bgCard,
          border: `1px solid ${C.panelBorder}`,
          borderRadius: 18,
          padding: '28px 0 24px',
        }}>
          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px 20px',
            borderBottom: `1px solid ${C.panelBorder}`,
            marginBottom: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{
                fontFamily: FONT, fontSize: 28, fontWeight: 500,
                color: C.white, letterSpacing: '-0.01em',
              }}>ETH / USDT</span>
              <span style={{
                fontFamily: FONT, fontSize: 20, fontWeight: 300,
                color: C.gray300, letterSpacing: '0.06em',
              }}>MULTI-TF</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['1H', '4H', '1D'].map((tf, i) => (
                <span key={i} style={{
                  fontFamily: FONT, fontSize: 18, fontWeight: i === 2 ? 500 : 300,
                  color: i === 2 ? C.blueLight : C.gray300,
                  padding: '4px 12px',
                  border: i === 2 ? `1px solid ${C.blue}` : '1px solid transparent',
                  borderRadius: 6, letterSpacing: '0.04em',
                }}>
                  {tf}
                </span>
              ))}
            </div>
          </div>

          {/* SVG chart area */}
          <div style={{ padding: `0 0 0 ${PAD.left}px`, overflow: 'hidden' }}>
            <svg width={pw + PAD.right} height={CH} style={{ display: 'block', overflow: 'visible' }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C.blue} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={C.blue} stopOpacity="0.00" />
                </linearGradient>
                <clipPath id="chartClip">
                  <rect x={0} y={0} width={pw} height={ph + PAD.bottom} />
                </clipPath>
                <filter id="chartGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g transform={`translate(0, ${PAD.top})`} clipPath="url(#chartClip)">
                {/* Horizontal level lines */}
                {LEVELS.map((lv, i) => (
                  <g key={i} opacity={levelOpa}>
                    <line
                      x1={0} y1={ph * (1 - lv.y)}
                      x2={pw} y2={ph * (1 - lv.y)}
                      stroke={lv.col} strokeWidth={0.8}
                      strokeDasharray="6 6" opacity={0.45}
                    />
                    <text
                      x={pw + 6} y={ph * (1 - lv.y)}
                      fontFamily={FONT} fontSize={14} fontWeight={400}
                      fill={lv.col} opacity={0.7}
                      dominantBaseline="middle" textAnchor="start"
                    >
                      {lv.label}
                    </text>
                  </g>
                ))}

                {/* Entry zone highlight */}
                <EntryZone W={pw} H={ph} opacity={zoneOpa} />

                {/* HTF trend line */}
                <path d={htfPath} fill="none"
                  stroke={C.blueLight} strokeWidth={1.5}
                  strokeDasharray="8 5" opacity={htfOpa * 0.6}
                />

                {/* Area fill under price */}
                <path
                  d={pricePath + ` L ${pw} ${ph} L 0 ${ph} Z`}
                  fill="url(#priceGrad)"
                  opacity={drawProgress * 0.6}
                  clipPath="url(#chartClip)"
                />

                {/* Price line */}
                <path
                  d={pricePath}
                  fill="none"
                  stroke={C.blue} strokeWidth={2}
                  strokeDasharray={PATH_LENGTH}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  filter="url(#chartGlow)"
                />

                {/* Sweep wick emphasis */}
                {drawProgress > 0.75 && (
                  <line
                    x1={0.535 * pw} y1={ph * (1 - 0.535)}
                    x2={0.535 * pw} y2={ph * (1 - 0.14)}
                    stroke={C.cyan} strokeWidth={1.5} opacity={0.5}
                    strokeDasharray="3 3"
                  />
                )}

                {/* Annotations */}
                {ann.map((a, i) => (
                  <Badge key={i}
                    x={a.x} y={a.y + ph * (1 - 0.76) * 0}
                    label={a.label} color={a.color}
                    frame={f} startFrame={a.sf} fps={fps}
                  />
                ))}
              </g>

              {/* X-axis ticks */}
              {XTICKS.map((label, i) => (
                <text key={i}
                  x={(i / (XTICKS.length - 1)) * pw}
                  y={PAD.top + ph + 26}
                  fontFamily={FONT} fontSize={16} fontWeight={300}
                  fill={C.gray300} textAnchor="middle"
                  opacity={levelOpa * 0.7}
                >
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </AbsoluteFill>

      {/* Bottom text */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 96px 220px',
      }}>
        <p style={{
          fontFamily: FONT, fontSize: 58, fontWeight: 200,
          color: C.white, letterSpacing: '-0.02em', lineHeight: 1.3,
          margin: 0, textAlign: 'center',
          opacity: t1O, transform: `translateY(${t1Y}px)`,
        }}>
          Not every move matters.
        </p>
        <p style={{
          fontFamily: FONT, fontSize: 58, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.02em', lineHeight: 1.3,
          margin: 0, textAlign: 'center',
          opacity: t2O, transform: `translateY(${t2Y}px)`,
        }}>
          Only the <span style={{ color: C.blueLight }}>high probability</span> ones.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
