import React from 'react';

interface Props {
  x: number;
  y: number;
  size?: number;
  color?: string;
  opacity?: number;
  blur?: number;
}

export const GlowOrb: React.FC<Props> = ({
  x, y, size = 500, color = '#3B82F6', opacity = 0.14, blur = 140,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - size / 2,
      top:  y - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      opacity,
      filter: `blur(${blur}px)`,
      pointerEvents: 'none',
    }}
  />
);
