import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, EASE_OUT, remap, osc, springVal, SPRING } from '../utils/animations';

interface PanelRow { label: string; value: string; color?: string; sub?: string }
interface PanelProps {
  title: string; emoji: string;
  rows: PanelRow[];
  x: number; y: number; width?: number;
  startFrame: number; floatPhase?: number;
  fps: number; frame: number;
}

const DataPanel: React.FC<PanelProps> = ({
  title, emoji, rows, x, y, width = 434, startFrame, floatPhase = 0, fps, frame,
}) => {
  const sp     = springVal(frame, startFrame, fps, 0, 1, SPRING.cinematic);
  const floatY = osc(frame, 3.5, 110, floatPhase);
  const alpha  = interpolate(frame, [startFrame, startFrame + 22], [0, 1], { extrapolateLeft:'clamp', extrapolateRight:'clamp' });
  // Animated emoji
  const es = 1 + osc(frame, 0.10, 26, floatPhase);
  const er = osc(frame, 8, 88, floatPhase + 0.5);

  return (
    <div style={{
      position: 'absolute', left: x, top: y + (1 - sp) * 44 + floatY,
      width, opacity: alpha, background: C.bgCard, borderRadius: 20,
      padding: '20px 24px 22px', boxShadow: C.shadow,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.panelBorder}`,
      }}>
        <span style={{
          fontSize: 22, display: 'inline-block',
          transform: `scale(${es}) rotate(${er}deg)`,
          transformOrigin: '50% 50%',
        }}>{emoji}</span>
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.gray300, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{title}</span>
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < rows.length - 1 ? 12 : 0 }}>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 300, color: C.gray300 }}>{row.label}</div>
            {row.sub && <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 400, color: C.gray500, marginTop: 1 }}>{row.sub}</div>}
          </div>
          <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: row.color ?? C.black, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
};

// Scene 2 — 150 frames = 5s
export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(f, 150, 15, 130, 20);

  // 2×2 panel grid — all kept in upper 58% of canvas (y: 160–880)
  const panels: PanelProps[] = [
    {
      title: 'Macro Environment', emoji: '🌐',
      rows: [
        { label: 'FED FUNDS', value: '5.25%',  color: C.accent, sub: 'held steady' },
        { label: 'DXY INDEX', value: '104.23', color: C.black,  sub: '↑ 0.3% today' },
        { label: '10Y YIELD', value: '4.67%',  color: C.black,  sub: '↑ risk-off signal' },
      ],
      x: 60, y: 160, startFrame: 8, floatPhase: 0.0, width: 450, fps, frame: f,
    },
    {
      title: 'Funding Rates', emoji: '💰',
      rows: [
        { label: 'BTC', value: '+0.019%', color: C.green, sub: 'longs paying' },
        { label: 'ETH', value: '+0.007%', color: C.green, sub: 'balanced market' },
        { label: 'SOL', value: '+0.031%', color: C.green, sub: 'slightly elevated' },
      ],
      x: 570, y: 248, startFrame: 18, floatPhase: 1.1, width: 450, fps, frame: f,
    },
    {
      title: 'Correlations', emoji: '🔗',
      rows: [
        { label: 'BTC / ETH',  value: '0.87',  color: C.black,  sub: 'very strong' },
        { label: 'BTC / GOLD', value: '0.42',  color: C.accent, sub: 'moderate hedge' },
        { label: 'BTC / DXY',  value: '−0.71', color: C.red,    sub: 'inverse flow' },
      ],
      x: 60, y: 570, startFrame: 28, floatPhase: 2.4, width: 450, fps, frame: f,
    },
    {
      title: 'Economic Calendar', emoji: '📅',
      rows: [
        { label: 'CPI DATA',  value: 'TODAY', color: C.accent, sub: '8:30 AM EST — high impact' },
        { label: 'FOMC MIN.', value: 'WED',   color: C.black,  sub: 'Fed minutes release' },
        { label: 'NFP',       value: 'FRI',   color: C.black,  sub: 'non-farm payrolls' },
      ],
      x: 570, y: 648, startFrame: 38, floatPhase: 3.7, width: 450, fps, frame: f,
    },
  ];

  // Text is pinned to the very bottom — clear of all panels
  const txtO = remap(f, [70, 92], [0, 1], EASE_OUT);
  const txtY = remap(f, [70, 92], [28, 0], EASE_OUT);

  return (
    <AbsoluteFill style={{ background: C.bgSoft, overflow: 'hidden', opacity }}>
      <AbsoluteFill>
        {panels.map((p, i) => <DataPanel key={i} {...p} />)}
      </AbsoluteFill>

      {/* Text is at paddingBottom: 60px — bottom 8% of canvas, zero overlap with panels */}
      <AbsoluteFill style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 80px 72px' }}>
        <div style={{ opacity: txtO, transform: `translateY(${txtY}px)`, textAlign: 'center' }}>
          <p style={{ fontFamily: FONT, fontSize: 54, fontWeight: 200, color: C.black, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0 }}>
            But the market moves
          </p>
          <p style={{ fontFamily: FONT, fontSize: 54, fontWeight: 200, color: C.gray300, letterSpacing: '-0.025em', lineHeight: 1.22, margin: 0 }}>
            because of{' '}<span style={{ color: C.accent, fontWeight: 500 }}>positioning</span>.
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
