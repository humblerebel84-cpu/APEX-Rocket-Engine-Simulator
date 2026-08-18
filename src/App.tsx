import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_INPUT, useEngineDesign, type EngineDesignInput } from './hooks/useEngineDesign';
import { PROPELLANTS, PROPELLANT_IDS, type PropellantId } from './physics/propellants';
import { computeDesign } from './physics/performance';
import { applyLosses, DEFAULT_LOSSES } from './physics/losses';
import type { DesignItem } from './physics/compare';
import type { UnitSystem } from './physics/units';
import { decodeConfig, encodeConfig } from './physics/configLink';
import PropellantPicker from './components/PropellantPicker';
import DesignControls from './components/DesignControls';
import ReadoutGrid from './components/ReadoutGrid';
import RocketViz from './components/RocketViz';
import MissionDvChart from './components/MissionDvChart';
import EquationPanel from './components/EquationPanel';
import ComparisonPanel from './components/ComparisonPanel';
import ShowcaseCompare from './components/ShowcaseCompare';
import SweepChart from './components/SweepChart';
import SpecSheet from './components/SpecSheet';

export default function App() {
  const [input, setInput] = useState<EngineDesignInput>(DEFAULT_INPUT);
  const [compareId, setCompareId] = useState<PropellantId | null>(null);
  const [units, setUnits] = useState<UnitSystem>('si');
  const [lossesOn, setLossesOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const { propellant, report } = useEngineDesign(input);

  // Restore a shared design from the URL hash (`#apex:...`) on first load.
  useEffect(() => {
    const c = decodeConfig(window.location.hash.replace(/^#/, ''));
    if (c) setInput({ ...DEFAULT_INPUT, ...c });
  }, []);

  // Ideal model stays in `report` (EquationPanel, ±3% CEA discipline); display gets
  // the corrected engine-level report when the loss toggle is on.
  const displayReport = useMemo(
    () => (lossesOn ? applyLosses(report, DEFAULT_LOSSES) : report),
    [lossesOn, report],
  );

  const onChange = (patch: Partial<EngineDesignInput>) => setInput((prev) => ({ ...prev, ...patch }));

  const primary: DesignItem = { propellant, report: displayReport };

  const compareItem = useMemo<DesignItem | null>(() => {
    if (!compareId) return null;
    const ideal = computeDesign(PROPELLANTS[compareId], {
      Pc: input.chamberPressurePa,
      eps: input.expansionRatio,
      Pa: input.ambientPressurePa,
      At: input.throatAreaM2,
      dryMass: input.dryMassKg,
      propMass: input.propellantMassKg,
    });
    return {
      propellant: PROPELLANTS[compareId],
      report: lossesOn ? applyLosses(ideal, DEFAULT_LOSSES) : ideal,
    };
  }, [
    compareId,
    lossesOn,
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

  const shareLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${encodeConfig(input)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
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
        <span className="unit-toggle-spacer" />
        <button type="button" className="share-config" onClick={shareLink}>
          {copied ? '✓ Link copied' : '⇱ Share design'}
        </button>
        <button type="button" className="share-config" onClick={() => window.print()}>
          ⎙ Print spec
        </button>
      </div>

      <ReadoutGrid report={displayReport} units={units} />

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
          <DesignControls
            input={input}
            report={displayReport}
            onChange={onChange}
            units={units}
            losses={lossesOn}
            onLossesChange={setLossesOn}
          />
        </div>

        <div>
          <RocketViz propellant={propellant} report={displayReport} units={units} />
          <EquationPanel propellant={propellant} input={input} report={report} />
          <SweepChart propellant={propellant} input={input} report={report} units={units} />
          <MissionDvChart report={displayReport} />
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
        Simplified frozen-flow model — no altitude-varying ambient pressure, no multi-stage optimization
        (loss corrections are an optional toggle) — every equation is real aerospace engineering.
        <br />
        <strong>Educational / trade-study tool — not flight-certified. Not for safety-critical design.</strong>
      </footer>

      <SpecSheet propellant={propellant} input={input} report={displayReport} units={units} />
    </div>
  );
}
