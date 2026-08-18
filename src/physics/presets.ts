import type { PropellantId } from './propellants';

export type PresetKind = 'engine' | 'mission';

export interface Preset {
  id: string;
  name: string;
  kind: PresetKind;
  propellantId: PropellantId;
  chamberPressurePa: number;
  expansionRatio: number;
  ambientPressurePa: number;
  throatAreaM2: number;
  dryMassKg: number;
  propellantMassKg: number;
  realIsp?: number; // published achieved Isp at the preset's ambient (engine presets) — "model vs real"
  realMdot?: number; // published propellant mass flow kg/s (engine presets) — throat area calibrated to it
  mission?: string; // mission preset: target MissionRef name in missions.ts
  note: string;
  citation: string;
}

const BAR = 1e5;

export const ENGINE_PRESETS: Preset[] = [
  {
    id: 'rs25',
    name: 'RS-25 (SSME)',
    kind: 'engine',
    propellantId: 'lox_lh2',
    chamberPressurePa: 206.8 * BAR,
    expansionRatio: 69,
    ambientPressurePa: 0,
    throatAreaM2: 0.057,
    dryMassKg: 1000,
    propellantMassKg: 1000,
    realIsp: 452.3,
    realMdot: 514,
    note: 'The Space Shuttle / SLS main engine. Highest sustained chamber pressure of its era; throat area calibrated to its published mass flow (≈514 kg/s).',
    citation: 'NASA / Aerojet Rocketdyne RS-25 fact sheet: Pc 3000 psi (206.8 bar), ε 69, Isp,vac 452.3 s, F,vac 2.279 MN, ṁ ≈ 514 kg/s',
  },
  {
    id: 'raptor2_vac',
    name: 'Raptor 2 (RVac)',
    kind: 'engine',
    propellantId: 'lox_ch4',
    chamberPressurePa: 300 * BAR,
    expansionRatio: 80,
    ambientPressurePa: 0,
    throatAreaM2: 0.044,
    dryMassKg: 1000,
    propellantMassKg: 1000,
    realIsp: 380,
    realMdot: 679,
    note: 'Starship/Super Heavy’s vacuum-optimized full-flow staged-combustion engine. 300 bar chamber pressure, methane/oxygen.',
    citation: 'SpaceX Raptor family (Wikipedia/infobox): Pc 300 bar, ε 80 (RVac), Isp,vac ≈ 380 s, F,vac 2.53 MN, ṁ ≈ 679 kg/s',
  },
  {
    id: 'merlin1d',
    name: 'Merlin 1D (sea level)',
    kind: 'engine',
    propellantId: 'lox_rp1',
    chamberPressurePa: 97 * BAR,
    expansionRatio: 16,
    ambientPressurePa: 1.01325e5,
    throatAreaM2: 0.0558,
    dryMassKg: 1000,
    propellantMassKg: 1000,
    realIsp: 282,
    realMdot: 305,
    note: 'Falcon 9 booster engine. Gas-generator RP-1 workhorse with 16:1 sea-level nozzle.',
    citation: 'Wikipedia “SpaceX Merlin”: Pc 9.7 MPa (97 bar), ε 16, Isp,sl 282 s, F,sl 845 kN, ṁ ≈ 305 kg/s',
  },
  {
    id: 'rd107a',
    name: 'RD-107A',
    kind: 'engine',
    propellantId: 'lox_rp1',
    chamberPressurePa: 61.2 * BAR,
    expansionRatio: 8.5,
    ambientPressurePa: 0,
    throatAreaM2: 0.094,
    dryMassKg: 1000,
    propellantMassKg: 1000,
    realIsp: 320,
    realMdot: 325,
    note: 'Soyuz’s booster engine, the most-flown rocket engine in history. Short, fat nozzle for dense atmosphere at liftoff.',
    citation: 'KB Khimavtomatika RD-107A / Soyuz User’s Guide: Pc 61.2 bar, ε ≈ 8.5, Isp,vac 320 s, F,sl 839 kN, ṁ ≈ 325 kg/s',
  },
  {
    id: 'rl10c1',
    name: 'RL10C-1 (Vulcan Centaur)',
    kind: 'engine',
    propellantId: 'lox_lh2',
    chamberPressurePa: 45 * BAR,
    expansionRatio: 130,
    ambientPressurePa: 0,
    throatAreaM2: 0.01178,
    dryMassKg: 1000,
    propellantMassKg: 1000,
    realIsp: 449.7,
    realMdot: 23.1,
    note: 'The Vulcan Centaur upper-stage engine, descended from 60 years of RL10. Tiny throat, huge expansion ratio.',
    citation: 'Aerojet Rocketdyne RL10C-1 / ULA Vulcan Centaur: Isp,vac 449.7 s, F 101.8 kN, ε 130, ṁ ≈ 23 kg/s',
  },
];

export const MISSION_PRESETS: Preset[] = [
  {
    id: 'f9_booster',
    name: 'Falcon 9 first stage (per-Merlin slice)',
    kind: 'mission',
    propellantId: 'lox_rp1',
    chamberPressurePa: 97 * BAR,
    expansionRatio: 16,
    ambientPressurePa: 1.01325e5,
    throatAreaM2: 0.0558,
    dryMassKg: 3022,
    propellantMassKg: 45700,
    mission: 'LEO from surface',
    note: 'One of nine Merlins carrying 1/9 of the booster (≈411 t propellant, ≈27.2 t dry). Single-stage ideal Δv overstates the real booster — staging and gravity/drag losses are not modeled.',
    citation: 'SpaceX Falcon 9 User’s Guide: booster ≈ 27.2 t dry, ≈ 411 t propellant; 9 × Merlin 1D',
  },
  {
    id: 'f9_upper',
    name: 'Falcon 9 second stage (Merlin 1D Vac)',
    kind: 'mission',
    propellantId: 'lox_rp1',
    chamberPressurePa: 97 * BAR,
    expansionRatio: 165,
    ambientPressurePa: 0,
    throatAreaM2: 0.0558,
    dryMassKg: 4000,
    propellantMassKg: 107500,
    mission: 'LEO from surface',
    note: 'The Falcon 9 upper stage: single vacuum Merlin with 165:1 nozzle. Real stage does ~2–3 km/s on top of the booster’s work, not the full LEO budget.',
    citation: 'SpaceX Falcon 9 User’s Guide: S2 ≈ 4 t dry, ≈ 107.5 t propellant; Merlin 1D Vac, ε 165, Isp,vac 348 s',
  },
  {
    id: 'cubesat_kicker',
    name: 'CubeSat kicker (green monoprop)',
    kind: 'mission',
    propellantId: 'ascent',
    chamberPressurePa: 15 * BAR,
    expansionRatio: 50,
    ambientPressurePa: 0,
    throatAreaM2: 3.5e-5,
    dryMassKg: 20,
    propellantMassKg: 30,
    mission: 'LEO from surface',
    note: 'A 50 kg-class kicker stage on ASCENT green monopropellant — the sort of small stage that pushes a CubeSat from a rideshare orbit. Throat slider bottoms out; the preset value is authoritative.',
    citation: 'NASA GRC AF-M315E / GR-1 thruster data: Isp ≈ 247 s vac; small-spacecraft deployment-class stage',
  },
];

export const ALL_PRESETS: Preset[] = [...ENGINE_PRESETS, ...MISSION_PRESETS];