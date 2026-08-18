import { describe, expect, it } from 'vitest';
import { cStar } from '../src/physics/nozzle';
import { computeDesign } from '../src/physics/performance';
import { PROPELLANTS, PROPELLANT_IDS, type Propellant } from '../src/physics/propellants';
import { CEA_REFERENCE_POINTS, CEA_VALIDATED } from '../src/physics/validation';

// Reference data (CEA_REFERENCE_POINTS) is the single source shared with the About
// panel's validation table — the published numbers and the regression cannot drift.

// Regression vs published NASA CEA / Sutton reference values (Architecture.md §6).
// Tolerance: ±3% (frozen Tc/M/k model vs full equilibrium chemistry) — applied to
// liquid bipropellants only. Monopropellants/solids (approxModel) use wider bands
// because the frozen-flow model is a simplification there (Rules/Phase 1).
const AT_REF = 1e-4; // m², reference throat (Isp is independent of throat size)

function ispVac(propellantId: keyof typeof PROPELLANTS, PcBar: number, eps: number): number {
  const r = computeDesign(PROPELLANTS[propellantId], {
    Pc: PcBar * 1e5,
    eps,
    Pa: 0,
    At: AT_REF,
    dryMass: 1,
    propMass: 1,
  });
  expect(r.isp).not.toBeNull();
  return r.isp!;
}

describe('Isp validation vs CEA/Sutton reference points (liquid bipropellants, ±3%)', () => {
  it.each(CEA_REFERENCE_POINTS)(
    '%s @ %i bar, ε=%i → %i s (±3%)',
    ({ id, PcBar, eps, refIsp }) => {
      const isp = ispVac(id, PcBar, eps);
      expect(Math.abs(isp - refIsp) / refIsp).toBeLessThan(0.03);
    },
  );

  it('N2O4/MMH @ 10 bar, ε=40 falls in the published hypergolic band (295–325 s)', () => {
    const isp = ispVac('n2o4_mmh', 10, 40);
    expect(isp).toBeGreaterThan(295);
    expect(isp).toBeLessThan(325);
  });
});

// The two headline teaching comparisons the new entries exist to support. Both are
// evaluated at identical Pc/ε so the delta is purely a propellant-chemistry effect.
describe('like-for-like propellant swaps (identical Pc and ε)', () => {
  it('LF2/LH2 beats LOX/LH2 by ≈ 35 s at 68 bar, ε=77 — the chemical ceiling', () => {
    const gain = ispVac('lf2_lh2', 68, 77) - ispVac('lox_lh2', 68, 77);
    expect(gain).toBeGreaterThan(25);
    expect(gain).toBeLessThan(45);
  });

  it('swapping N2O4 for IRFNA on UDMH costs ≈ 15 s at 70 bar, ε=40', () => {
    const loss = ispVac('n2o4_udmh', 70, 40) - ispVac('irfna_udmh', 70, 40);
    expect(loss).toBeGreaterThan(8);
    expect(loss).toBeLessThan(24);
  });
});

describe('Isp sanity for approx-model entries (monopropellants / solids, wide bands)', () => {
  it('Hydrazine monoprop @ 20 bar, ε=50 → ≈ 220–235 s (MR-107 class ≈ 224 s)', () => {
    const isp = ispVac('hydrazine_mono', 20, 50);
    expect(isp).toBeGreaterThan(210);
    expect(isp).toBeLessThan(235);
  });

  it('98% H2O2 @ 20 bar, ε=50 → ≈ 155–180 s (green monoprop band)', () => {
    const isp = ispVac('htp_98', 20, 50);
    expect(isp).toBeGreaterThan(150);
    expect(isp).toBeLessThan(185);
  });

  it('ASCENT @ 15 bar, ε=50 → ≈ 240–265 s (GR-1 flight ≈ 247 s)', () => {
    const isp = ispVac('ascent', 15, 50);
    expect(isp).toBeGreaterThan(235);
    expect(isp).toBeLessThan(265);
  });

  it('Solid APCP @ 70 bar, ε=10 falls in the published APCP band (250–280 s)', () => {
    const isp = ispVac('solid_apcp', 70, 10);
    expect(isp).toBeGreaterThan(250);
    expect(isp).toBeLessThan(280);
  });

  it('KNSU @ 30 bar, ε=10 → ≈ 150–170 s (Nakka hobby-solid band)', () => {
    const isp = ispVac('knsu', 30, 10);
    expect(isp).toBeGreaterThan(145);
    expect(isp).toBeLessThan(170);
  });

  it('N2O/Paraffin hybrid @ 20 bar, ε=40 → ≈ 275–310 s (frozen model vs equilibrium CEA ≈ 315 s)', () => {
    const isp = ispVac('n2o_paraffin', 20, 40);
    expect(isp).toBeGreaterThan(275);
    expect(isp).toBeLessThan(310);
  });
});

