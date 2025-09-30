import fs from 'node:fs/promises';
import path from 'node:path';
import { SmokingRow, SmokingRow as SmokingSchema } from '../types.js';
import { fetchOWIDSmokingPrevalence } from '../sources/owid.js';
import { writeFileWithDirs } from '../lib/files.js';
import { log, logError, logSuccess } from '../lib/log.js';
import { getArg } from '../lib/args.js';

function key(row: SmokingRow): string {
  return `${row.country_code}-${row.year}`;
}

async function run() {
  try {
    const stamp = new Date().toISOString().slice(0, 10);
    const rawDir = path.join('data/raw', stamp);
    const procDir = path.join('data/processed', stamp);
    const source = getArg(process.argv, '--source') || 'all';
    log(`Starting smoking prevalence data pipeline for source: ${source}`);

    await fs.mkdir(rawDir, { recursive: true });
    await fs.mkdir(procDir, { recursive: true });

    let data: SmokingRow[] = [];

    if (source === 'owid' || source === 'all') {
      const rows = await fetchOWIDSmokingPrevalence();
      if (rows.length) {
        await writeFileWithDirs(path.join(rawDir, 'owid_smoking_prevalence.json'), JSON.stringify(rows, null, 2));
      }
      data.push(...rows);
      logSuccess(`OWID smoking: ${rows.length} records`);
    }

    // Validate
    const valid: SmokingRow[] = [];
    let invalid = 0;
    const seen = new Set<string>();
    for (const r of data) {
      if (seen.has(key(r))) continue; // dedupe
      seen.add(key(r));
      try { valid.push(SmokingSchema.parse(r)); } catch (e) {
        invalid++; if (invalid <= 5) logError('Invalid smoking row', e);
      }
    }

    await writeFileWithDirs(path.join(procDir, 'smoking_prevalence.json'), JSON.stringify(valid, null, 2));
    await fs.mkdir('data/latest', { recursive: true });
    await writeFileWithDirs('data/latest/smoking_prevalence.json', JSON.stringify(valid, null, 2));
    logSuccess(`Smoking prevalence pipeline completed: ${valid.length} records`);
  } catch (error) {
    logError('Smoking prevalence pipeline failed', error);
    process.exit(1);
  }
}

run();
