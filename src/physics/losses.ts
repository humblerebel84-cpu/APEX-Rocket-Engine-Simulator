import type { DesignReport } from './performance';

// Engine-level loss corrections — the frozen ideal model omits these by design.
// Validation discipline (Architecture.md §6): the ±3% CEA regression validates the
// IDEAL model. Corrections are an optional layer on top (Sutton & Biblarz §12.3,
// Huzel & Huang §4.3), applied only when the UI toggle is on.

export interface LossModel {
  divergenceHalfAngleDeg: number; // conical nozzle half-angle (typical 15°)
  boundaryLayerEfficiency: number; // η_bl — boundary-layer loss coefficient (0–1)
}

export const DEFAULT_LOSSES: LossModel = {
  divergenceHalfAngleDeg: 15,
  boundaryLayerEfficiency: 0.97,
};

// Conical-nozzle divergence efficiency: averaged cos over the exit plane = (1 + cos α)/2.
export function divergenceEfficiency(halfAngleDeg: number): number {
  if (halfAngleDeg < 0) return 1;
  const t = (halfAngleDeg * Math.PI) / 180;
  return (1 + Math.cos(t)) / 2;
}

export function thrustLossFactor(losses: LossModel): number {
  return divergenceEfficiency(losses.divergenceHalfAngleDeg) * losses.boundaryLayerEfficiency;
}

// Corrected, engine-level report. F, Isp, Cf, density impulse, Δv and TWR all scale
// by the loss factor; throat flow (ṁ, c*, Pe, Ae, Me), burn time and geometry are
// unaffected. Returns a new report with lossFactor set.
export function applyLosses(report: DesignReport, losses: LossModel): DesignReport {
  const f = thrustLossFactor(losses);
  return {
    ...report,
    F: report.F !== null ? report.F * f : null,
    isp: report.isp !== null ? report.isp * f : null,
    cf: report.cf !== null ? report.cf * f : null,
    densityImpulse: report.densityImpulse !== null ? report.densityImpulse * f : null,
    dv: report.isp !== null ? report.dv * f : report.dv,
    twr: report.twr !== null ? report.twr * f : null,
    lossFactor: f,
  };
}