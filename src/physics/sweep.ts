import type { Propellant } from './propellants';
import { computeDesign } from './performance';

export interface SweepPoint {
  x: number;
  y: number;
}

// Sweep helpers for design-space exploration. Pure and cheap (each point is one
// computeDesign call); the UI memoises the arrays and renders them as line charts.

export function sweepIspVsExpansion(
  prop: Propellant,
  Pc: number,
  Pa: number,
  n = 24,
  epsMin = 2,
  epsMax = 100,
): SweepPoint[] {
  const out: SweepPoint[] = [];
  for (let i = 0; i < n; i += 1) {
    const eps = epsMin + ((epsMax - epsMin) * i) / (n - 1);
    const r = computeDesign(prop, { Pc, eps, Pa, At: 1e-4, dryMass: 1, propMass: 1 });
    if (r.isp !== null) out.push({ x: eps, y: r.isp });
  }
  return out;
}

export function sweepThrustVsPressure(
  prop: Propellant,
  eps: number,
  Pa: number,
  At: number,
  n = 24,
  pcMinBar = 10,
  pcMaxBar = 300,
): SweepPoint[] {
  const out: SweepPoint[] = [];
  for (let i = 0; i < n; i += 1) {
    const Pc = (pcMinBar + ((pcMaxBar - pcMinBar) * i) / (n - 1)) * 1e5;
    const r = computeDesign(prop, { Pc, eps, Pa, At, dryMass: 1, propMass: 1 });
    if (r.F !== null) out.push({ x: Pc / 1e5, y: r.F });
  }
  return out;
}