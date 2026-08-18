import { describe, expect, it } from 'vitest';
import { ENGINE_PRESETS, MISSION_PRESETS } from '../src/physics/presets';
import { computeDesign } from '../src/physics/performance';
import { MISSION_REFS } from '../src/physics/missions';
import { PROPELLANTS, PROPELLANT_IDS } from '../src/physics/propellants';

describe('engine presets reproduce published real-world Isp', () => {
  it.each(ENGINE_PRESETS)('$name: model Isp within ±10% of real ($realIsp s)', (preset) => {
    const r = computeDesign(PROPELLANTS[preset.propellantId], {
      Pc: preset.chamberPressurePa,
      eps: preset.expansionRatio,
      Pa: preset.ambientPressurePa,
      At: preset.throatAreaM2,
      dryMass: preset.dryMassKg,
      propMass: preset.propellantMassKg,
    });
    expect(r.isp).not.toBeNull();
    // Real engines include divergence/BL/combustion losses the frozen ideal model omits,
    // so the honest comparison is a wide band, not the ±3% CEA regression.
    const err = Math.abs(r.isp! - preset.realIsp!) / preset.realIsp!;
    expect(err).toBeLessThan(0.1);
  });

  it('preset throat areas reproduce published mass flows within ±5%', () => {
    for (const p of ENGINE_PRESETS) {
      const r = computeDesign(PROPELLANTS[p.propellantId], {
        Pc: p.chamberPressurePa,
        eps: p.expansionRatio,
        Pa: p.ambientPressurePa,
        At: p.throatAreaM2,
        dryMass: 1,
        propMass: 1,
      });
      expect(r.mdot).not.toBeNull();
      expect(Math.abs(r.mdot! - p.realMdot!) / p.realMdot!).toBeLessThan(0.05);
    }
  });
});

describe('mission presets produce a sane, non-NaN design', () => {
  it.each(MISSION_PRESETS)('$name: valid inputs + positive Δv, target mission exists', (preset) => {
    expect(PROPELLANT_IDS).toContain(preset.propellantId);
    const r = computeDesign(PROPELLANTS[preset.propellantId], {
      Pc: preset.chamberPressurePa,
      eps: preset.expansionRatio,
      Pa: preset.ambientPressurePa,
      At: preset.throatAreaM2,
      dryMass: preset.dryMassKg,
      propMass: preset.propellantMassKg,
    });
    expect(Number.isNaN(r.dv)).toBe(false);
    expect(r.dv).toBeGreaterThan(0);
    expect(MISSION_REFS.some((m) => m.name === preset.mission)).toBe(true);
  });
});

describe('preset data integrity', () => {
  it('every preset has a valid propellant and positive geometry', () => {
    for (const p of [...ENGINE_PRESETS, ...MISSION_PRESETS]) {
      expect(PROPELLANT_IDS).toContain(p.propellantId);
      expect(p.chamberPressurePa).toBeGreaterThan(0);
      expect(p.expansionRatio).toBeGreaterThanOrEqual(1);
      expect(p.throatAreaM2).toBeGreaterThan(0);
      expect(p.citation.length).toBeGreaterThan(10);
    }
  });
});