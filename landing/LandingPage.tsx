import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { HermesVideo } from '../src/HermesVideo';

export const LandingPage: React.FC = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #020408 0%, #06090f 50%, #020408 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 24px 80px',
    }}>
      {/* Nav bar */}
      <header style={{
        width: '100%',
        maxWidth: 960,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 72,
      }}>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: '0.22em',
          color: '#fff',
        }}>
          HERMES
        </span>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#72728A',
          letterSpacing: '0.05em',
        }}>
          Swing Trading Intelligence
        </span>
      </header>

      {/* Hero headline */}
      <div style={{ textAlign: 'center', marginBottom: 16, maxWidth: 600 }}>
        <h1 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: 200,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: '#fff',
          margin: '0 0 16px',
        }}>
          See the market<br />
          <span style={{ color: '#3B82F6' }}>differently.</span>
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          fontWeight: 300,
          color: '#72728A',
          lineHeight: 1.7,
          margin: 0,
        }}>
          A 15-second cinematic look at how HERMES reads swing-trading setups.
        </p>
      </div>

      {/* Glow accent */}
      <div style={{
        width: 320,
        height: 1,
        background: 'linear-gradient(90deg, transparent, #3B82F6 50%, transparent)',
        opacity: 0.4,
        marginBottom: 48,
      }} />

      {/* Video player */}
      <div style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 0 80px rgba(59,130,246,0.18), 0 0 0 1px rgba(255,255,255,0.06)',
        maxWidth: 360,
        width: '100%',
      }}>
        {/* Blue glow behind player */}
        <div style={{
          position: 'absolute',
          inset: -40,
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Player
            component={HermesVideo}
            durationInFrames={450}
            fps={30}
            compositionWidth={1080}
            compositionHeight={1920}
            style={{ width: '100%', borderRadius: 20 }}
            controls
            loop
            autoPlay={false}
          />
        </div>
      </div>

      {/* Caption below video */}
      <p style={{
        marginTop: 28,
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        color: '#2A2A38',
        letterSpacing: '0.1em',
        textAlign: 'center',
      }}>
        PRESS PLAY TO WATCH ↑
      </p>

      {/* Feature pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 64,
        justifyContent: 'center',
        maxWidth: 560,
      }}>
        {['Swing Trading Signals', 'Risk / Reward Clarity', 'Pattern Recognition', 'Calm Execution'].map(label => (
          <span key={label} style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: '#72728A',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 100,
            padding: '6px 16px',
          }}>
            {label}
          </span>
        ))}
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: 80,
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        color: '#2A2A38',
        letterSpacing: '0.1em',
        textAlign: 'center',
      }}>
        © 2026 HERMES — ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};
