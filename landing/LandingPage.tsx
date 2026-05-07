import React from 'react';
import { Player } from '@remotion/player';
import { HermesVideo } from '../src/HermesVideo';
import { MembersLiveVideo } from '../src/MembersLiveVideo';

export const LandingPage: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    background: '#F5F5F7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '52px 24px 80px',
    fontFamily: "'Inter', -apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
  }}>
    {/* Nav */}
    <header style={{
      width: '100%', maxWidth: 960,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 80,
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.24em', color: '#1D1D1F' }}>
        HERMES
      </span>
      <span style={{ fontSize: 13, fontWeight: 300, color: '#6E6E73', letterSpacing: '0.04em' }}>
        Swing Trading Intelligence
      </span>
    </header>

    {/* Hero */}
    <div style={{ textAlign: 'center', marginBottom: 20, maxWidth: 640 }}>
      <h1 style={{
        fontSize: 'clamp(38px, 6vw, 60px)', fontWeight: 200,
        letterSpacing: '-0.03em', lineHeight: 1.1,
        color: '#1D1D1F', margin: '0 0 18px',
      }}>
        See the market<br />
        <span style={{ color: '#5AC8FA' }}>differently.</span>
      </h1>
      <p style={{ fontSize: 17, fontWeight: 300, color: '#6E6E73', lineHeight: 1.65, margin: 0 }}>
        A 15-second cinematic look at how HERMES reads swing-trading setups.
      </p>
    </div>

    {/* Teal hairline */}
    <div style={{
      width: 260, height: 1,
      background: 'linear-gradient(90deg, transparent, #5AC8FA 50%, transparent)',
      opacity: 0.55, marginBottom: 52,
    }} />

    {/* Video */}
    <div style={{
      borderRadius: 28, overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)',
      maxWidth: 320, width: '100%',
      background: '#fff',
    }}>
      <Player
        component={HermesVideo}
        durationInFrames={750}
        fps={30}
        compositionWidth={1080}
        compositionHeight={1920}
        style={{ width: '100%', borderRadius: 28, display: 'block' }}
        controls
        loop
        autoPlay={false}
      />
    </div>

    <p style={{
      marginTop: 20, fontSize: 11,
      color: '#D1D1D6', letterSpacing: '0.14em', textAlign: 'center',
    }}>
      PRESS PLAY TO WATCH ↑
    </p>

    {/* Members Live Video */}
    <div style={{ marginTop: 64, textAlign: 'center' }}>
      <p style={{ fontSize: 11, color: '#D1D1D6', letterSpacing: '0.14em', marginBottom: 20 }}>
        LIVE COMMUNITY
      </p>
      <div style={{
        borderRadius: 28, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)',
        maxWidth: 320, width: '100%',
        background: '#fff',
        margin: '0 auto',
      }}>
        <Player
          component={MembersLiveVideo}
          durationInFrames={580}
          fps={30}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{ width: '100%', borderRadius: 28, display: 'block' }}
          controls
          loop
          autoPlay={false}
        />
      </div>
    </div>

    {/* Stats card */}
    <div style={{
      display: 'flex', gap: 0, marginTop: 64,
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 2px 20px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}>
      {[
        { label: 'WIN RATE', value: '74%',   color: '#34C759' },
        { label: 'AVG R:R',  value: '2.8×',  color: '#5AC8FA' },
        { label: 'MAX DD',   value: '−6.2%', color: '#FF3B30' },
      ].map((stat, i) => (
        <div key={stat.label} style={{
          textAlign: 'center',
          padding: '28px 44px',
          borderRight: i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none',
        }}>
          <div style={{
            fontSize: 30, fontWeight: 700, color: stat.color,
            letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
          }}>
            {stat.value}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 500, color: '#6E6E73',
            letterSpacing: '0.12em', marginTop: 5,
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
          fontSize: 12, fontWeight: 400, letterSpacing: '0.05em', color: '#6E6E73',
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 100, padding: '7px 18px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          {label}
        </span>
      ))}
    </div>

    <footer style={{
      marginTop: 80, fontSize: 11, color: '#D1D1D6',
      letterSpacing: '0.12em', textAlign: 'center',
    }}>
      © 2026 HERMES — ALL RIGHTS RESERVED
    </footer>
  </div>
);
