# Architecture — APEX Rocket Engine Simulator

## 1. System Overview
Static single-page application (no backend required for v1–v2). Pure client-side
computation. Deployable to any static host (GitHub Pages, Netlify, Vercel) or opened
from disk.

```
┌─────────────────────────────────────────────┐
│  Browser (React SPA)                        │
│                                             │
│  ┌────────────┐      ┌─────────────────┐    │
│  │ UI Layer   │─────▶│ State (React)   │    │
│  │ components │◀─────│ design config   │    │
│  └────────────┘      └────────┬────────┘    │
│                               │ calls       │
│                      ┌────────▼────────┐    │
│                      │ Physics Module  │    │
│                      │ (pure TS, no    │    │
│                      │  React imports) │    │
│                      └────────┬────────┘    │
│                               │ reads       │
│                      ┌────────▼────────┐    │
│                      │ Data Layer      │    │
│                      │ propellants.ts  │    │
│                      │ missions.ts     │    │
│                      │ constants.ts    │    │
│                      └─────────────────┘    │
└─────────────────────────────────────────────┘
```

## 2. Tech Stack (replaces current CDN/Babel setup)
| Concern | Choice | Rationale |
|---|---|---|
| Build | **Vite** + TypeScript | Fast, offline-friendly, no runtime JSX compilation |
| UI | **React 18** (`createRoot`, not `ReactDOM.render`) | Existing code is already React |
| Styles | **Vanilla CSS** (port existing stylesheet) | Current design is good; no framework needed |
| State | React `useState` + `useMemo` | App is single-view; no store library needed |
| Tests | **Vitest** | Same toolchain as Vite; tests the physics module |
| Charts | **Chart.js** or hand-rolled SVG | Sweep plots (Isp vs area ratio, thrust vs altitude) |
| No backend | Config persistence via URL hash / localStorage | Shareable designs without a server |

## 3. Directory Layout
```
rocket_simulator/
├── PRD.md / Architecture.md / Rules.md / Phases.md / Design.md / memory.md
├── rocket_engine_simulator.html      # legacy demo (kept for reference)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx                      # createRoot entry
│   ├── App.tsx
│   ├── physics/
│   │   ├── constants.ts              # G0, R_UNIVERSAL, unit conversions
│   │   ├── nozzle.ts                 # isentropic flow: area ratio, Mach, Pe, Ve
│   │   ├── performance.ts            # Isp, c*, Cf, thrust, TWR, Δv, mass ratio
│   │   ├── sizing.ts                 # solve At from thrust target / ṁ from Pc,At
│   │   ├── propellants.ts            # typed propellant database + citations
│   │   └── missions.ts               # Δv budget reference data
│   ├── components/
│   │   ├── PropellantPicker.tsx
│   │   ├── DesignControls.tsx        # Pc, area ratio, ambient, masses
│   │   ├── ReadoutGrid.tsx
│   │   ├── RocketViz.tsx             # existing SVG, driven by computed values
│   │   ├── MissionDvChart.tsx
│   │   ├── EquationPanel.tsx         # live-substituted formulas
│   │   └── SizingPanel.tsx           # v2: thrust-target mode, contour output
│   ├── hooks/
│   │   └── useEngineDesign.ts        # derives full design state from inputs
│   ├── styles/
│   │   └── theme.css                 # ported from legacy <style> block
│   └── data/                         # (if static JSON preferred over ts const)
└── tests/
    ├── nozzle.test.ts
    ├── performance.test.ts
    └── validation_cea.test.ts        # regression vs published CEA values
```

## 4. Physics Module — Core Model
Pure TypeScript, zero UI imports, SI units internally:

- `nozzleAreaRatio(k, Pe, Pc)` — isentropic area-Mach relation (solved numerically
  via bisection/Newton on Mach number).
- `machAtExit(k, Pe, Pc)`, `throatPressure(k, Pc)` — choked-flow relations.
- `exhaustVelocity(Tc, M, k, Pc, Pe)` — existing equation, unchanged.
- `cStar(Tc, M, k)` — `c* = √(R·Tc/M) / (k·(2/(k+1))^((k+1)/(2(k-1))))`.
- `cF(k, Pe, Pc, Pa, Ae, At)` — thrust coefficient with pressure term.
- `massFlow(Pc, At, Tc, M, k)` — `ṁ = Pc·At / c*` (approximate; corrected form uses
  isentropic throat density/velocity).
- Corrections: divergence efficiency `λ ≈ 0.5(1+cos α)`, boundary-layer factor ~0.99.
- `sizing.solveThroatArea(F_target, ...)` — invert thrust equation for At.

**Coupling rule:** user inputs are {propellant, Pc, area ratio ε (or Pe), ambient,
thrust target OR chamber geometry, masses}. Everything else (ṁ, Ae, Pe, Ve, Isp, Cf,
Δv) is **derived**. No slider may set a derived quantity directly — this is the main
fix vs the legacy demo.

## 5. State Shape
```ts
interface EngineDesignInput {
  propellantId: PropellantId;
  chamberPressurePa: number;   // user input
  expansionRatio: number;      // user input (Ae/At)
  ambientPressurePa: number;   // user input or altitude slider
  thrustTargetN?: number;      // v2: optional; if set, At is solved
  throatAreaM2?: number;       // v1: user input if no thrust target
  dryMassKg: number;
  propellantMassKg: number;
}
// useEngineDesign(input) → EngineDesignReport (all derived quantities)
```
Config serialized to URL hash for sharing (`#cfg=...base64/json`).

## 6. Validation Strategy
- Unit tests against hand-calculated values for every physics function.
- Regression test suite vs published NASA CEA / Sutton tables:
  | Propellant | Pc | ε | Expected Isp(vac) |
  |---|---|---|---|
  | LOX/LH2 | 68 bar | 77 | ~453 s |
  | LOX/RP-1 | 97 bar | 16 | ~333 s |
  | LOX/CH4 | 100 bar | 40 | ~376 s |
  Tolerance: ±3% (simplified Tc/M/k model vs full equilibrium chemistry).
- Publish validation note in About page.

## 7. Build & Deploy
- `npm run dev` — local dev server.
- `npm run build` — static `dist/`, relative asset paths (`vite.config` `base: './'`)
  so it runs from `file://` as well as any host.
- `npm test` — Vitest.
- CI (GitHub Actions): lint → typecheck → tests → build.
- Deploy: GitHub Pages initially.

## 8. Future Extension Points (products 3–4, out of scope now)
- `physics/ascent.ts` — numerical trajectory integrator.
- `physics/stages.ts` — multi-stage Δv stacking.
- Physics module is designed to be extractable as a standalone npm package later.
