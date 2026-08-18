import { useEffect, useRef, useState } from 'react';
import type { EngineDesignInput } from '../hooks/useEngineDesign';
import type { DesignReport } from '../physics/performance';
import { ENGINE_PRESETS, MISSION_PRESETS, type Preset } from '../physics/presets';
import { PROPELLANTS } from '../physics/propellants';
import { thrustCoefficient } from '../physics/nozzle';
import { throatAreaForThrust } from '../physics/sizing';
import { ATM } from '../physics/constants';
import { bellDivergenceEfficiency, conicalDivergenceEfficiency, raoBellExitHalfAngleDeg, type NozzleGeometry } from '../physics/losses';
import { fmt } from '../physics/format';
import { toIn2, toLb, toLbf, toPsi, type UnitSystem } from '../physics/units';

interface Props {
  input: EngineDesignInput;
  report: DesignReport;
  onChange: (patch: Partial<EngineDesignInput>) => void;
  units: UnitSystem;
  losses: boolean;
  onLossesChange: (v: boolean) => void;
  geometry: NozzleGeometry;
  onGeometryChange: (g: NozzleGeometry) => void;
}

function DerivedBadge({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="derived-badge">
      <span className="derived-label">{label}</span>
      <span className="derived-value">
        {value} <span className="unit">{unit}</span>
      </span>
    </div>
  );
}

function applyPreset(p: Preset): Partial<EngineDesignInput> {
  return {
    propellantId: p.propellantId,
    chamberPressurePa: p.chamberPressurePa,
    expansionRatio: p.expansionRatio,
    ambientPressurePa: p.ambientPressurePa,
    throatAreaM2: p.throatAreaM2,
    dryMassKg: p.dryMassKg,
    propellantMassKg: p.propellantMassKg,
  };
}

