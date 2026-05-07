import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from 'remotion';

// ── helpers ────────────────────────────────────────────────────────────────────

const SPRING = Easing.bezier(0.16, 1, 0.3, 1);
const EASE   = Easing.bezier(0.4, 0, 0.2, 1);

function ipl(
  frame: number,
  inOut: [number, number],
  fromTo: [number, number],
  easing: (t: number) => number = SPRING,
) {
  return interpolate(frame, inOut, fromTo, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

function typeAt(text: string, frame: number, start: number, speed = 1.8): string {
  return text.slice(0, Math.max(0, Math.floor((frame - start) * speed)));
}

function isDone(text: string, frame: number, start: number, speed = 1.8): boolean {
  return Math.floor((frame - start) * speed) >= text.length;
}

// ── Timing (30 fps) ────────────────────────────────────────────────────────────

const B_IN     = 18;
const D_IN     = 50;
const T_IN     = 80;
const HOLD_END = 195;
const CLEAR    = 228;

const TERM_IN  = 240;

const CMD1  = 272;
const OUT1A = 302;   // Market volatility spike detected.
const OUT1B = 318;   // BTC -4.2% past hour
const OUT1C = 334;   // ETH -6.1% past hour
const OUT1D = 350;   // Long liquidations increasing

const CMD2  = 390;
const OUT2A = 422;   // Liquidity zones mapped
const OUT2B = 440;   // Funding imbalance detected
const OUT2C = 458;   // Short-term reversal probability increasing

const CMD3  = 502;
const OUT3A = 534;   // Risk exposure minimized
const OUT3B = 552;   // Entry optimized
const OUT3C = 568;   // Profit targets configured

const ALERT = 605;   // LOW RISK TRADE DETECTED
const CONF  = 648;   // Confidence score: 87%

const CMD4  = 680;
const DISC  = 712;   // Discord........ SENT
const INSTA = 738;   // Instagram...... SENT
const PUSH  = 764;   // Push............ SENT
const SEND  = 790;   // sending_to_members...

const COUNT_START = 830;
const FRAMES_PER_STEP = 5;
const COUNT_STEPS = ['003', '018', '041', '067', '089', '104', '121', '138', '147', '152'];
const COUNT_END   = COUNT_START + COUNT_STEPS.length * FRAMES_PER_STEP; // 880
const SUCCESS     = COUNT_END + 30;  // 910
const END_CURSOR  = SUCCESS + 20;    // 930

// ── Scroll offset ──────────────────────────────────────────────────────────────

function scrollOffset(frame: number): number {
  const keys: [number, number][] = [
    [CMD1,   0],
    [CMD3,   0],
    [ALERT,  80],
    [CMD4,   170],
    [SEND,   250],
    [COUNT_START, 320],
    [SUCCESS, 430],
    [END_CURSOR, 460],
  ];
  for (let i = 0; i < keys.length - 1; i++) {
    if (frame >= keys[i][0] && frame < keys[i + 1][0]) {
      return ipl(frame, [keys[i][0], keys[i + 1][0]], [keys[i][1], keys[i + 1][1]], EASE);
    }
  }
  return keys[keys.length - 1][1];
}

// ── Badge ──────────────────────────────────────────────────────────────────────

const GreenDot: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = ipl(frame, [D_IN, D_IN + 16], [0, 1]);
  const pulse  = 1 + 0.2 * Math.sin((frame - D_IN) * 0.18);
  return (
    <div style={{ position: 'relative', width: 16, height: 16, opacity: appear, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: -8, borderRadius: '50%',
        background: 'rgba(52,199,89,0.18)',
        transform: `scale(${pulse})`,
      }} />
      <div style={{
        position: 'absolute', inset: -3, borderRadius: '50%',
        background: 'rgba(52,199,89,0.32)',
        transform: `scale(${1 + 0.1 * Math.sin((frame - D_IN) * 0.18 + 1)})`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: '#34C759',
        boxShadow: '0 0 12px rgba(52,199,89,0.9)',
      }} />
    </div>
  );
};

const MembersBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const slideIn = ipl(frame, [B_IN, B_IN + 26], [0, 1]);
  const yIn     = ipl(frame, [B_IN, B_IN + 26], [36, 0]);
  const fadeOut = ipl(frame, [HOLD_END, CLEAR], [1, 0]);
  const textSnap = frame >= T_IN ? 1 : 0;

  return (
    <div style={{
      opacity: slideIn * fadeOut,
      transform: `translateY(${yIn}px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#1C1C1E',
        borderRadius: 60,
        padding: '16px 30px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 12px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.06)',
      }}>
        <GreenDot frame={frame} />
        <span style={{
          color: '#FFFFFF',
          fontSize: 28,
          fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 600,
          letterSpacing: '-0.5px',
          opacity: textSnap,
          lineHeight: 1,
        }}>
          152 members active
        </span>
      </div>
    </div>
  );
};

// ── Terminal components ────────────────────────────────────────────────────────

const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace";
const SANS = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

const Prompt: React.FC<{ frame: number; start: number; cmd: string }> = ({ frame, start, cmd }) => {
  if (frame < start) return null;
  const typed = typeAt(cmd, frame, start);
  const done  = isDone(cmd, frame, start);
  const cur   = Math.sin(frame * 0.45) > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', minHeight: 28, marginBottom: 2 }}>
      <span style={{ color: '#A78BFA', fontFamily: MONO, fontSize: 17, marginRight: 8, flexShrink: 0 }}>~</span>
      <span style={{ color: '#34D399', fontFamily: MONO, fontSize: 17, marginRight: 8, flexShrink: 0 }}>{'>'}</span>
      <span style={{ color: '#F1F5F9', fontFamily: MONO, fontSize: 17 }}>{typed}</span>
      {!done && (
        <span style={{
          display: 'inline-block', width: 9, height: 18,
          background: '#F1F5F9', opacity: cur ? 1 : 0,
          marginLeft: 2, verticalAlign: 'text-bottom',
        }} />
      )}
    </div>
  );
};

const Out: React.FC<{ frame: number; start: number; text: string; color?: string }> = ({
  frame, start, text, color = '#94A3B8',
}) => {
  if (frame < start) return null;
  const op = ipl(frame, [start, start + 10], [0, 1]);
  return (
    <div style={{ color, fontFamily: MONO, fontSize: 17, opacity: op, paddingLeft: 34, minHeight: 26, lineHeight: '26px' }}>
      {text}
    </div>
  );
};

const AlertBlock: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < ALERT) return null;
  const op    = ipl(frame, [ALERT, ALERT + 15], [0, 1]);
  const pulse = 0.08 + 0.04 * Math.sin((frame - ALERT) * 0.2);
  return (
    <div style={{
      opacity: op,
      marginTop: 8, marginBottom: 2,
      background: `rgba(52,211,153,${pulse})`,
      border: '1px solid rgba(52,211,153,0.35)',
      borderRadius: 8,
      padding: '14px 20px',
    }}>
      <div style={{
        color: '#34D399',
        fontFamily: MONO,
        fontSize: 19,
        fontWeight: 700,
        letterSpacing: '0.06em',
      }}>
        ⬤ LOW RISK TRADE DETECTED
      </div>
    </div>
  );
};

const CountUp: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < COUNT_START) return null;

  const elapsed  = frame - COUNT_START;
  const stepIdx  = Math.min(Math.floor(elapsed / FRAMES_PER_STEP), COUNT_STEPS.length - 1);
  const stepFrame = elapsed - stepIdx * FRAMES_PER_STEP;
  const isLast   = stepIdx === COUNT_STEPS.length - 1;
  const value    = COUNT_STEPS[stepIdx];

  // scale punch on each new number
  const scale = ipl(stepFrame, [0, FRAMES_PER_STEP - 1], [1.18, 1.0]);
  // brief blur on landing
  const blur  = ipl(stepFrame, [0, 2], [2.5, 0]);
  // final glow
  const glow  = isLast
    ? `0 0 ${20 + 10 * Math.sin((frame - COUNT_END) * 0.2)}px rgba(52,211,153,0.7)`
    : 'none';

  return (
    <div style={{ paddingLeft: 34, marginTop: 10, marginBottom: 10 }}>
      <span style={{
        fontFamily: MONO,
        fontSize: 80,
        fontWeight: 700,
        color: '#34D399',
        display: 'inline-block',
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
        filter: `blur(${blur}px)`,
        textShadow: glow,
        letterSpacing: '-2px',
        lineHeight: 1,
      }}>
        {value}
      </span>
    </div>
  );
};

const TerminalBody: React.FC<{ frame: number }> = ({ frame }) => {
  const scroll = scrollOffset(frame);
  const cur    = Math.sin(frame * 0.45) > 0;

  return (
    <div style={{ height: 700, overflow: 'hidden', background: '#181825' }}>
      <div style={{
        padding: '28px 32px 36px',
        transform: `translateY(-${scroll}px)`,
        lineHeight: '26px',
      }}>

        {/* ── monitor_market ── */}
        <Prompt frame={frame} start={CMD1} cmd="monitor_market --live" />
        <Out frame={frame} start={OUT1A} text="Market volatility spike detected." color="#F1F5F9" />
        <Out frame={frame} start={OUT1B} text="  BTC -4.2% past hour" color="#FF6B6B" />
        <Out frame={frame} start={OUT1C} text="  ETH -6.1% past hour" color="#FF6B6B" />
        <Out frame={frame} start={OUT1D} text="  Long liquidations increasing" color="#FBBF24" />

        {frame >= CMD2 - 8 && <div style={{ height: 18 }} />}

        {/* ── calculating_risk ── */}
        <Prompt frame={frame} start={CMD2} cmd="calculating_risk" />
        <Out frame={frame} start={OUT2A} text="  Liquidity zones mapped" color="#34D399" />
        <Out frame={frame} start={OUT2B} text="  Funding imbalance detected" color="#34D399" />
        <Out frame={frame} start={OUT2C} text="  Short-term reversal probability increasing" color="#34D399" />

        {frame >= CMD3 - 8 && <div style={{ height: 18 }} />}

        {/* ── analyzing_positioning ── */}
        <Prompt frame={frame} start={CMD3} cmd="analyzing_positioning" />
        <Out frame={frame} start={OUT3A} text="  Risk exposure minimized" color="#94A3B8" />
        <Out frame={frame} start={OUT3B} text="  Entry optimized" color="#94A3B8" />
        <Out frame={frame} start={OUT3C} text="  Profit targets configured" color="#94A3B8" />

        {/* ── ALERT ── */}
        <AlertBlock frame={frame} />
        <Out frame={frame} start={CONF} text="  Confidence score: 87%" color="#A78BFA" />

        {frame >= CMD4 - 8 && <div style={{ height: 18 }} />}

        {/* ── notifying_members ── */}
        <Prompt frame={frame} start={CMD4} cmd="notifying_members" />
        <Out frame={frame} start={DISC}  text="  Discord........  SENT" color="#34D399" />
        <Out frame={frame} start={INSTA} text="  Instagram......  SENT" color="#34D399" />
        <Out frame={frame} start={PUSH}  text="  Push............  SENT" color="#34D399" />

        {frame >= SEND - 4 && <div style={{ height: 12 }} />}
        <Out frame={frame} start={SEND} text="  sending_to_members..." color="#FBBF24" />

        {/* ── count-up ── */}
        <CountUp frame={frame} />

        {/* ── success ── */}
        <Out frame={frame} start={SUCCESS} text="  152 members notified successfully" color="#34D399" />

        {/* ── idle cursor ── */}
        {frame >= END_CURSOR && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
            <span style={{ color: '#A78BFA', fontFamily: MONO, fontSize: 17, marginRight: 8 }}>~</span>
            <span style={{ color: '#34D399', fontFamily: MONO, fontSize: 17, marginRight: 8 }}>{'>'}</span>
            <span style={{
              display: 'inline-block', width: 9, height: 18,
              background: '#F1F5F9', opacity: cur ? 1 : 0,
              verticalAlign: 'text-bottom',
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

const TerminalWindow: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = ipl(frame, [TERM_IN, TERM_IN + 20], [0, 1]);
  const scale   = ipl(frame, [TERM_IN, TERM_IN + 26], [0.94, 1]);

  return (
    <div style={{
      opacity, transform: `scale(${scale})`,
      width: 940,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)',
    }}>
      {/* Title bar */}
      <div style={{
        background: '#ECECEC', padding: '13px 20px',
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', zIndex: 1 }}>
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div style={{
          position: 'absolute', left: 0, right: 0,
          textAlign: 'center', fontFamily: SANS,
          fontSize: 13, fontWeight: 500, color: '#555',
          pointerEvents: 'none',
        }}>
          market-intel — zsh
        </div>
        <div style={{ marginLeft: 'auto', zIndex: 1, fontSize: 16, color: '#C084FC' }}>✦</div>
      </div>

      <TerminalBody frame={frame} />
    </div>
  );
};

// ── Root ───────────────────────────────────────────────────────────────────────

export const MembersLiveVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {frame < CLEAR && <MembersBadge frame={frame} />}
      {frame >= TERM_IN && <TerminalWindow frame={frame} />}
    </AbsoluteFill>
  );
};
