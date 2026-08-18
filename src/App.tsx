import { useMemo, useState } from 'react';
import { DEFAULT_INPUT, useEngineDesign, type EngineDesignInput } from './hooks/useEngineDesign';
import { PROPELLANTS, PROPELLANT_IDS, type PropellantId } from './physics/propellants';
import { computeDesign } from './physics/performance';
import type { DesignItem } from './physics/compare';
import type { UnitSystem } from './physics/units';
import PropellantPicker from './components/PropellantPicker';
import DesignControls from './components/DesignControls';
import ReadoutGrid from './components/ReadoutGrid';
import RocketViz from './components/RocketViz';
import MissionDvChart from './components/MissionDvChart';
import EquationPanel from './components/EquationPanel';
import ComparisonPanel from './components/ComparisonPanel';
import ShowcaseCompare from './components/ShowcaseCompare';

export default function App() {
  const [input, setInput] = useState<EngineDesignInput>(DEFAULT_INPUT);
  const [compareId, setCompareId] = useState<PropellantId | null>(null);
  const [units, setUnits] = useState<UnitSystem>('si');
  const { propellant, report } = useEngineDesign(input);

  const onChange = (patch: Partial<EngineDesignInput>) => setInput((prev) => ({ ...prev, ...patch }));

  const primary: DesignItem = { propellant, report };

  const compareItem = useMemo<DesignItem | null>(() => {
    if (!compareId) return null;
    return {
      propellant: PROPELLANTS[compareId],
      report: computeDesign(PROPELLANTS[compareId], {
        Pc: input.chamberPressurePa,
        eps: input.expansionRatio,
        Pa: input.ambientPressurePa,
        At: input.throatAreaM2,
        dryMass: input.dryMassKg,
        propMass: input.propellantMassKg,
      }),
    };
  }, [
    compareId,
    input.chamberPressurePa,
    input.expansionRatio,
    input.ambientPressurePa,
    input.throatAreaM2,
    input.dryMassKg,
    input.propellantMassKg,
  ]);

  const enableCompare = () => {
    setCompareId(compareId ?? PROPELLANT_IDS.find((id) => id !== input.propellantId) ?? input.propellantId);
  };

  const loadShowcase = (primaryId: PropellantId, compare: PropellantId) => {
    onChange({ propellantId: primaryId });
    setCompareId(compare);
  };

  return (
    <div className="wrap">
      <div className="masthead">
        <h1>
          APEX<span>.</span>
          <br />
          ROCKET ENGINE SIM
        </h1>
        <div className="tag">
          REAL PHYSICS ENGINE
          <br />
          de Laval Nozzle Theory · Tsiolkovsky Equation
          <br />
          Build 1.0 — Coupled inputs. No impossible configs.
        </div>
      </div>

      <div className="unit-toggle">
        <span className="unit-toggle-label">Units</span>
        <button type="button" className={units === 'si' ? 'active' : ''} onClick={() => setUnits('si')}>
          SI
        </button>
        <button type="button" className={units === 'eng' ? 'active' : ''} onClick={() => setUnits('eng')}>
          US
        </button>
      </div>

      <ReadoutGrid report={report} units={units} />

      {report.warnings.length > 0 && (
        <div className="warnings" role="alert">
          {report.warnings.map((w) => (
            <div key={w.id} className="warning-line">
              ⚠ {w.message}
            </div>
          ))}
        </div>
      )}

      <div className="grid">
        <div className="panel">
          <h2>Propellant &amp; Nozzle</h2>
          <PropellantPicker value={input.propellantId} propellant={propellant} onChange={(id) => onChange({ propellantId: id })} />
          <button type="button" className="compare-toggle" onClick={enableCompare}>
            {compareId ? '◫ Comparison open' : '◫ Compare with another propellant'}
          </button>
          <ShowcaseCompare onLoad={loadShowcase} />
          <DesignControls input={input} report={report} onChange={onChange} units={units} />
        </div>

        <div>
          <RocketViz propellant={propellant} report={report} units={units} />
          <EquationPanel propellant={propellant} input={input} report={report} />
          <MissionDvChart report={report} />
        </div>
      </div>

      {compareItem && (
        <ComparisonPanel
          primary={primary}
          compare={compareItem}
          compareId={compareId!}
          onCompareChange={setCompareId}
          onClose={() => setCompareId(null)}
          units={units}
        />
      )}

      <footer>
        Propellant data: {PROPELLANTS[input.propellantId].citation}
        <br />
        Simplified frozen-flow model — no boundary-layer or divergence losses, no altitude-varying ambient
        pressure, no multi-stage optimization — every equation is real aerospace engineering.
        <br />
        <strong>Educational / trade-study tool — not flight-certified. Not for safety-critical design.</strong>
      </footer>
    </div>
  );
}
