import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, EASE_OUT, remap, osc, springVal, SPRING } from '../utils/animations';

interface PanelRow { label: string; value: string; color?: string; sub?: string }
interface PanelProps {
  title: string; icon: string;
  rows: PanelRow[];
  x: number; y: number; width?: number;
  startFrame: number; floatPhase?: number;
  fps: number; frame: number;
}

const DataPanel: React.FC<PanelProps> = ({
  title, icon, rows, x, y, width = 434, startFrame, floatPhase = 0, fps, frame,
}) => {
  const sp     = springVal(frame, startFrame, fps, 0, 1, SPRING.cinematic);
  const floatY = osc(frame, 3.5, 110, floatPhase);
  const alpha  = interpolate(frame, [startFrame, startFrame + 22], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y + (1 - sp) * 44 + floatY,
      width, opacity: alpha,
      background: C.bgCard,
      borderRadius: 20,
      padding: '22px 26px 26px',
      boxShadow: C.shadow,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 18, paddingBottom: 14,
        borderBottom: `1px solid ${C.panelBorder}`,
      }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{
          fontFamily: FONT, fontSize: 12, fontWeight: 600,
          color: C.gray300, letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>{title}</span>
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: i < rows.length - 1 ? 14 : 0,
        }}>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 21, fontWeight: 300, color: C.gray300 }}>
              {row.label}
            </div>
            {row.sub && (
              <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 400, color: C.gray500 }}>
                {row.sub}
              </div>
            )}
          </div>
          <span style={{
            fontFamily: FONT, fontSize: 24, fontWeight: 700,
            color: row.color ?? C.black, letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Scene 2 — 120 frames = 4s
export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(f, 120, 15, 102, 18);

  const panels: PanelProps[] = [
    {
      title: 'Macro Environment', icon: '🌐',
      rows: [
        { label: 'FED FUNDS', value: '5.25%',  color: C.teal,  sub: 'held steady' },
        { label: 'DXY INDEX', value: '104.23', color: C.black, sub: '↑ 0.3% today' },
        { label: '10Y YIELD', value: '4.67%',  color: C.black, sub: '↑ risk-off' },
      ],
      x: 72, y: 190, startFrame: 8, floatPhase: 0.0, width: 434, fps, frame: f,
    },
    {
      title: 'Funding Rates', icon: '📊',
      rows: [
        { label: 'BTC', value: '+0.019%', color: C.green, sub: 'longs paying' },
        { label: 'ETH', value: '+0.007%', color: C.green, sub: 'balanced' },
        { label: 'SOL', value: '+0.031%', color: C.green, sub: 'overheated' },
      ],
      x: 574, y: 270, startFrame: 18, floatPhase: 1.1, width: 434, fps, frame: f,
    },
    {
      title: 'Correlations', icon: '🔗',
      rows: [
        { label: 'BTC / ETH',  value: '0.87',  color: C.black, sub: 'strong' },
        { label: 'BTC / GOLD', value: '0.42',  color: C.teal,  sub: 'moderate' },
        { label: 'BTC / DXY',  value: '−0.71', color: C.red,   sub: 'inverse' },
      ],
      x: 55, y: 590, startFrame: 28, floatPhase: 2.4, width: 434, fps, frame: f,
    },
    {
      title: 'Economic Calendar', icon: '📅',
      rows: [
        { label: 'CPI DATA',  value: 'TODAY', color: C.teal,  sub: '8:30 AM EST' },
        { label: 'FOMC MIN.', value: 'WED',   color: C.black, sub: 'high impact' },
        { label: 'NFP',       value: 'FRI',   color: C.black, sub: 'major event' },
      ],
      x: 591, y: 668, startFrame: 38, floatPhase: 3.7, width: 434, fps, frame: f,
    },
  ];

  const txtO = remap(f, [62, 84], [0, 1], EASE_OUT);
  const txtY = remap(f, [62, 84], [28, 0], EASE_OUT);

  return (
    <AbsoluteFill style={{ background: C.bgSoft, overflow: 'hidden', opacity }}>
      <AbsoluteFill>
        {panels.map((p, i) => <DataPanel key={i} {...p} />)}
      </AbsoluteFill>

      <AbsoluteFill style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 96px 290px',
      }}>
        <div style={{ opacity: txtO, transform: `translateY(${txtY}px)`, textAlign: 'center' }}>
          <p style={{
            fontFamily: FONT, fontSize: 58, fontWeight: 200,
            color: C.black, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0,
          }}>
            But the market moves
          </p>
          <p style={{
            fontFamily: FONT, fontSize: 58, fontWeight: 200,
            color: C.gray300, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0,
          }}>
            because of{' '}
            <span style={{ color: C.teal, fontWeight: 400 }}>positioning</span>.
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
