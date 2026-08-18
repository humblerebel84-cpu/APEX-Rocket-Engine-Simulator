# 🚀 APEX Rocket Engine Simulator

**Design a virtual rocket engine. Move a slider. Watch real aerospace physics respond — instantly, in your browser.**

APEX is a free, open-source, fully offline web app for exploring **liquid rocket engine performance**.
It computes exhaust velocity, specific impulse (Isp), thrust, and delta-v using the same
de Laval nozzle theory and Tsiolkovsky rocket equation that real aerospace engineers use —
with every calculation shown live.

> ⚠️ **Educational / trade-study tool. Not flight-certified. Not for safety-critical design.**

---

## Table of Contents

- [What Is This?](#what-is-this)
- [Quick Start (No Code Needed)](#quick-start-no-code-needed)
- [Features](#features)
- [Who Is This For?](#who-is-this-for)
- [Physics: What's Under the Hood](#physics-whats-under-the-hood)
- [The Propellant Database](#the-propellant-database)
- [Real-Engine Presets](#real-engine-presets)
- [Warnings: The App Talks Back](#warnings-the-app-talks-back)
- [Units: SI ↔ US Toggle](#units-si--us-toggle)
- [Run It Locally (Developers)](#run-it-locally-developers)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Validation & Testing](#validation--testing)
- [Contributing](#contributing)
- [License](#license)

---

## What Is This?

In one sentence: **it's a what-if calculator for rocket engines that teaches you while you use it.**

You pick a propellant (fuel + oxidizer combination), set chamber pressure, nozzle geometry,
and vehicle masses — and the app instantly tells you:

| Readout | Meaning (plain language) |
|---|---|
| **Exhaust velocity (Ve)** | How fast the exhaust leaves the nozzle — the raw "push" quality |
| **Specific impulse (Isp)** | Fuel efficiency, in seconds — like MPG for rockets |
| **Thrust** | Total force the engine produces (kN / lbf) |
| **Thrust-to-weight ratio (TWR)** | Can this rocket actually lift off? (must exceed 1) |
| **Characteristic velocity (c\*)** | Combustion chamber efficiency |
| **Thrust coefficient (Cf)** | How well the nozzle converts chamber pressure into thrust |
| **Density impulse** | Efficiency per unit of *tank volume* — explains why kerosene rules first stages |
| **Delta-v** | Total speed the stage can change — decide whether orbit, Moon, or Mars is reachable |

Everything updates live. No "calculate" button. No install. Works offline.

---

## Quick Start (No Code Needed)

### Option A — Use the live app
Live demo: **https://humblerebel84-cpu.github.io/APEX-Rocket-Engine-Simulator/**

### Option B — Open the standalone file
Double-click `rocket_engine_simulator.html` in the repo root — it opens in any browser, fully offline.

### Option C — Run the full app locally
```bash
git clone https://github.com/<your-username>/apex-rocket-engine-simulator.git
cd apex-rocket-engine-simulator
npm install
npm run dev
```
Then open the URL it prints (usually `http://localhost:5173`).

**Requirements:** Node.js 18+ and npm. That's it.

---

## Features

- 🧯 **15 real-world propellants** across 6 categories (see [database](#the-propellant-database))
- 📊 **Trade-study comparison** — put two propellants in the same engine, see what changes and why
- ⚙️ **Real-engine presets** — load RS-25, Raptor, Merlin 1D, RD-107A, RL10C-1 with one click
- 🎯 **Mission presets** — Falcon 9 booster stage, upper stage, CubeSat kicker
- 📐 **Physically coupled inputs** — mass flow is *derived* from chamber pressure and throat area, so you can never build an impossible engine configuration
- 🎯 **Thrust-target mode** — tell it how much thrust you want; it solves the throat area (closed form, no iteration)
- 🌡️ **Sea-level vs vacuum modes** — one click for SL/vacuum design, with over-expansion / flow-separation warnings
- 🔬 **Loss corrections (optional)** — conical divergence + boundary-layer layer (×~0.95) applied to F/Isp/Δv/TWR; ideal physics stays one toggle away
- 📈 **Sweep plots** — Isp vs expansion ratio and thrust vs chamber pressure, hand-rendered SVG
- 🔗 **Shareable design links** — one click copies a URL that restores the exact design
- 🖨️ **Printable spec sheet** — clean two-table datasheet from the Print button
- 🔬 **Live equation panel** — see the exact formulas with your current numbers substituted in
- ⚠️ **Smart warnings** — TWR < 1, flow separation, over-expansion, kerosene coking
- 🌈 **Physically-accurate plume colors** — RP-1 burns orange, LH2 is pale, hypergolics run green
- 🔁 **SI ↔ US unit toggle** — bar/psi, kg/lb, kN/lbf, m/s↔ft/s
- 📡 **Mission delta-v chart** — compare your stage's Δv against LEO, TLI, and Mars budgets
- 📴 **Fully offline** — no CDN, no login, no network calls after load

---

## Who Is This For?

| User | How you'll use it |
|---|---|
| **University rocket teams** | Quick nozzle trade studies, propellant comparison, sanity-check your engine before hardware |
| **Rocketry clubs & hobbyists** | Learn nozzle theory interactively; sanity-check designs with Isp and TWR readouts |
| **Students & instructors** | Teaching aid for de Laval nozzle theory and Tsiolkovsky physics; live equations with values substituted |
| **Curious minds** | Understand *why* rockets are shaped the way they are — no prior knowledge needed |

---

## Physics: What's Under the Hood

This is not a game. Every number is computed from the frozen-flow, perfect-gas expansion of combustion products — a real (simplified) propulsion model:

| Quantity | Formula | What it says |
|---|---|---|
| Exhaust velocity | $v_e = \sqrt{\frac{2k}{k-1} \frac{R_u T_c}{M} \left[1 - \left(\frac{P_e}{P_c}\right)^{\frac{k-1}{k}}\right]}$ | How fast the gas leaves the nozzle |
| Characteristic velocity | $c^* = \frac{\sqrt{R_u T_c / M}}{\Gamma(k)}$ | Chamber + combustion efficiency |
| Thrust | $F = \dot{m}\,v_e + (P_e - P_a)A_e$ | Momentum term + pressure term |
| Specific impulse | $I_{sp} = F / (\dot{m}\,g_0)$ | Efficiency per unit propellant |
| Delta-v | $\Delta v = I_{sp}\,g_0 \ln(m_0/m_f)$ | Tsiolkovsky — the rocket equation |
| Mass flow | $\dot{m} = P_c A_t / c^*$ | **Derived**, not a free input (coupling rule) |

**Honest caveats** — by design, the base model does *not* include:
- Boundary-layer or divergence losses *(optional: toggle adds conical divergence + boundary-layer corrections)*
- Altitude-varying ambient pressure
- Multi-stage optimization
- Combustion chemistry (CEA is used as the external validation source)

For a teaching and trade-study tool, that's the correct level of simplification.
The disclaimer in the footer is there for a reason: **this is not a flight-certification tool.**

---

## The Propellant Database

| Category | Propellants |
|---|---|
| **Cryogenic** | LOX/LH2 (RS-25), LOX/RP-1 (Merlin/F-1), LOX/LCH4 (Raptor/BE-4), LOX/Ethanol (V-2), LOX/Ammonia (X-15 XLR99), LOX/Propane |
| **Hypergolic** | N2O4/MMH, N2O4/UDMH (Titan II/Proton), Aerozine-50/N2O4 (Apollo SPS AJ10) |
| **Storable** | 98% H2O2 — HTP (Black Arrow) |
| **Solid** | APCP (SRBs/hobby), KNSU sugar propellant (amateur rocketry) |
| **Hybrid** | N2O/Paraffin (student/cubeSat-class) |
| **Monoprop** | Hydrazine (satellite thrusters), ASCENT green monoprop (NASA GR-1) |

Each entry carries:
- Calibrated `(Tc, M, k)` frozen-flow constants
- O/F ratio, bulk density, plume color
- **Citation** (Sutton & Biblarz 9th ed., Huzel & Huang, NASA CEA, or published flight data)

Monopropellants and solids are marked `approxModel` — the ±3% CEA-validation discipline
applies to liquid bipropellants only.

---

## Real-Engine Presets

Load a famous engine's real parameters with one click and compare the model's Isp against published values:

| Preset | Propellant | Published Isp |
|---|---|---|
| **RS-25 (SSME)** | LOX/LH2 | 452.3 s vac |
| **Raptor 2 (RVac)** | LOX/LCH4 | ~380 s vac |
| **Merlin 1D** | LOX/RP-1 | 282 s SL |
| **RD-107A** | LOX/RP-1 | 320 s vac |
| **RL10C-1** | LOX/LH2 | 449.7 s vac |

Throat areas are calibrated to each engine's published mass flow, so the thrust you see
is the *model's* prediction given real geometry.

**Mission presets:** Falcon 9 first stage (per-Merlin slice), Falcon 9 second stage
(Merlin 1D Vac, ε=165), and a CubeSat kicker on ASCENT green monoprop.

---

## Warnings: The App Talks Back

| Trigger | Message | Why it matters |
|---|---|---|
| TWR < 1 | Stage cannot lift off | Classic beginner mistake — the app catches it |
| Pe < Pa | Over-expanded nozzle | Pressure term subtracts thrust |
| Pe < 0.4·Pa | Flow separation (Summerfield criterion) | Real engines have failed from this |
| Pc > coking limit (kerosene) | Coking risk | Real constraint behind film-cooled RP-1 engines |

---

## Units: SI ↔ US Toggle

All internal state is SI. The toggle converts display only:

| SI | US |
|---|---|
| bar | psi |
| kg | lb |
| kN | lbf |
| m/s | ft/s |
| kg/m³ | lb/ft³ |
| kN·s/m³ | lbf·s/in³ |

---

## Run It Locally (Developers)

```bash
# 1. Clone
git clone https://github.com/<your-username>/apex-rocket-engine-simulator.git
cd apex-rocket-engine-simulator

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev          # → http://localhost:5173

# 4. Verify everything
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run test         # Vitest (116 tests incl. CEA regression)

# 5. Production build
npm run build        # outputs to dist/
npm run preview      # serve the built app locally
```

**Tech stack:** Vite 6 · React 18 · TypeScript 5.7 · Vitest · ESLint 9
**No runtime network calls.** Self-hosted fonts (Archivo, Space Mono). Works from `file://`.

---

## Deployment

The app is a static site. `vite.config.ts` sets `base: './'`, so any of these work:

### GitHub Pages (recommended)
```bash
npm run build
# then push dist/ to the gh-pages branch, or:
# use actions/deploy-pages in a CI workflow
```
In repo **Settings → Pages**, choose *Deploy from a branch* or *GitHub Actions*.

### Netlify / Vercel / Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`

### Any static host / `file://`
Copy the `dist/` folder anywhere. That's it — no server, no config.

---

## Project Structure

```
rocket_simulator/
├── src/
│   ├── physics/          ← Pure functions, SI units, zero UI code
│   │   ├── constants.ts      Physical constants
│   │   ├── nozzle.ts         de Laval flow: Ve, c*, Pe/Pc, Mach(ε)
│   │   ├── performance.ts    computeDesign() → DesignReport + warnings
│   │   ├── sizing.ts         ṁ from Pc·At coupling; At from thrust target
│   │   ├── losses.ts         Conical divergence + boundary-layer corrections
│   │   ├── sweep.ts          Design-space sweeps (Isp vs ε, thrust vs Pc)
│   │   ├── configLink.ts     #apex: URL-hash shareable design encoding
│   │   ├── propellants.ts    15 propellants, 6 categories, citations
│   │   ├── missions.ts       Δv budgets (LEO, TLI, Mars, …)
│   │   ├── presets.ts        Real engines + mission presets
│   │   ├── compare.ts        Trade-study row builder + winner logic
│   │   ├── units.ts          SI ↔ US display conversions
│   │   └── format.ts         Number formatting
│   ├── hooks/
│   │   └── useEngineDesign.ts   Input state → DesignReport
│   ├── components/
│   │   ├── PropellantPicker.tsx  Grouped <select> with optgroups
│   │   ├── DesignControls.tsx    Sliders + presets + derived badges
│   │   ├── ReadoutGrid.tsx       7 live tiles
│   │   ├── RocketViz.tsx         SVG engine + live plume
│   │   ├── EquationPanel.tsx     Live-substituted equations
│   │   ├── MissionDvChart.tsx    Δv budget comparison
│   │   ├── ComparisonPanel.tsx   Side-by-side trade study
│   │   ├── ShowcaseCompare.tsx   Curated comparison starters
│   │   ├── SweepChart.tsx        Hand-rolled SVG design-space plots
│   │   └── SpecSheet.tsx         Print-only engine spec sheet
│   └── styles/theme.css     "Engineering paper" design language
├── tests/                  ← 116 Vitest tests
├── PRD.md                  Product requirements
├── Architecture.md         Physics + validation methodology
├── Design.md               Visual design spec
└── Phases.md               Build roadmap
```

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run typecheck` | TypeScript strict check |
| `npm run lint` | ESLint |
| `npm run test` | Run all Vitest tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build locally |

---

## Validation & Testing

**116 unit tests**, all passing, organized as:

| Suite | Tests | Purpose |
|---|---|---|
| `validation_cea.test.ts` | 34 | Regression vs NASA CEA / Sutton reference values |
| `performance.test.ts` | 16 | Thrust, Isp, Δv, TWR, edge cases |
| `nozzle.test.ts` | 19 | Mach–area-ratio, c*, pressure-ratio solvers |
| `presets.test.ts` | 10 | Preset integrity + model-vs-published Isp |
| `sizing.test.ts` | 9 | Thrust-target solve + Cf consistency |
| `losses.test.ts` | 8 | Divergence / boundary-layer corrections |
| `units.test.ts` | 7 | SI ↔ US conversion correctness |
| `sweep.test.ts` | 5 | Sweep curves (monotonicity, range, NaN) |
| `compare.test.ts` | 4 | Trade-study row + winner logic |
| `configLink.test.ts` | 4 | Share-link round trip + validation |

**The core discipline:** every liquid bipropellant must land within **±3% of published NASA CEA / Sutton Isp** at its reference (Pc, O/F, ε). Example reference points:

- LOX/LH2 @ 68 bar, ε=77 → 453 s
- LOX/RP-1 @ 97 bar, ε=16 → 333 s
- LOX/LCH4 @ 100 bar, ε=40 → 376 s

Monopropellants and solids use wider published bands because the frozen-flow model is a simplification there.

---

## Contributing

Contributions welcome. A few house rules that keep the project honest:

1. **Physics module stays pure** — no UI code in `src/physics/`; SI units internally everywhere.
2. **New propellants need citations** — Sutton & Biblarz, Huzel & Huang, NASA CEA output, or published flight data. No unsourced numbers.
3. **±3% CEA test required** — new liquid bipropellants must pass regression against a published reference point.
4. **Run the checks before pushing:** `npm run typecheck && npm run lint && npm run test`.
5. **Data corrections** are the most valuable contributions — if a Tc/M/k/citation is off, open an issue with the source.

---

## License

[MIT](LICENSE) — use, modify, redistribute freely. Keep the copyright notice.
Bundled fonts (Archivo, Space Mono) are SIL OFL — their license text is included in `LICENSES/`.

---

## Disclaimer

> **Educational / trade-study tool. Not flight-certified. Not for safety-critical design.**
> Simplified frozen-flow model: no boundary-layer or divergence losses, no altitude-varying
> ambient pressure, no multi-stage optimization. Every equation is real aerospace engineering —
> the simplifications are deliberate and documented.

---

## Acknowledgments

- Gordon P. Sutton & Bijan Z. Biblarz, *Rocket Propulsion Elements*, 9th ed.
- D. K. Huzel & D. H. Huang, *Modern Engineering for Design of Liquid-Propellant Rocket Engines*
- NASA CEA (Chemical Equilibrium with Applications) — external validation source
- R. Nakka, *Experimental Rocketry* — hobby solid propellant data

---

**Built as part of the APEX project.** If this tool taught you something, drop a ⭐ — it helps others find it.
