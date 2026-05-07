import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, EASE_OUT, remap, osc, springVal, SPRING } from '../utils/animations';

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
  const floatY = osc(frame, 5, 100, floatPhase);
  const alpha = interpolate(frame, [startFrame, startFrame + 22], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y + (1 - sp) * 44 + floatY,
      width,
      opacity: alpha,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: 16,
      padding: '22px 26px 24px',
    }}>
      {/* Header */}
      <div style={{
        fontFamily: FONT, fontSize: 13, fontWeight: 500,
        color: C.gray300, letterSpacing: '0.16em',
        textTransform: 'uppercase', marginBottom: 18,
        paddingBottom: 14,
        borderBottom: `1px solid rgba(255,255,255,0.07)`,
      }}>
        {title}
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: i < rows.length - 1 ? 12 : 0,
        }}>
          <span style={{
            fontFamily: FONT, fontSize: 22, fontWeight: 300,
            color: C.gray300, letterSpacing: '-0.01em',
          }}>
            {row.label}
          </span>
          <span style={{
            fontFamily: FONT, fontSize: 24, fontWeight: 500,
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

export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = sceneFade(f, 105, 15, 88, 17);

  const panels: PanelProps[] = [
    {
      title: 'Macro Environment',
      rows: [
        { label: 'FED FUNDS', value: '5.25%', color: C.teal },
        { label: 'DXY INDEX', value: '104.23', color: C.white },
        { label: '10Y YIELD', value: '4.67%', color: C.white },
      ],
      x: 72, y: 210, startFrame: 8, floatPhase: 0.0, width: 434, fps, frame: f,
    },
    {
      title: 'Funding Rates',
      rows: [
        { label: 'BTC', value: '+0.019%', color: C.green },
        { label: 'ETH', value: '+0.007%', color: C.green },
        { label: 'SOL', value: '+0.031%', color: C.green },
      ],
      x: 574, y: 290, startFrame: 18, floatPhase: 1.1, width: 434, fps, frame: f,
    },
    {
      title: 'Correlations',
      rows: [
        { label: 'BTC / ETH',  value: '0.87',   color: C.white },
        { label: 'BTC / GOLD', value: '0.42',   color: C.teal },
        { label: 'BTC / DXY',  value: '−0.71',  color: C.red },
      ],
      x: 55, y: 610, startFrame: 28, floatPhase: 2.4, width: 434, fps, frame: f,
    },
    {
      title: 'Economic Calendar',
      rows: [
        { label: 'CPI DATA',  value: 'TODAY',  color: C.teal },
        { label: 'FOMC MIN.', value: 'WED',    color: C.white },
        { label: 'NFP',       value: 'FRI',    color: C.white },
      ],
      x: 591, y: 690, startFrame: 38, floatPhase: 3.7, width: 434, fps, frame: f,
    },
  ];

  const txtO = remap(f, [50, 72], [0, 1], EASE_OUT);
  const txtY = remap(f, [50, 72], [28, 0], EASE_OUT);
  const divO = remap(f, [62, 80], [0, 1], EASE_OUT);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden', opacity }}>
      {/* Dot grid — very subtle */}
      <AbsoluteFill style={{ opacity: 0.04 }}>
        <svg width="1080" height="1920">
          <defs>
            <pattern id="dotgrid" x="0" y="0" width="54" height="54" patternUnits="userSpaceOnUse">
              <circle cx="27" cy="27" r="1" fill={C.white} />
            </pattern>
          </defs>
          <rect width="1080" height="1920" fill="url(#dotgrid)" />
        </svg>
      </AbsoluteFill>

      {/* Subtle teal glow — top left */}
      <div style={{
        position: 'absolute', left: -80, top: 300,
        width: 420, height: 420, borderRadius: '50%',
        background: C.teal, opacity: 0.04, filter: 'blur(120px)',
      }} />

      {/* Data panels */}
      <AbsoluteFill>
        {panels.map((p, i) => <DataPanel key={i} {...p} />)}
      </AbsoluteFill>

      {/* Hairline divider */}
      <div style={{
        position: 'absolute', left: 96, top: 1060,
        width: 888, height: 1,
        background: 'rgba(255,255,255,0.08)',
        opacity: divO,
      }} />

      {/* Bottom text */}
      <AbsoluteFill style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 96px 300px',
      }}>
        <div style={{ opacity: txtO, transform: `translateY(${txtY}px)`, textAlign: 'center' }}>
          <p style={{
            fontFamily: FONT, fontSize: 60, fontWeight: 200,
            color: C.white, letterSpacing: '-0.025em', lineHeight: 1.25,
            margin: 0,
          }}>
            But the market moves
          </p>
          <p style={{
            fontFamily: FONT, fontSize: 60, fontWeight: 200,
            color: C.gray300, letterSpacing: '-0.025em', lineHeight: 1.25,
            margin: 0,
          }}>
            because of{' '}
            <span style={{ color: C.teal, fontWeight: 300 }}>positioning</span>.
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
