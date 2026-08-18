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