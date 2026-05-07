import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, remap, EASE_OUT, EASE_INOUT, springVal, SPRING } from '../utils/animations';

// Price path: slight rise → dip to E2 → dip to E3 → recovery → exit profit
// x: 0–1 (time), y: 0–1 (price, 1=top)
const PRICE_PTS: [number, number][] = [
  [0.00, 0.64],
  [0.10, 0.68],
  [0.20, 0.58], // entry 1 zone ($3,400)
  [0.30, 0.50],
  [0.38, 0.44], // entry 2 zone ($3,040)
  [0.44, 0.40],
  [0.50, 0.36], // entry 3 zone ($2,840)
  [0.58, 0.42],
  [0.66, 0.54],
  [0.74, 0.63], // crosses avg entry
  [0.82, 0.72],
  [0.90, 0.78], // exit zone
  [1.00, 0.82],
];

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

const ENTRIES = [
  { frame: 20, pct: 15, price: '$3,400', alloc: '$1,500',  avgPrice: '$3,400', label: 'Entry 1' },
  { frame: 52, pct: 25, price: '$3,040', alloc: '$2,500',  avgPrice: '$3,180', label: '+ Add' },
  { frame: 82, pct: 35, price: '$2,840', alloc: '$3,500',  avgPrice: '$3,070', label: '+ Add' },
];

