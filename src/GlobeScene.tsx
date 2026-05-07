import React, { useRef, useEffect, useMemo } from 'react';
import { interpolate, Easing } from 'remotion';

const SPRING = Easing.bezier(0.16, 1, 0.3, 1);
const EASE   = Easing.bezier(0.4, 0, 0.2, 1);

function ipl(f: number, io: [number,number], ft: [number,number], e = SPRING) {
  return interpolate(f, io, ft, { extrapolateLeft:'clamp', extrapolateRight:'clamp', easing: e });
}
function typeAt(text: string, frame: number, start: number, speed = 1.8) {
  return text.slice(0, Math.max(0, Math.floor((frame - start) * speed)));
}

// Deterministic seeded random (no Math.random — must be stable per-frame)
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Data ──────────────────────────────────────────────────────────────────────

const LOCATIONS = [
  { id:'mtl', name:'Montreal',    country:'CA', flag:'🇨🇦', color:'#22c55e', temp:12, weather:'☁',  time:'9:41 AM',  lat:45.5, lon:-73.6 },
  { id:'tor', name:'Toronto',     country:'CA', flag:'🇨🇦', color:'#22c55e', temp:12, weather:'☁',  time:'9:41 AM',  lat:43.7, lon:-79.4 },
  { id:'nyc', name:'New York',    country:'US', flag:'🇺🇸', color:'#3b82f6', temp:18, weather:'⛅', time:'9:41 AM',  lat:40.7, lon:-74.0 },
  { id:'lax', name:'Los Angeles', country:'US', flag:'🇺🇸', color:'#ec4899', temp:20, weather:'☀',  time:'6:41 AM',  lat:34.0, lon:-118.2},
  { id:'lon', name:'London',      country:'UK', flag:'🇬🇧', color:'#3b82f6', temp:12, weather:'☁',  time:'2:41 PM',  lat:51.5, lon:-0.1  },
  { id:'tok', name:'Tokyo',       country:'JP', flag:'🇯🇵', color:'#ec4899', temp:18, weather:'☀',  time:'10:41 PM', lat:35.7, lon:139.7 },
];

const CLUSTERS = [
  {lat:40.7,lon:-74,   s:30},{lat:51.5,lon:-0.1, s:25},{lat:35.7,lon:139.7,s:28},
  {lat:37.8,lon:144.9, s:18},{lat:1.3, lon:103.8,s:15},{lat:48.9,lon:2.3,  s:20},
  {lat:52.5,lon:13.4,  s:18},{lat:-33.9,lon:151.2,s:15},{lat:19.4,lon:-99.1,s:22},
  {lat:55.7,lon:37.6,  s:20},{lat:41.0,lon:28.9, s:18},{lat:23.1,lon:113.3,s:25},
  {lat:31.2,lon:121.5, s:25},{lat:22.3,lon:114.2,s:22},{lat:34.1,lon:-118.2,s:20},
  {lat:37.8,lon:-122.4,s:15},{lat:45.5,lon:-73.6,s:18},{lat:43.7,lon:-79.4,s:16},
  {lat:28.6,lon:77.2,  s:22},{lat:12.9,lon:77.6, s:18},{lat:6.5, lon:3.4,  s:16},
  {lat:-23.5,lon:-46.6,s:20},{lat:-34.6,lon:-58.4,s:16},{lat:30.0,lon:31.2,s:18},
  {lat:24.7,lon:46.7,  s:15},{lat:25.2,lon:55.3, s:18},{lat:59.9,lon:10.7,s:12},
  {lat:57.2,lon:25.2,  s:10},{lat:64.1,lon:-21.9,s:8},
];

// ── Layout ────────────────────────────────────────────────────────────────────

const CHROME_H = 50;
const TERM_H   = 148;
const CANVAS_W = 1080;
const CANVAS_H = 1920 - CHROME_H - TERM_H;  // 1722
const CX = CANVAS_W / 2;
const CY = CANVAS_H / 2;
const R  = Math.min(CANVAS_W, CANVAS_H) * 0.43; // ≈ 464

// ── Timing ────────────────────────────────────────────────────────────────────

const GLOBE_IN   = 5;
const SIDE_IN    = 14;
const COUNT_IN   = 22;
const LOC_START  = 38;
const LOC_GAP    = 22;
const FOOTER_IN  = LOC_START + LOCATIONS.length * LOC_GAP + 8;  // 174
const CMD_START  = FOOTER_IN + 16;   // 190
const RESULT_IN  = CMD_START + 22;   // 212
const CUR_IN     = RESULT_IN + 14;   // 226

