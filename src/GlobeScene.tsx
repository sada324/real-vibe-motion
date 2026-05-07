import React from 'react';
import { interpolate, Easing } from 'remotion';

const SPRING = Easing.bezier(0.16, 1, 0.3, 1);
const EASE   = Easing.bezier(0.4, 0, 0.2, 1);

function ipl(f: number, io: [number, number], ft: [number, number], e = SPRING) {
  return interpolate(f, io, ft, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
}

const SANS = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

// ── Cities (positions in 800×400 equirectangular map space) ────────────────────
// label offsets (lx,ly) are from map-container top-left in rendered pixels

const CITIES = [
  { name: 'Montreal',      full: 'Montreal, CA',      flag: '🇨🇦', col: '#34D399', mx: 237, my:  99, lx: 178, ly:  48 },
  { name: 'Toronto',       full: 'Toronto, CA',        flag: '🇨🇦', col: '#34D399', mx: 224, my: 103, lx:  35, ly:  75 },
  { name: 'New York',      full: 'New York, US',       flag: '🇺🇸', col: '#60A5FA', mx: 236, my: 110, lx: 255, ly:  98 },
  { name: 'Los Angeles',   full: 'Los Angeles, US',    flag: '🇺🇸', col: '#60A5FA', mx: 137, my: 124, lx:   5, ly: 118 },
  { name: 'London',        full: 'London, UK',         flag: '🇬🇧', col: '#A78BFA', mx: 400, my:  86, lx: 478, ly:  40 },
  { name: 'Tokyo',         full: 'Tokyo, JP',          flag: '🇯🇵', col: '#F472B6', mx: 710, my: 121, lx: 738, ly:  98 },
];

// ── Continent polygons (800×400 equirectangular, approximate) ─────────────────

const POLYS: Record<string, string> = {
  northAmerica:
    '72,52 95,38 125,30 155,26 178,28 196,38 212,46 232,50 258,52 275,58 282,72 282,90 275,112 280,132 274,155 262,178 248,196 226,215 200,226 172,228 148,218 128,206 105,188 82,165 68,142 58,115 60,85',
  greenland:
    '272,22 302,18 328,22 336,36 332,52 320,68 305,80 285,85 272,72',
  cuba:
    '195,188 208,185 222,188 228,195 218,200 202,198',
  southAmerica:
    '148,220 172,215 195,218 218,228 235,245 245,268 248,295 242,322 228,348 208,368 188,378 168,372 152,352 140,325 135,298 135,270 138,248',
  europe:
    '352,48 370,40 392,38 412,42 428,50 438,62 442,78 436,95 428,110 418,122 402,132 382,138 362,130 348,118 344,102 345,82 348,62',
  scandinavia:
    '388,28 398,22 412,26 418,38 412,52 400,58 388,50 382,38',
  uk:
    '364,55 376,52 380,60 376,74 365,78 358,68',
  africa:
    '348,145 375,138 405,140 435,148 458,162 475,185 485,215 488,248 480,282 466,315 445,342 418,360 392,365 368,355 348,332 335,305 330,275 332,245 338,218 342,190 344,165',
  madagascar:
    '448,295 458,288 465,298 462,318 452,325 444,315',
  asia:
    '440,30 492,22 548,18 602,22 652,28 702,32 742,40 768,55 778,75 775,102 765,125 752,148 735,168 712,182 688,198 658,210 625,218 592,222 562,220 532,212 505,202 480,188 458,172 446,155 442,135 445,112 448,90 444,68',
  india:
    '492,150 525,145 552,150 562,168 562,192 552,215 532,230 512,235 496,222 488,200 488,175',
  sriLanka:
    '528,240 535,238 538,248 530,252',
  seAsia:
    '622,198 652,195 680,202 688,222 680,242 658,255 632,255 618,240 615,218',
  japan:
    '702,88 718,85 728,92 726,108 716,118 702,115',
  korea:
    '688,100 700,95 706,102 702,114 692,116 685,108',
  taiwan:
    '680,155 688,150 694,158 690,168 682,165',
  australia:
    '618,268 648,260 682,262 710,272 726,290 730,312 720,335 702,350 672,358 642,352 618,335 610,310 608,285',
  newZealand:
    '745,312 755,305 762,315 758,328 748,332 742,322',
};

// ── Timing ─────────────────────────────────────────────────────────────────────

const MAP_IN    = 5;
const HEADER_IN = 18;
const COUNT_IN  = 32;
const LOC_START = 52;
const LOC_GAP   = 24;

// Map is 1040×520 in the video (scaled from 800×400 viewBox)
const MAP_W = 1040;
const MAP_H = 520;

// ── Scene ──────────────────────────────────────────────────────────────────────

export const GlobeScene: React.FC<{ frame: number }> = ({ frame }) => {
  const mapOp    = ipl(frame, [MAP_IN, MAP_IN + 20], [0, 1]);
  const mapScale = ipl(frame, [MAP_IN, MAP_IN + 28], [0.96, 1], SPRING);
  const headerOp = ipl(frame, [HEADER_IN, HEADER_IN + 18], [0, 1]);
  const countVal = Math.min(Math.round(ipl(frame, [COUNT_IN, COUNT_IN + 22], [0, 152], EASE)), 152);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      fontFamily: SANS,
    }}>

      {/* ── Header ── */}
      <div style={{
        opacity: headerOp,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 110, paddingBottom: 44,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: '#34D399',
            boxShadow: '0 0 10px rgba(52,211,153,0.85)',
          }} />
          <span style={{
            fontSize: 13, fontWeight: 600, letterSpacing: '0.16em', color: '#9CA3AF',
            textTransform: 'uppercase',
          }}>
            Live Users
          </span>
        </div>
        <div style={{
          fontSize: 100, fontWeight: 700, color: '#111827',
          letterSpacing: '-5px', lineHeight: 1,
        }}>
          {countVal}
        </div>
        <div style={{
          fontSize: 18, fontWeight: 300, color: '#D1D5DB',
          marginTop: 14, letterSpacing: '0.02em',
        }}>
          trading live · worldwide
        </div>
      </div>

      {/* ── Map container ── */}
      <div style={{
        position: 'relative',
        width: MAP_W, height: MAP_H,
        opacity: mapOp,
        transform: `scale(${mapScale})`,
        transformOrigin: 'center center',
        flexShrink: 0,
      }}>
        <svg
          width={MAP_W} height={MAP_H}
          viewBox="0 0 800 400"
          style={{ display: 'block', borderRadius: 16, overflow: 'hidden' }}
        >
          {/* Ocean */}
          <rect width={800} height={400} fill="#F0F7FF" />

          {/* Subtle lat/lon grid */}
          <g stroke="#E0EEFF" strokeWidth="0.4" fill="none" opacity="0.8">
            {[100,200,300,400,500,600,700].map(x => <line key={x} x1={x} y1={0} x2={x} y2={400} />)}
            {[100,200,300].map(y => <line key={y} x1={0} y1={y} x2={800} y2={y} />)}
          </g>

          {/* Continents */}
          {Object.entries(POLYS).map(([key, pts]) => (
            <polygon key={key} points={pts}
              fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.7" strokeLinejoin="round" />
          ))}

          {/* City dots */}
          {CITIES.map((city, i) => {
            const showAt = LOC_START + i * LOC_GAP;
            if (frame < showAt) return null;
            const age = frame - showAt;
            const sc  = ipl(Math.min(age, 14), [0, 14], [0, 1], SPRING);
            const pulse = frame >= showAt ? 1 + 0.28 * Math.sin(age * 0.2) : 0;
            return (
              <g key={city.name}>
                {/* outer glow */}
                <circle cx={city.mx} cy={city.my} r={11 * pulse * sc} fill={city.col} opacity={0.18} />
                {/* mid ring */}
                <circle cx={city.mx} cy={city.my} r={6 * sc} fill={city.col} opacity={0.35} />
                {/* solid dot */}
                <circle cx={city.mx} cy={city.my} r={3.5 * sc} fill={city.col} />
              </g>
            );
          })}
        </svg>

        {/* ── Floating city labels (abs positioned over map) ── */}
        {CITIES.map((city, i) => {
          const showAt = LOC_START + i * LOC_GAP;
          if (frame < showAt) return null;
          const age = frame - showAt;
          const op = ipl(Math.min(age, 14), [0, 14], [0, 1], SPRING);
          const sc = ipl(Math.min(age, 14), [0, 14], [0.82, 1], SPRING);
          return (
            <div key={city.name} style={{
              position: 'absolute',
              left: city.lx,
              top:  city.ly,
              opacity: op,
              transform: `scale(${sc})`,
              transformOrigin: 'left bottom',
              pointerEvents: 'none',
            }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: 9,
                padding: '7px 11px',
                boxShadow: '0 2px 14px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: 7,
                whiteSpace: 'nowrap',
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: city.col, flexShrink: 0,
                  boxShadow: `0 0 6px ${city.col}99`,
                }} />
                <span style={{
                  fontSize: 13, fontWeight: 600, color: '#1F2937',
                  fontFamily: SANS,
                }}>
                  {city.name}
                </span>
                <span style={{ fontSize: 14 }}>{city.flag}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── City chips below the map ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 14,
        justifyContent: 'center',
        maxWidth: 1040,
        padding: '36px 20px 0',
      }}>
        {CITIES.map((city, i) => {
          const showAt = LOC_START + i * LOC_GAP + 10;
          if (frame < showAt) return null;
          const op = ipl(frame, [showAt, showAt + 12], [0, 1]);
          const ty = ipl(frame, [showAt, showAt + 16], [14, 0], SPRING);
          return (
            <div key={city.full} style={{
              opacity: op, transform: `translateY(${ty}px)`,
              background: '#F9FAFB',
              border: '1px solid #F3F4F6',
              borderRadius: 50,
              padding: '12px 22px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: city.col,
                boxShadow: `0 0 7px ${city.col}99`,
              }} />
              <span style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>
                {city.full}
              </span>
              <span style={{ fontSize: 16 }}>{city.flag}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};
