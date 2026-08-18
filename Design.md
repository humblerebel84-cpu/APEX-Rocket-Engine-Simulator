# Design — APEX Rocket Engine Simulator

## 1. Design Language: "Engineering Paper"
The legacy demo already establishes a strong identity — keep and systematize it.
Retro aerospace drafting sheet: graph-paper background, hard-edge panels, mono type
for data, heavy ink borders, rust/orange accents. Think: 1960s NASA design report
meets modern web.

## 2. Design Tokens
```css
--paper: #f4f1ea;        /* page background */
--ink: #1a1815;          /* borders, text */
--rust: #b5502e;         /* primary accent (controls, values) */
--rust-dark: #8a3a1f;
--steel: #4a5a63;        /* secondary text, hardware */
--steel-light: #7d8f98;
--flame: #e8853d;
--flame-hot: #f4b942;
--line: #d4cfc0;         /* grid lines */
--panel: #fbfaf6;        /* panel surface */
--ok: #2e7d32;           /* v2: success states (new) */
--warn: var(--rust);     /* warnings reuse rust */
```
- Background: 40 px graph-paper grid over `--paper`.
- Type: **Archivo** (900) headings; **Space Mono** for all data, labels, equations.
  Self-host both (woff2) for offline use.
- Panels: 2 px ink border + `6px 6px 0` hard ink shadow. No border-radius. No soft
  shadows.
- Readouts: ink background, `--flame-hot` labels, mono values.
- Section headers prefixed `// ` in rust (engineering-comment motif).

## 3. Layout (desktop ≥900 px)
```
MASTHEAD  (name left, physics tagline right, 4px ink rule)
READOUT ROW  (4–6 tiles: Ve, Isp, Thrust, TWR [+ c*, Cf in v2])
┌─────────────┬──────────────────────────────┐
│ CONTROLS    │  ROCKET VIZ (SVG)            │
│ propellant  ├──────────────────────────────┤
│ Pc / ε / Pa │  SWEEP CHARTS (v2)           │
│ masses      ├──────────────────────────────┤
│ [equations] │  MISSION Δv CHART + verdict  │
└─────────────┴──────────────────────────────┘
FOOTER  (disclaimer + sources link)
```
Mobile (<900 px): single column, readouts 2-up, viz collapses to compact banner.

## 4. Component Specs

### Controls (phase 2 replaces legacy sliders)
- Propellant: styled `<select>` + citation note below.
- Sliders: chamber pressure (10–300 bar), expansion ratio ε (2–80), ambient
  (0–1.01 bar, labels show Vacuum / Sea Level), throat area, masses.
- **Derived values** (ṁ, Pe, Ae) shown as read-only mono badges, not inputs —
  visual distinction: bordered, no track.
- v2: thrust-target numeric input with "SOLVE" affordance toggling sizing mode.

### RocketViz
- Keep existing SVG rocket; flame height/width driven by computed thrust & ṁ.
- v2: nozzle throat/bell drawn proportionally to ε (visual feedback for area ratio).

### EquationPanel
- Ink background, flame-hot mono text; each equation rendered with current values
  substituted in-place, e.g. `v_e = √[(2·1.19/0.19)·(8.314/0.0207)·3550·(1-(0.05/100)^0.16)] = 3 612 m/s`.

### MissionDvChart
- Horizontal bar (existing) + v2: markers become clickable tooltips; verdict box
  unchanged in tone (direct, engineering voice).

## 5. Interaction Principles
1. **Instant feedback** — every input change recomputes synchronously (<16 ms).
   No buttons needed except explicit "solve" actions.
2. **Teach while using** — derived quantities displayed alongside the equations that
   produce them; hovering a readout highlights its equation.
3. **Warn, don't block** — TWR < 1, over-expanded nozzle at sea level, degenerate
   inputs → inline warnings with explanation, never silent.
4. **No chrome** — no login, no modals for v1. Share = copy URL.

## 6. Content Voice
Engineering-report voice: precise, dry, no hype. Example verdict tone (keep from
legacy): "This stage alone could theoretically reach LEO… real vehicles need multiple
stages due to structural/aero losses."
