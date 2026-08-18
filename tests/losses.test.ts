import { describe, expect, it } from 'vitest';
import { applyLosses, DEFAULT_LOSSES, divergenceEfficiency, thrustLossFactor } from '../src/physics/losses';
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

describe('divergenceEfficiency', () => {
  it('is 1 for a zero half-angle nozzle', () => {
    expect(divergenceEfficiency(0)).toBe(1);
  });

  it('gives (1 + cos α)/2 for a conical nozzle (Sutton §12.3)', () => {
    expect(divergenceEfficiency(15)).toBeCloseTo((1 + Math.cos((15 * Math.PI) / 180)) / 2, 6);
    expect(divergenceEfficiency(30)).toBeCloseTo((1 + Math.cos((30 * Math.PI) / 180)) / 2, 6);
  });

  it('degrades monotonically with half-angle', () => {
    expect(divergenceEfficiency(10)).toBeGreaterThan(divergenceEfficiency(15));
    expect(divergenceEfficiency(15)).toBeGreaterThan(divergenceEfficiency(30));
  });

  it('clamps negative angles to 1', () => {
    expect(divergenceEfficiency(-5)).toBe(1);
  });
});

describe('thrustLossFactor', () => {
  it('DEFAULT_LOSSES ≈ 0.983 × 0.97 ≈ 0.953', () => {
    expect(thrustLossFactor(DEFAULT_LOSSES)).toBeCloseTo(0.983 * 0.97, 3);
  });
});

describe('applyLosses', () => {
  it('scales thrust-like fields down and leaves throat flow untouched', () => {
    const r = applyLosses(IDEAL, DEFAULT_LOSSES);
    const f = thrustLossFactor(DEFAULT_LOSSES);
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