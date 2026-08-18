import { describe, expect, it } from 'vitest';
import { throatAreaForThrust, throatAreaFromDiameter, throatAreaFromMassFlow, massFlowFromThroatArea } from '../src/physics/sizing';
import { thrustCoefficient } from '../src/physics/nozzle';
import { computeDesign } from '../src/physics/performance';
import { PROPELLANTS } from '../src/physics/propellants';

describe('throatAreaFromDiameter', () => {
  it('converts millimetres to m² (πd²/4)', () => {
    expect(throatAreaFromDiameter(100)).toBeCloseTo(Math.PI / 4 * 0.1 ** 2, 12);
  });
  it('guards non-positive diameters', () => {
    expect(throatAreaFromDiameter(0)).toBeNull();
  });
});

describe('massFlowFromThroatArea / throatAreaFromMassFlow round trip', () => {
  it('inverts exactly (ṁ = Pc·At/c*)', () => {
    const At = 0.05;
    const mdot = massFlowFromThroatArea(100e5, At, 1943)!;
    expect(throatAreaFromMassFlow(100e5, mdot, 1943)).toBeCloseTo(At, 10);
  });
});

describe('thrustCoefficient matches computeDesign.cf', () => {
  it('vacuum: identical for the pinned LOX/CH4 default', () => {
    const r = computeDesign(PROPELLANTS.lox_ch4, {
      Pc: 100e5, eps: 40, Pa: 0, At: Math.PI / 4 * 0.14 ** 2, dryMass: 3000, propMass: 17000,
    });
    expect(thrustCoefficient(PROPELLANTS.lox_ch4.k, 40, 0)).toBeCloseTo(r.cf!, 6);
  });

  it('sea level: identical including the pressure term', () => {
    const r = computeDesign(PROPELLANTS.lox_ch4, {
      Pc: 100e5, eps: 40, Pa: 1.01325e5, At: Math.PI / 4 * 0.14 ** 2, dryMass: 3000, propMass: 17000,
    });
    expect(thrustCoefficient(PROPELLANTS.lox_ch4.k, 40, 1.01325e5 / 100e5)).toBeCloseTo(r.cf!, 6);
  });

  it('guards invalid geometry', () => {
    expect(thrustCoefficient(1.2, 0.5, 0)).toBeNull();
  });
});

describe('throatAreaForThrust (thrust-target mode)', () => {
  it('solves At = F/(Pc·Cf) and reproduces the RS-25 throat to within 2%', () => {
    const prop = PROPELLANTS.lox_lh2;
    const Pc = 206.8e5;
    const eps = 69;
    const cf = thrustCoefficient(prop.k, eps, 0)!;
    const At = throatAreaForThrust(2.279e6, Pc, cf)!;
    expect(At).toBeCloseTo(0.057, 2);
  });

  it('scales linearly with target thrust at fixed Pc/ε', () => {
    const prop = PROPELLANTS.lox_ch4;
    const cf = thrustCoefficient(prop.k, 40, 0)!;
    const a1 = throatAreaForThrust(1e6, 100e5, cf)!;
    const a2 = throatAreaForThrust(2e6, 100e5, cf)!;
    expect(a2 / a1).toBeCloseTo(2, 10);
  });

  it('guards non-positive inputs', () => {
    const prop = PROPELLANTS.lox_ch4;
    const cf = thrustCoefficient(prop.k, 40, 0)!;
    expect(throatAreaForThrust(0, 100e5, cf)).toBeNull();
    expect(throatAreaForThrust(-1, 100e5, cf)).toBeNull();
    expect(throatAreaForThrust(1e6, 0, cf)).toBeNull();
    expect(throatAreaForThrust(1e6, 100e5, 0)).toBeNull();
  });
});