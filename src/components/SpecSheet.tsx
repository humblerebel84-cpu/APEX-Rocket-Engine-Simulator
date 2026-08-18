import type { EngineDesignInput } from '../hooks/useEngineDesign';
import type { DesignReport } from '../physics/performance';
import type { Propellant } from '../physics/propellants';
import type { NozzleGeometry } from '../physics/losses';
import { toFtPerS, toIn2, toLb, toLbf, toLbfSPerIn3, toPsi, type UnitSystem } from '../physics/units';
import { fmt } from '../physics/format';

interface Props {
  propellant: Propellant;
  input: EngineDesignInput;
  report: DesignReport;
  units: UnitSystem;
  lossesGeometry?: NozzleGeometry;
}

// Print-only spec sheet. Hidden on screen (`.spec-sheet { display: none }`); the
// print stylesheet makes it the only visible content.
export default function SpecSheet({ propellant, input, report, units, lossesGeometry }: Props) {
  const eng = units === 'eng';
  const cell = (label: string, value: string, unit: string) => (
    <tr>
      <td>{label}</td>
      <td>{value}</td>
      <td>{unit}</td>
    </tr>
  );

  return (
    <div className="spec-sheet">
      <h1>APEX — Engine Spec Sheet</h1>
      <p className="spec-propellent">
        {propellant.name} · {propellant.category}
      </p>

      <table>
        <thead>
          <tr>
            <th>Input</th>
            <th>Value</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {cell('Chamber pressure', fmt(eng ? toPsi(input.chamberPressurePa / 1e5) : input.chamberPressurePa / 1e5, 1), eng ? 'psi' : 'bar')}
          {cell('Expansion ratio ε', `${input.expansionRatio}`, '—')}
          {cell(
            'Ambient pressure',
            input.ambientPressurePa >= 1.01e5 ? 'Sea Level' : input.ambientPressurePa <= 0 ? 'Vacuum' : fmt(input.ambientPressurePa / 1e5, 2),
            eng ? 'psi' : 'bar',
          )}
          {cell('Throat area', fmt(eng ? toIn2(input.throatAreaM2 * 1e4) : input.throatAreaM2 * 1e4, 1), eng ? 'in²' : 'cm²')}
          {cell('Dry mass', fmt(eng ? toLb(input.dryMassKg) : input.dryMassKg, 0), eng ? 'lb' : 'kg')}
          {cell('Propellant mass', fmt(eng ? toLb(input.propellantMassKg) : input.propellantMassKg, 0), eng ? 'lb' : 'kg')}
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>Output</th>
            <th>Value</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {cell('Exhaust velocity', fmt(eng ? toFtPerS(report.ve) : report.ve, 0), eng ? 'ft/s' : 'm/s')}
          {cell('Specific impulse', report.isp !== null ? fmt(report.isp, 1) : '—', 's')}
          {cell('Characteristic c*', fmt(eng ? toFtPerS(report.cstar) : report.cstar, 0), eng ? 'ft/s' : 'm/s')}
          {cell('Thrust', report.F !== null ? fmt(eng ? toLbf(report.F / 1000) : report.F / 1000, 1) : '—', eng ? 'lbf' : 'kN')}
          {cell('Thrust coefficient Cf', report.cf !== null ? fmt(report.cf, 3) : '—', '—')}
          {cell('Thrust/weight', report.twr !== null ? fmt(report.twr, 2) : '—', '—')}
          {cell('Density impulse', report.densityImpulse !== null ? fmt(eng ? toLbfSPerIn3(report.densityImpulse / 1000) : report.densityImpulse / 1000, 1) : '—', eng ? 'lbf·s/in³' : 'kN·s/m³')}
          {cell('Mass ratio', report.massRatio !== null ? fmt(report.massRatio, 2) : '—', '—')}
          {cell('Delta-v', fmt(eng ? toFtPerS(report.dv) : report.dv, 0), eng ? 'ft/s' : 'm/s')}
          {cell('Burn time', fmt(report.burnTime, 1), 's')}
        </tbody>
      </table>

      {report.lossFactor !== undefined && (
        <p className="spec-loss">
          Includes {lossesGeometry === 'bell' ? 'Rao bell' : '15° conical'} divergence + boundary-layer losses
          (×{fmt(report.lossFactor, 3)}).
        </p>
      )}
      {report.warnings.length > 0 && (
        <ul className="spec-warnings">
          {report.warnings.map((w) => (
            <li key={w.id}>⚠ {w.message}</li>
          ))}
        </ul>
      )}
      <p className="spec-cite">Propellant data: {propellant.citation}</p>
      <p className="spec-disclaimer">
        Educational / trade-study tool. Not flight-certified. Not for safety-critical design. Ideal frozen-flow model
        (loss corrections applied only when noted).
      </p>
    </div>
  );
}