# Rules — Engineering Conventions

## Physics Rules (non-negotiable)
1. **SI units internally, always.** Pascal, kelvin, kg, meters, seconds. Convert at the
   UI boundary only. No mixing of bar/atm/Pa inside `physics/`.
2. **No magic numbers.** Every physical constant lives in `physics/constants.ts` with a
   name and source comment (e.g. `G0 = 9.80665 // m/s², standard gravity (WEL-8)`).
3. **Every data value needs a citation.** Propellant Tc/M/k values must cite a source
   (Sutton *Rocket Propulsion Elements*, Huzel-Huang, or NASA CEA run) in `propellants.ts`.
4. **Inputs vs derived:** users may only set *independent* design parameters. Mass flow,
   exit pressure, exit area, Ve, Isp, thrust are always **derived** — never user-settable
   sliders (the legacy demo's bug; do not reintroduce).
5. **Guard every equation**: pressure ratios, logs, mass ratios must handle
   degenerate inputs (Pe ≥ Pc, mf = 0) without NaN — return typed results or `null`
   with a UI warning, never silent NaN.
6. **Physics stays pure**: `src/physics/**` imports nothing from React, DOM, or UI.
   This keeps it unit-testable and later publishable as a package.
7. **Validation before merge**: any change to physics functions must keep
   `tests/validation_cea.test.ts` within ±3% of reference values.

## Code Rules
8. TypeScript `strict: true`. No `any` except at serialization boundaries (URL hash parse).
9. Functions <40 lines preferred; extract named helpers. One physics concept per file.
10. Naming: camelCase for variables/functions, PascalCase for types/components,
    UPPER_SNAKE for constants. Units encoded in names at the boundary
    (`chamberPressurePa`, `dryMassKg`) — not in physics internals (`Pc`, `mDry`).
11. **No comments unless they document physics or a non-obvious decision**
    (per project preference). Physics citations count as required documentation.
12. No runtime CDN dependencies. React, ReactDOM bundled via npm build. Google Fonts:
    self-host the 2 font files or fall back to system fonts.
13. `ReactDOM.createRoot`, never legacy `ReactDOM.render`.

## UI Rules
14. Follow `Design.md`: APEX engineering-paper aesthetic (colors, Space Mono / Archivo
    fonts, hard shadows). Don't introduce new colors without design tokens.
15. All numeric readouts go through the shared formatter (locale-aware, unit suffix).
16. Mobile: single-column layout below 900 px; sliders ≥44 px touch target.
17. Educational claim shown in footer: "Educational / trade-study tool — not
    flight-certified."

## Process Rules
18. Lint (`eslint`) + typecheck (`tsc --noEmit`) + tests must pass before a phase is
    marked done.
19. Commit messages: imperative, scoped — `physics: add c* calculation`,
    `ui: mission dv chart`, `docs: update memory.md`.
20. Update `memory.md` at the end of every phase: decisions made, deviations, next steps.
21. Legacy `rocket_engine_simulator.html` is read-only reference — do not edit it;
    all work happens in the new project tree.
