import type { DesignReport } from './performance';
import type { Propellant } from './propellants';

export interface DesignItem {
  propellant: Propellant;
  report: DesignReport;
}

export interface CompareRow {
  label: string;
  unit: string;
  a: number | null;
  b: number | null;
  higherIsBetter: boolean;
}

// Side-by-side trade study of two propellants at identical Pc / ε / Pa / masses.
// Only the propellant chemistry differs, so every delta is a pure propellant effect.
export function compareDesigns(a: DesignItem, b: DesignItem): CompareRow[] {
  const kn = (v: number | null): number | null => (v !== null ? v / 1000 : null);
  return [
    { label: 'Specific Impulse', unit: 's', a: a.report.isp, b: b.report.isp, higherIsBetter: true },
    {
      label: 'Density Impulse',
      unit: 'kN·s/m³',
      a: kn(a.report.densityImpulse),
      b: kn(b.report.densityImpulse),
      higherIsBetter: true,
    },
    { label: 'Bulk Density', unit: 'kg/m³', a: a.propellant.densityKgM3, b: b.propellant.densityKgM3, higherIsBetter: true },
    { label: 'c*', unit: 'm/s', a: a.report.cstar, b: b.report.cstar, higherIsBetter: true },
    { label: 'Thrust', unit: 'kN', a: kn(a.report.F), b: kn(b.report.F), higherIsBetter: true },
    { label: 'Δv (this stage)', unit: 'm/s', a: a.report.dv, b: b.report.dv, higherIsBetter: true },
    { label: 'Mass Ratio', unit: '—', a: a.report.massRatio, b: b.report.massRatio, higherIsBetter: true },
  ];
}

export function compareWinner(row: CompareRow): 'a' | 'b' | 'tie' {
  if (row.a === null || row.b === null) return 'tie';
  if (Math.abs(row.a - row.b) < 1e-9) return 'tie';
  return row.higherIsBetter === row.a > row.b ? 'a' : 'b';
}
