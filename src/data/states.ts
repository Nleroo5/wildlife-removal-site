/**
 * US State name ↔ abbreviation mappings and slug utilities.
 * Slugs are lowercase, hyphenated versions of state names (e.g. "new-york").
 * The territories table stores state as 2-letter abbreviation (e.g. "GA").
 */

export const STATE_ABBR_TO_NAME: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
};

export const STATE_NAME_TO_ABBR: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBR_TO_NAME).map(([abbr, name]) => [name, abbr])
);

/** Convert a state name to a URL slug: "New York" → "new-york" */
export function stateToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

/** Convert a URL slug back to a state name: "new-york" → "New York" */
export function slugToStateName(slug: string): string | null {
  const lower = slug.toLowerCase();
  for (const name of Object.keys(STATE_NAME_TO_ABBR)) {
    if (stateToSlug(name) === lower) return name;
  }
  return null;
}

/** Convert a URL slug to a state abbreviation: "georgia" → "GA" */
export function slugToStateAbbr(slug: string): string | null {
  const name = slugToStateName(slug);
  if (!name) return null;
  return STATE_NAME_TO_ABBR[name] ?? null;
}

/** Convert a state abbreviation to a URL slug: "GA" → "georgia" */
export function abbrToSlug(abbr: string): string {
  const name = STATE_ABBR_TO_NAME[abbr.toUpperCase()];
  if (!name) return abbr.toLowerCase();
  return stateToSlug(name);
}