describe('cStar model consistency', () => {
  // c* is derived from the calibrated (Tc, M, k) frozen-flow constants; these pins
  // catch accidental data edits that would break the CEA Isp regression above.
  it.each([
    ['lox_lh2', 2295],
    ['lox_rp1', 1774],
    ['lox_ch4', 1943],
    ['lox_ethanol', 1715],
    ['lox_ammonia', 1761],
    ['lox_propane', 1849],
    ['lf2_lh2', 2657],
    ['h2o2_rp1', 1710],
    ['irfna_udmh', 1701],
    ['n2o4_mmh', 1682],
    ['n2o4_udmh', 1756],
    ['aerozine_n2o4', 1729],
    ['hydrazine_mono', 1236],
    ['htp_98', 884],
    ['ascent', 1323],
    ['solid_apcp', 1514],
    ['knsu', 869],
    ['n2o_paraffin', 1468],
  ] as const)('%s c* pinned', (id, cstarRef) => {
    expect(cStar(PROPELLANTS[id])).toBeCloseTo(cstarRef, -1);
  });
});

describe('propellant database integrity', () => {
  it('has ≥18 propellants, each with Tc/M/k/citation and a valid category', () => {
    expect(PROPELLANT_IDS.length).toBeGreaterThanOrEqual(18);
    const validCategories = ['Cryogenic', 'Storable', 'Hypergolic', 'Solid', 'Hybrid', 'Monoprop'];
    for (const id of PROPELLANT_IDS) {
      const p = PROPELLANTS[id];
      expect(p.Tc).toBeGreaterThan(1000);
      expect(p.M).toBeGreaterThan(0);
      expect(p.k).toBeGreaterThan(1);
      expect(p.k).toBeLessThan(1.4);
      expect(p.citation.length).toBeGreaterThan(10);
      expect(validCategories).toContain(p.category);
      expect(p.note.length).toBeGreaterThan(10);
    }
  });

  it('each propellant has a bulk density and a plume colour (density-impulse + flame features)', () => {
    for (const id of PROPELLANT_IDS) {
      const p: Propellant = PROPELLANTS[id];
      expect(p.densityKgM3).toBeGreaterThan(0);
      expect(p.densityKgM3).toBeLessThan(5000);
      expect(p.flame).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  // The discipline is a property of the combustion model, not of the category:
  // 98% H2O2 / RP-1 is a CEA-validated liquid bipropellant that is neither
  // cryogenic nor hypergolic, so the old category-derived rule no longer holds.
  it('approxModel is unset exactly for the propellants with a regression case in this file', () => {
    const validated = PROPELLANT_IDS.filter((id) => {
      const p: Propellant = PROPELLANTS[id];
      return !(p.approxModel ?? false);
    });
    expect([...validated].sort()).toEqual([...CEA_VALIDATED].sort());
  });

  it('Solid / Hybrid / Monoprop entries are always approxModel (frozen flow is a simplification there)', () => {
    for (const id of PROPELLANT_IDS) {
      const p: Propellant = PROPELLANTS[id];
      if (p.category === 'Solid' || p.category === 'Hybrid' || p.category === 'Monoprop') {
        expect(p.approxModel).toBe(true);
      }
    }
  });

  it('every category group has at least one member (Hybrid filled by N2O/paraffin)', () => {
    const counts = new Map<string, number>();
    for (const id of PROPELLANT_IDS) {
      const cat = PROPELLANTS[id].category;
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    for (const n of counts.values()) {
      expect(n).toBeGreaterThanOrEqual(1);
    }
    expect(counts.size).toBe(6);
  });
});
