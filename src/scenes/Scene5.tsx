import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, remap, EASE_OUT, springVal, SPRING } from '../utils/animations';

// Animates integer from 0 → target using easing
function countUp(frame: number, start: number, end: number, target: number): number {
  const p = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });
  return Math.round(p * target);
}

interface TradeCard {
  handle: string; asset: string; type: 'LONG' | 'SHORT';
  pnl: string; pct: string; duration: string;
  startFrame: number;
}

const TRADE_CARDS: TradeCard[] = [
  {
    handle: '@jake_trades',
    asset: 'BTC / USDT',
    type: 'LONG',
    pnl: '+$4,190',
    pct: '+61.4%',
    duration: '3 days',
    startFrame: 18,
  },
  {
    handle: '@sara_swing',
    asset: 'ETH / USDT',
    type: 'LONG',
    pnl: '+$2,847',
    pct: '+34.2%',
    duration: '5 days',
    startFrame: 30,
  },
  {
    handle: '@mark_crypto',
    asset: 'SOL / USDT',
    type: 'SHORT',
    pnl: '+$1,260',
    pct: '+28.8%',
    duration: '2 days',
    startFrame: 42,
  },
];

const TradeResultCard: React.FC<{ card: TradeCard; frame: number; fps: number }> = ({ card, frame, fps }) => {
  const sp = springVal(frame, card.startFrame, fps, 0, 1, SPRING.cinematic);
  const alpha = interpolate(frame, [card.startFrame, card.startFrame + 20], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const isLong = card.type === 'LONG';

  return (
    <div style={{
      background: C.bgCard,
      borderRadius: 20,
      padding: '22px 26px',
      boxShadow: C.shadow,
      opacity: alpha,
      transform: `translateY(${(1 - sp) * 32}px)`,
      display: 'flex', flexDirection: 'column', gap: 12,
      flex: '1 1 0',
      minWidth: 0,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 600,
            color: C.gray300, letterSpacing: '0.04em', marginBottom: 2,
          }}>{card.handle}</div>
          <div style={{
            fontFamily: FONT, fontSize: 18, fontWeight: 600,
            color: C.black, letterSpacing: '-0.01em',
          }}>{card.asset}</div>
        </div>
        <div style={{
          background: isLong ? C.greenDim : C.redDim,
          border: `1px solid ${isLong ? C.green : C.red}`,
          borderRadius: 8, padding: '5px 12px',
        }}>
          <span style={{
            fontFamily: FONT, fontSize: 13, fontWeight: 700,
            color: isLong ? C.green : C.red,
            letterSpacing: '0.06em',
          }}>{card.type}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: C.panelBorder }} />

      {/* PnL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{
            fontFamily: FONT, fontSize: 12, fontWeight: 500,
            color: C.gray300, letterSpacing: '0.1em', marginBottom: 4,
          }}>FIRST TRADE PNL</div>
          <div style={{
            fontFamily: FONT, fontSize: 32, fontWeight: 700,
            color: C.green, letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>{card.pnl}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: FONT, fontSize: 12, fontWeight: 500,
            color: C.gray300, letterSpacing: '0.1em', marginBottom: 4,
          }}>RETURN</div>
          <div style={{
            fontFamily: FONT, fontSize: 28, fontWeight: 700,
            color: C.green, letterSpacing: '-0.02em',
          }}>{card.pct}</div>
        </div>
      </div>

      {/* Duration */}
      <div style={{
        fontFamily: FONT, fontSize: 13, fontWeight: 400,
        color: C.gray300, display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <span style={{ opacity: 0.5 }}>⏱</span> Held {card.duration}
      </div>
    </div>
  );
};

// Scene 5 — 90 frames = 3s  (NEW: social proof)
export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(f, 90, 15, 72, 18);

  // Big counter — counts 0 → 150 over frames 10→60
  const count = countUp(f, 10, 60, 150);

  // Headline text
  const headO = remap(f, [10, 30], [0, 1], EASE_OUT);
  const headY = remap(f, [10, 30], [24, 0], EASE_OUT);

  // Sub-text
  const subO  = remap(f, [20, 40], [0, 1], EASE_OUT);
  const subY  = remap(f, [20, 40], [16, 0], EASE_OUT);

  // Counter
  const countO = remap(f, [8, 22], [0, 1], EASE_OUT);

  // Cards
  const cardsO = remap(f, [18, 36], [0, 1], EASE_OUT);

  // Bottom stats row
  const statsO = remap(f, [50, 68], [0, 1], EASE_OUT);
  const statsY = remap(f, [50, 68], [14, 0], EASE_OUT);

  const BOTTOM_STATS = [
    { value: '89%',    label: 'Profitable\nFirst Month' },
    { value: '$2.8k',  label: 'Avg First\nTrade PnL'   },
    { value: '2.4d',   label: 'Avg Hold\nDuration'      },
  ];

  return (
    <AbsoluteFill style={{ background: C.bgSoft, overflow: 'hidden', opacity }}>
      {/* Top section — counter + headline */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 148, paddingLeft: 64, paddingRight: 64,
      }}>
        {/* Counter */}
        <div style={{ opacity: countO, marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{
            fontFamily: FONT, fontSize: 120, fontWeight: 800,
            color: C.black, letterSpacing: '-0.05em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{count}</span>
          <span style={{
            fontFamily: FONT, fontSize: 72, fontWeight: 300,
            color: C.green, letterSpacing: '-0.03em',
          }}>+</span>
        </div>

        {/* Headline */}
        <p style={{
          fontFamily: FONT, fontSize: 38, fontWeight: 200,
          color: C.black, letterSpacing: '-0.02em', lineHeight: 1.25,
          margin: 0, textAlign: 'center',
          opacity: headO, transform: `translateY(${headY}px)`,
        }}>
          traders became{' '}
          <span style={{ color: C.green, fontWeight: 500 }}>profitable</span>
        </p>
        <p style={{
          fontFamily: FONT, fontSize: 38, fontWeight: 200,
          color: C.gray300, letterSpacing: '-0.02em', lineHeight: 1.25,
          margin: '0 0 40px', textAlign: 'center',
          opacity: headO, transform: `translateY(${headY}px)`,
        }}>
          from their very first trade
        </p>

        {/* Trade cards */}
        <div style={{
          display: 'flex', gap: 14, width: '100%',
          opacity: cardsO,
        }}>
          {TRADE_CARDS.map(card => (
            <TradeResultCard key={card.handle} card={card} frame={f} fps={fps} />
          ))}
        </div>

        {/* Bottom stats */}
        <div style={{
          display: 'flex', width: '100%', marginTop: 24,
          background: C.bgCard, borderRadius: 18,
          boxShadow: C.shadow, overflow: 'hidden',
          opacity: statsO, transform: `translateY(${statsY}px)`,
        }}>
          {BOTTOM_STATS.map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1, textAlign: 'center',
              padding: '20px 16px',
              borderRight: i < BOTTOM_STATS.length - 1 ? `1px solid ${C.panelBorder}` : 'none',
            }}>
              <div style={{
                fontFamily: FONT, fontSize: 32, fontWeight: 700,
                color: C.teal, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>{stat.value}</div>
              <div style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 500,
                color: C.gray300, letterSpacing: '0.08em',
                marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.4,
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
