export function throatAreaFromDiameter(dMm: number): number | null {
  if (!(dMm > 0)) return null;
  const dM = dMm / 1000;
  return (Math.PI / 4) * dM * dM;
}

export function massFlowFromThroatArea(Pc: number, At: number, cStar: number): number | null {
  if (!(Pc > 0) || !(At > 0) || !(cStar > 0)) return null;
  return (Pc * At) / cStar;
}

export function throatAreaFromMassFlow(Pc: number, mdot: number, cStar: number): number | null {
  if (!(Pc > 0) || !(mdot > 0) || !(cStar > 0)) return null;
  return (mdot * cStar) / Pc;
}

export function throatAreaForThrust(F: number, Pc: number, cf: number): number | null {
  if (!(F > 0) || !(Pc > 0) || !(cf > 0)) return null;
  return F / (Pc * cf);
}
