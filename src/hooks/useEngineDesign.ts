import { useMemo } from 'react';
import { PROPELLANTS, type Propellant, type PropellantId } from '../physics/propellants';
import { computeDesign, type DesignReport } from '../physics/performance';

export interface EngineDesignInput {
  propellantId: PropellantId;
  chamberPressurePa: number;
  expansionRatio: number;
  ambientPressurePa: number;
  throatAreaM2: number;
  dryMassKg: number;
  propellantMassKg: number;
}

export const DEFAULT_INPUT: EngineDesignInput = {
  propellantId: 'lox_ch4',
  chamberPressurePa: 1e7,
  expansionRatio: 40,
  ambientPressurePa: 0,
  throatAreaM2: 0.01,
  dryMassKg: 4000,
  propellantMassKg: 16000,
};

export interface EngineDesign {
  propellant: Propellant;
  report: DesignReport;
}

export function useEngineDesign(input: EngineDesignInput): EngineDesign {
  const {
    propellantId,
    chamberPressurePa,
    expansionRatio,
    ambientPressurePa,
    throatAreaM2,
    dryMassKg,
    propellantMassKg,
  } = input;

  return useMemo(() => {
    const propellant = PROPELLANTS[propellantId];
    const report = computeDesign(propellant, {
      Pc: chamberPressurePa,
      eps: expansionRatio,
      Pa: ambientPressurePa,
      At: throatAreaM2,
      dryMass: dryMassKg,
      propMass: propellantMassKg,
    });
    return { propellant, report };
  }, [propellantId, chamberPressurePa, expansionRatio, ambientPressurePa, throatAreaM2, dryMassKg, propellantMassKg]);
}
