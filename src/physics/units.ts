// SI ↔ US customary conversions. All state stays SI internally (Rule #1); these
// helpers exist only for display at the UI boundary.

export type UnitSystem = 'si' | 'eng';

const PSI_PER_BAR = 14.5037738;
const LB_PER_KG = 2.20462262;
const FT_PER_M = 3.2808399;
const IN2_PER_CM2 = 0.15500031;
const LBF_PER_KN = 224.808943;
const LBF_S_PER_IN3_PER_KN_S_M3 = 0.0036839; // 1 kN·s/m³ = 0.224809 lbf / 61023.7 in³
const LBM_PER_FT3_PER_KG_M3 = 0.06242796;

export function toPsi(bar: number): number {
  return bar * PSI_PER_BAR;
}

export function toLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function toFtPerS(mPerS: number): number {
  return mPerS * FT_PER_M;
}

export function toIn2(cm2: number): number {
  return cm2 * IN2_PER_CM2;
}

export function toLbf(kn: number): number {
  return kn * LBF_PER_KN;
}

export function toLbfSPerIn3(knSPerM3: number): number {
  return knSPerM3 * LBF_S_PER_IN3_PER_KN_S_M3;
}

export function toLbmPerFt3(kgPerM3: number): number {
  return kgPerM3 * LBM_PER_FT3_PER_KG_M3;
}