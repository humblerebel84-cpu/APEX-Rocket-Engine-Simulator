import type { ReactNode } from 'react';
import { R_UNIVERSAL } from '../physics/constants';
import type { EngineDesignInput } from '../hooks/useEngineDesign';
import type { DesignReport } from '../physics/performance';
import type { Propellant } from '../physics/propellants';
import { fmt } from '../physics/format';

interface Props {
  propellant: Propellant;
  input: EngineDesignInput;
  report: DesignReport;
}

function Row({ comment, equation }: { comment: string; equation: ReactNode }) {
  return (
    <div className="equation-row">
      <span className="comment">{`// ${comment}`}</span>
      <div className="equation-line">{equation}</div>
    </div>
  );
}

export default function EquationPanel({ propellant, input, report }: Props) {
  const PcBar = input.chamberPressurePa / 1e5;
  const PeBar = report.Pe !== null ? report.Pe / 1e5 : null;
  const PaBar = input.ambientPressurePa / 1e5;
  const k = propellant.k;

  return (
    <div className="formula-box equation-panel">
      <Row
        comment="de Laval exhaust velocity"
        equation={
          <>
            v_e = √[(2·{k}/(k−1))·(R/M)·Tc·(1−(Pe/Pc)^((k−1)/k))]<br />
            v_e = √[(2·{k}/{fmt(k - 1, 3)})·({R_UNIVERSAL}/{propellant.M})·{propellant.Tc}·(1−(
            {PeBar !== null ? fmt(PeBar, 2) : '?'}/{fmt(PcBar, 1)})^{fmt((k - 1) / k, 3)}))] ={' '}
            <strong>{fmt(report.ve)} m/s</strong>
          </>
        }
      />
      <Row
        comment="characteristic velocity c*"
        equation={
          <>
            c* = √(R·Tc/M) / Γ(k)<br />
            c* = √({R_UNIVERSAL}·{propellant.Tc}/{propellant.M}) / Γ({fmt(k, 3)}) ={' '}
            <strong>{fmt(report.cstar)} m/s</strong>
          </>
        }
      />
      <Row
        comment="mass flow from choked throat"
        equation={
          <>
            ṁ = Pc·At / c*<br />
            ṁ = ({fmt(PcBar, 1)}·10⁵ Pa)·{fmt(input.throatAreaM2, 4)} m² / {fmt(report.cstar)} ={' '}
            <strong>{report.mdot !== null ? fmt(report.mdot, 1) : '—'} kg/s</strong>
          </>
        }
      />
      <Row
        comment="thrust with pressure term"
        equation={
          <>
            F = ṁ·v_e + (Pe − Pa)·Ae<br />F = ({report.mdot !== null ? fmt(report.mdot, 1) : '—'})·(
            {fmt(report.ve)}) + ({PeBar !== null ? fmt(PeBar, 3) : '−'} − {fmt(PaBar, 2)})·10⁵·(
            {report.Ae !== null ? fmt(report.Ae, 3) : '—'}) ={' '}
            <strong>{report.F !== null ? `${fmt(report.F / 1000, 1)} kN` : '—'}</strong>
          </>
        }
      />
      <Row
        comment="thrust coefficient"
        equation={
          <>
            Cf = F / (Pc·At)<br />
            Cf = ({report.F !== null ? fmt(report.F) : '—'} N) / (({fmt(PcBar, 1)}·10⁵)·(
            {fmt(input.throatAreaM2, 4)})) = <strong>{report.cf !== null ? fmt(report.cf, 3) : '—'}</strong>
          </>
        }
      />
      <Row
        comment="specific impulse"
        equation={
          <>
            Isp = F / (ṁ·g₀)<br />Isp = ({report.F !== null ? fmt(report.F) : '—'}) / ((
            {report.mdot !== null ? fmt(report.mdot, 1) : '—'})·9.80665) ={' '}
            <strong>{report.isp !== null ? `${fmt(report.isp, 1)} s` : '—'}</strong>
          </>
        }
      />
      <Row
        comment="Tsiolkovsky rocket equation"
        equation={
          <>
            Δv = Isp·g₀·ln(m₀/mf)<br />Δv = ({report.isp !== null ? fmt(report.isp, 1) : '—'})·9.80665·ln(
            {fmt(report.m0)} / {fmt(report.mf)}) = <strong>{fmt(report.dv)} m/s</strong>
          </>
        }
      />
    </div>
  );
}
