import { describe, expect, it } from 'vitest';
import { toFtPerS, toIn2, toLb, toLbf, toLbfSPerIn3, toLbmPerFt3, toPsi } from '../src/physics/units';

describe('unit conversions match published factors', () => {
  it('pressure: 1 bar → 14.5038 psi', () => {
    expect(toPsi(1)).toBeCloseTo(14.5038, 3);
  });
  it('mass: 1 kg → 2.2046 lb', () => {
    expect(toLb(1)).toBeCloseTo(2.2046, 3);
  });
  it('velocity: 1 m/s → 3.2808 ft/s', () => {
    expect(toFtPerS(1)).toBeCloseTo(3.2808, 3);
  });
  it('area: 1 cm² → 0.155 in²', () => {
    expect(toIn2(1)).toBeCloseTo(0.155, 3);
  });
  it('force: 1 kN → 224.809 lbf', () => {
    expect(toLbf(1)).toBeCloseTo(224.809, 3);
  });
  it('density impulse: 1 kN·s/m³ → 0.00368 lbf·s/in³', () => {
    expect(toLbfSPerIn3(1)).toBeCloseTo(0.00368, 4);
  });
  it('bulk density: 1 kg/m³ → 0.0624 lb/ft³', () => {
    expect(toLbmPerFt3(1)).toBeCloseTo(0.0624, 3);
  });
});