import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { DesignReport } from '../physics/performance';
import { MISSION_REFS, DV_CHART_MAX } from '../physics/missions';
import { fmt } from '../physics/format';

interface Props {
  report: DesignReport;
}

// Space Mono is monospace, so label pixel width ≈ charCount × char advance.
// 0.65em at 16px root ≈ 10.4px font; Space Mono advance ≈ 0.6em → ~6.3px/char.
const CHAR_W = 6.3;
const LABEL_H = 16;
const ROW_H = 13;

function verdict(dv: number): string {
  if (dv > 9400) {
    return `✓ This stage alone could theoretically reach LEO from the surface (${fmt(dv)} m/s available vs 9,400 m/s needed) — though real vehicles need multiple stages due to structural/aero losses.`;
  }
  if (dv > 3200) {
    return `This stage has enough Δv for a Trans-Lunar Injection burn or Mars transfer burn (${fmt(dv)} m/s available), but not enough alone to reach orbit from the surface.`;
  }
  if (dv > 1000) {
    return `This is upper-stage / in-space maneuvering territory (${fmt(dv)} m/s) — enough for orbit adjustments, not surface-to-orbit.`;
  }
  return `Low Δv (${fmt(dv)} m/s) — this configuration is more like a reaction control thruster than a launch stage. Try increasing propellant mass or Isp.`;
}

export default function MissionDvChart({ report }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(700);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setChartWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Greedy stacking: each mission label keeps its true Δv position as its centre
  // x, but drops to the lowest row where it does not overlap a previously-placed
  // label. Long names near each other (TLI 3200, escape 3200, TMI 3600) get their
  // own rows instead of overlapping.
  const rows = useMemo(() => {
    const placed: Array<Array<[number, number]>> = [];
    const result: Record<string, number> = {};
    for (const m of MISSION_REFS) {
      const cx = (m.dv / DV_CHART_MAX) * chartWidth;
      const half = (m.name.length * CHAR_W) / 2 + 4;
      let row = 0;
      while (true) {
        if (!placed[row]) placed[row] = [];
        if (!placed[row].some(([l, r]) => cx + half > l && cx - half < r)) break;
        row += 1;
      }
      placed[row].push([cx - half, cx + half]);
      result[m.name] = row;
    }
    return result;
  }, [chartWidth]);

  const maxRow = Math.max(0, ...Object.values(rows));
  const barTop = 22 + maxRow * ROW_H;
  const twrNote =
    report.twr !== null && report.twr <= 1
      ? ' ⚠ Warning: Thrust-to-weight ratio is below 1.0 — this engine cannot lift its own vehicle off the ground (fine for vacuum/orbital stages, not for launch).'
      : '';

  return (
    <div className="chart-panel mission-panel">
      <h2>Mission Δv Requirements — Can This Engine Do It?</h2>
      <div className="delta-v-bar-wrap" ref={wrapRef}>
        <div className="delta-v-chart" style={{ height: barTop + 34 }}>
          <div className="delta-v-bar-bg" style={{ top: barTop }}>
            <div
              className="delta-v-bar-fill"
              style={{ width: `${Math.min(100, (report.dv / DV_CHART_MAX) * 100)}%` }}
            ></div>
          </div>
          {MISSION_REFS.map((m) => {
            const row = rows[m.name] ?? 0;
            const labelTop = row * ROW_H;
            return (
              <div
                key={m.name}
                className="delta-v-marker"
                title={`${m.name}: ${fmt(m.dv)} m/s — ${m.description} (${m.source})`}
                style={{ left: `${Math.min(100, (m.dv / DV_CHART_MAX) * 100)}%`, top: labelTop }}
              >
                <span className="delta-v-label">{m.name}</span>
                <span className="delta-v-tick" style={{ height: barTop - (labelTop + LABEL_H) }} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mission-verdict">
        {verdict(report.dv)}
        {twrNote}
      </div>
    </div>
  );
}
