export const PROPELLANT_CATEGORIES = ['Cryogenic', 'Storable', 'Hypergolic', 'Solid', 'Hybrid', 'Monoprop'] as const;

export type PropellantCategory = (typeof PROPELLANT_CATEGORIES)[number];

export interface Propellant {
  name: string;
  category: PropellantCategory;
  Tc: number; // K, adiabatic flame / chamber temperature (frozen-flow value)
  M: number; // kg/mol, effective exhaust molar mass (frozen flow, calibrated vs CEA)
  k: number; // frozen ratio of specific heats at the nozzle exit
  of?: number; // mixture ratio (mass O/F) the data refers to
  densityKgM3: number; // bulk (combination) density, kg/m³ — O/F-weighted; drives density-impulse readout
  flame: string; // exhaust plume colour (presentation only; e.g. RP-1 bright orange, LH2 pale)
  cokingLimitBar?: number; // chamber-pressure coking limit (kerosene ~200 bar) → warning above it
  // true = simplified frozen-flow approximation (monopropellants / solids / hybrids),
  // where the frozen (Tc, M, k) model is a genuine simplification of the real physics.
  // false/absent = held to the ±3% CEA regression discipline in validation_cea.test.ts.
  // NOTE: this is a property of the *combustion model*, not of the category — a storable
  // liquid bipropellant (98% H2O2 / RP-1) is CEA-validated despite not being cryogenic
  // or hypergolic, so do not re-derive this flag from `category`.
  approxModel?: boolean;
  note: string;
  citation: string;
}

