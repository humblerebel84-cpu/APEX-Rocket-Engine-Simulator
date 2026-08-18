import type { PropellantId } from './propellants';

// Single source of truth for the ±3% CEA regression (Architecture.md §6). Both the
// test suite (validation_cea.test.ts) and the About panel's validation table read
// from here, so the published table can never drift from what the tests enforce.
export const CEA_VALIDATED: PropellantId[] = [
  'lox_lh2',
  'lox_rp1',
  'lox_ch4',
  'lox_ethanol',
  'lox_ammonia',
  'lox_propane',
  'lf2_lh2',
  'n2o4_mmh',
  'n2o4_udmh',
  'aerozine_n2o4',
  'irfna_udmh',
  'h2o2_rp1',
];

export interface CeaReferencePoint {
  id: PropellantId;
  PcBar: number;
  eps: number;
  refIsp: number; // published / CEA vacuum Isp (s)
  source: string; // short citation for the About table
}

// Vacuum Isp reference points, one per CEA-validated liquid bipropellant.
// Tolerance ±3% (frozen Tc/M/k model vs full equilibrium chemistry).
export const CEA_REFERENCE_POINTS: CeaReferencePoint[] = [
  {
    id: 'lox_lh2',
    PcBar: 68,
    eps: 77,
    refIsp: 453,
    source: 'Sutton & Biblarz 9th ed. Table 5-8 + NASA CEA (O/F 6.0)',
  },
  {
    id: 'lox_rp1',
    PcBar: 97,
    eps: 16,
    refIsp: 333,
    source: 'Sutton & Biblarz 9th ed. Table 5-8 + NASA CEA (O/F 2.7)',
  },
  {
    id: 'lox_ch4',
    PcBar: 100,
    eps: 40,
    refIsp: 376,
    source: 'NASA CEA (O/F 3.6)',
  },
  {
    id: 'lox_ethanol',
    PcBar: 50,
    eps: 40,
    refIsp: 331,
    source: 'Sutton & Biblarz 9th ed. Table 5-8 + NASA CEA (O/F 1.7)',
  },
  {
    id: 'lox_ammonia',
    PcBar: 70,
    eps: 40,
    refIsp: 335,
    source: 'NASA CEA (O/F 1.4); XLR99 flight ≈ 285 s incl. losses',
  },
  {
    id: 'lox_propane',
    PcBar: 100,
    eps: 40,
    refIsp: 359,
    source: 'NASA CEA (O/F 3.9)',
  },
  {
    id: 'lf2_lh2',
    PcBar: 68,
    eps: 77,
    refIsp: 488,
    source: 'NASA CEA / rocketcea 1.2.3 (O/F 9.0, equilibrium)',
  },
  {
    id: 'n2o4_udmh',
    PcBar: 70,
    eps: 40,
    refIsp: 337,
    source: 'Sutton & Biblarz 9th ed. Table 5-9 + NASA CEA (O/F 2.4)',
  },
  {
    id: 'aerozine_n2o4',
    PcBar: 10,
    eps: 60,
    refIsp: 335,
    source: 'NASA CEA (O/F 1.6); AJ10-137 flew at ε 147.5 → ≈ 312 s incl. losses',
  },
  {
    id: 'irfna_udmh',
    PcBar: 70,
    eps: 40,
    refIsp: 322,
    source: 'NASA CEA / rocketcea 1.2.3 (O/F 3.3, equilibrium)',
  },
  {
    id: 'h2o2_rp1',
    PcBar: 70,
    eps: 40,
    refIsp: 327,
    source: 'NASA CEA / rocketcea 1.2.3 (O/F 7.0, equilibrium); Black Arrow Gamma 8 flight ref.',
  },
];