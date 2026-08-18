import {
  PROPELLANTS,
  PROPELLANT_CATEGORIES,
  PROPELLANT_IDS,
  type Propellant,
  type PropellantId,
} from '../physics/propellants';

interface Props {
  value: PropellantId;
  propellant: Propellant;
  onChange: (id: PropellantId) => void;
  label?: string;
  showDetail?: boolean;
}

const GROUPS = PROPELLANT_CATEGORIES.map((category) => ({
  category,
  ids: PROPELLANT_IDS.filter((id) => PROPELLANTS[id].category === category),
})).filter((group) => group.ids.length > 0);

export default function PropellantPicker({ value, propellant, onChange, label, showDetail = true }: Props) {
  return (
    <div className="field">
      <label>{label ?? 'Propellant Combination'}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as PropellantId)}>
        {GROUPS.map(({ category, ids }) => (
          <optgroup key={category} label={category}>
            {ids.map((id) => (
              <option key={id} value={id}>
                {PROPELLANTS[id].name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {showDetail && (
        <>
          <div className="propellant-note">{propellant.note}</div>
          {propellant.approxModel && (
            <div className="propellant-note propellant-approx">
              ≈ Frozen-flow approximation — simplified model. The ±3% CEA validation discipline applies to liquid
              bipropellants only.
            </div>
          )}
          <div className="propellant-note propellant-cite">SOURCE: {propellant.citation}</div>
        </>
      )}
    </div>
  );
}
