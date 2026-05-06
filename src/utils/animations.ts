import { interpolate, spring, Easing } from 'remotion';

export const EASE_OUT   = Easing.bezier(0.16, 1, 0.30, 1);
export const EASE_IN    = Easing.bezier(0.55, 0, 1, 0.45);
export const EASE_INOUT = Easing.bezier(0.87, 0, 0.13, 1);
export const EASE_CIRC  = Easing.bezier(0.00, 0.55, 0.45, 1);

export type SpringCfg = { damping?: number; stiffness?: number; mass?: number; overshootClamping?: boolean };

export const SPRING: Record<string, SpringCfg> = {
  cinematic: { damping: 120, stiffness:  80, mass: 1.2 },
  gentle:    { damping: 100, stiffness: 110, mass: 1.0 },
  snappy:    { damping:  80, stiffness: 260, mass: 0.8 },
  float:     { damping: 200, stiffness:  40, mass: 1.0 },
};

export function fadeIn(frame: number, start: number, dur = 20): number {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });
}

export function fadeOut(frame: number, start: number, dur = 15): number {
  return interpolate(frame, [start, start + dur], [1, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_IN,
  });
}

export function sceneFade(
  frame: number,
  duration: number,
  fadeInDur = 15,
  fadeOutStart = -1,
  fadeOutDur = 15,
): number {
  const foStart = fadeOutStart < 0 ? duration - fadeOutDur : fadeOutStart;
  const inVal  = fadeIn(frame, 0, fadeInDur);
  const outVal = fadeOut(frame, foStart, fadeOutDur);
  return Math.min(inVal, outVal);
}

export function slide(frame: number, start: number, dur = 20, dist = 40): number {
  return interpolate(frame, [start, start + dur], [dist, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });
}

export function springVal(
  frame: number,
  start: number,
  fps: number,
  from = 0,
  to = 1,
  cfg: SpringCfg = SPRING.cinematic,
): number {
  return spring({ fps, frame: frame - start, config: cfg, from, to });
}

export function osc(frame: number, amp: number, period: number, phase = 0): number {
  return amp * Math.sin((frame / period) * Math.PI * 2 + phase);
}

export function remap(
  frame: number,
  inRange: [number, number],
  outRange: [number, number],
  ease = EASE_OUT,
): number {
  return interpolate(frame, inRange, outRange, {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
}
