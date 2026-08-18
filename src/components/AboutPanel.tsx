import { useMemo } from 'react';
import { computeDesign } from '../physics/performance';
import { PROPELLANTS } from '../physics/propellants';
import { CEA_REFERENCE_POINTS } from '../physics/validation';
import { fmt } from '../physics/format';

interface Props {
  open: boolean;
  onClose: () => void;
}

const GITHUB_ISSUES = 'https://github.com/humblerebel84-cpu/APEX-Rocket-Engine-Simulator/issues';

const EQUATIONS = [
  { name: 'de Laval exhaust velocity', formula: 'v_e = √[(2k/(k−1))·(R/M)·Tc·(1−(Pe/Pc)^((k−1)/k))]', source: 'Sutton & Biblarz, Rocket Propulsion Elements, 9th ed., §3' },
  { name: 'Characteristic velocity c*', formula: 'c* = √(R·Tc/M) / Γ(k), Γ(k) = √k·(2/(k+1))^((k+1)/(2(k−1)))', source: 'Sutton & Biblarz §3.5; calibrated (Tc, M, k) vs NASA CEA' },
  { name: 'Choked mass flow', formula: 'ṁ = Pc·At / c*', source: 'Sutton & Biblarz §3.4' },
  { name: 'Thrust with pressure term', formula: 'F = ṁ·v_e + (Pe − Pa)·Ae', source: 'Sutton & Biblarz §3.2–3.3' },
  { name: 'Thrust coefficient', formula: 'Cf = F / (Pc·At)', source: 'Sutton & Biblarz §3.3' },
  { name: 'Specific impulse', formula: 'Isp = F / (ṁ·g₀)', source: 'Sutton & Biblarz §1.5' },
  { name: 'Tsiolkovsky rocket equation', formula: 'Δv = Isp·g₀·ln(m₀/m_f)', source: 'Sutton & Biblarz §4.2' },
  { name: 'Flow-separation criterion', formula: 'P_e < 0.4·P_a → separation likely', source: 'Summerfield criterion, cited in Sutton & Biblarz §3.4' },
];

const ASSUMPTIONS = [
  'Frozen-flow combustion model: fixed (Tc, M, k) per propellant, calibrated to NASA CEA equilibrium chemistry (Architecture.md §6).',
  'One-dimensional isentropic nozzle theory with a real pressure term — no boundary-layer or divergence losses in the ideal model (an optional correction layer is available).',
  'No altitude-varying ambient pressure, no multi-stage optimization, no chamber heat loss.',
  'Every propellant carries a published citation (Sutton & Biblarz, NASA CEA / rocketcea); liquid bipropellants are held to ±3% of CEA (enforced by 34 regression tests).',
  'Solids, monopropellants and hybrids use wider validation bands — the frozen-flow model is a simplification there.',
];

export default function AboutPanel({ open, onClose }: Props) {
  const rows = useMemo(
    () =>
      CEA_REFERENCE_POINTS.map(({ id, PcBar, eps, refIsp, source }) => {
        const r = computeDesign(PROPELLANTS[id], {
          Pc: PcBar * 1e5,
          eps,
          Pa: 0,
          At: 1e-4,
          dryMass: 1,
          propMass: 1,
        });
        const model = r.isp ?? NaN;
        const delta = Math.abs(model - refIsp) / refIsp;
        return {
          name: PROPELLANTS[id].name,
          PcBar,
          eps,
          refIsp,
          model,
          delta,
          pass: delta < 0.03,
          source,
        };
      }),
    [],
  );

  if (!open) return null;

  return (
    <div className="about-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-header">
          <h2>
            APEX<span>.</span> ABOUT &amp; SOURCES
          </h2>
          <button type="button" className="about-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="about-lede">
          A free, offline rocket-engine trade-study tool. Every equation is real aerospace
          engineering; every propellant number is cited; every liquid bipropellant is regression-tested
          to within 3% of NASA CEA equilibrium chemistry.
        </p>

        <h3>Validation — vacuum Isp vs NASA CEA / Sutton</h3>
        <table className="about-table">
          <thead>
            <tr>
              <th>Propellant</th>
              <th>Pc (bar)</th>
              <th>ε</th>
              <th>Reference Isp (s)</th>
              <th>Model Isp (s)</th>
              <th>Δ</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className={row.pass ? '' : 'about-fail'}>
                <td>{row.name}</td>
                <td>{row.PcBar}</td>
                <td>{row.eps}</td>
                <td>{row.refIsp}</td>
                <td>{fmt(row.model, 1)}</td>
                <td>{row.pass ? '✓ ≤3%' : `⚠ ${fmt(row.delta * 100, 1)}%`}</td>
                <td className="about-src">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="about-footnote">
          Same physics the test suite enforces (tests/validation_cea.test.ts, 43 cases) — this table is
          rendered from the identical shared reference data, so it can never drift.
        </p>

        <h3>Governing equations &amp; sources</h3>
        <ul className="about-list">
          {EQUATIONS.map((eq) => (
            <li key={eq.name}>
              <strong>{eq.name}:</strong> <code>{eq.formula}</code>
              <br />
              <span className="about-src">{eq.source}</span>
            </li>
          ))}
        </ul>

        <h3>Model assumptions &amp; caveats</h3>
        <ul className="about-list">
          {ASSUMPTIONS.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>

        <h3>Feedback</h3>
        <p>
          Found a wrong number or a propellant you want added? Open an issue — data corrections are
          welcome and get verified against a source:{' '}
          <a href={GITHUB_ISSUES} target="_blank" rel="noreferrer">
            {GITHUB_ISSUES}
          </a>
        </p>

        <p className="about-disclaimer">
          <strong>Educational / trade-study tool — not flight-certified. Not for safety-critical
          design.</strong> Simulation output must never directly drive ignition, valves, or any
          hardware decision without an independent, hardware-level safety interlock.
        </p>
      </div>
    </div>
  );
}