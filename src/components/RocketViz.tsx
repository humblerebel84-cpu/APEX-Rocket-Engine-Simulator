import type { Propellant } from '../physics/propellants';
import type { DesignReport } from '../physics/performance';
import { fmt } from '../physics/format';
import { toFtPerS, type UnitSystem } from '../physics/units';

interface Props {
  propellant: Propellant;
  report: DesignReport;
  units: UnitSystem;
}

export default function RocketViz({ propellant, report, units }: Props) {
  const eng = units === 'eng';
  const fN = report.F ?? 0;
  const mdot = report.mdot ?? 0;
  const flameHeight = Math.min(105, Math.max(15, fN / 8000));
  const flameWidth = Math.min(80, Math.max(20, mdot / 3));
  const twrColor = report.twr !== null && report.twr > 1 ? '#1a1815' : '#b5502e';
  const flame = propellant.flame;

  return (
    <div className="viz-area">
      <svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Engine visualization">
        <rect x="260" y="20" width="80" height="180" fill="#fbfaf6" stroke="#1a1815" strokeWidth="3" />
        <polygon points="260,20 300,-10 340,20" fill="#4a5a63" stroke="#1a1815" strokeWidth="3" />
        <line x1="260" y1="80" x2="340" y2="80" stroke="#1a1815" strokeWidth="1.5" strokeDasharray="4,3" />
        <line x1="260" y1="140" x2="340" y2="140" stroke="#1a1815" strokeWidth="1.5" strokeDasharray="4,3" />
        <polygon points="260,160 230,200 260,200" fill="#b5502e" stroke="#1a1815" strokeWidth="2" />
        <polygon points="340,160 370,200 340,200" fill="#b5502e" stroke="#1a1815" strokeWidth="2" />
        <polygon points="270,200 330,200 315,225 285,225" fill="#4a5a63" stroke="#1a1815" strokeWidth="3" />
        <polygon
          points={`285,225 315,225 ${300 + flameWidth / 2},${225 + flameHeight} ${300 - flameWidth / 2},${225 + flameHeight}`}
          fill="url(#flameGrad)"
          opacity="0.9"
        />
        <polygon
          points={`290,225 310,225 ${300 + flameWidth / 4},${225 + flameHeight * 0.6} ${300 - flameWidth / 4},${225 + flameHeight * 0.6}`}
          fill={flame}
          opacity="0.95"
        />
        <defs>
          <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={flame} />
            <stop offset="100%" stopColor={flame} stopOpacity="0.15" />
          </linearGradient>
        </defs>

        <text x="30" y="40" fontFamily="Space Mono, monospace" fontSize="12" fill="#1a1815" fontWeight="700">
          PROPELLANT
        </text>
        <text x="30" y="58" fontFamily="Space Mono, monospace" fontSize="11" fill="#b5502e">
          {propellant.name}
        </text>

        <text x="30" y="100" fontFamily="Space Mono, monospace" fontSize="12" fill="#1a1815" fontWeight="700">
          BURN TIME
        </text>
        <text x="30" y="118" fontFamily="Space Mono, monospace" fontSize="18" fill="#b5502e" fontWeight="700">
          {fmt(report.burnTime, 1)}s
        </text>

        <text x="450" y="100" fontFamily="Space Mono, monospace" fontSize="12" fill="#1a1815" fontWeight="700" textAnchor="end">
          MASS RATIO
        </text>
        <text x="450" y="118" fontFamily="Space Mono, monospace" fontSize="18" fill="#b5502e" fontWeight="700" textAnchor="end">
          {report.massRatio !== null ? fmt(report.massRatio, 2) : '—'}
        </text>

        <text x="30" y="290" fontFamily="Space Mono, monospace" fontSize="12" fill="#1a1815" fontWeight="700">
          DELTA-V CAPACITY
        </text>
        <text x="30" y="315" fontFamily="Space Mono, monospace" fontSize="24" fill="#1a1815" fontWeight="700">
          {fmt(eng ? toFtPerS(report.dv) : report.dv)} <tspan fontSize="14" fill="#7d8f98">{eng ? 'ft/s' : 'm/s'}</tspan>
        </text>

        <text x="450" y="290" fontFamily="Space Mono, monospace" fontSize="12" fill="#1a1815" fontWeight="700" textAnchor="end">
          TWR
        </text>
        <text x="450" y="315" fontFamily="Space Mono, monospace" fontSize="24" fill={twrColor} fontWeight="700" textAnchor="end">
          {report.twr !== null ? fmt(report.twr, 2) : '—'} {report.twr !== null && report.twr <= 1 ? '⚠' : ''}
        </text>
      </svg>
    </div>
  );
}
