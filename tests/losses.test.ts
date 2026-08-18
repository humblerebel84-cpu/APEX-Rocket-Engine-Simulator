import { describe, expect, it } from 'vitest';
import {
  applyLosses,
  bellDivergenceEfficiency,
  conicalDivergenceEfficiency,
  DEFAULT_LOSSES,
  raoBellExitHalfAngleDeg,
  thrustLossFactor,
} from '../src/physics/losses';
import { computeDesign } from '../src/physics/performance';
import { PROPELLANTS } from '../src/physics/propellants';

const IDEAL = computeDesign(PROPELLANTS.lox_ch4, {
  Pc: 100e5,
  eps: 40,
  Pa: 0,
  At: Math.PI / 4 * 0.14 ** 2,
  dryMass: 3000,
  propMass: 17000,
});

describe('conicalDivergenceEfficiency', () => {
  it('is 1 for a zero half-angle nozzle', () => {
    expect(conicalDivergenceEfficiency(0)).toBe(1);
  });

  it('gives (1 + cos α)/2 for a conical nozzle (Sutton §12.3)', () => {
    expect(conicalDivergenceEfficiency(15)).toBeCloseTo((1 + Math.cos((15 * Math.PI) / 180)) / 2, 6);
    expect(conicalDivergenceEfficiency(30)).toBeCloseTo((1 + Math.cos((30 * Math.PI) / 180)) / 2, 6);
  });

  it('degrades monotonically with half-angle', () => {
    expect(conicalDivergenceEfficiency(10)).toBeGreaterThan(conicalDivergenceEfficiency(15));
    expect(conicalDivergenceEfficiency(15)).toBeGreaterThan(conicalDivergenceEfficiency(30));
  });

  it('clamps non-positive angles to 1', () => {
    expect(conicalDivergenceEfficiency(-5)).toBe(1);
  });
});

describe('raoBellExitHalfAngleDeg (Rao-optimized contour)', () => {
  it('matches published optimum-bell anchors (Huzel & Huang Fig. 4-7 / Sutton §3)', () => {
    expect(raoBellExitHalfAngleDeg(10)).toBeCloseTo(12, 0); // ε 10 → ~12°
    expect(raoBellExitHalfAngleDeg(25)).toBeCloseTo(10, 0); // ε 25 → ~10°
    expect(raoBellExitHalfAngleDeg(40)).toBeCloseTo(8, 0); // ε 40 → ~8°
    expect(raoBellExitHalfAngleDeg(100)).toBeCloseTo(5.5, 0); // ε 100 → ~5.5°
  });

  it('decreases monotonically with area ratio and flattens', () => {
    expect(raoBellExitHalfAngleDeg(10)).toBeGreaterThan(raoBellExitHalfAngleDeg(40));
    expect(raoBellExitHalfAngleDeg(40)).toBeGreaterThan(raoBellExitHalfAngleDeg(100));
    // nearly flat by very high area ratio (asymptote ≈ 4.5°)
    expect(raoBellExitHalfAngleDeg(500)).toBeCloseTo(4.5, 1);
  });

  it('stays finite for degenerate area ratios', () => {
    expect(raoBellExitHalfAngleDeg(0)).toBeLessThan(20);
    expect(raoBellExitHalfAngleDeg(1)).toBeLessThan(20);
  });
});

describe('bellDivergenceEfficiency', () => {
  it('is (1 + cos θ_e)/2 for the Rao exit angle', () => {
    expect(bellDivergenceEfficiency(40)).toBeCloseTo(
      (1 + Math.cos((raoBellExitHalfAngleDeg(40) * Math.PI) / 180)) / 2,
      6,
    );
  });

  it('beats a 15° conical nozzle at every realistic area ratio', () => {
    expect(bellDivergenceEfficiency(10)).toBeGreaterThan(conicalDivergenceEfficiency(15));
    expect(bellDivergenceEfficiency(40)).toBeGreaterThan(conicalDivergenceEfficiency(15));
    expect(bellDivergenceEfficiency(100)).toBeGreaterThan(conicalDivergenceEfficiency(15));
  });
});

describe('thrustLossFactor', () => {
  it('DEFAULT_LOSSES (15° conical) ≈ 0.983 × 0.97 ≈ 0.953', () => {
    expect(thrustLossFactor(DEFAULT_LOSSES, 40)).toBeCloseTo(0.983 * 0.97, 3);
  });

  it('a Rao bell recovers more thrust than the fixed cone (lossFactor closer to 1)', () => {
    const bell = { ...DEFAULT_LOSSES, geometry: 'bell' as const };
    expect(thrustLossFactor(bell, 40)).toBeGreaterThan(thrustLossFactor(DEFAULT_LOSSES, 40));
    expect(thrustLossFactor(bell, 40)).toBeCloseTo(bellDivergenceEfficiency(40) * 0.97, 6);
  });
});

describe('applyLosses', () => {
  it('scales thrust-like fields down and leaves throat flow untouched', () => {
    const r = applyLosses(IDEAL, DEFAULT_LOSSES);
    const f = thrustLossFactor(DEFAULT_LOSSES, IDEAL.expansionRatio);
    expect(r.F!).toBeCloseTo(IDEAL.F! * f, 6);
    expect(r.isp!).toBeCloseTo(IDEAL.isp! * f, 6);
    expect(r.cf!).toBeCloseTo(IDEAL.cf! * f, 6);
    expect(r.densityImpulse!).toBeCloseTo(IDEAL.densityImpulse! * f, 6);
    expect(r.dv).toBeCloseTo(IDEAL.dv * f, 6);
    expect(r.twr!).toBeCloseTo(IDEAL.twr! * f, 6);
    expect(r.lossFactor).toBeCloseTo(f, 6);
    // unaffected:
    expect(r.mdot).toBe(IDEAL.mdot);
    expect(r.cstar).toBe(IDEAL.cstar);
    expect(r.ve).toBe(IDEAL.ve);
    expect(r.Ae).toBe(IDEAL.Ae);
    expect(r.Pe).toBe(IDEAL.Pe);
    expect(r.Me).toBe(IDEAL.Me);
    expect(r.burnTime).toBe(IDEAL.burnTime);
  });

  it('applies the Rao bell factor at the report area ratio', () => {
    const bell = { ...DEFAULT_LOSSES, geometry: 'bell' as const };
    const r = applyLosses(IDEAL, bell);
    const f = thrustLossFactor(bell, IDEAL.expansionRatio);
    expect(r.lossFactor).toBeCloseTo(f, 6);
    expect(r.isp!).toBeCloseTo(IDEAL.isp! * f, 6);
    // bell engine keeps more Isp than the conical one
    expect(r.isp!).toBeGreaterThan(applyLosses(IDEAL, DEFAULT_LOSSES).isp!);
  });

  it('preserves null fields', () => {
    const bad = computeDesign(PROPELLANTS.lox_ch4, { Pc: 0, eps: 40, Pa: 0, At: 1e-4, dryMass: 1, propMass: 1 });
    const r = applyLosses(bad, DEFAULT_LOSSES);
    expect(r.F).toBeNull();
    expect(r.isp).toBeNull();
    expect(r.twr).toBeNull();
    expect(r.dv).toBe(0);
  });

  it('engine-level Isp is below the ideal (losses are a penalty)', () => {
    const r = applyLosses(IDEAL, DEFAULT_LOSSES);
    expect(r.isp!).toBeLessThan(IDEAL.isp!);
  });
});