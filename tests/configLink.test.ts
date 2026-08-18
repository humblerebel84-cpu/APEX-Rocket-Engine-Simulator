import { describe, expect, it } from 'vitest';
import { decodeConfig, encodeConfig, type EngineDesignConfig } from '../src/physics/configLink';

const CONFIG: EngineDesignConfig = {
  propellantId: 'lox_ch4',
  chamberPressurePa: 100e5,
  expansionRatio: 40,
  ambientPressurePa: 0,
  throatAreaM2: 0.015,
  dryMassKg: 3000,
  propellantMassKg: 17000,
};

describe('configLink encode/decode', () => {
  it('round-trips a full config exactly', () => {
    const decoded = decodeConfig(encodeConfig(CONFIG));
    expect(decoded).not.toBeNull();
    expect(decoded).toEqual(CONFIG);
  });

  it('survives float precision (e.g. 1e-4 throat area)', () => {
    const c: EngineDesignConfig = { ...CONFIG, throatAreaM2: 0.0001, chamberPressurePa: 206.8e5 };
    expect(decodeConfig(encodeConfig(c))).toEqual(c);
  });

  it('rejects a missing or malformed payload', () => {
    expect(decodeConfig('')).toBeNull();
    expect(decodeConfig('apex:')).toBeNull();
    expect(decodeConfig('other:garbage')).toBeNull();
    expect(decodeConfig('apex:!!not-base64!!')).toBeNull();
  });

  it('rejects valid JSON with an unknown propellant or NaN numbers', () => {
    const badProp = { ...CONFIG, propellantId: 'not_a_propellant' };
    expect(decodeConfig(encodeConfig(badProp as unknown as EngineDesignConfig))).toBeNull();
    const badNum = { ...CONFIG, dryMassKg: NaN };
    expect(decodeConfig(encodeConfig(badNum))).toBeNull();
  });
});