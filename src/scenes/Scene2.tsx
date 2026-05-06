import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { GlowOrb } from '../components/GlowOrb';
import { sceneFade, EASE_OUT, remap, osc, springVal, SPRING } from '../utils/animations';

// ─── Data panel component ────────────────────────────────────────────────────
interface PanelRow { label: string; value: string; color?: string }
interface PanelProps {
  title: string;
  rows: PanelRow[];
  x: number;
  y: number;
  width?: number;
  startFrame: number;
  floatPhase?: number;
  fps: number;
  frame: number;
}

const DataPanel: React.FC<PanelProps> = ({
  title, rows, x, y, width = 420, startFrame, floatPhase = 0, fps, frame,
}) => {
  const sp = springVal(frame, startFrame, fps, 0, 1, SPRING.cinematic);
  const floatY = osc(frame, 6, 90, floatPhase);
  const alpha = interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y + (1 - sp) * 50 + floatY,
      width,
      opacity: alpha,
      background: C.panelBg,
      border: `1px solid ${C.panelBorder}`,
      borderRadius: 14,
      padding: '22px 26px 24px',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Panel header */}
      <div style={{
        fontFamily: FONT, fontSize: 18, fontWeight: 400,
        color: C.gray300, letterSpacing: '0.14em',
        textTransform: 'uppercase', marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `1px solid ${C.panelBorder}`,
      }}>
        {title}
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: i < rows.length - 1 ? 10 : 0,
        }}>
          <span style={{
            fontFamily: FONT, fontSize: 24, fontWeight: 300,
            color: C.gray300, letterSpacing: '-0.01em',
          }}>
            {row.label}
          </span>
          <span style={{
            fontFamily: FONT, fontSize: 26, fontWeight: 500,
            color: row.color ?? C.white, letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Scene 2 ─────────────────────────────────────────────────────────────────
// Sequence duration: 105 frames (local 0–105)
export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = sceneFade(f, 105, 15, 88, 17);

  // Panels staggered: 8, 18, 28, 38 frame starts
  const panels: PanelProps[] = [
    {
      title: 'MACRO ENV',
      rows: [
        { label: 'FED FUNDS', value: '5.25%', color: C.cyan },
        { label: 'DXY INDEX', value: '104.23' },
        { label: '10Y YIELD', value: '4.67%' },
      ],
      x: 72, y: 210, startFrame: 8, floatPhase: 0.0, width: 430, fps, frame: f,
    },
    {
      title: 'FUNDING RATES',
      rows: [
        { label: 'BTC', value: '+0.019%', color: C.green },
        { label: 'ETH', value: '+0.007%', color: C.green },
        { label: 'SOL', value: '+0.031%', color: C.green },
      ],
      x: 578, y: 290, startFrame: 18, floatPhase: 1.1, width: 430, fps, frame: f,
    },
    {
      title: 'CORRELATIONS',
      rows: [
        { label: 'BTC / ETH',  value: '0.87' },
        { label: 'BTC / GOLD', value: '0.42', color: C.blueLight },
        { label: 'BTC / DXY',  value: '−0.71', color: C.red },
      ],
      x: 55, y: 610, startFrame: 28, floatPhase: 2.4, width: 430, fps, frame: f,
    },
    {
      title: 'CALENDAR',
      rows: [
        { label: 'CPI DATA',      value: 'TODAY', color: C.cyan },
        { label: 'FOMC MIN.',     value: 'WED' },
        { label: 'NFP',           value: 'FRI' },
      ],
      x: 595, y: 690, startFrame: 38, floatPhase: 3.7, width: 430, fps, frame: f,
    },
  ];

  // Main text
  const txtO = remap(f, [50, 72], [0, 1], EASE_OUT);
  const txtY = remap(f, [50, 72], [30, 0], EASE_OUT);
  const divO = remap(f, [62, 80], [0, 1], EASE_OUT);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Ambient glow sources */}
      <GlowOrb x={200} y={500}  size={550} color={C.blue} opacity={0.07} blur={160} />
      <GlowOrb x={880} y={750}  size={480} color={C.cyan} opacity={0.06} blur={140} />
      <GlowOrb x={540} y={1300} size={600} color={C.blue} opacity={0.07} blur={200} />

      {/* Background dot grid */}
      <AbsoluteFill style={{ opacity: 0.06 }}>
        <svg width="1080" height="1920">
          <defs>
            <pattern id="dotgrid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <circle cx="24" cy="24" r="1" fill={C.gray300} />
            </pattern>
          </defs>
          <rect width="1080" height="1920" fill="url(#dotgrid)" />
        </svg>
      </AbsoluteFill>

      {/* Data panels */}
      <AbsoluteFill>
        {panels.map((p, i) => <DataPanel key={i} {...p} />)}
      </AbsoluteFill>

      {/* Divider line */}
      <div style={{
        position: 'absolute', left: 96, top: 1050,
        width: 888, height: 1,
        background: C.panelBorder,
        opacity: divO,
      }} />

      {/* Main text block */}
      <AbsoluteFill style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 96px 320px',
      }}>
        <div style={{
          opacity: txtO, transform: `translateY(${txtY}px)`,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: FONT, fontSize: 58, fontWeight: 200,
            color: C.white, letterSpacing: '-0.02em', lineHeight: 1.3,
            margin: 0,
          }}>
            But the market moves
          </p>
          <p style={{
            fontFamily: FONT, fontSize: 58, fontWeight: 200,
            color: C.gray300, letterSpacing: '-0.02em', lineHeight: 1.3,
            margin: 0,
          }}>
            because of <span style={{ color: C.blueLight, fontWeight: 300 }}>positioning</span>.
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
