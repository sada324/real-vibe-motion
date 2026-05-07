import React from 'react';
import { interpolate, Easing } from 'remotion';

const SPRING = Easing.bezier(0.16, 1, 0.3, 1);
const EASE   = Easing.bezier(0.4, 0, 0.2, 1);

function ipl(f: number, io: [number, number], ft: [number, number], e = SPRING) {
  return interpolate(f, io, ft, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
}
function typeAt(text: string, frame: number, start: number, speed = 1.8) {
  return text.slice(0, Math.max(0, Math.floor((frame - start) * speed)));
}
function isDone(text: string, frame: number, start: number, speed = 1.8) {
  return Math.floor((frame - start) * speed) >= text.length;
}

const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace";
const SANS = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

// ── Location data ──────────────────────────────────────────────────────────────

const LOCS = [
  { name: 'Montreal, CA', flag: '🇨🇦', time: '9:41 AM',  wx: '☁️', tmp: '12°', col: '#34D399', gx: 243, gy: 132, cdx:  10, cdy: -82 },
  { name: 'Toronto, CA',  flag: '🇨🇦', time: '9:41 AM',  wx: '☁️', tmp: '12°', col: '#34D399', gx: 228, gy: 145, cdx: -175, cdy: -58 },
  { name: 'New York, US', flag: '🇺🇸', time: '9:41 AM',  wx: '⛅', tmp: '18°', col: '#60A5FA', gx: 252, gy: 162, cdx:  14, cdy: -78 },
  { name: 'Los Angeles, US', flag: '🇺🇸', time: '6:41 AM', wx: '☀️', tmp: '20°', col: '#F472B6', gx: 126, gy: 180, cdx: -30, cdy:  22 },
  { name: 'London, UK',   flag: '🇬🇧', time: '2:41 PM',  wx: '☁️', tmp: '12°', col: '#60A5FA', gx: 400, gy: 114, cdx:  10, cdy: -78 },
  { name: 'Tokyo, JP',    flag: '🇯🇵', time: '10:41 PM', wx: '☀️', tmp: '18°', col: '#F472B6', gx: 534, gy: 160, cdx: -168, cdy:  22 },
];

// ── City lights (x, y, r) in 620×620 SVG space ────────────────────────────────

const LIGHTS: [number, number, number][] = [
  // US East Coast
  [248,148,2.5],[255,157,2.2],[262,164,2],[242,141,2.2],[268,170,1.5],[245,154,1.5],[272,176,1.5],
  // Great Lakes / Toronto
  [233,138,2.2],[242,132,2],[228,143,1.8],[238,128,1.5],[220,136,1.5],
  // US West Coast
  [127,177,2.5],[131,188,2.2],[135,198,2],[138,208,1.5],[124,183,1.8],[120,192,1.5],
  // US Midwest / South
  [222,158,1.8],[215,168,1.5],[228,165,1.5],[235,185,1.8],[245,195,1.5],[240,190,1.5],
  // Mexico
  [162,228,2],[170,235,1.8],[178,242,1.5],[157,235,1.5],
  // South America
  [258,350,2.2],[263,362,2],[268,373,2],[275,385,1.8],[252,355,1.5],[248,360,1.5],[265,390,1.5],
  // Brazil SE
  [272,368,1.8],[280,375,1.5],[270,380,1.5],
  // Western Europe
  [395,113,2.5],[403,120,2.2],[410,127,2],[415,118,1.8],[398,107,1.8],[385,117,1.5],[420,130,1.5],[390,122,1.5],
  // Central Europe
  [420,118,1.5],[425,125,1.5],[430,120,1.5],[435,128,1.5],[428,110,1.5],
  // Nordic
  [392,100,1.8],[388,105,1.5],[395,95,1.5],[402,92,1.5],[408,98,1.5],
  // Russia
  [432,98,1.8],[445,95,1.5],[460,98,1.5],[475,100,1.5],[490,100,1.5],
  // Africa West/South
  [383,232,1.5],[390,242,1.5],[395,178,1.5],[400,192,1.5],[408,220,1.5],[415,235,1.5],
  // Middle East
  [438,175,1.8],[445,182,1.5],[450,190,1.5],[442,185,1.5],[455,178,1.5],
  // India
  [460,207,2],[468,215,1.8],[455,220,1.5],[472,222,1.5],[463,225,1.5],[458,215,1.5],
  // China
  [505,155,2],[512,148,1.8],[518,155,1.8],[500,162,1.5],[508,162,1.5],[515,168,1.5],
  // Japan
  [532,152,2.5],[538,159,2.2],[543,166,2],[528,158,1.8],[546,172,1.5],[525,154,1.5],
  // Korea
  [522,150,1.8],[516,152,1.5],[520,143,1.5],
  // SE Asia
  [520,238,1.8],[528,245,1.5],[515,248,1.5],[525,252,1.5],[518,255,1.5],
  // Australia
  [555,295,2],[562,303,1.8],[548,297,1.5],[568,298,1.5],[558,308,1.5],
];

// ── Timing ─────────────────────────────────────────────────────────────────────

const CMD1_START  = 22;
const GLOBE_IN    = 40;
const PANEL_IN    = 58;
const COUNT_UP_F  = 72;   // count to 152
const LOC_START   = 72;
const LOC_GAP     = 20;
const LOC_COUNT   = LOCS.length;
const FOOTER_IN   = LOC_START + LOC_COUNT * LOC_GAP + 10;
const CMD2_START  = FOOTER_IN + 15;
const RESULT_IN   = CMD2_START + 20;
const CUR_IN      = RESULT_IN + 14;

// ── Globe SVG ──────────────────────────────────────────────────────────────────

const GlobeSVG: React.FC<{ frame: number }> = ({ frame }) => {
  const op    = ipl(frame, [GLOBE_IN, GLOBE_IN + 20], [0, 1]);
  const scale = ipl(frame, [GLOBE_IN, GLOBE_IN + 28], [0.82, 1], SPRING);

  return (
    <div style={{
      position: 'relative',
      width: 620, height: 620, flexShrink: 0,
      opacity: op,
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
    }}>
      {/* Globe SVG */}
      <svg width={620} height={620} viewBox="0 0 620 620" style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="globe-bg" cx="36%" cy="30%" r="72%">
            <stop offset="0%"   stopColor="#1B3D72" />
            <stop offset="40%"  stopColor="#0D1F3C" />
            <stop offset="100%" stopColor="#020810" />
          </radialGradient>
          <radialGradient id="atmo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="80%"  stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(80,140,255,0.18)" />
          </radialGradient>
          <filter id="light-glow">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="dot-glow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="globe-clip"><circle cx="310" cy="310" r="298" /></clipPath>
        </defs>

        {/* Base sphere */}
        <circle cx="310" cy="310" r="298" fill="url(#globe-bg)" />

        {/* Grid lines */}
        <g clipPath="url(#globe-clip)" fill="none" stroke="rgba(100,160,255,0.055)" strokeWidth="0.6">
          {/* Longitude */}
          <ellipse cx="310" cy="310" rx="75"  ry="298" />
          <ellipse cx="310" cy="310" rx="150" ry="298" />
          <ellipse cx="310" cy="310" rx="225" ry="298" />
          {/* Latitude */}
          <ellipse cx="310" cy="160" rx="258" ry="42" />
          <ellipse cx="310" cy="260" rx="290" ry="35" />
          <ellipse cx="310" cy="360" rx="290" ry="35" />
          <ellipse cx="310" cy="460" rx="210" ry="38" />
        </g>

        {/* City lights */}
        <g clipPath="url(#globe-clip)" filter="url(#light-glow)">
          {LIGHTS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r}
              fill={`rgba(255,210,100,${0.55 + (r - 1.5) * 0.2})`} />
          ))}
        </g>

        {/* Atmosphere ring */}
        <circle cx="310" cy="310" r="298" fill="none" stroke="rgba(90,150,255,0.14)" strokeWidth="22" />
        <circle cx="310" cy="310" r="298" fill="none" stroke="rgba(60,100,220,0.08)" strokeWidth="40" />

        {/* City active dots */}
        {LOCS.map((loc, i) => {
          const showAt = LOC_START + i * LOC_GAP;
          if (frame < showAt) return null;
          const age = frame - showAt;
          const dotScale = ipl(Math.min(age, 12), [0, 12], [0, 1], SPRING);
          const pulse = 1 + 0.22 * Math.sin(age * 0.18);
          return (
            <g key={loc.name} filter="url(#dot-glow)">
              <circle cx={loc.gx} cy={loc.gy} r={7 * pulse} fill={loc.col} opacity={0.25 * dotScale} />
              <circle cx={loc.gx} cy={loc.gy} r={4} fill={loc.col} opacity={dotScale} />
            </g>
          );
        })}
      </svg>

      {/* Floating location cards */}
      {LOCS.map((loc, i) => {
        const showAt = LOC_START + i * LOC_GAP;
        if (frame < showAt) return null;
        const age = frame - showAt;
        const op2  = ipl(Math.min(age, 14), [0, 14], [0, 1], SPRING);
        const sc   = ipl(Math.min(age, 14), [0, 14], [0.88, 1], SPRING);
        const cx   = loc.gx + loc.cdx;
        const cy   = loc.gy + loc.cdy;
        return (
          <div key={loc.name} style={{
            position: 'absolute',
            left: cx, top: cy,
            opacity: op2, transform: `scale(${sc})`,
            transformOrigin: 'left center',
          }}>
            <div style={{
              background: 'rgba(24,26,40,0.92)',
              border: `1px solid ${loc.col}44`,
              borderRadius: 10,
              padding: '8px 12px',
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#F1F5F9',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: loc.col, display: 'inline-block', flexShrink: 0 }} />
                {loc.name} {loc.flag}
              </div>
              <div style={{
                marginTop: 3,
                fontFamily: SANS, fontSize: 12, color: '#94A3B8',
                paddingLeft: 13,
              }}>
                {loc.time} · {loc.wx} {loc.tmp}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Live panel ─────────────────────────────────────────────────────────────────

const LivePanel: React.FC<{ frame: number }> = ({ frame }) => {
  const op  = ipl(frame, [PANEL_IN, PANEL_IN + 18], [0, 1]);
  const tx  = ipl(frame, [PANEL_IN, PANEL_IN + 22], [-28, 0], SPRING);

  // animated count to 152
  const count = Math.min(Math.round(ipl(frame, [COUNT_UP_F, COUNT_UP_F + 22], [0, 152], EASE)), 152);

  const footerOp = ipl(frame, [FOOTER_IN, FOOTER_IN + 12], [0, 1]);

  return (
    <div style={{
      width: 340, flexShrink: 0,
      opacity: op, transform: `translateX(${tx}px)`,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '22px 24px',
        flex: 1,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399', display: 'inline-block',
            boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: '#64748B', letterSpacing: '0.12em' }}>
            LIVE USERS
          </span>
        </div>

        {/* Count */}
        <div style={{
          fontFamily: SANS, fontSize: 56, fontWeight: 700, color: '#F1F5F9',
          letterSpacing: '-2px', lineHeight: 1, marginBottom: 22,
        }}>
          {count}
        </div>

        {/* Locations label */}
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 600, color: '#475569',
          letterSpacing: '0.14em', marginBottom: 12,
        }}>
          LOCATIONS
        </div>

        {/* Location rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LOCS.map((loc, i) => {
            const showAt = LOC_START + i * LOC_GAP;
            if (frame < showAt) return null;
            const rowOp = ipl(frame, [showAt, showAt + 10], [0, 1]);
            return (
              <div key={loc.name} style={{
                display: 'flex', alignItems: 'center',
                opacity: rowOp,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: loc.col, flexShrink: 0, marginRight: 8,
                  boxShadow: `0 0 6px ${loc.col}88`,
                }} />
                <span style={{ fontFamily: SANS, fontSize: 13, color: '#CBD5E1', flex: 1 }}>
                  {loc.name} {loc.flag}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 12, color: '#475569', marginLeft: 8 }}>
                  {loc.time}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 12, color: '#475569', marginLeft: 6 }}>
                  {loc.tmp}
                </span>
                <span style={{ marginLeft: 4, fontSize: 13 }}>{loc.wx}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {frame >= FOOTER_IN && (
          <div style={{
            marginTop: 16, paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            opacity: footerOp,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 11, color: '#475569' }}>
              {LOCS.length} locations
            </span>
            <span style={{ fontFamily: SANS, fontSize: 11, color: '#475569' }}>
              Updated just now ↻
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Terminal prompt row ────────────────────────────────────────────────────────

const TermRow: React.FC<{ frame: number; start: number; cmd: string; children?: React.ReactNode }> = ({
  frame, start, cmd, children,
}) => {
  if (frame < start) return null;
  const typed = typeAt(cmd, frame, start);
  const done  = isDone(cmd, frame, start);
  const cur   = Math.sin(frame * 0.45) > 0;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <span style={{ color: '#A78BFA', fontFamily: MONO, fontSize: 18, marginRight: 10 }}>~</span>
        <span style={{ color: '#34D399', fontFamily: MONO, fontSize: 18, marginRight: 10 }}>{'>'}</span>
        <span style={{ color: '#F1F5F9', fontFamily: MONO, fontSize: 18 }}>{typed}</span>
        {!done && (
          <span style={{
            display: 'inline-block', width: 10, height: 18,
            background: '#F1F5F9', opacity: cur ? 1 : 0,
            marginLeft: 2, verticalAlign: 'text-bottom',
          }} />
        )}
      </div>
      {children}
    </div>
  );
};

// ── Main scene ─────────────────────────────────────────────────────────────────

export const GlobeScene: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = ipl(frame, [0, 22], [0, 1]);
  const cur    = Math.sin(frame * 0.45) > 0;

  const resultOp = ipl(frame, [RESULT_IN, RESULT_IN + 10], [0, 1]);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#080C14', opacity: fadeIn,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Title bar */}
      <div style={{
        background: '#131620', padding: '14px 22px',
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 8, zIndex: 1 }}>
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div style={{
          position: 'absolute', left: 0, right: 0, textAlign: 'center',
          fontFamily: SANS, fontSize: 14, fontWeight: 500,
          color: 'rgba(255,255,255,0.45)', pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>🌐</span> world.globe
        </div>
        <div style={{ marginLeft: 'auto', zIndex: 1, color: '#C084FC', fontSize: 18 }}>✦</div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '38px 50px 44px',
        gap: 28,
      }}>
        {/* ~ globe */}
        <TermRow frame={frame} start={CMD1_START} cmd="globe" />

        {/* Middle: panel + globe */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flex: 1 }}>
          <LivePanel frame={frame} />
          <GlobeSVG frame={frame} />
        </div>

        {/* Bottom prompts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <TermRow frame={frame} start={CMD2_START} cmd="globe --live">
            {frame >= RESULT_IN && (
              <div style={{ opacity: resultOp, display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4, marginTop: 8 }}>
                <span style={{ color: '#34D399', fontSize: 18 }}>✓</span>
                <span style={{ fontFamily: MONO, fontSize: 17, color: '#94A3B8' }}>
                  Live <span style={{ color: '#34D399' }}>•</span> 152 users online
                </span>
              </div>
            )}
          </TermRow>

          {frame >= CUR_IN && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{ color: '#A78BFA', fontFamily: MONO, fontSize: 18, marginRight: 10 }}>~</span>
              <span style={{ color: '#34D399', fontFamily: MONO, fontSize: 18, marginRight: 10 }}>{'>'}</span>
              <span style={{
                display: 'inline-block', width: 10, height: 18,
                background: '#F1F5F9', opacity: cur ? 1 : 0,
                verticalAlign: 'text-bottom',
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
