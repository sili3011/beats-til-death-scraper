import { httpGetText } from '../lib/fetcher.js';
import { log, logError, logWarning } from '../lib/log.js';
import type { DrugUseMortalityRow, AlcoholRow, SmokingRow } from '../types.js';
import { parse } from 'csv-parse/sync';

// Prefer rate (per 100k) datasets; try multiple slugs in order
function candidateSlugs(): string[] {
  const fromEnv = process.env.OWID_CANNABIS_SLUG_LIST?.trim();
  if (fromEnv) return fromEnv.split(',').map(s => s.trim()).filter(Boolean);
  return [
    'death-rate-from-mental-health-and-substance-use-disorders-who',
    'ihme-age-standardized-death-rates-cannabis-use-disorders',
    'ihme-age-standardized-death-rates-substance-use-disorders',
    'ihme-cannabis-use-disorders-death-rate',
    'ihme-cannabis-use-disorders-deaths',
    'ihme-deaths-from-substance-use-disorders',
  ];
}

function grapherCsvUrl(slug: string): string {
  return `https://ourworldindata.org/grapher/${slug}.csv`;
}

export async function fetchOWIDDrugUseMortality(): Promise<DrugUseMortalityRow[]> {
  for (const slug of candidateSlugs()) {
    try {
      const url = grapherCsvUrl(slug);
      log(`Fetching OWID cannabis/substance mortality CSV: ${url}`);
      const res = await httpGetText(url);
      if (res.status === 304) continue;
      const csv = res.text || '';
      if (!csv.trim()) continue;

      // Parse CSV robustly
      const rows: Array<Record<string, string>> = parse(csv, {
        columns: true,
        skip_empty_lines: true,
      });

      // Expect columns Entity, Code, Year, <measure>
      let count = 0;
      const out: DrugUseMortalityRow[] = [];
      for (const r of rows) {
        const entity = r.Entity ?? r.entity;
        const code = r.Code ?? r.code;
        const year = Number(r.Year ?? r.year);
        // Pick first numeric column that isn't Entity/Code/Year
        let value: number | null = null;
        for (const k of Object.keys(r)) {
          if (/^(entity|code|year)$/i.test(k)) continue;
          const v = Number((r as any)[k]);
          if (Number.isFinite(v)) { value = v; break; }
        }
        if (value == null) continue;
        if (!code || code.length !== 3) continue;
        if (!Number.isFinite(year) || year < 1950 || year > 2100) continue;
        if (!Number.isFinite(value) || value < 0) continue;
        // Heuristic: rate datasets contain 'rate' or 'death-rates' in slug
        const isRate = /rate|death-rates/i.test(slug);
        if (!isRate) {
          // Skip count datasets to avoid mixing units; try next candidate
          count = 0;
          break;
        }
        out.push({
          country_code: code,
          country_name: entity || code,
          year,
          drug_use_mortality_rate: value, // per 100k
          source: `owid:${slug}`,
          retrieved_at: new Date().toISOString(),
        });
        count++;
      }

      if (count > 0) {
        log(`Successfully fetched ${out.length} OWID rows from '${slug}'`);
        return out;
      }

      logWarning(`OWID slug '${slug}' produced no usable rate rows; trying next`);
    } catch (error) {
      logWarning(`OWID slug fetch failed; trying next. Reason: ${(error as Error).message}`);
    }
  }

  logWarning('All OWID cannabis/substance slugs failed; returning empty list');
  return [];
}

function firstNumericValue(row: Record<string, string>): number | null {
  for (const k of Object.keys(row)) {
    if (/^(entity|code|year)$/i.test(k)) continue;
    const v = Number((row as any)[k]);
    if (Number.isFinite(v)) return v;
  }
  return null;
}

export async function fetchOWIDAlcoholConsumption(): Promise<AlcoholRow[]> {
  const candidates = (process.env.OWID_ALCOHOL_SLUG_LIST?.split(',').map(s=>s.trim()).filter(Boolean)) || [
    'total-alcohol-consumption-per-capita-litres-of-pure-alcohol',
    'alcohol-consumption',
  ];
  for (const slug of candidates) {
    try {
      const url = grapherCsvUrl(slug);
      log(`Fetching OWID alcohol CSV: ${url}`);
      const res = await httpGetText(url);
      if (res.status === 304) continue;
      const csv = res.text || '';
      if (!csv.trim()) continue;
      const rows: Array<Record<string,string>> = parse(csv, { columns: true, skip_empty_lines: true });
      const out: AlcoholRow[] = [];
      for (const r of rows) {
        const code = r.Code ?? r.code;
        const entity = r.Entity ?? r.entity;
        const year = Number(r.Year ?? r.year);
        const val = firstNumericValue(r);
        if (!code || code.length!==3) continue;
        if (!Number.isFinite(year) || year<1950 || year>2100) continue;
        if (val==null || val<0 || val>50) continue; // liters per capita
        out.push({ country_code: code, country_name: entity || code, year, alcohol_consumption: val, source: `owid:${slug}`, retrieved_at: new Date().toISOString() });
      }
      if (out.length) {
        log(`Successfully fetched ${out.length} OWID alcohol rows from '${slug}'`);
        return out;
      }
    } catch (e) {
      logWarning(`OWID alcohol '${slug}' failed: ${(e as Error).message}`);
    }
  }
  logWarning('All OWID alcohol slugs failed; returning empty');
  return [];
}

export async function fetchOWIDSmokingPrevalence(): Promise<SmokingRow[]> {
  const candidates = (process.env.OWID_SMOKING_SLUG_LIST?.split(',').map(s=>s.trim()).filter(Boolean)) || [
    'share-of-adults-who-smoke',
    'daily-smoking-prevalence',
  ];
  for (const slug of candidates) {
    try {
      const url = grapherCsvUrl(slug);
      log(`Fetching OWID smoking CSV: ${url}`);
      const res = await httpGetText(url);
      if (res.status === 304) continue;
      const csv = res.text || '';
      if (!csv.trim()) continue;
      const rows: Array<Record<string,string>> = parse(csv, { columns: true, skip_empty_lines: true });
      const out: SmokingRow[] = [];
      for (const r of rows) {
        const code = r.Code ?? r.code;
        const entity = r.Entity ?? r.entity;
        const year = Number(r.Year ?? r.year);
        const val = firstNumericValue(r);
        if (!code || code.length!==3) continue;
        if (!Number.isFinite(year) || year<1950 || year>2100) continue;
        if (val==null || val<0 || val>100) continue; // percent
        out.push({ country_code: code, country_name: entity || code, year, smoking_prevalence: val, source: `owid:${slug}`, retrieved_at: new Date().toISOString() });
      }
      if (out.length) {
        log(`Successfully fetched ${out.length} OWID smoking rows from '${slug}'`);
        return out;
      }
    } catch (e) {
      logWarning(`OWID smoking '${slug}' failed: ${(e as Error).message}`);
    }
  }
  logWarning('All OWID smoking slugs failed; returning empty');
  return [];
}
