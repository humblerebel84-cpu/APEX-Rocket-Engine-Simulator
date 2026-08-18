import type { PropellantId } from '../physics/propellants';

interface Props {
  onLoad: (primary: PropellantId, compare: PropellantId) => void;
}

interface Showcase {
  id: string;
  label: string;
  primary: PropellantId;
  compare: PropellantId;
  blurb: string;
}

// Curated trade studies that teach propellant-classification axes. Same engine
// (Pc / ε / Pa / masses) for both sides — only the chemistry differs.
const SHOWCASES: Showcase[] = [
  {
    id: 'storable-vs-hypergolic',
    label: 'Storable vs Hypergolic',
    primary: 'n2o4_udmh',
    compare: 'htp_98',
    blurb: 'Both are storable. N2O4/UDMH is hypergolic — ignites on contact, no ignition system. HTP needs a catalyst bed to decompose. Storability and hypergolicity are separate axes.',
  },
  {
    id: 'hybrid-vs-solid',
    label: 'Hybrid vs Solid',
    primary: 'n2o_paraffin',
    compare: 'solid_apcp',
    blurb: 'Hybrid = solid paraffin grain + liquid N2O (throttlable, restartable, safer). Solid APCP = monolithic cast grain (simple, dense, but no throttle or shutdown).',
  },
  {
    id: 'the-chemical-ceiling',
    label: 'The Chemical Ceiling',
    primary: 'lf2_lh2',
    compare: 'lox_lh2',
    blurb: 'Fluorine beats oxygen on Isp AND on tank density — and never flew. Isp is a number you can optimize; hydrofluoric-acid exhaust is a number you cannot. The clearest case that propellant choice is never just performance.',
  },
  {
    id: 'oxidizer-swap',
    label: 'Oxidizer Swap: N2O4 vs IRFNA',
    primary: 'n2o4_udmh',
    compare: 'irfna_udmh',
    blurb: 'Same fuel, same engine, different oxidizer. N2O4 buys you ~15 s of Isp; nitric acid buys you cost, density and a far easier supply chain. Which is why most tactical missiles ever built flew on the slower one.',
  },
  {
    id: 'green-vs-toxic',
    label: 'Green vs Toxic Storables',
    primary: 'h2o2_rp1',
    compare: 'n2o4_mmh',
    blurb: 'Both sit on the pad for months. One exhausts steam and CO2, the other needs SCAPE suits and a toxic-vapour exclusion zone. The Isp gap is the price of going green.',
  },
];

export default function ShowcaseCompare({ onLoad }: Props) {
  return (
    <div className="showcase">
      <div className="showcase-heading">// showcase comparisons — click to load both sides</div>
      {SHOWCASES.map((s) => (
        <div className="showcase-item" key={s.id}>
          <button type="button" className="showcase-btn" onClick={() => onLoad(s.primary, s.compare)}>
            ◫ {s.label}
          </button>
          <div className="showcase-blurb">{s.blurb}</div>
        </div>
      ))}
    </div>
  );
}