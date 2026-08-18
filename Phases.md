# Phases — Build Roadmap

## Phase 0 — Project Setup (Day 1–2)
- [ ] Scaffold Vite + React + TypeScript project alongside the legacy HTML file.
- [ ] Port existing CSS into `src/styles/theme.css`; wire `index.html` to reach visual
      parity with the legacy demo (static props, fake numbers).
- [ ] Configure Vitest, ESLint, `tsc` script; GitHub Actions CI skeleton.
- **Exit criteria:** `npm run dev` renders the same-looking UI; CI pipeline runs.

## Phase 1 — Physics Module + Validation (Week 1)
- [x] Implement `constants.ts`, `nozzle.ts`, `performance.ts` (port + extend existing
      equations: Ve, Isp, thrust, Δv — plus new: c*, Cf, Mach, area-ratio solve, ṁ from
      Pc·At).
- [x] Implement `propellants.ts` (5 propellants with citations) and `missions.ts`.
- [x] Write unit tests + CEA validation regression (±3% tolerance).
- **Exit criteria:** `npm test` green including CEA reference values; zero UI code in
  physics module.

## Phase 2 — Coupled Educational App v1.0 (Week 2–3)
- [x] `useEngineDesign` hook: inputs → derived report.
- [x] Replace legacy sliders: Pc, expansion ratio (ε), ambient pressure, throat area
      (or thrust later), masses. ṁ / Pe / Ae become derived readouts.
- [x] Components: PropellantPicker, DesignControls, ReadoutGrid (add c*, Cf, ε),
      RocketViz (flame driven by computed thrust), MissionDvChart.
- [x] EquationPanel: live-substituted equations.
- [x] Build verified fully offline (no network requests); self-hosted fonts.
- **Exit criteria:** PRD acceptance criteria for v1.0 met; `file://` build works.

## Phase 3 — Launch & Feedback (Week 4)
- [x] Deploy to GitHub Pages; custom URL path.
      Live at https://humblerebel84-cpu.github.io/APEX-Rocket-Engine-Simulator/
      (`base: './'` + Actions workflow `configure-pages` → `deploy-pages`).
- [x] About page: physics sources, validation table, disclaimer, feedback link
      (`AboutPanel.tsx` — validation table rendered from the same shared data
      (`physics/validation.ts`) the regression tests enforce; live-computed model
      Isp per row, sources for every equation, GitHub Issues feedback link).
- [ ] Share: r/rocketry, r/spacex, Rocketry Forum, university team channels.
- **Exit criteria:** live URL, ≥500 visitors in 2 weeks, feedback log started.

## Phase 4 — Engine Sizing Tool v2.0 (Week 5–8)
- [x] **B — Sea-level vs vacuum modes + loss corrections.** Ambient Design Mode buttons
      (Sea Level 1.01325 bar / Vacuum 0) on the ambient slider; optional
      divergence + boundary-layer loss layer (`losses.ts`, η = λ(15°)·0.97 ≈ 0.953)
      applied to F/Isp/Cf/density impulse/Δv/TWR. Ideal model untouched → ±3% CEA
      regression stays intact; EquationPanel always shows the ideal physics.
- [x] **A — Thrust-target mode.** `thrustCoefficient(k, ε, Pa/Pc)` (same Cf the report
      reports) → closed-form `At = F/(Pc·Cf)` (`sizing.ts`). UI toggle replaces the
      throat-area slider with a Target Thrust slider + derived At badge. RS-25 round
      trip reproduces its 0.057 m² throat within 2%.
- [x] **C — Sweep plots.** `sweep.ts` (Isp vs ε 2–100, thrust vs Pc 10–300 bar) +
      hand-rolled SVG `SweepChart` — no Chart.js dependency (offline rule).
- [x] **D — Shareable config link.** `configLink.ts` — `#apex:<base64url JSON>`
      round-trip encode/decode with validation; Share button copies the URL,
      restored on load.
- [x] **E — Printable spec sheet.** `SpecSheet.tsx` + `@media print` (visibility
      technique); Print button → clean two-table sheet with disclaimer.
- [ ] Optional: Rao nozzle contour point list (export).
- **Exit criteria:** PRD v2.0 acceptance criteria; ≥3 external users running trade studies.

## Phase 5 — Iterate from Feedback (ongoing)
- [ ] Triage feedback log; quarterly micro-releases.
- [ ] Decide go/no-go for Product 3 (ascent sim / multi-stage) based on demand.

## Not Scheduled (deferred backlog)
- Ascent/trajectory simulation, multi-stage vehicle builder, physics npm package,
  paid API (products 3–4 in the strategy discussion).

## Roadmap v2 — Propellant Database Expansion (2026-08-18)
### Phase 1 — Real-world propellant combos
- [x] Expand DB 5 → 14: LOX/ethanol (V-2), N2O4/UDMH (Titan II/Proton), Aerozine-50/N2O4
      (Apollo SPS), LOX/ammonia (X-15 XLR99), LOX/propane, hydrazine (monoprop),
      98% HTP, ASCENT/LMP-103S, KNSU — each with citation.
- [x] Add `category` field to `Propellant`; group picker by Cryogenic / Storable /
      Hypergolic / Solid / Monoprop (Hybrid reserved, empty groups hidden).
- [x] `approxModel` flag: ±3% CEA regression for liquid bipropellants only; wide-band
      tests + UI note for monopropellants/solids/HTP (frozen-flow approximation).
- [x] Extend c* pins + integrity tests to all 14 entries.
- **Exit criteria:** 62 tests green, lint/typecheck/build green, picker groups teach
  classification.
### Phase 2 (done 2026-08-18)
- [x] Hybrid propellant entry — N2O / paraffin (Hybrid group filled). Frozen model
      calibrated to measured c* ≈ 1485 m/s (COBEM2005) and frozen Isp,vac ≈ 291 s
      @ ε 40 vs equilibrium CEA ≈ 315 s (PoliMi NASA-CEA); approxModel wide band.
- [x] Storable vs hypergolic comparison in the UI — ShowcaseCompare panel: curated
      one-click trade studies that load both sides (Storable vs Hypergolic;
      Hybrid vs Solid) into the existing comparison grid.
### Phase 3 — Quality of life "Other improvements" (done 2026-08-18)
- [x] Density impulse (N·s/m³ = ρ·g0·Isp) as a first-class metric: `densityImpulse` in
      `DesignReport` + 7th readout tile; `densityKgM3` on all 14 propellants.
- [x] Propellant-colored flame in RocketViz (per-propellant `flame` field).
- [x] Coking-risk warning: `cokingLimitBar` (lox_rp1 200 bar), warns when Pc exceeds it.
- [x] Comparison mode: `compare.ts` + ComparisonPanel — identical engine, only the
      propellant differs, winner highlighting per metric.
- [x] One-click presets: 5 engines (RS-25, Raptor 2 RVac, Merlin 1D, RD-107A,
      RL10C-1) + 3 missions (F9 booster slice, F9 S2, CubeSat kicker). Throat areas
      calibrated to published `realMdot`; engine Isp validated vs real within ±10%
      (real engines carry losses the ideal frozen model omits).
- [x] SI ↔ US unit toggle: pure `units.ts` conversions; state stays SI, display
      converts at the UI boundary only (mission chart stays m/s).
- **Exit criteria:** 88 tests green (presets 10, units 7, validation_cea 32,
  performance 16, compare 4, nozzle 19), lint/typecheck/build green.
