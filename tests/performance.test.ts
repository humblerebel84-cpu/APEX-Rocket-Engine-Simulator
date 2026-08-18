import { describe, expect, it } from 'vitest';
import { computeDesign, deltaV, exhaustVelocity, specificImpulse, thrust } from '../src/physics/performance';
import { PROPELLANTS } from '../src/physics/propellants';

const DEFAULTS = {
  Pc: 100e5,
  eps: 40,
  Pa: 0,
  At: Math.PI / 4 * 0.14 ** 2,
  dryMass: 3000,
  propMass: 17000,
};

describe('exhaustVelocity', () => {
  it('computes a plausible LOX/CH4 vacuum exhaust velocity', () => {
    const ve = exhaustVelocity(PROPELLANTS.lox_ch4, 100e5, 0.5e5);
    expect(ve).toBeGreaterThan(3000);
    expect(ve).toBeLessThan(3500);
  });

  it('increases with expansion', () => {
    const low = exhaustVelocity(PROPELLANTS.lox_ch4, 100e5, 0.5e5);
    const high = exhaustVelocity(PROPELLANTS.lox_ch4, 100e5, 0.02e5);
    expect(high).toBeGreaterThan(low);
  });

  it('guards against invalid pressure ratios', () => {
    expect(exhaustVelocity(PROPELLANTS.lox_ch4, 1e5, 2e5)).toBe(0);
    expect(exhaustVelocity(PROPELLANTS.lox_ch4, 1e5, 0)).toBe(0);
    expect(exhaustVelocity(PROPELLANTS.lox_ch4, 0, 0)).toBe(0);
  });
});

describe('specificImpulse', () => {
  it('converts exhaust velocity using standard gravity', () => {
    expect(specificImpulse(9.80665 * 300)).toBeCloseTo(300, 6);
  });
});

describe('deltaV', () => {
  it('applies Tsiolkovsky equation', () => {
    const dv = deltaV(300, 3000, 1000);
    expect(dv).toBeCloseTo(300 * 9.80665 * Math.log(3), 6);
  });

  it('guards degenerate masses', () => {
    expect(deltaV(300, 1000, 1000)).toBe(0);
    expect(deltaV(300, 0, 0)).toBe(0);
    expect(deltaV(300, 1000, 2000)).toBe(0);
  });
});

describe('thrust', () => {
  it('includes pressure term', () => {
    expect(thrust(250, 3600, 0.5e5, 0, 0.8)).toBeCloseTo(250 * 3600 + 0.5e5 * 0.8, 3);
  });
});

