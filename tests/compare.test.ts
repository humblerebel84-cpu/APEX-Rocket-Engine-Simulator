import { describe, expect, it } from 'vitest';
import { compareDesigns, compareWinner } from '../src/physics/compare';
import { computeDesign } from '../src/physics/performance';
import { PROPELLANTS } from '../src/physics/propellants';

const INPUTS = { Pc: 100e5, eps: 40, Pa: 0, At: 0.01, dryMass: 4000, propMass: 16000 };

function item(id: keyof typeof PROPELLANTS) {
  return { propellant: PROPELLANTS[id], report: computeDesign(PROPELLANTS[id], INPUTS) };
}

describe('compareDesigns', () => {
  it('exposes identical inputs for both propellants', () => {
    const rows = compareDesigns(item('lox_rp1'), item('lox_lh2'));
    const labels = rows.map((r) => r.label);
    expect(labels).toEqual([
      'Specific Impulse',
      'Density Impulse',
      'Bulk Density',
      'c*',
      'Thrust',
      'Δv (this stage)',
      'Mass Ratio',
    ]);
  });

  it('RP-1 beats LH2 on density impulse (trade-study lesson)', () => {
    const rows = compareDesigns(item('lox_rp1'), item('lox_lh2'));
    const di = rows.find((r) => r.label === 'Density Impulse')!;
    expect(di.a!).toBeGreaterThan(di.b!);
    expect(compareWinner(di)).toBe('a');
  });

  it('LH2 beats RP-1 on specific impulse', () => {
    const rows = compareDesigns(item('lox_rp1'), item('lox_lh2'));
    const isp = rows.find((r) => r.label === 'Specific Impulse')!;
    expect(isp.a!).toBeLessThan(isp.b!);
    expect(compareWinner(isp)).toBe('b');
  });

  it('identical propellants tie', () => {
    const rows = compareDesigns(item('lox_ch4'), item('lox_ch4'));
    for (const row of rows) {
      expect(compareWinner(row)).toBe('tie');
    }
  });
});