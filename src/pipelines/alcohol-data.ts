import fs from 'node:fs/promises';
import path from 'node:path';
import { AlcoholRow } from '../types.js';
import { fetchWHOAlcoholConsumption } from '../sources/who.js';
import { fetchOWIDAlcoholConsumption } from '../sources/owid.js';
import { dedupeKeepLatest } from '../lib/normalize.js';
import { writeFileWithDirs } from '../lib/files.js';
import { getArg } from '../lib/args.js';
import { log, logError, logSuccess } from '../lib/log.js';

function alcoholDataKey(row: AlcoholRow): string {
  return `${row.country_code}-${row.year}`;
}

async function run() {
  try {
    const stamp = new Date().toISOString().slice(0, 10);
    const rawDir = path.join('data/raw', stamp);
    const procDir = path.join('data/processed', stamp);

    // Parse command line arguments (supports --source=who or --source who)
    const source = getArg(process.argv, '--source') || 'all';

    log(`Starting alcohol consumption data pipeline for source: ${source}`);

    // Create directories
    await fs.mkdir(rawDir, { recursive: true });
    await fs.mkdir(procDir, { recursive: true });

    let allData: AlcoholRow[] = [];

    // Fetch data based on source
    if (source === 'who' || source === 'all') {
      try {
        const whoData = await fetchWHOAlcoholConsumption();
        await writeFileWithDirs(
          path.join(rawDir, 'who_alcohol_consumption.json'),
          JSON.stringify(whoData, null, 2)
        );
        allData.push(...whoData);
        logSuccess(`WHO alcohol: ${whoData.length} records`);
      } catch (error) {
        logError('WHO alcohol fetch failed', error);
      }
    }

    if (source === 'owid' || source === 'all') {
      try {
        const owidData = await fetchOWIDAlcoholConsumption();
        await writeFileWithDirs(
          path.join(rawDir, 'owid_alcohol_consumption.json'),
          JSON.stringify(owidData, null, 2)
        );
        allData.push(...owidData);
        logSuccess(`OWID alcohol: ${owidData.length} records`);
      } catch (error) {
        logError('OWID alcohol fetch failed', error);
      }
    }

    // TODO: Add other sources (World Bank, OECD) as they become available

    // Deduplicate and validate
    const merged = dedupeKeepLatest(allData, alcoholDataKey);
    log(`Merged ${allData.length} records into ${merged.length} unique records`);

    // Validate all records
    const validRecords: AlcoholRow[] = [];
    const invalidCount = { count: 0 };

    for (const record of merged) {
      try {
        const validRecord = AlcoholRow.parse(record);
        validRecords.push(validRecord);
      } catch (error) {
        invalidCount.count++;
        if (invalidCount.count <= 5) { // Log first 5 errors
          logError(`Invalid alcohol record: ${JSON.stringify(record)}`, error);
        }
      }
    }

    if (invalidCount.count > 0) {
      log(`Filtered out ${invalidCount.count} invalid alcohol records`);
    }

    // Write processed data
    await writeFileWithDirs(
      path.join(procDir, 'alcohol_consumption.json'),
      JSON.stringify(validRecords, null, 2)
    );

    // Copy to latest
    await fs.mkdir('data/latest', { recursive: true });
    await writeFileWithDirs(
      'data/latest/alcohol_consumption.json',
      JSON.stringify(validRecords, null, 2)
    );

    logSuccess(`Alcohol pipeline completed: ${validRecords.length} valid records processed`);

  } catch (error) {
    logError('Alcohol pipeline failed', error);
    process.exit(1);
  }
}

// Run if called directly
run();