describe('computeDesign', () => {
  it('derives ṁ, Pe, Ae from Pc / ε / At (coupling check)', () => {
    const r = computeDesign(PROPELLANTS.lox_ch4, DEFAULTS);
    expect(r.mdot).toBeCloseTo((DEFAULTS.Pc * DEFAULTS.At) / r.cstar, 6);
    expect(r.Ae!).toBeCloseTo(DEFAULTS.At * DEFAULTS.eps, 10);
    expect(r.Pe!).toBeLessThan(DEFAULTS.Pc);
  });

  it('matches pinned reference values (fidelity check)', () => {
    const r = computeDesign(PROPELLANTS.lox_ch4, DEFAULTS);
    expect(r.Me).not.toBeNull();
    expect(r.Me!).toBeCloseTo(4.183, 2);
    expect(r.Pe).not.toBeNull();
    expect(r.Pe!).toBeCloseTo(21712, 0);
    expect(r.ve).toBeCloseTo(3513.4, 0);
    expect(r.cstar).toBeCloseTo(1943.0, 0);
    expect(r.mdot!).toBeCloseTo(79.23, 0);
    expect(r.Ae!).toBeCloseTo(0.61575, 4);
    expect(r.F!).toBeCloseTo(291725, -1);
    expect(r.isp!).toBeCloseTo(375.48, 0);
    expect(r.cf!).toBeCloseTo(1.895, 2);
    expect(r.burnTime).toBeCloseTo(214.57, 0);
    expect(r.m0).toBe(20000);
    expect(r.mf).toBe(3000);
    expect(r.massRatio!).toBeCloseTo(20000 / 3000, 6);
    expect(r.dv).toBeCloseTo(6985.5, 0);
    expect(r.twr!).toBeCloseTo(1.487, 1);
    expect(r.warnings.filter((w) => w.id !== 'low-twr')).toHaveLength(0);
  });

  it('sea-level ambient subtracts pressure thrust and warns when over-expanded', () => {
    const r = computeDesign(PROPELLANTS.lox_ch4, { ...DEFAULTS, Pa: 1.01325e5 });
    expect(r.F!).toBeCloseTo(229334, -2);
    expect(r.isp!).toBeCloseTo(295.17, 0);
    expect(r.warnings.some((w) => w.id === 'over-expanded')).toBe(true);
    expect(r.warnings.some((w) => w.id === 'separation-risk')).toBe(true);
  });

  it('flags low TWR', () => {
    const r = computeDesign(PROPELLANTS.lox_ch4, {
      ...DEFAULTS,
      propMass: 2000,
      At: Math.PI / 4 * 0.05 ** 2,
    });
    expect(r.warnings.some((w) => w.id === 'low-twr')).toBe(true);
  });

  it('derives density impulse from bulk density and Isp (ρ·g0·Isp)', () => {
    const r = computeDesign(PROPELLANTS.lox_rp1, DEFAULTS);
    expect(r.isp).not.toBeNull();
    expect(r.densityImpulse).not.toBeNull();
    expect(r.densityImpulse!).toBeCloseTo(PROPELLANTS.lox_rp1.densityKgM3 * 9.80665 * r.isp!, 6);
  });

  it('dense propellants beat H2 on density impulse despite lower Isp (the kerosene lesson)', () => {
    const rp1 = computeDesign(PROPELLANTS.lox_rp1, DEFAULTS).densityImpulse!;
    const lh2 = computeDesign(PROPELLANTS.lox_lh2, DEFAULTS).densityImpulse!;
    expect(lh2).toBeLessThan(rp1);
  });

  it('warns above the kerosene coking limit', () => {
    const safe = computeDesign(PROPELLANTS.lox_rp1, { ...DEFAULTS, Pc: 100e5 });
    expect(safe.warnings.some((w) => w.id === 'coking-risk')).toBe(false);
    const hot = computeDesign(PROPELLANTS.lox_rp1, { ...DEFAULTS, Pc: 250e5 });
    expect(hot.warnings.some((w) => w.id === 'coking-risk')).toBe(true);
    expect(hot.warnings.find((w) => w.id === 'coking-risk')!.message).toContain('200');
  });

  it('does not coking-warn for non-kerosene propellants', () => {
    const r = computeDesign(PROPELLANTS.lox_ch4, { ...DEFAULTS, Pc: 250e5 });
    expect(r.warnings.some((w) => w.id === 'coking-risk')).toBe(false);
  });

  it('returns guarded invalid state without NaN', () => {
    for (const bad of [
      { ...DEFAULTS, Pc: 0 },
      { ...DEFAULTS, eps: 0.5 },
      { ...DEFAULTS, At: 0 },
      { ...DEFAULTS, dryMass: 0, propMass: 0 },
    ]) {
      const r = computeDesign(PROPELLANTS.lox_ch4, bad);
      expect(Number.isNaN(r.ve)).toBe(false);
      expect(Number.isNaN(r.dv)).toBe(false);
      expect(Number.isNaN(r.burnTime)).toBe(false);
    }
    const r = computeDesign(PROPELLANTS.lox_ch4, { ...DEFAULTS, Pc: 0 });
    expect(r.warnings.some((w) => w.id === 'invalid')).toBe(true);
    expect(r.Me).toBeNull();
    expect(r.F).toBeNull();
    expect(r.isp).toBeNull();
  });
});
