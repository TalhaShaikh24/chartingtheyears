/**
 * Representative year for each era filter.
 * Used to determine which countries historically existed during that era.
 */
export const ERA_YEAR: Record<string, number> = {
  'Ancient':   1850,
  '1900-1920': 1910,
  '1940':      1940,
  '1980':      1975,
  '2000':      2000,
  '2026':      2026,
  'All':       2026,
};

/**
 * Year each country was formally established as a sovereign state.
 * Countries NOT listed here are assumed to have existed since ancient times
 * and are always rendered on the map.
 */
export const COUNTRY_FOUNDED: Record<string, number> = {
  // Oceania
  AU: 1901, NZ: 1907, PG: 1975, FJ: 1970, VU: 1980,
  // Europe (modern formations)
  IT: 1861, DE: 1871, FI: 1917, PL: 1918, TR: 1923, IS: 1944,
  LT: 1990, LV: 1991, EE: 1991, UA: 1991, BY: 1991, MD: 1991,
  SI: 1991, HR: 1991, MK: 1991, BA: 1992, RS: 2006, ME: 2006,
  CZ: 1993, SK: 1993, BZ: 1981,
  // Middle East
  LB: 1943, SY: 1946, JO: 1946, IL: 1948,
  IQ: 1932, SA: 1932, KW: 1961, YE: 1967,
  AE: 1971, QA: 1971, BH: 1971, OM: 1970,
  // South / Southeast Asia
  IN: 1947, PK: 1947, BD: 1971, LK: 1948, MV: 1965,
  ID: 1945, PH: 1946, MM: 1948, KH: 1953, LA: 1953,
  VN: 1954, MY: 1963, SG: 1965, BN: 1984, TL: 2002,
  // East Asia
  KR: 1948, KP: 1948,
  // Central Asia
  KZ: 1991, UZ: 1991, TM: 1991, KG: 1991, TJ: 1991,
  // Caucasus
  AM: 1991, AZ: 1991, GE: 1991,
  // Africa
  LY: 1951, SD: 1956, MA: 1956, TN: 1956, DZ: 1962,
  GH: 1957, GN: 1958,
  SN: 1960, ML: 1960, MR: 1960, NE: 1960, BF: 1960,
  CI: 1960, BJ: 1960, TG: 1960, NG: 1960, CM: 1960,
  CF: 1960, CG: 1960, CD: 1960, GA: 1960, SO: 1960, MG: 1960,
  SL: 1961, TZ: 1961, KE: 1963, MY: 1963,
  UG: 1962, RW: 1962, BI: 1962,
  ZM: 1964, MW: 1964, GM: 1965, LS: 1966, BW: 1966,
  GQ: 1968, SZ: 1968, MU: 1968,
  GW: 1974,
  MZ: 1975, AO: 1975, CV: 1975, ST: 1975, SR: 1975,
  DJ: 1977, ZW: 1980, NA: 1990, ER: 1993, SS: 2011,
  ZA: 1910,
  // Americas
  PA: 1903, JM: 1962, TT: 1962,
};

/**
 * Returns true if the country historically existed during the given era.
 * Countries not in COUNTRY_FOUNDED are always considered to exist.
 */
export function isCountryVisibleInEra(
  countryCode: string,
  era: string,
): boolean {
  const eraYear = ERA_YEAR[era];
  if (eraYear === undefined) return true;
  const founded = COUNTRY_FOUNDED[countryCode];
  if (founded === undefined) return true; // ancient / always existed
  return founded <= eraYear;
}