export default function DesignControls({ input, report, onChange, units, losses, onLossesChange, geometry, onGeometryChange }: Props) {
  const [lastPreset, setLastPreset] = useState<Preset | null>(null);
  const [thrustMode, setThrustMode] = useState(false);
  const [targetKN, setTargetKN] = useState(500);
  const eng = units === 'eng';
  const pcBar = input.chamberPressurePa / 1e5;
  const paBar = input.ambientPressurePa / 1e5;
  const atCm2 = input.throatAreaM2 * 1e4;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Thrust-target mode: At is derived from the target thrust, chamber pressure and
  // the ideal thrust coefficient — same closed form as the sizing module.
  useEffect(() => {
    if (!thrustMode) return;
    const cf = thrustCoefficient(
      PROPELLANTS[input.propellantId].k,
      input.expansionRatio,
      input.ambientPressurePa / input.chamberPressurePa,
    );
    const At = cf === null ? null : throatAreaForThrust(targetKN * 1000, input.chamberPressurePa, cf);
    if (At === null) return;
    onChangeRef.current({ throatAreaM2: At });
  }, [
    thrustMode,
    targetKN,
    input.propellantId,
    input.chamberPressurePa,
    input.expansionRatio,
    input.ambientPressurePa,
  ]);

  return (
    <>
      <div className="field">
        <label>One-Click Presets</label>
        <select
          value=""
          onChange={(e) => {
            const p = [...ENGINE_PRESETS, ...MISSION_PRESETS].find((x) => x.id === e.target.value);
            if (!p) return;
            setLastPreset(p);
            onChange(applyPreset(p));
          }}
        >
          <option value="">— select engine / mission —</option>
          <optgroup label="ENGINE PRESETS">
            {ENGINE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="MISSION PRESETS">
            {MISSION_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
        </select>
        {lastPreset && (
          <div className="propellant-note propellant-cite">
            LOADED: {lastPreset.name} — {lastPreset.note}
          </div>
        )}
      </div>

      <div className="field">
        <label>Ambient Design Mode</label>
        <div className="mode-buttons">
          <button
            type="button"
            className={paBar >= 1.01 ? 'active' : ''}
            onClick={() => onChangeRef.current({ ambientPressurePa: ATM })}
          >
            Sea Level
          </button>
          <button
            type="button"
            className={paBar <= 0 ? 'active' : ''}
            onClick={() => onChangeRef.current({ ambientPressurePa: 0 })}
          >
            Vacuum
          </button>
        </div>
      </div>

      <div className="field">
        <label className="toggle-row">
          <input type="checkbox" checked={losses} onChange={(e) => onLossesChange(e.target.checked)} />
          Include divergence + boundary-layer losses
        </label>
        {losses && (
          <>
            <div className="mode-buttons">
              <button type="button" className={geometry === 'conical' ? 'active' : ''} onClick={() => onGeometryChange('conical')}>
                Conical 15°
              </button>
              <button type="button" className={geometry === 'bell' ? 'active' : ''} onClick={() => onGeometryChange('bell')}>
                Rao bell
              </button>
            </div>
            <div className="propellant-note propellant-cite">
              {geometry === 'conical'
                ? `Conical divergence λ = (1+cos 15°)/2 = ${fmt(conicalDivergenceEfficiency(15), 4)} (Sutton §12.3).`
                : `Rao-optimized bell: exit half-angle ${fmt(raoBellExitHalfAngleDeg(input.expansionRatio), 1)}° at ε = ${input.expansionRatio} → λ = ${fmt(bellDivergenceEfficiency(input.expansionRatio), 4)} (Huzel & Huang Fig. 4-7).`}{' '}
              {report.lossFactor !== undefined && (
                <>Engine-level correction ×{fmt(report.lossFactor, 3)} applied to F / Isp / Δv / TWR. The equation panel stays ideal.</>
              )}
            </div>
          </>
        )}
      </div>

      <div className="field">
        <label className="toggle-row">
          <input type="checkbox" checked={thrustMode} onChange={(e) => setThrustMode(e.target.checked)} />
          Thrust-target mode — solve throat area
        </label>
      </div>

      {thrustMode && (
        <div className="field">
          <label>
            Target Thrust{' '}
            <span className="val">{eng ? `${fmt(toLbf(targetKN), 0)} lbf` : `${fmt(targetKN, 0)} kN`}</span>
          </label>
          <input
            type="range"
            min="50"
            max="5000"
            step="10"
            value={targetKN}
            onChange={(e) => setTargetKN(Number(e.target.value))}
          />
        </div>
      )}
      <div className="field">
        <label>
          Chamber Pressure{' '}
          <span className="val">
            {eng ? `${fmt(toPsi(pcBar), 0)} psi` : `${pcBar} bar`}
          </span>
        </label>
        <input
          type="range"
          min="10"
          max="300"
          step="1"
          value={pcBar}
          onChange={(e) => onChange({ chamberPressurePa: Number(e.target.value) * 1e5 })}
        />
      </div>

      <div className="field">
        <label>
          Expansion Ratio ε = Ae/At <span className="val">{input.expansionRatio}</span>
        </label>
        <input
          type="range"
          min="2"
          max="80"
          step="1"
          value={input.expansionRatio}
          onChange={(e) => onChange({ expansionRatio: Number(e.target.value) })}
        />
      </div>

      <div className="field">
        <label>
          Ambient Pressure{' '}
          <span className="val">
            {paBar >= 1.01 ? 'Sea Level' : paBar <= 0 ? 'Vacuum' : eng ? `${fmt(toPsi(paBar), 1)} psi` : `${paBar.toFixed(2)} bar`}
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="1.01"
          step="0.01"
          value={paBar}
          onChange={(e) => onChange({ ambientPressurePa: Number(e.target.value) * 1e5 })}
        />
      </div>

      {!thrustMode && (
        <div className="field">
          <label>
            Throat Area <span className="val">{eng ? `${fmt(toIn2(atCm2), 0)} in²` : `${fmt(atCm2, 0)} cm²`}</span>
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            step="5"
            value={atCm2}
            onChange={(e) => onChange({ throatAreaM2: Number(e.target.value) * 1e-4 })}
          />
        </div>
      )}

      <h2 className="sub-heading">Vehicle Mass</h2>

      <div className="field">
        <label>
          Dry Mass <span className="val">{eng ? `${fmt(toLb(input.dryMassKg), 0)} lb` : `${fmt(input.dryMassKg)} kg`}</span>
        </label>
        <input
          type="range"
          min="500"
          max="20000"
          step="100"
          value={input.dryMassKg}
          onChange={(e) => onChange({ dryMassKg: Number(e.target.value) })}
        />
      </div>

      <div className="field">
        <label>
          Propellant Mass{' '}
          <span className="val">{eng ? `${fmt(toLb(input.propellantMassKg), 0)} lb` : `${fmt(input.propellantMassKg)} kg`}</span>
        </label>
        <input
          type="range"
          min="1000"
          max="100000"
          step="500"
          value={input.propellantMassKg}
          onChange={(e) => onChange({ propellantMassKg: Number(e.target.value) })}
        />
      </div>

      <div className="derived-group">
        <div className="derived-heading">// derived — not adjustable (coupling rule)</div>
        <div className="derived-badges">
          <DerivedBadge
            label="ṁ mass flow"
            value={report.mdot !== null ? fmt(eng ? toLb(report.mdot) : report.mdot, eng ? 0 : 1) : '—'}
            unit={eng ? 'lb/s' : 'kg/s'}
          />
          <DerivedBadge
            label="Pe exit pressure"
            value={report.Pe !== null ? fmt(eng ? toPsi(report.Pe / 1e5) : report.Pe / 1e5, eng ? 1 : 3) : '—'}
            unit={eng ? 'psi' : 'bar'}
          />
          <DerivedBadge
            label="Ae exit area"
            value={report.Ae !== null ? fmt(eng ? toIn2(report.Ae * 1e4) : report.Ae, eng ? 1 : 3) : '—'}
            unit={eng ? 'in²' : 'm²'}
          />
          {thrustMode && (
            <DerivedBadge
              label="At throat area"
              value={fmt(eng ? toIn2(atCm2) : atCm2, eng ? 0 : 1)}
              unit={eng ? 'in²' : 'cm²'}
            />
          )}
          <DerivedBadge label="Me exit Mach" value={report.Me !== null ? fmt(report.Me, 2) : '—'} unit="M" />
        </div>
      </div>
    </>
  );
}
