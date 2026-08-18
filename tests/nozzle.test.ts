import { describe, expect, it } from 'vitest';
import {
  areaRatioForMach,
  cStar,
  exitPressureRatio,
  exhaustVelocityForPressureRatio,
  idealCfVac,
  machForAreaRatio,
  machForPressureRatio,
  throatPressure,
  throatPressureRatio,
} from '../src/physics/nozzle';
import { PROPELLANTS } from '../src/physics/propellants';

describe('throatPressureRatio', () => {
  it('matches the classic air value for k=1.4', () => {
    expect(throatPressureRatio(1.4)).toBeCloseTo(0.528282, 5);
  });

  it('rejects non-physical k', () => {
    expect(throatPressureRatio(1)).toBeNull();
    expect(throatPressureRatio(0.8)).toBeNull();
  });
});

describe('throatPressure', () => {
  it('scales chamber pressure', () => {
    expect(throatPressure(1.2, 100e5)).toBeCloseTo(100e5 * 0.564474, -1);
  });

  it('guards degenerate Pc', () => {
    expect(throatPressure(1.2, 0)).toBeNull();
    expect(throatPressure(1.2, -1)).toBeNull();
  });
});

describe('areaRatioForMach / machForAreaRatio', () => {
  it('reproduces A/A* = 1.6875 at M=2 for air', () => {
    expect(areaRatioForMach(1.4, 2)).toBeCloseTo(1.6875, 4);
  });

  it('is the inverse over the supersonic branch', () => {
    const m = machForAreaRatio(1.2, 40);
    expect(m).not.toBeNull();
    expect(areaRatioForMach(1.2, m!)).toBeCloseTo(40, 6);
  });

  it('returns M=1 exactly at ε=1', () => {
    expect(machForAreaRatio(1.2, 1)).toBe(1);
  });

  it('guards invalid inputs', () => {
    expect(machForAreaRatio(1.2, 0.5)).toBeNull();
    expect(areaRatioForMach(0.9, 2)).toBeNull();
    expect(areaRatioForMach(1.2, -1)).toBeNull();
  });
});

describe('exitPressureRatio / machForPressureRatio', () => {
  it('is monotonically decreasing in Mach number', () => {
    const r1 = exitPressureRatio(1.2, 3)!;
    const r2 = exitPressureRatio(1.2, 4)!;
    expect(r2).toBeLessThan(r1);
  });

  it('inverts each other', () => {
    const peRatio = 0.02;
    const m = machForPressureRatio(1.19, peRatio);
    expect(m).not.toBeNull();
    expect(exitPressureRatio(1.19, m!)).toBeCloseTo(peRatio, 8);
  });

  it('guards invalid pressure ratios', () => {
    expect(machForPressureRatio(1.2, 0)).toBeNull();
    expect(machForPressureRatio(1.2, 1)).toBeNull();
    expect(exitPressureRatio(1, 2)).toBeNull();
  });
});

describe('cStar', () => {
  it('produces published-order values for the database', () => {
    expect(cStar(PROPELLANTS.lox_lh2)).toBeCloseTo(2295, -1);
    expect(cStar(PROPELLANTS.lox_rp1)).toBeCloseTo(1774, -1);
    expect(cStar(PROPELLANTS.lox_ch4)).toBeCloseTo(1943, -1);
    expect(cStar(PROPELLANTS.solid_apcp)).toBeCloseTo(1514, -1);
  });

  it('guards bad prop data', () => {
    expect(cStar({ Tc: -1, M: 0.02, k: 1.2 })).toBe(0);
    expect(cStar({ Tc: 3000, M: 0, k: 1.2 })).toBe(0);
    expect(cStar({ Tc: 3000, M: 0.02, k: 0.9 })).toBe(0);
  });
});

describe('exhaustVelocityForPressureRatio', () => {
  it('computes a plausible LOX/CH4 vacuum value', () => {
    const ve = exhaustVelocityForPressureRatio(PROPELLANTS.lox_ch4, 0.5 / 100);
    expect(ve).toBeGreaterThan(3000);
    expect(ve).toBeLessThan(3600);
  });

  it('increases as pressure ratio drops', () => {
    const lo = exhaustVelocityForPressureRatio(PROPELLANTS.lox_ch4, 0.05);
    const hi = exhaustVelocityForPressureRatio(PROPELLANTS.lox_ch4, 0.005);
    expect(hi).toBeGreaterThan(lo);
  });

  it('guards invalid pressure ratios', () => {
    expect(exhaustVelocityForPressureRatio(PROPELLANTS.lox_ch4, 0)).toBe(0);
    expect(exhaustVelocityForPressureRatio(PROPELLANTS.lox_ch4, 1)).toBe(0);
    expect(exhaustVelocityForPressureRatio(PROPELLANTS.lox_ch4, 2)).toBe(0);
  });
});

describe('idealCfVac', () => {
  it('approaches the momentum term + ε·(Pe/Pc) bookkeeping for LOX/CH4 ε=40', () => {
    const cf = idealCfVac(1.19, 40);
    expect(cf).not.toBeNull();
    expect(cf!).toBeGreaterThan(1.6);
    expect(cf!).toBeLessThan(2.1);
  });

  it('monotonically increases with expansion ratio in vacuum', () => {
    expect(idealCfVac(1.19, 40)!).toBeGreaterThan(idealCfVac(1.19, 10)!);
  });

  it('guards invalid inputs', () => {
    expect(idealCfVac(1.19, 0.5)).toBeNull();
    expect(idealCfVac(0.9, 40)).toBeNull();
  });
});
