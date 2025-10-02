import fs from 'node:fs/promises';
import path from 'node:path';
import { DrugUseMortalityRow } from '../types.js';
import { fetchWHODrugUseMortality } from '../sources/who.js';
import { fetchOWIDDrugUseMortality } from '../sources/owid.js';
import { dedupeKeepLatest } from '../lib/normalize.js';
import { writeFileWithDirs } from '../lib/files.js';
import { log, logError, logSuccess } from '../lib/log.js';
import { getArg } from '../lib/args.js';

function drugUseKey(row: DrugUseMortalityRow): string {
  return `${row.country_code}-${row.year}`;
}

async function run() {
  try {
    const stamp = new Date().toISOString().slice(0, 10);
    const rawDir = path.join('data/raw', stamp);
    const procDir = path.join('data/processed', stamp);

    const source = getArg(process.argv, '--source') || 'all';
    log(`Starting drug/substance mortality data pipeline for source: ${source}`);

    await fs.mkdir(rawDir, { recursive: true });
    await fs.mkdir(procDir, { recursive: true });

    let allData: DrugUseMortalityRow[] = [];

    if (source === 'who' || source === 'all') {
      try {
        const whoData = await fetchWHODrugUseMortality();
        if (whoData.length) {
          await writeFileWithDirs(path.join(rawDir, 'who_drug_use_mortality.json'), JSON.stringify(whoData, null, 2));
        }
        allData.push(...whoData);
        logSuccess(`WHO drug/substance mortality: ${whoData.length} records`);
      } catch (error) {
        logError('WHO drug/substance mortality fetch failed', error);
      }
    }

    if (source === 'owid' || source === 'all') {
      try {
        const owidData = await fetchOWIDDrugUseMortality();
        if (owidData.length) {
          await writeFileWithDirs(path.join(rawDir, 'owid_drug_use_mortality.json'), JSON.stringify(owidData, null, 2));
        }
        allData.push(...owidData);
        logSuccess(`OWID drug/substance mortality: ${owidData.length} records`);
      } catch (error) {
        logError('OWID drug/substance mortality fetch failed', error);
      }
    }

    const merged = dedupeKeepLatest(allData, drugUseKey);
    log(`Merged ${allData.length} records into ${merged.length} unique records`);

    // Validate all records
    const validRecords: DrugUseMortalityRow[] = [];
    let invalidCount = 0;
    for (const record of merged) {
      try {
        const valid = DrugUseMortalityRow.parse(record);
        validRecords.push(valid);
      } catch (error) {
        invalidCount++;
        if (invalidCount <= 5) logError(`Invalid drug/substance mortality record: ${JSON.stringify(record)}`, error);
      }
    }
    if (invalidCount > 0) log(`Filtered out ${invalidCount} invalid drug/substance mortality records`);

    // Write processed and latest
    await writeFileWithDirs(path.join(procDir, 'drug_use_mortality.json'), JSON.stringify(validRecords, null, 2));
    await fs.mkdir('data/latest', { recursive: true });
    await writeFileWithDirs('data/latest/drug_use_mortality.json', JSON.stringify(validRecords, null, 2));

    logSuccess(`Drug/substance mortality pipeline completed: ${validRecords.length} valid records processed`);
  } catch (error) {
    logError('Drug/substance mortality pipeline failed', error);
    process.exit(1);
  }
}

// Run if called directly
run();
