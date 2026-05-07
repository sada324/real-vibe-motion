import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from 'remotion';

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

// ── Timing ─────────────────────────────────────────────────────────────────────

// Phase 1: badge — ends at exactly 4 s
const B_IN     = 18;
const D_IN     = 48;
const T_IN     = 76;
const HOLD_END = 100;
const CLEAR    = 128;

// Phase 2: terminal
const TERM_IN = 142;

const CMD1  = 162;   // monitor_market --live
const OUT1A = 190;   // Market volatility spike detected.
const OUT1B = 204;   // BTC -4.2% | ETH -6.1%
const OUT1C = 218;   // Long liquidations increasing

const CMD2  = 244;   // calculating_risk
const OUT2A = 266;   // Liquidity zones mapped
const OUT2B = 280;   // Short-term reversal probability increasing

const CMD3  = 312;   // analyzing_positioning
const OUT3A = 334;   // Risk exposure minimized
const OUT3B = 348;   // Entry optimized. Profit targets configured.

const ALERT = 374;   // LOW RISK TRADE DETECTED  (normal output, green bold)
const CONF  = 396;   // Confidence score: 87%

const CMD4  = 422;   // notifying_members
const DISC  = 448;   // Discord........ SENT
const INSTA = 464;   // Instagram...... SENT
const PUSH  = 480;   // Push............ SENT
const SEND  = 498;   // sending_to_members...

// Count-up: single line, value updates rapidly
const COUNT_START  = 524;
const FRAMES_PER   = 4;
const COUNT_STEPS  = ['003', '018', '041', '067', '089', '104', '121', '138', '147', '152'];
const COUNT_END    = COUNT_START + COUNT_STEPS.length * FRAMES_PER; // 564

const SUCCESS  = COUNT_END + 22;  // 586
const END_CUR  = SUCCESS + 18;    // 604

// ── Scroll ─────────────────────────────────────────────────────────────────────

