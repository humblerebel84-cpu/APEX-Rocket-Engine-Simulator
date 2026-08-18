# PRD — APEX Rocket Engine Simulator

## 1. Vision
Turn the existing single-file demo (`rocket_engine_simulator.html`) into a production-grade
web application: an **educational aerospace tool** (Product 1) that graduates into a
**liquid rocket engine sizing tool** (Product 2). All physics is real, verifiable, and
validated against NASA CEA data.

## 2. Problem
- Existing physics calculators (NASA CEA, RPA) are clunky, desktop-only, or command-line.
- Students, hobbyists, and university rocket teams lack a clean, visual, web-based
  nozzle/propellant design tool.
- The current demo is a static calculator with physically-uncoupled inputs and no build system.

## 3. Target Users (priority order)
| User | Needs |
|---|---|
| University rocket teams (IREC, Spaceport America Cup) | Quick nozzle trade studies, propellant comparison |
| Rocketry clubs / hobbyists (Tripoli, NAR, liquid hobbyists) | Learn nozzle theory, sanity-check designs |
| Students & instructors | Interactive teaching of de Laval / Tsiolkovsky physics |

## 4. Scope

### Product 1 — Educational Web App (v1.0)
- Propellant database with cited combustion data (Tc, M, k, c*).
- Interactive nozzle explorer: chamber pressure, area ratio, ambient pressure.
- Live readouts: Ve, Isp, thrust, TWR, mass ratio, burn time, Δv.
- Mission Δv comparison (LEO, TLI, Mars, etc.).
- "Learn" panels showing the governing equations with live variable highlighting.
- Fully offline-capable (no runtime CDN dependencies).

### Product 2 — Engine Sizing Tool (v1.5–2.0)
- **Physically coupled design inputs**: throat area + Pc define mass flow; Pe/Pc (or area
  ratio) defines exit area. No more impossible engine configurations.
- Design outputs: area ratio, C*, Cf (with divergence/boundary-layer corrections),
  nozzle contour (ideal + Rao approximation), characteristic lengths.
- Thrust target as input → auto-solve throat area & mass flow.
- Sea-level vs vacuum nozzle design modes with over-expansion/flow-separation warnings.
- Export: shareable config link, design report (printable), engine spec sheet.

### Non-Goals (explicitly out of scope for v1–v2)
- Flight trajectory / ascent simulation (deferred product #3).
- Multi-stage vehicle optimization (deferred product #3).
- Combustion chemistry solver (CEA stays as external validation source).
- Safety-critical / flight-certified claims. Tool is labeled **educational / trade-study only**.

## 5. Key Features & Acceptance Criteria
| Feature | Acceptance Criteria |
|---|---|
| Physics module | Unit tests: LOX/RP-1 @ Pc=97 bar, ε=16 → Isp(vac) within ±3% of CEA (~330–340 s). All pure functions, SI units internally. |
| Coupled nozzle inputs | Cannot set ṁ independently; ṁ derived from Pc & At. UI shows derived values. |
| Propellant database | ≥5 propellants, each with citation (Sutton, Huzel-Huang, or CEA output). |
| Live equations panel | Equations render with current numeric values substituted in. |
| Offline operation | `npm run build` output runs from `file://` or any static host with zero network requests. |
| Performance | Slider changes recompute in <16 ms (no visible lag). |
| Mobile | Fully usable at 375 px width. |

## 6. Success Metrics
- v1.0: zero CDN dependencies; physics tests green; load <2 s on cold cache.
- Launch validation: post to r/rocketry, r/spacex, university team forums → ≥500 unique
  visitors / 2 weeks, collect feedback.
- v2.0: ≥3 external users (teams/individuals) using sizing tool for real trade studies.

## 7. Positioning & Constraints
- Name: **APEX Rocket Engine Simulator**.
- Disclaimer shown in-app footer & About: "Educational / trade-study tool. Not
  flight-certified. Not for safety-critical design."
- Data sources must be cited in-app (About page + per-propellant notes).
