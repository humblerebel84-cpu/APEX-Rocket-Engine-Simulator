import { R_UNIVERSAL } from './constants';
import type { Propellant } from './propellants';

export function gammaFunction(k: number): number | null {
  if (!(k > 1)) return null;
  return Math.sqrt(k) * Math.pow(2 / (k + 1), (k + 1) / (2 * (k - 1)));
}

export function throatPressureRatio(k: number): number | null {
  if (!(k > 1)) return null;
  return Math.pow(2 / (k + 1), k / (k - 1));
}

export function throatPressure(k: number, Pc: number): number | null {
  const ratio = throatPressureRatio(k);
  if (ratio === null || !(Pc > 0)) return null;
  return Pc * ratio;
}

export function areaRatioForMach(k: number, Me: number): number | null {
  if (!(k > 1) || !(Me > 0)) return null;
  const t = (2 / (k + 1)) * (1 + ((k - 1) / 2) * Me * Me);
  return (1 / Me) * Math.pow(t, (k + 1) / (2 * (k - 1)));
}

export function machForAreaRatio(k: number, eps: number): number | null {
  if (!(k > 1) || !(eps >= 1)) return null;
  if (eps === 1) return 1;
  let lo = 1;
  let hi = 50;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    const ar = areaRatioForMach(k, mid);
    if (ar === null) return null;
    if (ar < eps) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function exitPressureRatio(k: number, Me: number): number | null {
  if (!(k > 1) || !(Me >= 0)) return null;
  return Math.pow(1 + ((k - 1) / 2) * Me * Me, -k / (k - 1));
}

export function cStar(prop: Pick<Propellant, 'Tc' | 'M' | 'k'>): number {
  const g = gammaFunction(prop.k);
  if (g === null || !(prop.Tc > 0) || !(prop.M > 0)) return 0;
  return Math.sqrt((R_UNIVERSAL * prop.Tc) / prop.M) / g;
}

export function exhaustVelocityForPressureRatio(
  prop: Pick<Propellant, 'Tc' | 'M' | 'k'>,
  pressureRatio: number,
): number {
  if (!(pressureRatio > 0 && pressureRatio < 1)) return 0;
  const term = 1 - Math.pow(pressureRatio, (prop.k - 1) / prop.k);
  const base = ((2 * prop.k) / (prop.k - 1)) * (R_UNIVERSAL / prop.M) * prop.Tc;
  return Math.sqrt(Math.max(base * term, 0));
}

export function idealCfVac(k: number, eps: number): number | null {
  const Me = machForAreaRatio(k, eps);
  if (Me === null) return null;
  const peRatio = exitPressureRatio(k, Me);
  const g = gammaFunction(k);
  if (peRatio === null || g === null || !(peRatio > 0 && peRatio < 1)) return null;
  const momentumCf = g * Math.sqrt(((2 * k) / (k - 1)) * (1 - Math.pow(peRatio, (k - 1) / k)));
  return momentumCf + eps * peRatio;
}

// Ideal thrust coefficient including the pressure term at ambient pressure:
// Cf = F/(Pc·At) = Γ(k)·√[(2k/(k−1))·(1−pr^((k−1)/k))] + (pr − Pa/Pc)·ε.
// This is the same quantity computeDesign reports as `cf`, and it lets the
// thrust-target mode solve At = F/(Pc·Cf) without iterating.
export function thrustCoefficient(k: number, eps: number, paOverPc: number): number | null {
  const Me = machForAreaRatio(k, eps);
  if (Me === null) return null;
  const peRatio = exitPressureRatio(k, Me);
  const g = gammaFunction(k);
  if (peRatio === null || g === null || !(peRatio > 0 && peRatio < 1)) return null;
  const momentum = g * Math.sqrt(((2 * k) / (k - 1)) * (1 - Math.pow(peRatio, (k - 1) / k)));
  return momentum + (peRatio - paOverPc) * eps;
}

export function machForPressureRatio(k: number, pressureRatio: number): number | null {
  if (!(k > 1) || !(pressureRatio > 0 && pressureRatio < 1)) return null;
  let lo = 1;
  let hi = 50;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    const r = exitPressureRatio(k, mid);
    if (r === null) return null;
    if (r > pressureRatio) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
