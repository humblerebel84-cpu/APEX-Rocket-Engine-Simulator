import type { DesignReport } from '../physics/performance';
import { fmt } from '../physics/format';
import { toFtPerS, toLbf, toLbfSPerIn3, type UnitSystem } from '../physics/units';

interface Props {
  report: DesignReport;
  units: UnitSystem;
}

function Tile({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="readout">
      <div className="label">{label}</div>
      <div className="value">
        {value}
        <span className="unit">{unit}</span>
      </div>
    </div>
  );
}

export default function ReadoutGrid({ report, units }: Props) {
  const eng = units === 'eng';
  const ve = eng ? toFtPerS(report.ve) : report.ve;
  const thrust = eng ? toLbf(report.F! / 1000) : report.F! / 1000;
  const cstar = eng ? toFtPerS(report.cstar) : report.cstar;
  const densityImpulse = eng ? toLbfSPerIn3(report.densityImpulse! / 1000) : report.densityImpulse! / 1000;

  return (
    <div className="readout-row readout-row-7">
      <Tile label="Exhaust Velocity" value={fmt(ve)} unit={eng ? 'ft/s' : 'm/s'} />
      <Tile label="Specific Impulse" value={report.isp !== null ? fmt(report.isp, 1) : '—'} unit="sec" />
      <Tile label="Thrust" value={report.F !== null ? fmt(thrust, 1) : '—'} unit={eng ? 'lbf' : 'kN'} />
      <Tile label="Thrust/Weight" value={report.twr !== null ? fmt(report.twr, 2) : '—'} unit="ratio" />
      <Tile label="Characteristic c*" value={fmt(cstar)} unit={eng ? 'ft/s' : 'm/s'} />
      <Tile label="Thrust Coeff. Cf" value={report.cf !== null ? fmt(report.cf, 3) : '—'} unit="—" />
      <Tile
        label="Density Impulse"
        value={report.densityImpulse !== null ? fmt(densityImpulse, eng ? 1 : 0) : '—'}
        unit={eng ? 'lbf·s/in³' : 'kN·s/m³'}
      />
    </div>
  );
}
