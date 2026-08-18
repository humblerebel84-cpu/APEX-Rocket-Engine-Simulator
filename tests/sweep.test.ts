import { describe, expect, it } from 'vitest';
import { sweepIspVsExpansion, sweepThrustVsPressure } from '../src/physics/sweep';
import { PROPELLANTS } from '../src/physics/propellants';

describe('sweepIspVsExpansion', () => {
  it('Isp rises monotonically with ε in vacuum (more expansion, more ve)', () => {
    const pts = sweepIspVsExpansion(PROPELLANTS.lox_ch4, 100e5, 0, 24);
    for (let i = 1; i < pts.length; i += 1) {
      expect(pts[i].y).toBeGreaterThan(pts[i - 1].y);
    }
  });

  it('covers the requested ε range with the requested point count and no NaN', () => {
    const pts = sweepIspVsExpansion(PROPELLANTS.lox_ch4, 100e5, 0, 24);
    expect(pts).toHaveLength(24);
    expect(pts[0].x).toBeCloseTo(2, 6);
    expect(pts[pts.length - 1].x).toBeCloseTo(100, 6);
    for (const p of pts) {
      expect(Number.isNaN(p.y)).toBe(false);
      expect(p.y).toBeGreaterThan(0);
    }
  });

  it('sea-level sweeps collapse after the separation regime (Pe < Pa → thrust loss)', () => {
    const vac = sweepIspVsExpansion(PROPELLANTS.lox_ch4, 100e5, 0, 24);
    const sl = sweepIspVsExpansion(PROPELLANTS.lox_ch4, 100e5, 1.01325e5, 24);
    expect(sl[sl.length - 1].y).toBeLessThan(vac[vac.length - 1].y);
  });
});

describe('sweepThrustVsPressure', () => {
  it('thrust rises monotonically with Pc at fixed ε / At', () => {
    const pts = sweepThrustVsPressure(PROPELLANTS.lox_rp1, 16, 1.01325e5, 0.01, 24);
    for (let i = 1; i < pts.length; i += 1) {
      expect(pts[i].y).toBeGreaterThan(pts[i - 1].y);
    }
  });

  it('sweeps the requested Pc range in bar with no NaN', () => {
    const pts = sweepThrustVsPressure(PROPELLANTS.lox_rp1, 16, 0, 0.01, 24);
    expect(pts).toHaveLength(24);
    expect(pts[0].x).toBeCloseTo(10, 6);
    expect(pts[pts.length - 1].x).toBeCloseTo(300, 6);
    for (const p of pts) {
      expect(Number.isNaN(p.y)).toBe(false);
      expect(p.y).toBeGreaterThan(0);
    }
  });
});