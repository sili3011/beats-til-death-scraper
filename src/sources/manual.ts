import { LifeRow } from '../types.js';
import { parse } from 'csv-parse';
import fs from 'node:fs/promises';
import path from 'node:path';
import { log, logWarning } from '../lib/log.js';

/**
 * Read manually curated CSV data
 * This is for custom datasets that don't come from APIs
 */
export async function fetchManualData(): Promise<LifeRow[]> {
  const csvPath = path.join('data', 'manual', 'life_expectancy.csv');
  
  try {
    const fileExists = await fs.access(csvPath).then(() => true).catch(() => false);
    if (!fileExists) {
      logWarning(`Manual CSV file not found: ${csvPath}`);
      return [];
    }
    
    const content = await fs.readFile(csvPath, 'utf8');
    const records: LifeRow[] = [];
    
    return new Promise((resolve, reject) => {
      parse(content, {
        columns: true,
        skip_empty_lines: true,
        comment: '#'
      }, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        for (const row of rows) {
          try {
            records.push({
              country_code: row.country_code,
              country_name: row.country_name,
              year: Number(row.year),
              life_expectancy: Number(row.life_expectancy),
              source: row.source || 'manual',
              retrieved_at: new Date().toISOString()
            });
          } catch (error) {
            log(`Skipping invalid manual CSV row: ${JSON.stringify(row)}`);
          }
        }
        
        log(`Loaded ${records.length} records from manual CSV`);
        resolve(records);
      });
    });
    
  } catch (error) {
    logWarning(`Failed to read manual CSV data: ${error}`);
    return [];
  }
}

/**
 * Example CSV format expected:
 * 
 * country_code,country_name,year,life_expectancy,source
 * USA,United States,2020,78.93,manual
 * CAN,Canada,2020,82.43,manual
 * # This is a comment
 * GBR,United Kingdom,2020,81.20,manual
 */