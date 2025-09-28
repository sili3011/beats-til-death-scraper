import fs from 'node:fs/promises';
import path from 'node:path';
import { BMIRow } from '../types.js';
import { fetchWHOBMI } from '../sources/who.js';
import { dedupeKeepLatest } from '../lib/normalize.js';
import { writeFileWithDirs } from '../lib/files.js';
import { log, logError, logSuccess } from '../lib/log.js';

function bmiDataKey(row: BMIRow): string {
  return `${row.country_code}-${row.year}`;
}

async function run() {
  try {
    const stamp = new Date().toISOString().slice(0, 10);
    const rawDir = path.join('data/raw', stamp);
    const procDir = path.join('data/processed', stamp);

    // Parse command line arguments
    const source = process.argv.find(arg => arg.startsWith('--source='))?.split('=')[1] || 'all';

    log(`Starting BMI/obesity data pipeline for source: ${source}`);

    // Create directories
    await fs.mkdir(rawDir, { recursive: true });
    await fs.mkdir(procDir, { recursive: true });

    let allData: BMIRow[] = [];

    // Fetch data based on source
    if (source === 'who' || source === 'all') {
      try {
        const whoData = await fetchWHOBMI();
        await writeFileWithDirs(
          path.join(rawDir, 'who_bmi_obesity.json'),
          JSON.stringify(whoData, null, 2)
        );
        allData.push(...whoData);
        logSuccess(`WHO BMI/obesity: ${whoData.length} records`);
      } catch (error) {
        logError('WHO BMI/obesity fetch failed', error);
      }
    }

    // TODO: Add other sources (World Bank, OECD) as they become available

    // Deduplicate and validate
    const merged = dedupeKeepLatest(allData, bmiDataKey);
    log(`Merged ${allData.length} records into ${merged.length} unique records`);

    // Validate all records
    const validRecords: BMIRow[] = [];
    const invalidCount = { count: 0 };

    for (const record of merged) {
      try {
        const validRecord = BMIRow.parse(record);
        validRecords.push(validRecord);
      } catch (error) {
        invalidCount.count++;
        if (invalidCount.count <= 5) { // Log first 5 errors
          logError(`Invalid BMI record: ${JSON.stringify(record)}`, error);
        }
      }
    }

    if (invalidCount.count > 0) {
      log(`Filtered out ${invalidCount.count} invalid BMI records`);
    }

    // Write processed data
    await writeFileWithDirs(
      path.join(procDir, 'bmi_obesity.json'),
      JSON.stringify(validRecords, null, 2)
    );

    // Copy to latest
    await fs.mkdir('data/latest', { recursive: true });
    await writeFileWithDirs(
      'data/latest/bmi_obesity.json',
      JSON.stringify(validRecords, null, 2)
    );

    logSuccess(`BMI pipeline completed: ${validRecords.length} valid records processed`);

  } catch (error) {
    logError('BMI pipeline failed', error);
    process.exit(1);
  }
}

// Run if called directly
run();