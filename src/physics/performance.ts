import { G0 } from './constants';
import type { Propellant } from './propellants';
import {
  cStar,
  exitPressureRatio,
  exhaustVelocityForPressureRatio,
  machForAreaRatio,
  thrustCoefficient,
} from './nozzle';
import { massFlowFromThroatArea } from './sizing';

export function exhaustVelocity(prop: Pick<Propellant, 'Tc' | 'M' | 'k'>, Pc: number, Pe: number): number {
  if (!(Pc > 0)) return 0;
  return exhaustVelocityForPressureRatio(prop, Pe / Pc);
}

export function specificImpulse(ve: number): number {
  return ve / G0;
}

export function deltaV(isp: number, m0: number, mf: number): number {
  if (m0 <= 0 || mf <= 0 || m0 <= mf) return 0;
  return isp * G0 * Math.log(m0 / mf);
}

export function thrust(mdot: number, ve: number, Pe: number, Pa: number, Ae: number): number {
  return mdot * ve + (Pe - Pa) * Ae;
}

export interface DesignInputs {
  Pc: number; // Pa
  eps: number; // Ae/At
  Pa: number; // Pa
  At: number; // m²
  dryMass: number; // kg
  propMass: number; // kg
}

export type WarningId = 'invalid' | 'over-expanded' | 'separation-risk' | 'low-twr' | 'coking-risk';

export interface DesignWarning {
  id: WarningId;
  message: string;
}

export interface DesignReport {
  Me: number | null;
  Pe: number | null; // Pa
  ve: number; // m/s
  cstar: number; // m/s
  mdot: number | null; // kg/s
  Ae: number | null; // m²
  F: number | null; // N
  isp: number | null; // s
  densityImpulse: number | null; // N·s/m³ = ρ_bulk · g0 · Isp
  cf: number | null; // -
  m0: number; // kg
  mf: number; // kg
  massRatio: number | null; // -
  dv: number; // m/s
  burnTime: number; // s
  twr: number | null; // -
  lossFactor?: number; // 1 = ideal; <1 only after applyLosses() (engine-level corrections)
  warnings: DesignWarning[];
}

export function computeDesign(prop: Propellant, inputs: DesignInputs): DesignReport {
  const warnings: DesignWarning[] = [];
  const cstar = cStar(prop);
  const m0 = inputs.dryMass + inputs.propMass;
  const mf = inputs.dryMass;

  const valid = inputs.Pc > 0 && inputs.eps >= 1 && inputs.At > 0 && inputs.Pa >= 0 && cstar > 0;
  if (!valid) {
    warnings.push({
      id: 'invalid',
      message: 'Inputs out of range (need Pc > 0, ε ≥ 1, throat area > 0, ambient ≥ 0). Readouts invalid.',
    });
  }

  const Me = valid ? machForAreaRatio(prop.k, inputs.eps) : null;
  const peRatio = valid && Me !== null ? exitPressureRatio(prop.k, Me) : null;
  const Pe = peRatio !== null ? inputs.Pc * peRatio : null;
  const ve = peRatio !== null ? exhaustVelocityForPressureRatio(prop, peRatio) : 0;
  const mdot = valid ? massFlowFromThroatArea(inputs.Pc, inputs.At, cstar) : null;
  const Ae = valid ? inputs.At * inputs.eps : null;
  const F = mdot !== null && Pe !== null && Ae !== null ? thrust(mdot, ve, Pe, inputs.Pa, Ae) : null;
  const cf = valid && peRatio !== null ? thrustCoefficient(prop.k, inputs.eps, inputs.Pa / inputs.Pc) : null;
  const isp = F !== null && mdot !== null && mdot > 0 ? specificImpulse(F / mdot) : null;
  const densityImpulse = isp !== null ? prop.densityKgM3 * G0 * isp : null;
  const massRatio = m0 > 0 && mf > 0 ? m0 / mf : null;
  const dv = isp !== null ? deltaV(isp, m0, mf) : 0;
  const burnTime = mdot !== null && mdot > 0 ? inputs.propMass / mdot : Infinity;
  const twr = F !== null && m0 > 0 ? F / (m0 * G0) : null;

  if (Pe !== null && inputs.Pa > 0 && Pe < inputs.Pa) {
    warnings.push({
      id: 'over-expanded',
      message: 'Nozzle is over-expanded at this ambient pressure (Pe < Pa) — the pressure term is subtracting thrust.',
    });
  }
  if (Pe !== null && inputs.Pa > 0 && Pe < 0.4 * inputs.Pa) {
    warnings.push({
      id: 'separation-risk',
      message: 'Severe over-expansion (Pe < 0.4·Pa, Summerfield criterion) — flow separation likely. Use a smaller ε for this ambient pressure.',
    });
  }
  if (twr !== null && twr < 1) {
    warnings.push({
      id: 'low-twr',
      message: 'TWR < 1.0 — this stage cannot lift off under its own thrust (acceptable for vacuum/in-space stages only).',
    });
  }
  if (prop.cokingLimitBar !== undefined && inputs.Pc > prop.cokingLimitBar * 1e5) {
    warnings.push({
      id: 'coking-risk',
      message: `Chamber pressure above the kerosene coking limit (~${prop.cokingLimitBar} bar) — thermal decomposition/coking risk in the cooling jacket and nozzle. Kerosene engines need film or regenerative cooling at high Pc.`,
    });
  }

  return { Me, Pe, ve, cstar, mdot, Ae, F, isp, densityImpulse, cf, m0, mf, massRatio, dv, burnTime, twr, warnings };
}
