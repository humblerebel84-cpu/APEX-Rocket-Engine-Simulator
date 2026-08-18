import type { DesignReport } from './performance';

// Engine-level loss corrections — the frozen ideal model omits these by design.
// Validation discipline (Architecture.md §6): the ±3% CEA regression validates the
// IDEAL model. Corrections are an optional layer on top (Sutton & Biblarz §12.3,
// Huzel & Huang §4.3), applied only when the UI toggle is on.

export type NozzleGeometry = 'conical' | 'bell';

export interface LossModel {
  geometry: NozzleGeometry;
  divergenceHalfAngleDeg: number; // conical nozzle half-angle (typical 15°; unused for bell)
  boundaryLayerEfficiency: number; // η_bl — boundary-layer loss coefficient (0–1)
}

export const DEFAULT_LOSSES: LossModel = {
  geometry: 'conical',
  divergenceHalfAngleDeg: 15,
  boundaryLayerEfficiency: 0.97,
};

// Conical-nozzle divergence efficiency: averaged cos over the exit plane = (1 + cos α)/2
// (Sutton & Biblarz §12.3). 15° → λ ≈ 0.983, 30° → λ ≈ 0.933.
export function conicalDivergenceEfficiency(halfAngleDeg: number): number {
  if (halfAngleDeg <= 0) return 1;
  const t = (halfAngleDeg * Math.PI) / 180;
  return (1 + Math.cos(t)) / 2;
}

// Rao-optimized bell exit half-angle (degrees) vs area ratio. A Rao contour turns the
// flow quickly near the throat then tapers to a small exit tangent angle, so λ is much
// closer to 1 than a fixed cone. Correlation anchored on published optimum-bell values
// (Huzel & Huang, Design of Liquid-Propellant Rocket Engines, Fig. 4-7; Sutton §3):
//   ε 10 → ~12°, ε 25 → ~10°, ε 40 → ~8°, ε 100 → ~5.5°, ε → ∞ → ~4.5°.
// Fit: θ_e = 4.5 + 9.38·e^(−0.0224·ε)  (engineering correlation, not first principles).
export function raoBellExitHalfAngleDeg(eps: number): number {
  const e = Math.max(eps, 2);
  return 4.5 + 9.38 * Math.exp(-0.0224 * e);
}

// Bell divergence efficiency: momentum integral for the contour's exit tangent angle,
// (1 + cos θ_e)/2. Same formula as the cone, applied to the Rao exit angle.
export function bellDivergenceEfficiency(eps: number): number {
  return conicalDivergenceEfficiency(raoBellExitHalfAngleDeg(eps));
}

export function divergenceEfficiency(losses: LossModel, eps: number): number {
  return losses.geometry === 'bell'
    ? bellDivergenceEfficiency(eps)
    : conicalDivergenceEfficiency(losses.divergenceHalfAngleDeg);
}

export function thrustLossFactor(losses: LossModel, eps: number): number {
  return divergenceEfficiency(losses, eps) * losses.boundaryLayerEfficiency;
}

// Corrected, engine-level report. F, Isp, Cf, density impulse, Δv and TWR all scale
// by the loss factor; throat flow (ṁ, c*, Pe, Ae, Me), burn time and geometry are
// unaffected. Returns a new report with lossFactor set.
export function applyLosses(report: DesignReport, losses: LossModel): DesignReport {
  const f = thrustLossFactor(losses, report.expansionRatio);
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