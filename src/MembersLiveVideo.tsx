import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from 'remotion';

// ── helpers ────────────────────────────────────────────────────────────────────

const SPRING = Easing.bezier(0.16, 1, 0.3, 1);

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

function typeAt(text: string, frame: number, start: number, speed = 1.6): string {
  const chars = Math.max(0, Math.floor((frame - start) * speed));
  return text.slice(0, chars);
}

function isDone(text: string, frame: number, start: number, speed = 1.6): boolean {
  return Math.floor((frame - start) * speed) >= text.length;
}

// ── Timing (30 fps) ────────────────────────────────────────────────────────────
// Phase 1: badge reveal 0-220
const B_IN   = 18;   // badge pill slides in
const D_IN   = 52;   // green dot fades in
const T_IN   = 82;   // "152 members active" text reveals
const HOLD_END = 195; // begin clear
const CLEAR   = 230; // fully blank

// Phase 2: terminal 240-580
const TERM_IN = 240;

// typing start frames
const CMD1  = 275;   // "active_members --live"
const OUT1  = 310;   // "152 traders. Live."
const CMD2  = 358;   // "what_are_they_doing"
const OUT2A = 395;   // "Running setups we built with them."
const OUT2B = 425;   // "Real entries. Real exits. In live markets."
const CMD3  = 478;   // "proof"
const OUT3  = 510;   // "You're looking at it."
const BLINK  = 540;  // idle cursor after last line

// ── Badge ──────────────────────────────────────────────────────────────────────

const GreenDot: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = ipl(frame, [D_IN, D_IN + 18], [0, 1]);
  // slow organic pulse — no CSS, pure math
  const pulse  = 1 + 0.18 * Math.sin((frame - D_IN) * 0.18);
  return (
    <div style={{ position: 'relative', width: 18, height: 18, opacity: appear, flexShrink: 0 }}>
      {/* outer glow ring */}
      <div style={{
        position: 'absolute',
        inset: -7,
        borderRadius: '50%',
        background: 'rgba(52,199,89,0.22)',
        transform: `scale(${pulse})`,
      }} />
      {/* mid glow */}
      <div style={{
        position: 'absolute',
        inset: -3,
        borderRadius: '50%',
        background: 'rgba(52,199,89,0.35)',
        transform: `scale(${1 + 0.09 * Math.sin((frame - D_IN) * 0.18 + 1)})`,
      }} />
      {/* solid dot */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: '#34C759',
        boxShadow: '0 0 14px rgba(52,199,89,0.9), 0 0 4px rgba(52,199,89,1)',
      }} />
    </div>
  );
};

const MembersBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const slideIn  = ipl(frame, [B_IN, B_IN + 28], [0, 1]);
  const yIn      = ipl(frame, [B_IN, B_IN + 28], [40, 0]);
  const fadeOut  = ipl(frame, [HOLD_END, CLEAR], [1, 0]);
  const textReveal = ipl(frame, [T_IN, T_IN + 22], [0, 1]);
  const textX      = ipl(frame, [T_IN, T_IN + 22], [12, 0]);

  return (
    <div style={{
      opacity: slideIn * fadeOut,
      transform: `translateY(${yIn}px)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#1C1C1E',
        borderRadius: 60,
        padding: '20px 36px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 12px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.06)',
      }}>
        <GreenDot frame={frame} />
        <span style={{
          color: '#FFFFFF',
          fontSize: 36,
          fontFamily: "'Inter', -apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 500,
          letterSpacing: '-0.4px',
          opacity: textReveal,
          transform: `translateX(${textX}px)`,
          display: 'inline-block',
          lineHeight: 1,
        }}>
          152 members active
        </span>
      </div>
    </div>
  );
};

// ── Terminal ───────────────────────────────────────────────────────────────────

const MONO = "'Courier New', 'Menlo', 'Consolas', monospace";
const SANS = "'Inter', -apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

interface TermLineProps {
  frame: number;
  start: number;
  text: string;
  color?: string;
  indent?: number;
  fade?: boolean;
  speed?: number;
}

const TermPrompt: React.FC<{ frame: number; start: number; cmd: string }> = ({ frame, start, cmd }) => {
  if (frame < start) return null;
  const typed = typeAt(cmd, frame, start);
  const done  = isDone(cmd, frame, start);
  const cursor = Math.sin(frame * 0.45) > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, minHeight: 28 }}>
      <span style={{ color: '#A78BFA', fontFamily: MONO, fontSize: 19, marginRight: 10, flexShrink: 0 }}>~</span>
      <span style={{ color: '#34D399', fontFamily: MONO, fontSize: 19, marginRight: 10, flexShrink: 0 }}>{'>'}</span>
      <span style={{ color: '#F1F5F9', fontFamily: MONO, fontSize: 19 }}>{typed}</span>
      {!done && (
        <span style={{
          display: 'inline-block',
          width: 10,
          height: 20,
          background: '#F1F5F9',
          opacity: cursor ? 1 : 0,
          marginLeft: 2,
          verticalAlign: 'text-bottom',
        }} />
      )}
    </div>
  );
};

const TermOutput: React.FC<TermLineProps> = ({ frame, start, text, color = '#94A3B8', fade = true, speed }) => {
  if (frame < start) return null;
  const op = fade ? ipl(frame, [start, start + 12], [0, 1]) : 1;
  return (
    <div style={{
      color,
      fontFamily: MONO,
      fontSize: 19,
      opacity: op,
      paddingLeft: 38,
      minHeight: 28,
      lineHeight: '28px',
    }}>
      {speed !== undefined ? typeAt(text, frame, start, speed) : text}
    </div>
  );
};

const BlinkCursor: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  if (frame < start) return null;
  const cursor = Math.sin(frame * 0.45) > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 4 }}>
      <span style={{ color: '#A78BFA', fontFamily: MONO, fontSize: 19, marginRight: 10 }}>~</span>
      <span style={{ color: '#34D399', fontFamily: MONO, fontSize: 19, marginRight: 10 }}>{'>'}</span>
      <span style={{
        display: 'inline-block',
        width: 10,
        height: 20,
        background: '#F1F5F9',
        opacity: cursor ? 1 : 0,
        verticalAlign: 'text-bottom',
      }} />
    </div>
  );
};

const TerminalWindow: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = ipl(frame, [TERM_IN, TERM_IN + 22], [0, 1]);
  const scale   = ipl(frame, [TERM_IN, TERM_IN + 28], [0.93, 1]);
  const yIn     = ipl(frame, [TERM_IN, TERM_IN + 28], [30, 0]);

  return (
    <div style={{
      opacity,
      transform: `scale(${scale}) translateY(${yIn}px)`,
      width: 920,
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.07)',
    }}>
      {/* Title bar */}
      <div style={{
        background: '#ECECEC',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        position: 'relative',
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', zIndex: 1 }}>
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#FF5F57', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#FFBD2E', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#28C840', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }} />
        </div>
        {/* Centered title */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: 14,
          fontWeight: 500,
          color: '#555',
          pointerEvents: 'none',
        }}>
          live-proof — zsh
        </div>
        {/* Sparkle */}
        <div style={{ marginLeft: 'auto', zIndex: 1, fontSize: 18, color: '#C084FC' }}>✦</div>
      </div>

      {/* Terminal body */}
      <div style={{
        background: '#181825',
        padding: '32px 36px 40px',
        minHeight: 520,
        lineHeight: '28px',
      }}>
        <TermPrompt frame={frame} start={CMD1} cmd="active_members --live" />
        <TermOutput  frame={frame} start={OUT1} text="152 traders. Live." color="#34D399" />

        {frame >= CMD2 - 10 && <div style={{ height: 20 }} />}
        <TermPrompt frame={frame} start={CMD2} cmd="what_are_they_doing" />
        <TermOutput  frame={frame} start={OUT2A} text="Running setups we built with them." />
        <TermOutput  frame={frame} start={OUT2B} text="Real entries. Real exits. In live markets." />

        {frame >= CMD3 - 10 && <div style={{ height: 20 }} />}
        <TermPrompt frame={frame} start={CMD3} cmd="proof" />
        <TermOutput  frame={frame} start={OUT3} text="You're looking at it." color="#FBBF24" />

        <BlinkCursor frame={frame} start={BLINK} />
      </div>
    </div>
  );
};

// ── Root composition ───────────────────────────────────────────────────────────

export const MembersLiveVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Phase 1: badge */}
      {frame < CLEAR && <MembersBadge frame={frame} />}

      {/* Phase 2: terminal */}
      {frame >= TERM_IN && <TerminalWindow frame={frame} />}
    </AbsoluteFill>
  );
};