export const PROPELLANTS = {
  // ── Cryogenic ─────────────────────────────────────────────────────────────
  lox_lh2: {
    name: 'LOX / LH2 (Liquid Hydrogen)',
    category: 'Cryogenic',
    Tc: 3357,
    M: 0.0126,
    k: 1.2,
    of: 6.0,
    densityKgM3: 361,
    flame: '#bcd7e8',
    note: 'Highest performance chemical propellant (RS-25 / SSME class). Cryogenic, very low density — large tanks.',
    citation: 'Sutton & Biblarz, Rocket Propulsion Elements, 9th ed., Table 5-8 + NASA CEA, Pc ≈ 68 bar, O/F = 6.0, ε = 77 → Isp,vac ≈ 453 s; ρ_bulk ≈ 361 kg/m³ (O/F-weighted: LH2 71, LOX 1141)',
  },
  lox_rp1: {
    name: 'LOX / RP-1 (Kerosene)',
    category: 'Cryogenic',
    Tc: 3670,
    M: 0.0238,
    k: 1.148,
    of: 2.7,
    densityKgM3: 1027,
    flame: '#e8853d',
    cokingLimitBar: 200,
    note: 'Dense, high thrust density. Used in Merlin, F-1, Soyuz (RD-107/108). Coking limits chamber pressure unless film-cooled.',
    citation: 'Sutton & Biblarz, 9th ed., Table 5-8 + NASA CEA, Pc ≈ 97 bar, O/F = 2.7, ε = 16 → Isp,vac ≈ 333 s; ρ_bulk ≈ 1027 kg/m³ (RP-1 810, LOX 1141)',
  },
  lox_ch4: {
    name: 'LOX / LCH4 (Methane)',
    category: 'Cryogenic',
    Tc: 3550,
    M: 0.0187,
    k: 1.19,
    of: 3.6,
    densityKgM3: 833,
    flame: '#6db6e0',
    note: 'Coking-resistant, reusable-engine friendly. Used in SpaceX Raptor, Blue Origin BE-4.',
    citation: 'NASA CEA, Pc = 100 bar, O/F = 3.6, ε = 40 → Isp,vac ≈ 376 s; consistent with Huzel & Huang trends; ρ_bulk ≈ 833 kg/m³ (LCH4 422, LOX 1141)',
  },
  lox_ethanol: {
    name: 'LOX / Ethanol (Alcohol)',
    category: 'Cryogenic',
    Tc: 3400,
    M: 0.023,
    k: 1.19,
    of: 1.7,
    densityKgM3: 979,
    flame: '#f4a93c',
    note: 'V-2 flew on 75% ethanol (water-diluted); Copenhagen Suborbitals still flies it. Easy to source, safer to handle — the classic student/amateur LOX fuel.',
    citation: 'Sutton & Biblarz, 9th ed., Table 5-8 (O2 + ethyl alcohol) + NASA CEA, Pc ≈ 50 bar, O/F = 1.7, ε = 40 → Isp,vac ≈ 331 s; ρ_bulk ≈ 979 kg/m³ (ethanol 789, LOX 1141)',
  },
  lox_ammonia: {
    name: 'LOX / Ammonia (X-15 XLR99)',
    category: 'Cryogenic',
    Tc: 3250,
    M: 0.0206,
    k: 1.21,
    of: 1.4,
    densityKgM3: 892,
    flame: '#9fc9e0',
    note: 'LOX + anhydrous ammonia fired the X-15’s Reaction Motors XLR99 past Mach 6. Unusual chemistry — the ammonia doubles as a regenerative coolant.',
    citation: 'NASA CEA, Pc ≈ 70 bar, O/F = 1.4, ε = 40 → Isp,vac ≈ 335 s; XLR99 actual ≈ 285 s vac (Pc ≈ 38 bar, ε = 7.5, incl. losses); ρ_bulk ≈ 892 kg/m³ (NH3 683, LOX 1141)',
  },
  lox_propane: {
    name: 'LOX / Propane (LPG)',
    category: 'Cryogenic',
    Tc: 3520,
    M: 0.0206,
    k: 1.18,
    of: 3.9,
    densityKgM3: 904,
    flame: '#7fc4e8',
    note: 'Propane sits between methane and kerosene — near-LNG performance with simpler logistics. Trialled by small-launch startups; student-friendly.',
    citation: 'NASA CEA, Pc = 100 bar, O/F = 3.9, ε = 40 → Isp,vac ≈ 359 s; ρ_bulk ≈ 904 kg/m³ (LPG ≈ 500, LOX 1141)',
  },
  lf2_lh2: {
    name: 'LF2 / LH2 (Liquid Fluorine)',
    category: 'Cryogenic',
    Tc: 4150,
    M: 0.0108,
    k: 1.33,
    of: 9.0,
    densityKgM3: 498,
    flame: '#e2d4f5',
    note: 'The chemical ceiling — and the reason Isp is never the whole story. Fluorine beats LOX on BOTH specific impulse and tank density, and has still never flown. It ignites on contact with almost anything (including asbestos and sand), the exhaust is hydrofluoric acid, and a pad spill is a mass-casualty event. Compare it against LOX/LH2 to see exactly how much performance engineers walked away from.',
    citation: 'NASA CEA (rocketcea 1.2.3, F2/LH2), Pc = 68 bar, O/F = 9.0, ε = 77 → Isp,vac ≈ 488 s (equilibrium), Tc ≈ 4146 K, c* ≈ 2540 m/s — same Pc and ε as the LOX/LH2 entry, i.e. ≈ +35 s for a like-for-like swap; ρ_bulk ≈ 498 kg/m³ (LH2 71, LF2 1505)',
  },

  // ── Hypergolic ────────────────────────────────────────────────────────────
  n2o4_mmh: {
    name: 'N2O4 / MMH (Hypergolic)',
    category: 'Hypergolic',
    Tc: 3125,
    M: 0.0217,
    k: 1.21,
    of: 2.0,
    densityKgM3: 1189,
    flame: '#a8c47a',
    note: 'Storable, hypergolic (ignites on contact) — no ignition system needed. Standard spacecraft propellant.',
    citation: 'Sutton & Biblarz, 9th ed. + NASA CEA, O/F = 2.0 (storable bipropellant reference values); ρ_bulk ≈ 1189 kg/m³ (MMH 878, N2O4 1446)',
  },
  n2o4_udmh: {
    name: 'N2O4 / UDMH (Hypergolic)',
    category: 'Hypergolic',
    Tc: 3410,
    M: 0.022,
    k: 1.19,
    of: 2.4,
    densityKgM3: 1163,
    flame: '#a3bf72',
    note: 'The Titan II, Proton (RD-253) and Long March workhorse. Storable + hypergolic, but toxic and corrosive — the flip side of the LOX family.',
    citation: 'Sutton & Biblarz, 9th ed., Table 5-9 + NASA CEA, Pc ≈ 70 bar, O/F = 2.4, ε = 40 → Isp,vac ≈ 337 s; ρ_bulk ≈ 1163 kg/m³ (UDMH 791, N2O4 1446)',
  },
  aerozine_n2o4: {
    name: 'Aerozine-50 / N2O4 (Apollo SPS)',
    category: 'Hypergolic',
    Tc: 3270,
    M: 0.0215,
    k: 1.21,
    of: 1.6,
    densityKgM3: 1172,
    flame: '#adcf87',
    note: 'Aerozine-50 (50% UDMH / 50% hydrazine) + N2O4 powered the Apollo SPS AJ10 engine — every lunar mission’s insertion, midcourse and return burns.',
    citation: 'NASA CEA, Pc ≈ 10 bar, O/F = 1.6, ε = 60 → Isp,vac ≈ 335 s; AJ10-137 flew at ε = 147.5, achieving ≈ 312 s incl. losses; ρ_bulk ≈ 1172 kg/m³ (Aerozine-50 ≈ 900, N2O4 1446)',
  },
  irfna_udmh: {
    name: 'IRFNA / UDMH (Nitric Acid)',
    category: 'Hypergolic',
    Tc: 3130,
    M: 0.021,
    k: 1.23,
    of: 3.3,
    densityKgM3: 1282,
    flame: '#c98f5c',
    note: 'Inhibited red fuming nitric acid — by vehicle count, the most-flown storable oxidizer on Earth (Scud/R-17, Prithvi, and most Cold-War tactical missiles). Cheaper, denser and easier to store than N2O4; the price is roughly 15 s of Isp. The “inhibited” part is the HF additive that stops it dissolving its own tank.',
    citation: 'NASA CEA (rocketcea 1.2.3, IRFNA/UDMH), Pc = 70 bar, O/F = 3.3, ε = 40 → Isp,vac ≈ 322 s (equilibrium), Tc ≈ 3132 K, c* ≈ 1633 m/s — vs N2O4/UDMH ≈ 337 s at identical Pc and ε; ρ_bulk ≈ 1282 kg/m³ (UDMH 791, IRFNA ≈ 1580)',
  },

  // ── Storable ──────────────────────────────────────────────────────────────
  h2o2_rp1: {
    name: '98% H2O2 / RP-1 (Storable Biprop)',
    category: 'Storable',
    Tc: 2960,
    M: 0.0199,
    k: 1.21,
    of: 7.0,
    densityKgM3: 1316,
    flame: '#edc98a',
    note: 'The storable bipropellant that is neither hypergolic nor toxic. Black Arrow’s Gamma engines pushed HTP through a silver catalyst pack, then burned the resulting oxygen-rich steam with kerosene. Denser in the tank than LOX/RP-1, sits on the pad for months, and the exhaust is steam and CO2 — the “green” answer to N2O4.',
    citation: 'NASA CEA (rocketcea 1.2.3, Peroxide98/RP1), Pc = 70 bar, O/F = 7.0, ε = 40 → Isp,vac ≈ 327 s (equilibrium), Tc ≈ 2956 K, c* ≈ 1660 m/s; Black Arrow Gamma 8 (HTP/kerosene) flight reference; ρ_bulk ≈ 1316 kg/m³ (RP-1 810, 98% H2O2 1445)',
  },
  htp_98: {
    name: '98% H2O2 — HTP (Monoprop / Oxidizer)',
    category: 'Storable',
    Tc: 1023,
    M: 0.025,
    k: 1.26,
    densityKgM3: 1445,
    flame: '#f2e3b8',
    approxModel: true,
    note: 'High-test peroxide: storable, decomposes catalytically to hot steam + oxygen — a “green” hydrazine alternative. Black Arrow upper stage; modern green revival.',
    citation: 'Sutton & Biblarz, 9th ed. (H2O2 monoprop, adiabatic T ≈ 1023 K); Black Arrow WRE.005 reference; ρ ≈ 1445 kg/m³ (98%) — model approx.',
  },

  // ── Solid ─────────────────────────────────────────────────────────────────
  solid_apcp: {
    name: 'Solid APCP (Composite)',
    category: 'Solid',
    Tc: 3300,
    M: 0.029,
    k: 1.17,
    densityKgM3: 1800,
    flame: '#ffd9a0',
    approxModel: true,
    note: 'Ammonium perchlorate composite propellant. Simple, storable; SRBs and hobby rockets.',
    citation: 'Sutton & Biblarz, 9th ed., Table 5-8 (APCP typical), Pc ≈ 70 bar, ε = 10 → Isp,vac ≈ 270 s; ρ ≈ 1800 kg/m³ — model approx.',
  },
  knsu: {
    name: 'KNSU Sugar Propellant (Solid)',
    category: 'Solid',
    Tc: 1720,
    M: 0.047,
    k: 1.13,
    densityKgM3: 1890,
    flame: '#ffcf7a',
    approxModel: true,
    note: 'Potassium nitrate + sucrose/sorbitol — the castable hobby solid (NAR, Tripoli). Lowest Isp of the list, but real amateurs build and fly these.',
    citation: 'R. Nakka, Experimental Rocketry (KNSU: Tc ≈ 1720 K, c* ≈ 850 m/s), Pc ≈ 30 bar, ε = 10 → Isp,vac ≈ 158 s; ρ ≈ 1890 kg/m³ — model approx.',
  },

  // ── Hybrid ─────────────────────────────────────────────────────────────────
  n2o_paraffin: {
    name: 'N2O / Paraffin (Hybrid)',
    category: 'Hybrid',
    Tc: 2960,
    M: 0.028,
    k: 1.15,
    of: 8.0,
    densityKgM3: 762,
    flame: '#dceaf2',
    approxModel: true,
    note: 'Hybrid: a solid paraffin fuel grain burned by liquid N2O oxidizer — throttlable, restartable, inherently safer (no premixed explosive), the classic student / cubesat-class motor. Lower Isp than liquid biprops: N2O brings nitrogen that dilutes the exhaust.',
    citation: 'COBEM2005 (paraffin/N2O flight motor): c* ≈ 1485 m/s, Pc 20 bar, O/F 9.8, Isp ≈ 224.6 s (sea level, small ε); PoliMi NASA-CEA (equilibrium): Isp,vac ≈ 315 s at ε = 40 — frozen model 291 s; ρ_bulk ≈ 762 kg/m³ (N2O ≈ 745, paraffin ≈ 900) — model approx.',
  },

  // ── Monoprop ──────────────────────────────────────────────────────────────
  hydrazine_mono: {
    name: 'Hydrazine (Monopropellant)',
    category: 'Monoprop',
    Tc: 1200,
    M: 0.0145,
    k: 1.32,
    densityKgM3: 1008,
    flame: '#f0c9a0',
    approxModel: true,
    note: 'Catalytic decomposition (N2H4 → N2 + H2 + NH3), no combustion chamber. Powers satellite thrusters, Cassini, the Curiosity sky crane. Lower Isp, different physics.',
    citation: 'Sutton & Biblarz, 9th ed. (hydrazine decomposition); Aerojet MR-107 class ≈ 224 s vac (Pc ≈ 20 bar, ε ≈ 50); ρ ≈ 1008 kg/m³ — model approx.',
  },
  ascent: {
    name: 'ASCENT / LMP-103S (Green Monoprop)',
    category: 'Monoprop',
    Tc: 2050,
    M: 0.023,
    k: 1.21,
    densityKgM3: 1470,
    flame: '#dbe4f0',
    approxModel: true,
    note: 'NASA’s next-gen green monopropellant (HAN-based AF-M315E; ADN-based LMP-103S flew on PRISMA). Beats hydrazine on Isp and toxicity.',
    citation: 'NASA GRC AF-M315E / Aerojet GR-1: Isp ≈ 247 s vac; model ≈ 255 s (Pc ≈ 15 bar, ε = 50); ρ ≈ 1470 kg/m³ (AF-M315E) — model approx.',
  },
} satisfies Record<string, Propellant>;

export type PropellantId = keyof typeof PROPELLANTS;

export const PROPELLANT_IDS = Object.keys(PROPELLANTS) as PropellantId[];