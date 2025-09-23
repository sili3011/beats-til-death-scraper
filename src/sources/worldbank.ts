import { LifeRow } from '../types.js';
import { httpGetJson } from '../lib/fetcher.js';
import { log, logError } from '../lib/log.js';

const WB_URL = (page = 1) =>
  `https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json&per_page=20000&page=${page}`;

interface WorldBankResponse {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

interface WorldBankMetadata {
  page: number;
  pages: number;
  per_page: number;
  total: number;
}

export async function fetchWorldBank(): Promise<LifeRow[]> {
  const out: LifeRow[] = [];
  
  try {
    log('Starting World Bank data fetch...');
    
    // WB returns [metadata, data[]]
    const firstResponse = await httpGetJson(WB_URL(1));
    if (firstResponse.status === 304) {
      log('World Bank data not modified');
      return [];
    }
    
    const first = firstResponse.json as [WorldBankMetadata, WorldBankResponse[]];
    const pages = first[0]?.pages ?? 1;
    
    log(`Found ${pages} pages of World Bank data`);
    
    const collect = async (p: number) => {
      let response;
      if (p === 1) {
        response = { status: 200 as const, json: first };
      } else {
        response = await httpGetJson(WB_URL(p));
        if (response.status === 304) return;
      }
      
      const [, data] = response.json as [WorldBankMetadata, WorldBankResponse[]];
      
      for (const row of data || []) {
        if (!row || row.value == null || !row.countryiso3code) continue;
        
        try {
          out.push({
            country_code: row.countryiso3code,
            country_name: row.country.value,
            year: Number(row.date),
            life_expectancy: Number(row.value),
            source: 'worldbank',
            retrieved_at: new Date().toISOString()
          });
        } catch (error) {
          logError(`Failed to process World Bank row: ${JSON.stringify(row)}`, error);
        }
      }
    };
    
    // Process all pages
    await Promise.all(Array.from({ length: pages }, (_, i) => collect(i + 1)));
    
    log(`Successfully fetched ${out.length} World Bank records`);
    return out;
    
  } catch (error) {
    logError('Failed to fetch World Bank data', error);
    throw error;
  }
}