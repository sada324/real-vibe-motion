import React from 'react';
import { Player } from '@remotion/player';
import { HermesVideo } from '../src/HermesVideo';

export const LandingPage: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '56px 24px 80px',
  }}>
    {/* Nav */}
    <header style={{
      width: '100%', maxWidth: 960,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 80,
    }}>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 14, fontWeight: 500, letterSpacing: '0.24em', color: '#fff',
      }}>
        HERMES
      </span>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 13, fontWeight: 300, color: '#8E8E93', letterSpacing: '0.04em',
      }}>
        Swing Trading Intelligence
      </span>
    </header>

    {/* Hero */}
    <div style={{ textAlign: 'center', marginBottom: 20, maxWidth: 640 }}>
      <h1 style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 'clamp(38px, 6vw, 58px)', fontWeight: 200,
        letterSpacing: '-0.03em', lineHeight: 1.12,
        color: '#fff', margin: '0 0 18px',
      }}>
        See the market<br />
        <span style={{ color: '#5AC8FA' }}>differently.</span>
      </h1>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 16, fontWeight: 300, color: '#8E8E93', lineHeight: 1.7, margin: 0,
      }}>
        A 15-second cinematic look at how HERMES reads swing-trading setups.
      </p>
    </div>

    {/* Teal hairline */}
    <div style={{
      width: 280, height: 1,
      background: 'linear-gradient(90deg, transparent, #5AC8FA 50%, transparent)',
      opacity: 0.45, marginBottom: 52,
    }} />

    {/* Video */}
    <div style={{
      position: 'relative',
      borderRadius: 22, overflow: 'hidden',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.7)',
      maxWidth: 340, width: '100%',
    }}>
      <div style={{
        position: 'absolute', inset: -60,
        background: 'radial-gradient(ellipse 55% 35% at 50% 50%, rgba(90,200,250,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Player
          component={HermesVideo}
          durationInFrames={450}
          fps={30}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{ width: '100%', borderRadius: 22 }}
          controls
          loop
          autoPlay={false}
        />
      </div>
    </div>

    <p style={{
      marginTop: 24,
      fontFamily: 'Inter, sans-serif', fontSize: 12,
      color: '#2C2C2E', letterSpacing: '0.12em', textAlign: 'center',
    }}>
      PRESS PLAY TO WATCH ↑
    </p>

    {/* Stats row */}
    <div style={{
      display: 'flex', gap: 48, marginTop: 72,
      padding: '28px 40px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
    }}>
      {[
        { label: 'WIN RATE', value: '74%',   color: '#34C759' },
        { label: 'AVG R:R',  value: '2.8×',  color: '#5AC8FA' },
        { label: 'MAX DD',   value: '−6.2%', color: '#FF3B30' },
      ].map(stat => (
        <div key={stat.label} style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 500,
            color: stat.color, letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {stat.value}
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 400,
            color: '#8E8E93', letterSpacing: '0.12em', marginTop: 4,
          }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>

    {/* Pills */}
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 10,
      marginTop: 40, justifyContent: 'center', maxWidth: 520,
    }}>
      {['Swing Trading Signals', 'Risk / Reward Clarity', 'Pattern Recognition', 'Calm Execution'].map(label => (
        <span key={label} style={{
          fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 300,
          letterSpacing: '0.06em', color: '#8E8E93',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 100, padding: '6px 16px',
        }}>
          {label}
        </span>
      ))}
    </div>

    {/* Footer */}
    <footer style={{
      marginTop: 80,
      fontFamily: 'Inter, sans-serif', fontSize: 11,
      color: '#2C2C2E', letterSpacing: '0.12em', textAlign: 'center',
    }}>
      © 2026 HERMES — ALL RIGHTS RESERVED
    </footer>
  </div>
);
