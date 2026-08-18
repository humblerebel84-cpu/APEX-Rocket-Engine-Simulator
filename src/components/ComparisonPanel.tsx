import { compareDesigns, compareWinner, type DesignItem, type CompareRow } from '../physics/compare';
import { fmt } from '../physics/format';
import { toFtPerS, toLbf, toLbfSPerIn3, toLbmPerFt3, type UnitSystem } from '../physics/units';
import type { PropellantId } from '../physics/propellants';
import PropellantPicker from './PropellantPicker';

interface Props {
  primary: DesignItem;
  compare: DesignItem;
  compareId: PropellantId;
  onCompareChange: (id: PropellantId) => void;
  onClose: () => void;
  units: UnitSystem;
}

// SI row unit → display conversion + unit label per UnitSystem.
function convertRow(row: CompareRow, units: UnitSystem): { value: (v: number) => number; unit: string } {
  const eng = units === 'eng';
  switch (row.unit) {
    case 'kN·s/m³':
      return { value: eng ? toLbfSPerIn3 : (v) => v, unit: eng ? 'lbf·s/in³' : 'kN·s/m³' };
    case 'kg/m³':
      return { value: eng ? toLbmPerFt3 : (v) => v, unit: eng ? 'lb/ft³' : 'kg/m³' };
    case 'm/s':
      return { value: eng ? toFtPerS : (v) => v, unit: eng ? 'ft/s' : 'm/s' };
    case 'kN':
      return { value: eng ? toLbf : (v) => v, unit: eng ? 'lbf' : 'kN' };
    default:
      return { value: (v) => v, unit: row.unit };
  }
}

function DeltaMark({ winner }: { winner: 'a' | 'b' | 'tie' }) {
  if (winner === 'tie') return <span className="compare-tie">≈ tie</span>;
  return <span className="compare-delta">{winner === 'a' ? '▲' : '▼'} better</span>;
}

export default function ComparisonPanel({ primary, compare, compareId, onCompareChange, onClose, units }: Props) {
  const rows = compareDesigns(primary, compare);

  return (
    <div className="chart-panel comparison-panel">
      <div className="comparison-head">
        <h2>Trade Study — Same Engine, Different Propellant</h2>
        <button type="button" className="compare-close" onClick={onClose} aria-label="Close comparison">
          ×
        </button>
      </div>

      <div className="comparison-picker">
        <PropellantPicker value={compareId} propellant={compare.propellant} onChange={onCompareChange} label="Compare vs" showDetail={false} />
      </div>

      <div className="compare-grid">
        <div className="compare-cell compare-name">
          <strong>{primary.propellant.name}</strong>
          <span className="compare-cat">{primary.propellant.category}</span>
        </div>
        <div className="compare-cell compare-label">metric</div>
        <div className="compare-cell compare-name">
          <strong>{compare.propellant.name}</strong>
          <span className="compare-cat">{compare.propellant.category}</span>
        </div>

        {rows.map((row) => {
          const winner = compareWinner(row);
          const conv = convertRow(row, units);
          const a = row.a !== null ? conv.value(row.a) : null;
          const b = row.b !== null ? conv.value(row.b) : null;
          return (
            <div className="compare-row-group" key={row.label}>
              <div className={`compare-cell compare-value ${winner === 'a' ? 'winner' : ''}`}>
                {a !== null ? fmt(a, a >= 1000 ? 0 : 1) : '—'}
              </div>
              <div className="compare-cell compare-metric">
                {row.label} <span className="unit">{conv.unit}</span>
                <DeltaMark winner={winner} />
              </div>
              <div className={`compare-cell compare-value right ${winner === 'b' ? 'winner' : ''}`}>
                {b !== null ? fmt(b, b >= 1000 ? 0 : 1) : '—'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="comparison-note">
        Identical Pc, ε, ambient pressure and masses for both — only the propellant chemistry differs, so every delta is
        a pure propellant effect. Note density impulse: high-Isp LH2 loses to dense kerosene on this metric, which is why
        RP-1 dominates booster stages despite lower Isp.
      </div>
    </div>
  );
}
