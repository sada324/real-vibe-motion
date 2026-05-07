import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from '../utils/colors';
import { sceneFade, remap, EASE_OUT, springVal, SPRING } from '../utils/animations';

function countUp(frame: number, start: number, end: number, target: number): number {
  const p = interpolate(frame, [start, end], [0, 1], { extrapolateLeft:'clamp', extrapolateRight:'clamp', easing: EASE_OUT });
  return Math.round(p * target);
}

interface TradeCard { handle: string; flag: string; asset: string; type: 'LONG' | 'SHORT'; pnl: string; pct: string; duration: string; startFrame: number }

const TRADE_CARDS: TradeCard[] = [
  { handle: '@jake_trades', flag: '🇺🇸', asset: 'BTC / USDT', type: 'LONG',  pnl: '+$4,190', pct: '+61.4%', duration: '3 days', startFrame: 22 },
  { handle: '@sara_swing',  flag: '🇬🇧', asset: 'ETH / USDT', type: 'LONG',  pnl: '+$2,847', pct: '+34.2%', duration: '5 days', startFrame: 36 },
  { handle: '@mark_crypto', flag: '🇦🇺', asset: 'SOL / USDT', type: 'SHORT', pnl: '+$1,260', pct: '+28.8%', duration: '2 days', startFrame: 50 },
];

const TradeResultCard: React.FC<{ card: TradeCard; frame: number; fps: number }> = ({ card, frame, fps }) => {
  const sp = springVal(frame, card.startFrame, fps, 0, 1, SPRING.cinematic);
  const alpha = interpolate(frame, [card.startFrame, card.startFrame + 18], [0, 1], { extrapolateLeft:'clamp', extrapolateRight:'clamp' });
  const isLong = card.type === 'LONG';
  return (
    <div style={{
      background: C.bgCard, borderRadius: 20, padding: '20px 22px',
      boxShadow: C.shadow, opacity: alpha,
      transform: `translateY(${(1 - sp) * 28}px)`,
      display: 'flex', flexDirection: 'column', gap: 10, flex: '1 1 0', minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 16 }}>{card.flag}</span>
            <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.gray300, letterSpacing: '0.04em' }}>{card.handle}</span>
          </div>
          <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: C.black, letterSpacing: '-0.01em' }}>{card.asset}</span>
        </div>
        <div style={{ background: isLong ? C.greenDim : C.redDim, border: `1px solid ${isLong ? C.green : C.red}`, borderRadius: 8, padding: '4px 10px' }}>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: isLong ? C.green : C.red, letterSpacing: '0.06em' }}>{card.type}</span>
        </div>
      </div>
      <div style={{ height: 1, background: C.panelBorder }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.gray300, letterSpacing: '0.10em', marginBottom: 3 }}>FIRST TRADE</div>
          <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: C.green, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{card.pnl}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.gray300, letterSpacing: '0.10em', marginBottom: 3 }}>RETURN</div>
          <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: C.green, letterSpacing: '-0.02em' }}>{card.pct}</div>
        </div>
      </div>
      <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 400, color: C.gray300 }}>⏱ Held {card.duration}</div>
    </div>
  );
};

// Scene 5 — 120 frames = 4s
export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(f, 120, 15, 100, 20);

  const count   = countUp(f, 10, 65, 150);
  const countO  = remap(f, [8, 24], [0, 1], EASE_OUT);
  const headO   = remap(f, [14, 34], [0, 1], EASE_OUT);
  const headY   = remap(f, [14, 34], [24, 0], EASE_OUT);
  const cardsO  = remap(f, [22, 42], [0, 1], EASE_OUT);
  const statsO  = remap(f, [55, 75], [0, 1], EASE_OUT);
  const statsY  = remap(f, [55, 75], [14, 0], EASE_OUT);

  const STATS = [
    { value: '89%',   label: 'Profitable\nMonth 1', emoji: '🏆' },
    { value: '$2.8k', label: 'Avg First\nTrade PnL', emoji: '💵' },
    { value: '2.4d',  label: 'Avg Hold\nDuration', emoji: '⚡' },
  ];

  return (
    <AbsoluteFill style={{ background: C.bgSoft, overflow: 'hidden', opacity }}>
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 140, paddingLeft: 56, paddingRight: 56 }}>
        {/* Counter + fire */}
        <div style={{ opacity: countO, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: FONT, fontSize: 112, fontWeight: 900, color: C.black,
            letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
          }}>{count}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{
              fontFamily: FONT, fontSize: 60, fontWeight: 300, color: C.green, letterSpacing: '-0.03em',
            }}>+</span>
            <span style={{ fontSize: 38 }}>🔥</span>
          </div>
        </div>

        <p style={{ fontFamily: FONT, fontSize: 36, fontWeight: 200, color: C.black, letterSpacing: '-0.02em', lineHeight: 1.25, margin: 0, textAlign: 'center', opacity: headO, transform: `translateY(${headY}px)` }}>
          traders became <span style={{ color: C.green, fontWeight: 600 }}>profitable</span>
        </p>
        <p style={{ fontFamily: FONT, fontSize: 36, fontWeight: 200, color: C.gray300, letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 36px', textAlign: 'center', opacity: headO, transform: `translateY(${headY}px)` }}>
          from their very first trade 🎯
        </p>

        {/* Trade cards */}
        <div style={{ display: 'flex', gap: 12, width: '100%', opacity: cardsO }}>
          {TRADE_CARDS.map(card => <TradeResultCard key={card.handle} card={card} frame={f} fps={fps} />)}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', width: '100%', marginTop: 20, background: C.bgCard, borderRadius: 18, boxShadow: C.shadow, overflow: 'hidden', opacity: statsO, transform: `translateY(${statsY}px)` }}>
          {STATS.map((stat, i) => {
            return (
              <div key={stat.label} style={{ flex: 1, textAlign: 'center', padding: '18px 12px', borderRight: i < STATS.length - 1 ? `1px solid ${C.panelBorder}` : 'none' }}>
                <span style={{ fontSize: 24, marginBottom: 6, display: 'block' }}>{stat.emoji}</span>
                <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: C.accent, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{stat.value}</div>
                <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.gray300, letterSpacing: '0.08em', marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.4 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
