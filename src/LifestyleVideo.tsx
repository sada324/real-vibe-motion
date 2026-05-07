import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, Easing, staticFile } from 'remotion';

const EASE = Easing.bezier(0.4, 0, 0.2, 1);

function ipl(f: number, io: [number, number], ft: [number, number]) {
  return interpolate(f, io, ft, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
}

const SLIDES = [
  { bg: staticFile('bg-house.png'),        text: 'Trade at home.' },
  { bg: staticFile('bg-setup.png'),        text: 'Trade from your setup.' },
  { bg: staticFile('bg-warehouse.png'),    text: 'Trade from anywhere.' },
  { bg: staticFile('bg-construction.png'), text: 'Trade on the job.' },
];

const SLIDE_DUR  = 150; // 5s per slide
const TYPE_START = 18;
const TYPE_SPEED = 2.0;  // chars/frame
const HOLD_END   = 108;
const DEL_SPEED  = 3.5;  // chars deleted/frame
const XFADE      = 20;   // bg crossfade duration

function getDisplayText(slideFrame: number, text: string): string {
  if (slideFrame < TYPE_START) return '';
  const typed = Math.min(Math.floor((slideFrame - TYPE_START) * TYPE_SPEED), text.length);
  if (slideFrame < HOLD_END) return text.slice(0, typed);
  const deleted = Math.floor((slideFrame - HOLD_END) * DEL_SPEED);
  return text.slice(0, Math.max(0, text.length - deleted));
}

const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace";
const SANS = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

export const LifestyleVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const slideIdx  = Math.min(Math.floor(frame / SLIDE_DUR), SLIDES.length - 1);
  const slideFrame = frame - slideIdx * SLIDE_DUR;
  const cur = Math.sin(frame * 0.45) > 0;

  // Terminal fade in once on first slide, then stays visible
  const termOp = ipl(frame, [TYPE_START, TYPE_START + 16], [0, 1]);

  return (
    <AbsoluteFill style={{ background: '#000' }}>

      {/* ── Backgrounds ── */}
      {SLIDES.map((slide, i) => {
        const start  = i * SLIDE_DUR;
        const end    = start + SLIDE_DUR;
        const isLast = i === SLIDES.length - 1;
        const fadeIn  = ipl(frame, [start, start + XFADE], [0, 1]);
        const fadeOut = isLast ? 1 : ipl(frame, [end - XFADE, end], [1, 0]);
        const op = fadeIn * fadeOut;
        if (op <= 0 && frame > end) return null;
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: op }}>
            <Img
              src={slide.bg}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        );
      })}

      {/* ── Compact terminal rectangle ── */}
      <div style={{
        position: 'absolute',
        bottom: 300,
        left: '50%',
        transform: `translateX(-50%)`,
        width: 860,
        borderRadius: 12,
        overflow: 'hidden',
        opacity: termOp,
        boxShadow: '0 28px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
      }}>
        {/* Title bar */}
        <div style={{
          background: '#ECECEC',
          padding: '11px 18px',
          display: 'flex', alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.12)',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', zIndex: 1 }}>
            {['#FF5F57', '#FFBD2E', '#28C840'].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{
            position: 'absolute', left: 0, right: 0, textAlign: 'center',
            fontFamily: SANS, fontSize: 12, fontWeight: 500, color: '#555',
            pointerEvents: 'none',
          }}>
            market-intel — zsh
          </div>
          <div style={{ marginLeft: 'auto', zIndex: 1, fontSize: 14, color: '#C084FC' }}>✦</div>
        </div>

        {/* Single-line body */}
        <div style={{
          background: '#181825',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{ color: '#A78BFA', fontFamily: MONO, fontSize: 18, marginRight: 8 }}>~</span>
          <span style={{ color: '#34D399', fontFamily: MONO, fontSize: 18, marginRight: 10 }}>{'>'}</span>
          <span style={{ color: '#F1F5F9', fontFamily: MONO, fontSize: 18 }}>
            {getDisplayText(slideFrame, SLIDES[slideIdx].text)}
          </span>
          <span style={{
            display: 'inline-block', width: 9, height: 18,
            background: '#F1F5F9', opacity: cur ? 1 : 0,
            marginLeft: 2, verticalAlign: 'text-bottom',
          }} />
        </div>
      </div>

    </AbsoluteFill>
  );
};