function scrollY(frame: number): number {
  const keys: [number, number][] = [
    [CMD1,  0],
    [CMD3,  0],
    [ALERT, 68],
    [CMD4,  128],
    [SEND,  190],
    [COUNT_START, 230],
    [END_CUR, 260],
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
  const appear = ipl(frame, [D_IN, D_IN + 14], [0, 1]);
  const pulse  = 1 + 0.2 * Math.sin((frame - D_IN) * 0.18);
  return (
    <div style={{ position: 'relative', width: 16, height: 16, opacity: appear, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: -8, borderRadius: '50%',
        background: 'rgba(52,199,89,0.18)', transform: `scale(${pulse})`,
      }} />
      <div style={{
        position: 'absolute', inset: -3, borderRadius: '50%',
        background: 'rgba(52,199,89,0.32)',
        transform: `scale(${1 + 0.1 * Math.sin((frame - D_IN) * 0.18 + 1)})`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: '#34C759', boxShadow: '0 0 12px rgba(52,199,89,0.9)',
      }} />
    </div>
  );
};

const MembersBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const slideIn = ipl(frame, [B_IN, B_IN + 24], [0, 1]);
  const yIn     = ipl(frame, [B_IN, B_IN + 24], [34, 0]);
  const fadeOut = ipl(frame, [HOLD_END, CLEAR], [1, 0]);
  const snap    = frame >= T_IN ? 1 : 0;

  return (
    <div style={{
      opacity: slideIn * fadeOut,
      transform: `translateY(${yIn}px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#1C1C1E', borderRadius: 60,
        padding: '16px 30px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 12px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.06)',
      }}>
        <GreenDot frame={frame} />
        <span style={{
          color: '#FFFFFF', fontSize: 28,
          fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 600, letterSpacing: '-0.5px',
          opacity: snap, lineHeight: 1,
        }}>
          152 members active
        </span>
      </div>
    </div>
  );
};

// ── Terminal ───────────────────────────────────────────────────────────────────

const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace";
const SANS = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

const Prompt: React.FC<{ frame: number; start: number; cmd: string }> = ({ frame, start, cmd }) => {
  if (frame < start) return null;
  const typed = typeAt(cmd, frame, start);
  const done  = isDone(cmd, frame, start);
  const cur   = Math.sin(frame * 0.45) > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', minHeight: 26, marginBottom: 2 }}>
      <span style={{ color: '#A78BFA', fontFamily: MONO, fontSize: 17, marginRight: 8, flexShrink: 0 }}>~</span>
      <span style={{ color: '#34D399', fontFamily: MONO, fontSize: 17, marginRight: 8, flexShrink: 0 }}>{'>'}</span>
      <span style={{ color: '#F1F5F9', fontFamily: MONO, fontSize: 17 }}>{typed}</span>
      {!done && (
        <span style={{
          display: 'inline-block', width: 9, height: 17,
          background: '#F1F5F9', opacity: cur ? 1 : 0,
          marginLeft: 2, verticalAlign: 'text-bottom',
        }} />
      )}
    </div>
  );
};

const Out: React.FC<{
  frame: number; start: number; text: string;
  color?: string; bold?: boolean;
}> = ({ frame, start, text, color = '#94A3B8', bold = false }) => {
  if (frame < start) return null;
  const op = ipl(frame, [start, start + 8], [0, 1]);
  return (
    <div style={{
      color, fontFamily: MONO, fontSize: 17,
      fontWeight: bold ? 700 : 400,
      opacity: op, paddingLeft: 34,
      minHeight: 24, lineHeight: '24px',
    }}>
      {text}
    </div>
  );
};

// Counter line — single line that updates value rapidly
const CounterLine: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < COUNT_START) return null;

  const elapsed  = frame - COUNT_START;
  const stepIdx  = Math.min(Math.floor(elapsed / FRAMES_PER), COUNT_STEPS.length - 1);
  const isLast   = stepIdx === COUNT_STEPS.length - 1;
  const value    = COUNT_STEPS[stepIdx];

  const glow = isLast
    ? `rgba(52,211,153,${0.6 + 0.3 * Math.sin((frame - COUNT_END) * 0.22)})`
    : 'transparent';

  return (
    <div style={{
      paddingLeft: 34, minHeight: 24, lineHeight: '24px',
    }}>
      <span style={{
        fontFamily: MONO, fontSize: 17, fontWeight: 700,
        color: '#34D399',
        textShadow: isLast ? `0 0 18px ${glow}` : 'none',
      }}>
        {value}
      </span>
    </div>
  );
};

const TermBody: React.FC<{ frame: number }> = ({ frame }) => {
  const scroll = scrollY(frame);
  const cur    = Math.sin(frame * 0.45) > 0;

  return (
    <div style={{ height: 660, overflow: 'hidden', background: '#181825' }}>
      <div style={{ padding: '26px 30px 32px', transform: `translateY(-${scroll}px)` }}>

        <Prompt frame={frame} start={CMD1} cmd="monitor_market --live" />
        <Out frame={frame} start={OUT1A} text="  Market volatility spike detected." color="#F1F5F9" />
        <Out frame={frame} start={OUT1B} text="  BTC -4.2%  |  ETH -6.1% past hour" color="#FF6B6B" />
        <Out frame={frame} start={OUT1C} text="  Long liquidations increasing" color="#FBBF24" />

        {frame >= CMD2 - 6 && <div style={{ height: 16 }} />}

        <Prompt frame={frame} start={CMD2} cmd="calculating_risk" />
        <Out frame={frame} start={OUT2A} text="  Liquidity zones mapped" color="#34D399" />
        <Out frame={frame} start={OUT2B} text="  Short-term reversal probability increasing" color="#34D399" />

        {frame >= CMD3 - 6 && <div style={{ height: 16 }} />}

        <Prompt frame={frame} start={CMD3} cmd="analyzing_positioning" />
        <Out frame={frame} start={OUT3A} text="  Risk exposure minimized" color="#94A3B8" />
        <Out frame={frame} start={OUT3B} text="  Entry optimized. Profit targets configured." color="#94A3B8" />

        {frame >= ALERT - 6 && <div style={{ height: 16 }} />}

        <Out frame={frame} start={ALERT} text="  LOW RISK TRADE DETECTED" color="#34D399" bold />
        <Out frame={frame} start={CONF}  text="  Confidence score: 87%" color="#34D399" />

        {frame >= CMD4 - 6 && <div style={{ height: 16 }} />}

        <Prompt frame={frame} start={CMD4} cmd="notifying_members" />
        <Out frame={frame} start={DISC}  text="  Discord........  SENT" color="#34D399" />
        <Out frame={frame} start={INSTA} text="  Instagram......  SENT" color="#34D399" />
        <Out frame={frame} start={PUSH}  text="  Push............  SENT" color="#34D399" />

        {frame >= SEND - 4 && <div style={{ height: 10 }} />}
        <Out frame={frame} start={SEND} text="  sending_to_members..." color="#FBBF24" />

        {frame >= COUNT_START - 2 && <div style={{ height: 10 }} />}
        <CounterLine frame={frame} />

        <Out frame={frame} start={SUCCESS} text="  152 members notified successfully" color="#34D399" />

        {frame >= END_CUR && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
            <span style={{ color: '#A78BFA', fontFamily: MONO, fontSize: 17, marginRight: 8 }}>~</span>
            <span style={{ color: '#34D399', fontFamily: MONO, fontSize: 17, marginRight: 8 }}>{'>'}</span>
            <span style={{
              display: 'inline-block', width: 9, height: 17,
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
  const opacity = ipl(frame, [TERM_IN, TERM_IN + 18], [0, 1]);
  const scale   = ipl(frame, [TERM_IN, TERM_IN + 24], [0.94, 1]);

  return (
    <div style={{
      opacity, transform: `scale(${scale})`,
      width: 940, borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)',
    }}>
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
      <TermBody frame={frame} />
    </div>
  );
};

// ── Root ───────────────────────────────────────────────────────────────────────

export const MembersLiveVideo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: '#FFFFFF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {frame < CLEAR && <MembersBadge frame={frame} />}
      {frame >= TERM_IN && <TerminalWindow frame={frame} />}
    </AbsoluteFill>
  );
};
