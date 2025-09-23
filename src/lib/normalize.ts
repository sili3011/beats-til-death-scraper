// Simple country code mapping - using a basic implementation
// In a full implementation, you'd use i18n-iso-countries properly

/**
 * Convert ISO3 country code to ISO2
 * Basic implementation - extend as needed
 */
export function iso3to2(iso3: string): string | null {
  const mapping: Record<string, string> = {
    'USA': 'US',
    'CAN': 'CA',
    'GBR': 'GB',
    'FRA': 'FR',
    'DEU': 'DE',
    'JPN': 'JP',
    'CHN': 'CN',
    'IND': 'IN',
    'BRA': 'BR',
    'RUS': 'RU',
    // Add more mappings as needed
  };
  
  return mapping[iso3] || null;
}

/**
 * Convert ISO2 country code to ISO3
 * Basic implementation - extend as needed
 */
export function iso2to3(iso2: string): string | null {
  const mapping: Record<string, string> = {
    'US': 'USA',
    'CA': 'CAN',
    'GB': 'GBR',
    'FR': 'FRA',
    'DE': 'DEU',
    'JP': 'JPN',
    'CN': 'CHN',
    'IN': 'IND',
    'BR': 'BRA',
    'RU': 'RUS',
    // Add more mappings as needed
  };
  
  return mapping[iso2] || null;
}

/**
 * Deduplicate array keeping the latest entry per key
 */
export function dedupeKeepLatest<T>(rows: T[], keyFn: (item: T) => string): T[] {
  const map = new Map<string, T>();
  for (const row of rows) {
    map.set(keyFn(row), row);
  }
  return [...map.values()];
}

/**
 * Default key function for life expectancy data
 */
export function lifeDataKey(row: { country_code: string; year: number; source: string }): string {
  return `${row.country_code}-${row.year}-${row.source}`;
}

/**
 * Normalize country name (basic cleanup)
 */
export function normalizeCountryName(name: string): string {
  return name.trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .trim();
}