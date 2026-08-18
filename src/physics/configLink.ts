import { PROPELLANT_IDS, type PropellantId } from './propellants';

// Shareable design configuration, encoded into a URL hash (`#apex:<base64url JSON>`).
// Pure: the UI composes the URL and reads it back on load.

export interface EngineDesignConfig {
  propellantId: PropellantId;
  chamberPressurePa: number;
  expansionRatio: number;
  ambientPressurePa: number;
  throatAreaM2: number;
  dryMassKg: number;
  propellantMassKg: number;
}

const KEY = 'apex';

function isValid(c: unknown): c is EngineDesignConfig {
  if (typeof c !== 'object' || c === null) return false;
  const o = c as Record<string, unknown>;
  if (typeof o.propellantId !== 'string' || !(PROPELLANT_IDS as readonly string[]).includes(o.propellantId)) return false;
  const nums = [
    o.chamberPressurePa,
    o.expansionRatio,
    o.ambientPressurePa,
    o.throatAreaM2,
    o.dryMassKg,
    o.propellantMassKg,
  ];
  return nums.every((n) => typeof n === 'number' && Number.isFinite(n));
}

export function encodeConfig(c: EngineDesignConfig): string {
  return `${KEY}:${btoa(unescape(encodeURIComponent(JSON.stringify(c))))}`;
}

export function decodeConfig(raw: string): EngineDesignConfig | null {
  try {
    if (!raw.startsWith(`${KEY}:`)) return null;
    const json = decodeURIComponent(escape(atob(raw.slice(KEY.length + 1))));
    const parsed = JSON.parse(json) as unknown;
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}