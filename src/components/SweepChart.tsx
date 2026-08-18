import { useMemo } from 'react';
import type { Propellant } from '../physics/propellants';
import type { EngineDesignInput } from '../hooks/useEngineDesign';
import type { DesignReport } from '../physics/performance';
import { sweepIspVsExpansion, sweepThrustVsPressure, type SweepPoint } from '../physics/sweep';
import { toLbf, type UnitSystem } from '../physics/units';
import { fmt } from '../physics/format';

interface Props {
  propellant: Propellant;
  input: EngineDesignInput;
  report: DesignReport;
  units: UnitSystem;
}

const W = 320;
const H = 180;
const PAD = 10;

function MiniLineChart({
  points,
  marker,
  xLabel,
  yLabel,
}: {
  points: SweepPoint[];
  marker: { x: number; y: number };
  xLabel: string;
  yLabel: string;
}) {
  if (points.length < 2) return null;
  const xMin = points[0].x;
  const xMax = points[points.length - 1].x;
  const yMin = 0;
  const yMaxRaw = Math.max(...points.map((p) => p.y), marker.y) * 1.1;
  const yMax = Math.ceil(yMaxRaw / 100) * 100;
  const px = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const py = (y: number) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - 2 * PAD);
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
  const mx = px(marker.x);
  const my = py(marker.y);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${yLabel} vs ${xLabel}`}>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={py(yMax * f)} y2={py(yMax * f)} stroke="#d4cfc0" strokeWidth="1" />
      ))}
      <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="#1a1815" strokeWidth="2" />
      <line x1={PAD} x2={PAD} y1={PAD} y2={H - PAD} stroke="#1a1815" strokeWidth="2" />
      <path d={line} fill="none" stroke="#b5502e" strokeWidth="2" />
      <circle cx={mx} cy={my} r="4" fill="#1a1815" stroke="#f4f1ea" strokeWidth="1.5" />
      <text x={PAD} y={H - 2} fontFamily="Space Mono, monospace" fontSize="9" fill="#7d8f98">
        {xMin}
      </text>
      <text x={W - PAD} y={H - 2} fontFamily="Space Mono, monospace" fontSize="9" fill="#7d8f98" textAnchor="end">
        {xMax}
      </text>
      <text x={W / 2} y={H - 2} fontFamily="Space Mono, monospace" fontSize="9" fill="#4a5a63" textAnchor="middle">
        {xLabel}
      </text>
      <text x={W - PAD} y={14} fontFamily="Space Mono, monospace" fontSize="9" fill="#4a5a63" textAnchor="end">
        {yLabel}: {fmt(marker.y, 0)}
      </text>
    </svg>
  );
}

export default function SweepChart({ propellant, input, report, units }: Props) {
  const eng = units === 'eng';
  const ispCurve = useMemo(
    () => sweepIspVsExpansion(propellant, input.chamberPressurePa, input.ambientPressurePa, 24),
    [propellant, input.chamberPressurePa, input.ambientPressurePa],
  );
  const thrustCurve = useMemo(
    () => sweepThrustVsPressure(propellant, input.expansionRatio, input.ambientPressurePa, input.throatAreaM2, 24),
    [propellant, input.expansionRatio, input.ambientPressurePa, input.throatAreaM2],
  );

  return (
    <div className="chart-panel sweep-panel">
      <h2>Design Space — Ideal Model</h2>
      <div className="sweep-grid">
        <div className="sweep-chart">
          <MiniLineChart
            points={ispCurve}
            marker={{ x: input.expansionRatio, y: report.isp ?? 0 }}
            xLabel="expansion ratio ε"
            yLabel="Isp (s)"
          />
        </div>
        <div className="sweep-chart">
          <MiniLineChart
            points={thrustCurve}
            marker={{ x: input.chamberPressurePa / 1e5, y: eng ? toLbf((report.F ?? 0) / 1000) : (report.F ?? 0) / 1000 }}
            xLabel="chamber pressure Pc (bar)"
            yLabel={eng ? 'thrust (lbf)' : 'thrust (kN)'}
          />
        </div>
      </div>
      <div className="sweep-note">
        Each dot is the current operating point. Left: how much ε buys you in Isp (diminishing returns).
        Right: thrust scales linearly with Pc·At (denser propellant → steeper line).
      </div>
    </div>
  );
}