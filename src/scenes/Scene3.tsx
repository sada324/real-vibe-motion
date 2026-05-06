import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { GlowOrb } from '../components/GlowOrb';
import { sceneFade, remap, osc, EASE_OUT, springVal, SPRING } from '../utils/animations';

// ─── Static node layout (0-1 range of 1080×1080 canvas area) ────────────────
interface Node { id: number; x: number; y: number; z: number; r: number; label: string }
const NODES: Node[] = [
  { id:  0, x: 0.14, y: 0.20, z: 0.4, r: 7,  label: '' },
  { id:  1, x: 0.42, y: 0.13, z: 0.8, r: 10, label: 'LONG OI' },
  { id:  2, x: 0.74, y: 0.22, z: 0.5, r: 8,  label: '' },
  { id:  3, x: 0.22, y: 0.42, z: 0.5, r: 6,  label: '' },
  { id:  4, x: 0.50, y: 0.38, z: 1.0, r: 15, label: 'LIQUIDITY POOL' },
  { id:  5, x: 0.80, y: 0.44, z: 0.6, r: 8,  label: '' },
  { id:  6, x: 0.09, y: 0.63, z: 0.3, r: 5,  label: '' },
  { id:  7, x: 0.36, y: 0.60, z: 0.7, r: 11, label: 'SELL PRESSURE' },
  { id:  8, x: 0.64, y: 0.58, z: 0.5, r: 7,  label: '' },
  { id:  9, x: 0.88, y: 0.68, z: 0.3, r: 5,  label: '' },
  { id: 10, x: 0.26, y: 0.80, z: 0.6, r: 9,  label: 'IMBALANCE' },
  { id: 11, x: 0.60, y: 0.78, z: 0.8, r: 12, label: 'SHORT CLUSTER' },
];

const EDGES: [number, number][] = [
  [1, 4], [2, 4], [0, 3], [3, 4], [4, 5],
  [4, 7], [4, 11], [6, 10], [7, 10], [7, 11],
  [8, 11], [9, 11], [8, 5],
];

// Catmull-Rom control points for a curved edge
function edgePath(a: Node, b: Node, W: number, H: number): string {
  const x1 = a.x * W, y1 = a.y * H;
  const x2 = b.x * W, y2 = b.y * H;
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.15;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.15;
  return `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
}

function nodeColor(z: number): string {
  if (z > 0.8) return C.blueLight;
  if (z > 0.5) return C.blue;
  return C.cyan;
}

// ─── Scene 3 ─────────────────────────────────────────────────────────────────
// Sequence duration: 105 frames (local 0–105)
export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = sceneFade(f, 105, 15, 88, 17);

  // Viz canvas dimensions within the 1080×1920 frame
  const VW = 1080, VH = 1000, VY = 180;

  // Slow rotation: -8° → +8°
  const rotY = remap(f, [0, 105], [-6, 6]);
  // Perspective tilt: constant slight downward view
  const rotX = 10;

  // Node entrance spring (staggered)
  const nodeEntry = (id: number) => springVal(f, id * 3 + 8, fps, 0, 1, SPRING.gentle);

  // Edge flow: animated dashOffset
  const flowOffset = (f * 1.8) % 40;

  // Text reveal
  const line1O = remap(f, [30, 52], [0, 1], EASE_OUT);
  const line1Y = remap(f, [30, 52], [25, 0], EASE_OUT);
  const line2O = remap(f, [44, 66], [0, 1], EASE_OUT);
  const line2Y = remap(f, [44, 66], [25, 0], EASE_OUT);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Deep glow sources */}
      <GlowOrb x={540} y={680}  size={800} color={C.blue} opacity={0.09} blur={220} />
      <GlowOrb x={200} y={400}  size={400} color={C.cyan} opacity={0.05} blur={130} />
      <GlowOrb x={880} y={900}  size={350} color={C.blue} opacity={0.05} blur={120} />

      {/* Perspective-transformed liquidity network */}
      <div style={{
        position: 'absolute', left: 0, top: VY, width: VW, height: VH,
        perspective: 900,
      }}>
        <div style={{
          width: '100%', height: '100%',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
        }}>
          <svg width={VW} height={VH} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              {/* Glow filter for nodes */}
              <filter id="nodeGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Subtle edge glow */}
              <filter id="edgeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Grid pattern */}
              <pattern id="grid3" x="0" y="0" width="72" height="72" patternUnits="userSpaceOnUse">
                <path d="M72 0 L0 0 0 72" fill="none" stroke={C.gray500} strokeWidth="0.5" opacity="0.6" />
              </pattern>
            </defs>

            {/* Perspective grid */}
            <rect width={VW} height={VH} fill="url(#grid3)" opacity={0.18} />

            {/* Edges */}
            {EDGES.map(([ai, bi], i) => {
              const a = NODES[ai], b = NODES[bi];
              const path = edgePath(a, b, VW, VH);
              const zAvg = (a.z + b.z) / 2;
              return (
                <g key={i} filter="url(#edgeGlow)">
                  {/* Base edge */}
                  <path d={path} fill="none"
                    stroke={C.blue} strokeWidth={0.8}
                    opacity={0.15 + zAvg * 0.15}
                  />
                  {/* Flowing highlight */}
                  <path d={path} fill="none"
                    stroke={C.cyan} strokeWidth={1.5}
                    strokeDasharray="12 28"
                    strokeDashoffset={-flowOffset + i * 7}
                    opacity={0.5 + zAvg * 0.25}
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => {
              const nx = node.x * VW;
              const ny = node.y * VH;
              const sp = nodeEntry(node.id);
              const r = node.r * (0.6 + node.z * 0.4) * sp;
              const col = nodeColor(node.z);
              const opa = 0.5 + node.z * 0.5;
              const floatY = osc(f, 3, 70, node.id * 0.8);

              return (
                <g key={node.id}
                  transform={`translate(${nx}, ${ny + floatY})`}
                  opacity={opa * sp}
                  filter="url(#nodeGlow)"
                >
                  {/* Outer ring */}
                  <circle cx={0} cy={0} r={r * 2.2}
                    fill="none" stroke={col} strokeWidth={0.6} opacity={0.25} />
                  {/* Core dot */}
                  <circle cx={0} cy={0} r={r}
                    fill={col} opacity={0.9} />

                  {/* Label */}
                  {node.label && (
                    <text
                      x={0} y={-r - 10}
                      textAnchor="middle"
                      fontFamily={FONT} fontSize={18} fontWeight={400}
                      fill={C.gray100} opacity={0.75}
                      letterSpacing="0.06em"
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

      {/* Bottom text */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 96px 200px',
      }}>
        <p style={{
          fontFamily: FONT, fontSize: 54, fontWeight: 200,
          color: C.white, letterSpacing: '-0.02em', lineHeight: 1.3,
          margin: 0, textAlign: 'center',
          opacity: line1O, transform: `translateY(${line1Y}px)`,
        }}>
          Swing trading is understanding
        </p>
        <p style={{
          fontFamily: FONT, fontSize: 54, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.02em', lineHeight: 1.3,
          margin: 0, textAlign: 'center',
          opacity: line2O, transform: `translateY(${line2Y}px)`,
        }}>
          the <span style={{ color: C.blueLight }}>macro</span>…
          and executing the <span style={{ color: C.cyan }}>micro</span>.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