// Scene 3 — 150 frames = 5s  PORTFOLIO ALLOCATION + TRADE JOURNEY
export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(f, 150, 15, 130, 20);

  // Chart area: upper 52% of canvas
  const CW = 1080, CH = 700, CY = 80;
  const PAD = { l: 60, r: 60, t: 32, b: 48 };
  const pw = CW - PAD.l - PAD.r;
  const ph = CH - PAD.t - PAD.b;

  // Draw price line 0→1 over frames 8→100
  const drawP = remap(f, [8, 100], [0, 1], EASE_INOUT);

  const pricePath = smoothPath(PRICE_PTS, pw, ph);

  // Which entries are visible
  const e0vis = f >= ENTRIES[0].frame;
  const e1vis = f >= ENTRIES[1].frame;
  const e2vis = f >= ENTRIES[2].frame;

  // Allocation bar: animated pct
  const allocPct = e2vis
    ? remap(f, [ENTRIES[2].frame, ENTRIES[2].frame + 18], [25, 35], EASE_OUT)
    : e1vis
    ? remap(f, [ENTRIES[1].frame, ENTRIES[1].frame + 18], [15, 25], EASE_OUT)
    : e0vis
    ? remap(f, [ENTRIES[0].frame, ENTRIES[0].frame + 18], [0, 15], EASE_OUT)
    : 0;

  // Average price indicator Y position on chart
  const avgY = e2vis
    ? remap(f, [ENTRIES[2].frame, ENTRIES[2].frame + 20], [
        (1 - 0.44) * ph, // entry 2 avg
        (1 - 0.41) * ph, // entry 3 avg
      ], EASE_OUT)
    : e1vis
    ? remap(f, [ENTRIES[1].frame, ENTRIES[1].frame + 20], [
        (1 - 0.64) * ph, // entry 1 price
        (1 - 0.52) * ph, // entry 2 avg
      ], EASE_OUT)
    : e0vis
    ? (1 - 0.64) * ph
    : (1 - 0.64) * ph;

  // Exit card appears at frame 110
  const exitO = remap(f, [110, 126], [0, 1], EASE_OUT);
  const exitY = remap(f, [110, 126], [20, 0], EASE_OUT);

  // Bottom text
  const txt1O = remap(f, [92, 110], [0, 1], EASE_OUT);
  const txt2O = remap(f, [106, 124], [0, 1], EASE_OUT);

  // Entry price X positions on chart
  const entryXs = [0.20, 0.38, 0.50].map(x => PAD.l + x * pw);
  const entryYs = [0.58, 0.44, 0.36].map(y => PAD.t + (1 - y) * ph);

  // Green fill area (post-avg-cross recovery) clip from ~74% x
  const recoveryX = PAD.l + 0.74 * pw;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>

      {/* ── Portfolio header card ── */}
      <div style={{
        position: 'absolute', left: 60, top: 52, right: 60,
        background: C.bgSoft, borderRadius: 20,
        padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        opacity: remap(f, [4, 18], [0, 1], EASE_OUT),
        boxShadow: C.shadow,
      }}>
        <div>
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.gray300, letterSpacing: '0.14em', marginBottom: 4 }}>PORTFOLIO BALANCE</div>
          <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 800, color: C.black, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>$10,000</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.gray300, letterSpacing: '0.14em', marginBottom: 4 }}>ACTIVE IN TRADE</div>
          <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 800, color: C.accent, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(allocPct)}%
          </div>
        </div>
      </div>

      {/* ── Allocation bar ── */}
      <div style={{
        position: 'absolute', left: 60, top: 168, right: 60,
        opacity: remap(f, [14, 28], [0, 1], EASE_OUT),
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.accent, letterSpacing: '0.10em' }}>DEPLOYED</span>
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.gray300, letterSpacing: '0.10em' }}>SIDELINES</span>
        </div>
        <div style={{ height: 14, borderRadius: 7, background: C.gray500, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${allocPct}%`,
            background: `linear-gradient(90deg, ${C.accent}, #34AADC)`,
            borderRadius: 7, transition: 'none',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.accent, fontVariantNumeric: 'tabular-nums' }}>
            ${Math.round(allocPct * 100)} of $10,000
          </span>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.gray300, fontVariantNumeric: 'tabular-nums' }}>
            ${(10000 - Math.round(allocPct * 100)).toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Price chart ── */}
      <div style={{ position: 'absolute', left: 0, top: CY + 170, width: CW, height: CH }}>
        <svg width={CW} height={CH} style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.red} stopOpacity="0.9" />
              <stop offset="58%" stopColor={C.red} stopOpacity="0.9" />
              <stop offset="74%" stopColor={C.green} stopOpacity="0.9" />
              <stop offset="100%" stopColor={C.green} stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="recoveryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.green} stopOpacity="0.10" />
              <stop offset="100%" stopColor={C.green} stopOpacity="0.00" />
            </linearGradient>
            <clipPath id="drawClip">
              <rect x={PAD.l} y={0} width={pw * drawP} height={CH} />
            </clipPath>
            <clipPath id="recoveryClip">
              <rect x={recoveryX} y={0} width={CW} height={CH} />
            </clipPath>
          </defs>

          <g>
            {/* Horizontal grid */}
            {[0.25, 0.50, 0.75].map((y, i) => (
              <line key={i}
                x1={PAD.l} y1={PAD.t + y * ph}
                x2={PAD.l + pw} y2={PAD.t + y * ph}
                stroke={C.gray500} strokeWidth={0.5} opacity={0.6} />
            ))}

            {/* Recovery fill */}
            <path
              d={smoothPath(PRICE_PTS.filter(([x]) => x >= 0.74), pw, ph).replace(
                `M ${(0.74) * pw}`,
                `M ${PAD.l + 0.74 * pw}`,
              )}
              fill="none" stroke="none"
              clipPath="url(#recoveryClip)"
            />
            <path
              d={`M ${recoveryX} ${PAD.t + (1-0.63)*ph} ` +
                [0.74, 0.82, 0.90, 1.00].map(x => {
                  const pt = PRICE_PTS.find(p => p[0] === x) || [x, 0.7] as [number,number];
                  return `L ${PAD.l + x * pw} ${PAD.t + (1 - pt[1]) * ph}`;
                }).join(' ') +
                ` L ${PAD.l + pw} ${PAD.t + ph} L ${recoveryX} ${PAD.t + ph} Z`}
              fill="url(#recoveryFill)"
              opacity={drawP}
            />

            {/* Price line */}
            <g transform={`translate(${PAD.l}, ${PAD.t})`}>
              <path
                d={pricePath}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                strokeLinecap="round"
                clipPath="url(#drawClip)"
                style={{ transform: `translateX(-${PAD.l}px)` }}
              />
            </g>

            {/* Avg entry dashed line */}
            {e0vis && (
              <line
                x1={PAD.l} y1={PAD.t + avgY}
                x2={PAD.l + pw * Math.min(drawP, 1)} y2={PAD.t + avgY}
                stroke={C.accent} strokeWidth={1.2}
                strokeDasharray="6 5" opacity={0.7}
              />
            )}
            {e0vis && (
              <g opacity={remap(f, [ENTRIES[0].frame, ENTRIES[0].frame + 12], [0, 1], EASE_OUT)}>
                <rect
                  x={PAD.l + pw - 108} y={PAD.t + avgY - 14}
                  width={104} height={24} rx={5}
                  fill={C.accentDim} stroke={C.accent} strokeWidth={0.8}
                />
                <text
                  x={PAD.l + pw - 56} y={PAD.t + avgY + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily={FONT} fontSize={11} fontWeight={700}
                  fill={C.accent} letterSpacing="0.06em"
                >
                  AVG ENTRY
                </text>
              </g>
            )}

            {/* Entry dots */}
            {ENTRIES.map((entry, i) => {
              if (f < entry.frame) return null;
              const sp = springVal(f, entry.frame, fps, 0, 1, SPRING.snappy);
              const dotX = entryXs[i];
              const dotY = PAD.t + entryYs[i];
              return (
                <g key={i} opacity={sp}>
                  <circle cx={dotX} cy={dotY} r={10 * sp} fill="none" stroke={C.accent} strokeWidth={1.5} opacity={0.4} />
                  <circle cx={dotX} cy={dotY} r={5 * sp} fill={C.accent} />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ── Entry stack cards ── */}
      <div style={{
        position: 'absolute', left: 60, top: 560, right: 60,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {ENTRIES.map((entry, i) => {
          if (f < entry.frame) return null;
          const sp = springVal(f, entry.frame, fps, 0, 1, SPRING.cinematic);
          const alpha = remap(f, [entry.frame, entry.frame + 14], [0, 1], EASE_OUT);
          return (
            <div key={i} style={{
              opacity: alpha,
              transform: `translateY(${(1 - sp) * 20}px)`,
              background: C.bgSoft,
              borderRadius: 14,
              padding: '12px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: `1px solid ${C.panelBorder}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  background: C.accentDim, borderRadius: 8,
                  padding: '4px 10px',
                  fontFamily: FONT, fontSize: 11, fontWeight: 700,
                  color: C.accent, letterSpacing: '0.08em',
                }}>{entry.label}</div>
                <div>
                  <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.black, fontVariantNumeric: 'tabular-nums' }}>{entry.price}</div>
                  <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 400, color: C.gray300 }}>ETH / USDT</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.accent, fontVariantNumeric: 'tabular-nums' }}>{entry.pct}% of port.</div>
                <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 400, color: C.gray300 }}>Avg → {entry.avgPrice}</div>
              </div>
            </div>
          );
        })}

        {/* Exit result card */}
        {f >= 110 && (
          <div style={{
            opacity: exitO,
            transform: `translateY(${exitY}px)`,
            background: C.greenDim,
            borderRadius: 14,
            padding: '14px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: `1px solid ${C.green}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                background: C.green, borderRadius: 8,
                padding: '4px 10px',
                fontFamily: FONT, fontSize: 11, fontWeight: 700,
                color: '#fff', letterSpacing: '0.08em',
              }}>EXIT ✓</div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.black }}>$3,620 target hit</div>
                <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 400, color: C.gray300 }}>Closed full position</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: C.green, fontVariantNumeric: 'tabular-nums' }}>+$1,932</div>
              <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.green }}>+19.3%</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom text ── */}
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '0 80px 88px' }}>
        <p style={{
          fontFamily: FONT, fontSize: 48, fontWeight: 200,
          color: C.black, letterSpacing: '-0.025em', lineHeight: 1.25,
          margin: 0, textAlign: 'center',
          opacity: txt1O, transform: `translateY(${remap(f, [92, 110], [22, 0], EASE_OUT)}px)`,
        }}>
          Position sizing is how you
        </p>
        <p style={{
          fontFamily: FONT, fontSize: 48, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.025em', lineHeight: 1.25,
          margin: 0, textAlign: 'center',
          opacity: txt2O, transform: `translateY(${remap(f, [106, 124], [22, 0], EASE_OUT)}px)`,
        }}>
          survive — and <span style={{ color: C.green, fontWeight: 500 }}>thrive</span>.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
