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
  const slideIn = ipl(frame, [B_IN, B_IN + 28], [0, 1]);
  const yIn     = ipl(frame, [B_IN, B_IN + 28], [40, 0]);
  const fadeOut = ipl(frame, [HOLD_END, CLEAR], [1, 0]);
  const textSnap = frame >= T_IN ? 1 : 0;

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
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 12px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.06)',
      }}>
        <GreenDot frame={frame} />
        <span style={{
          color: '#FFFFFF',
          fontSize: 22,
          fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 300,
          letterSpacing: '-0.2px',
          opacity: textSnap,
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
          taught-by-sosa — zsh
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

        {/* By Sosa — appears after cursor settles */}
        {frame >= BLINK + 20 && (
          <div style={{
            opacity: ipl(frame, [BLINK + 20, BLINK + 40], [0, 1]),
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 36,
            paddingTop: 28,
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            {/* Apple logo SVG */}
            <svg width="18" height="22" viewBox="0 0 814 1000" fill="#AEAEB2">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-156.8-107C18.3 716.5 0 610.9 0 509.4c0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
            </svg>
            <span style={{
              fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
              fontSize: 15,
              fontWeight: 400,
              color: '#AEAEB2',
              letterSpacing: '0.04em',
            }}>
              By Sosa
            </span>
          </div>
        )}
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
