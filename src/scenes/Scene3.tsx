import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, remap, osc, EASE_OUT, springVal, SPRING } from '../utils/animations';

interface Node { id: number; x: number; y: number; z: number; r: number; label: string; type: 'buy' | 'sell' | 'neutral' }

const NODES: Node[] = [
  { id:  0, x: 0.14, y: 0.20, z: 0.4, r: 6,  label: '',              type: 'neutral' },
  { id:  1, x: 0.42, y: 0.13, z: 0.8, r: 10, label: 'LONG OI',       type: 'buy'     },
  { id:  2, x: 0.74, y: 0.22, z: 0.5, r: 7,  label: '',              type: 'neutral' },
  { id:  3, x: 0.22, y: 0.42, z: 0.5, r: 6,  label: '',              type: 'neutral' },
  { id:  4, x: 0.50, y: 0.38, z: 1.0, r: 15, label: 'LIQUIDITY',     type: 'buy'     },
  { id:  5, x: 0.80, y: 0.44, z: 0.6, r: 7,  label: '',              type: 'neutral' },
  { id:  6, x: 0.09, y: 0.63, z: 0.3, r: 5,  label: '',              type: 'neutral' },
  { id:  7, x: 0.36, y: 0.60, z: 0.7, r: 11, label: 'SELL PRESSURE', type: 'sell'    },
  { id:  8, x: 0.64, y: 0.58, z: 0.5, r: 7,  label: '',              type: 'neutral' },
  { id:  9, x: 0.88, y: 0.68, z: 0.3, r: 5,  label: '',              type: 'neutral' },
  { id: 10, x: 0.26, y: 0.80, z: 0.6, r: 8,  label: 'IMBALANCE',    type: 'sell'    },
  { id: 11, x: 0.60, y: 0.78, z: 0.8, r: 12, label: 'SHORT CLUSTER', type: 'sell'    },
];

const EDGES: [number, number][] = [
  [1, 4], [2, 4], [0, 3], [3, 4], [4, 5],
  [4, 7], [4, 11], [6, 10], [7, 10], [7, 11],
  [8, 11], [9, 11], [8, 5],
];

function edgePath(a: Node, b: Node, W: number, H: number): string {
  const x1 = a.x * W, y1 = a.y * H;
  const x2 = b.x * W, y2 = b.y * H;
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.15;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.15;
  return `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
}

function nodeColor(node: Node): string {
  if (node.type === 'buy')  return C.green;
  if (node.type === 'sell') return C.red;
  return C.teal;
}

// Scene 3 — 120 frames = 4s
export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(f, 120, 15, 102, 18);

  const VW = 1080, VH = 1000, VY = 168;
  // Wider rotation sweep over the extra time
  const rotY = remap(f, [0, 120], [-7, 7]);
  const rotX = 7;

  const nodeEntry  = (id: number) => springVal(f, id * 3 + 8, fps, 0, 1, SPRING.gentle);
  const flowOffset = (f * 1.5) % 40;

  const line1O = remap(f, [30, 52], [0, 1], EASE_OUT);
  const line1Y = remap(f, [30, 52], [24, 0], EASE_OUT);
  const line2O = remap(f, [44, 66], [0, 1], EASE_OUT);
  const line2Y = remap(f, [44, 66], [24, 0], EASE_OUT);

  // Legend that appears later
  const legendO = remap(f, [70, 88], [0, 1], EASE_OUT);
  const legendY = remap(f, [70, 88], [12, 0], EASE_OUT);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Network */}
      <div style={{
        position: 'absolute', left: 0, top: VY, width: VW, height: VH,
        perspective: 1000,
      }}>
        <div style={{
          width: '100%', height: '100%',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
        }}>
          <svg width={VW} height={VH} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <filter id="nodeGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id="grid3" x="0" y="0" width="72" height="72" patternUnits="userSpaceOnUse">
                <path d="M72 0 L0 0 0 72" fill="none" stroke={C.gray500} strokeWidth="0.5" />
              </pattern>
            </defs>

            <rect width={VW} height={VH} fill="url(#grid3)" opacity={0.6} />

            {EDGES.map(([ai, bi], i) => {
              const a = NODES[ai], b = NODES[bi];
              const path = edgePath(a, b, VW, VH);
              return (
                <g key={i}>
                  <path d={path} fill="none" stroke={C.gray500} strokeWidth={1} opacity={0.7} />
                  <path d={path} fill="none"
                    stroke={C.teal} strokeWidth={1.4}
                    strokeDasharray="10 30"
                    strokeDashoffset={-flowOffset + i * 7}
                    opacity={0.50}
                  />
                </g>
              );
            })}

            {NODES.map((node) => {
              const nx = node.x * VW;
              const ny = node.y * VH;
              const sp = nodeEntry(node.id);
              const r  = node.r * (0.6 + node.z * 0.4) * sp;
              const col = nodeColor(node);
              const floatY = osc(f, 3, 72, node.id * 0.8);

              return (
                <g key={node.id}
                  transform={`translate(${nx}, ${ny + floatY})`}
                  opacity={(0.55 + node.z * 0.45) * sp}
                  filter="url(#nodeGlow)"
                >
                  <circle cx={0} cy={0} r={r * 2.4} fill={col} opacity={0.10} />
                  <circle cx={0} cy={0} r={r} fill={col} opacity={0.90} />
                  {node.label && (
                    <text
                      x={0} y={-r - 12}
                      textAnchor="middle"
                      fontFamily={FONT} fontSize={15} fontWeight={600}
                      fill={col} opacity={0.90}
                      letterSpacing="0.08em"
                    >
                      {node.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend pills */}
      <div style={{
        position: 'absolute', top: VY + VH - 20, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 18,
        opacity: legendO, transform: `translateY(${legendY}px)`,
      }}>
        {[
          { col: C.green, label: 'Buy Flow' },
          { col: C.red,   label: 'Sell Pressure' },
          { col: C.teal,  label: 'Liquidity' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: item.col }} />
            <span style={{
              fontFamily: FONT, fontSize: 14, fontWeight: 500,
              color: C.gray300, letterSpacing: '0.06em',
            }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom text */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 96px 210px',
      }}>
        <p style={{
          fontFamily: FONT, fontSize: 56, fontWeight: 200,
          color: C.black, letterSpacing: '-0.025em', lineHeight: 1.25,
          margin: 0, textAlign: 'center',
          opacity: line1O, transform: `translateY(${line1Y}px)`,
        }}>
          Swing trading is understanding
        </p>
        <p style={{
          fontFamily: FONT, fontSize: 56, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.025em', lineHeight: 1.25,
          margin: 0, textAlign: 'center',
          opacity: line2O, transform: `translateY(${line2Y}px)`,
        }}>
          the <span style={{ color: C.teal, fontWeight: 400 }}>macro</span>…
          and executing the <span style={{ color: C.green, fontWeight: 400 }}>micro</span>.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
