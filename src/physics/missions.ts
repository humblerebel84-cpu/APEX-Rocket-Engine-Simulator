export interface MissionRef {
  name: string;
  dv: number; // m/s
  description: string;
  source: string;
}

// Δv budgets: NASA / JPL mission design reference values (ideal two-impulse transfers
// plus representative gravity+drag losses where noted).
export const MISSION_REFS: MissionRef[] = [
  {
    name: 'LEO from surface',
    dv: 9400,
    description: 'Surface to ~250 km LEO incl. gravity + drag losses',
    source: 'NASA GSFC, “Reaching and Staying in Orbit” — ~9.3–10 km/s incl. losses',
  },
  {
    name: 'Lunar landing',
    dv: 1730,
    description: 'Low lunar orbit to soft touchdown (Apollo LEM descent)',
    source: 'Apollo mission design; Sutton & Biblarz Table 4-4 style budget',
  },
  {
    name: 'Trans-Lunar Injection',
    dv: 3200,
    description: 'LEO parking orbit → lunar transfer trajectory',
    source: 'NASA C3/JPL “Porkchop” TLI reference, ~3.1–3.2 km/s',
  },
  {
    name: 'Earth escape (from LEO)',
    dv: 3200,
    description: 'Hyperbolic escape burn (parabolic v∞ ≈ 0)',
    source: '(√2 − 1)·v_LEO ≈ 3.2 km/s, orbital mechanics identity',
  },
  {
    name: 'Trans-Mars Injection',
    dv: 3600,
    description: 'LEO → Mars Hohmann transfer (nominal departure year)',
    source: 'NASA/JPL Mars transfer porkchop, ~3.5–3.8 km/s',
  },
];

export const DV_CHART_MAX = 12000; // m/s, chart x-axis bound