// ── Globe math ────────────────────────────────────────────────────────────────

function ll2xy(lat: number, lon: number, rotY: number, cx: number, cy: number, r: number) {
  const phi   = (90 - lat) * Math.PI / 180;
  const theta = (lon + rotY * 180 / Math.PI) * Math.PI / 180;
  const x3 = r * Math.sin(phi) * Math.cos(theta);
  const y3 = r * Math.cos(phi);
  const z3 = r * Math.sin(phi) * Math.sin(theta);
  return { x: cx + x3, y: cy - y3, z: z3 };
}

// ── Canvas draw ───────────────────────────────────────────────────────────────

function drawGlobe(canvas: HTMLCanvasElement, rotY: number, opacity: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.globalAlpha = opacity;

  // Base sphere gradient
  const g = ctx.createRadialGradient(CX - R*0.2, CY - R*0.2, R*0.08, CX, CY, R*1.1);
  g.addColorStop(0,   '#1a1a3a');
  g.addColorStop(0.6, '#0a0a20');
  g.addColorStop(1,   '#040410');
  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI*2); ctx.fillStyle = g; ctx.fill();

  // Clip to sphere
  ctx.save();
  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI*2); ctx.clip();

  // Lat / lon grid
  ctx.strokeStyle = 'rgba(100,120,200,0.06)'; ctx.lineWidth = 0.7;
  for (let i = 0; i <= 12; i++) {
    const lat = -90 + i * 15;
    ctx.beginPath(); let first = true;
    for (let lon = -180; lon <= 180; lon += 2) {
      const p = ll2xy(lat, lon, rotY, CX, CY, R);
      if (p.z > 0) { first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); first = false; }
      else { first = true; }
    }
    ctx.stroke();
  }
  for (let lon = -180; lon < 180; lon += 15) {
    ctx.beginPath(); let first = true;
    for (let lt = -90; lt <= 90; lt += 2) {
      const p = ll2xy(lt, lon, rotY, CX, CY, R);
      if (p.z > 0) { first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); first = false; }
      else { first = true; }
    }
    ctx.stroke();
  }

  // City lights (deterministic seeded positions)
  CLUSTERS.forEach((c, ci) => {
    const n = Math.floor(c.s * 1.5);
    for (let j = 0; j < n; j++) {
      const dlat = (sr(ci*1000 + j*2)     - 0.5) * 4;
      const dlon = (sr(ci*1000 + j*2 + 1) - 0.5) * 6;
      const p = ll2xy(c.lat + dlat, c.lon + dlon, rotY, CX, CY, R);
      if (p.z > 0) {
        const bright = 0.4 + sr(ci*1000 + j*2 + 2) * 0.6;
        const dotR   = sr(ci*1000 + j*2 + 3) * 1.2 + 0.3;
        ctx.beginPath(); ctx.arc(p.x, p.y, dotR, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,218,130,${bright * 0.72})`; ctx.fill();
      }
    }
  });

  ctx.restore();

  // Atmosphere glow
  const atm = ctx.createRadialGradient(CX, CY, R*0.95, CX, CY, R*1.07);
  atm.addColorStop(0, 'rgba(60,100,255,0.13)'); atm.addColorStop(1, 'rgba(60,100,255,0)');
  ctx.beginPath(); ctx.arc(CX, CY, R*1.07, 0, Math.PI*2); ctx.fillStyle = atm; ctx.fill();

  // Specular shimmer
  const sh = ctx.createRadialGradient(CX - R*0.35, CY - R*0.3, 0, CX - R*0.1, CY - R*0.1, R*0.7);
  sh.addColorStop(0, 'rgba(120,150,255,0.06)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI*2); ctx.fillStyle = sh; ctx.fill();

  ctx.globalAlpha = 1;
}

// ── Collision resolution ──────────────────────────────────────────────────────

function resolveCollisions(pins: Array<{sx:number,sy:number,[k:string]:any}>) {
  const PIN_W = 170, PIN_H = 50;
  const rects = pins.map(p => ({...p, dx: 0, dy: 0}));
  for (let iter = 0; iter < 25; iter++) {
    for (let i = 0; i < rects.length; i++) {
      for (let j = i+1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        const ax = a.sx + a.dx - PIN_W/2, ay = a.sy + a.dy - PIN_H/2;
        const bx = b.sx + b.dx - PIN_W/2, by = b.sy + b.dy - PIN_H/2;
        const ox = (ax + PIN_W) - bx, oy = (ay + PIN_H) - by;
        if (ox > 0 && oy > 0 && bx - ax < PIN_W && by - ay < PIN_H) {
          if (Math.abs(ox) < Math.abs(oy)) { const push = ox/2+5; a.dx -= push; b.dx += push; }
          else                              { const push = oy/2+5; a.dy -= push; b.dy += push; }
        }
      }
    }
  }
  return rects.map(r => ({...r, fx: r.sx + r.dx, fy: r.sy + r.dy}));
}

// ── Component ─────────────────────────────────────────────────────────────────

const MONO = "'SF Mono','Fira Code',monospace";

export const GlobeScene: React.FC<{ frame: number }> = ({ frame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rotY       = -0.5 + frame * 0.003;
  const globeOp    = ipl(frame, [GLOBE_IN, GLOBE_IN + 28], [0, 1]);
  const sideOp     = ipl(frame, [SIDE_IN, SIDE_IN + 18], [0, 1]);
  const sideTx     = ipl(frame, [SIDE_IN, SIDE_IN + 22], [-22, 0], SPRING);
  const countVal   = Math.min(Math.round(ipl(frame, [COUNT_IN, COUNT_IN+22], [0, 152], EASE)), 152);
  const footerOp   = ipl(frame, [FOOTER_IN, FOOTER_IN+12], [0, 1]);
  const cmd2Text   = typeAt('globe --live', frame, CMD_START);
  const resultOp   = ipl(frame, [RESULT_IN, RESULT_IN+10], [0, 1]);
  const cur        = Math.sin(frame * 0.45) > 0;

  // Draw globe on every frame
  useEffect(() => {
    if (canvasRef.current) drawGlobe(canvasRef.current, rotY, globeOp);
  });

  // City pin positions (pure math, no state)
  const pins = useMemo(() => {
    const visible = LOCATIONS
      .map((loc, i) => {
        const showAt = LOC_START + i * LOC_GAP;
        if (frame < showAt) return null;
        const p = ll2xy(loc.lat, loc.lon, rotY, CX, CY, R);
        if (p.z < R * 0.15) return null;
        return { ...loc, sx: p.x, sy: p.y, showAt };
      })
      .filter(Boolean) as Array<typeof LOCATIONS[0] & {sx:number,sy:number,showAt:number}>;
    return resolveCollisions(visible);
  }, [frame, rotY]);

  return (
    <div style={{ width:'100%', height:'100%', background:'#0a0a0f', display:'flex', flexDirection:'column', fontFamily: MONO }}>

      {/* ── Browser chrome ── */}
      <div style={{
        height: CHROME_H, background:'#1a1a1f',
        borderBottom:'1px solid #2a2a35',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 20px', flexShrink: 0,
      }}>
        <div style={{ display:'flex', gap:7 }}>
          {['#ff5f57','#febc2e','#28c840'].map((c,i) => (
            <div key={i} style={{ width:13, height:13, borderRadius:'50%', background:c }} />
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'#111118', border:'1px solid #2a2a35', borderRadius:7, padding:'5px 14px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
          <span style={{ fontSize:12, color:'#888' }}>world.globe</span>
        </div>
        <span style={{ color:'#c084fc', fontSize:16 }}>✦</span>
      </div>

      {/* ── Content area (globe + sidebar + pins) ── */}
      <div style={{ flex:1, position:'relative', minHeight:0 }}>

        {/* Globe canvas — fills content area */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block' }}
        />

        {/* Sidebar overlaid top-left */}
        <div style={{
          position:'absolute', top:24, left:24,
          width:290, zIndex:10,
          opacity: sideOp,
          transform: `translateX(${sideTx}px)`,
        }}>
          {/* ~ globe prompt */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ width:28, height:28, background:'#7c3aed', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🍎</div>
            <span style={{ fontSize:14, color:'#7c3aed' }}>~ </span>
            <span style={{ fontSize:14, color:'#34d399' }}>globe</span>
          </div>

          {/* Card */}
          <div style={{
            background:'rgba(15,15,25,0.88)',
            border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:12, padding:'14px 16px',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px #22c55e66' }} />
              <span style={{ fontSize:10, letterSpacing:'0.12em', color:'#555', textTransform:'uppercase' }}>Live Users</span>
            </div>
            <div style={{ fontSize:36, fontWeight:300, color:'#e5e5f0', lineHeight:1, marginBottom:14 }}>
              {countVal}
            </div>
            <div style={{ fontSize:10, letterSpacing:'0.1em', color:'#444', textTransform:'uppercase', marginBottom:8 }}>Locations</div>

            {LOCATIONS.map((loc, i) => {
              const showAt = LOC_START + i * LOC_GAP;
              if (frame < showAt) return null;
              const rowOp = ipl(frame, [showAt, showAt+10], [0, 1]);
              return (
                <div key={loc.id} style={{
                  display:'flex', alignItems:'center', gap:6,
                  padding:'4px 0',
                  borderBottom: i < LOCATIONS.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  opacity: rowOp,
                }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:loc.color, flexShrink:0 }} />
                  <span style={{ fontSize:11.5, color:'#b0b0c0', flex:1 }}>{loc.name}, {loc.country}</span>
                  <span style={{ fontSize:13 }}>{loc.flag}</span>
                  <span style={{ fontSize:11, color:'#555' }}>{loc.time}</span>
                  <span style={{ fontSize:11, color:'#888', minWidth:24, textAlign:'right' }}>{loc.temp}°</span>
                  <span style={{ fontSize:13 }}>{loc.weather}</span>
                </div>
              );
            })}

            {frame >= FOOTER_IN && (
              <div style={{
                display:'flex', justifyContent:'space-between',
                marginTop:10, paddingTop:8,
                borderTop:'1px solid rgba(255,255,255,0.05)',
                opacity: footerOp,
              }}>
                <span style={{ fontSize:10, color:'#444' }}>6 locations</span>
                <span style={{ fontSize:10, color:'#444' }}>Updated just now ↻</span>
              </div>
            )}
          </div>
        </div>

        {/* City pins */}
        {pins.map((pin) => {
          const age  = frame - pin.showAt;
          const pinOp = ipl(Math.min(age,14), [0,14], [0,1], SPRING);
          const ddx  = pin.fx - pin.sx, ddy = pin.fy - pin.sy;
          const dist = Math.sqrt(ddx*ddx + ddy*ddy);

          return (
            <div key={pin.id} style={{
              position:'absolute',
              left: pin.fx, top: pin.fy,
              transform:'translate(-50%,-50%)',
              opacity: pinOp, zIndex:20,
              pointerEvents:'none',
            }}>
              {dist > 10 && (
                <svg style={{ position:'absolute', overflow:'visible', top:0, left:0, pointerEvents:'none' }} width={1} height={1}>
                  <line x1={0} y1={0} x2={-ddx} y2={-ddy}
                    stroke={pin.color} strokeWidth={1} strokeOpacity={0.4} strokeDasharray="4 3" />
                </svg>
              )}
              <div style={{
                background:'rgba(10,10,20,0.88)',
                border:'1px solid rgba(255,255,255,0.13)',
                borderRadius:9, padding:'6px 10px',
                whiteSpace:'nowrap',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:pin.color, flexShrink:0 }} />
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:'#e0e0f0' }}>{pin.name}, {pin.country}</span>
                      <span style={{ fontSize:11 }}>{pin.flag}</span>
                    </div>
                    <div style={{ fontSize:10, color:'#666', display:'flex', gap:5, marginTop:2 }}>
                      <span>{pin.time}</span>
                      <span>{pin.weather}</span>
                      <span>{pin.temp}°</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Terminal section ── */}
      <div style={{
        height: TERM_H, background:'#0d0d15',
        borderTop:'1px solid rgba(255,255,255,0.06)',
        padding:'16px 22px',
        display:'flex', flexDirection:'column', justifyContent:'center',
        gap:10, flexShrink:0,
      }}>
        {frame >= CMD_START && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:22, height:22, background:'#7c3aed', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, flexShrink:0 }}>🍎</div>
            <span style={{ fontSize:12, color:'#7c3aed' }}>~</span>
            <span style={{ fontSize:12, color:'#34d399' }}>{cmd2Text}</span>
          </div>
        )}
        {frame >= RESULT_IN && (
          <div style={{ paddingLeft:30, opacity: resultOp, display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
            <span style={{ color:'#22c55e' }}>✓</span>
            <span style={{ color:'#22c55e' }}>Live</span>
            <span style={{ color:'#444' }}>·</span>
            <span style={{ color:'#888' }}>152 users online</span>
          </div>
        )}
        {frame >= CUR_IN && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:22, height:22, background:'#7c3aed', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>🍎</div>
            <span style={{ fontSize:12, color:'#7c3aed' }}>~</span>
            <div style={{ width:7, height:14, background:'#7c3aed', opacity: cur ? 1 : 0 }} />
          </div>
        )}
      </div>
    </div>
  );
};
