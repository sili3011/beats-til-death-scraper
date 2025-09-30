import fs from 'node:fs/promises';
import path from 'node:path';
import { LifeRow } from '../types.js';
import { fetchWorldBank } from '../sources/worldbank.js';
import { fetchWHOLifeExpectancy as fetchWHO } from '../sources/who.js';
import { fetchOECD } from '../sources/oecd.js';
import { fetchManualData } from '../sources/manual.js';
import { dedupeKeepLatest, lifeDataKey } from '../lib/normalize.js';
import { writeFileWithDirs } from '../lib/files.js';
import { getArg } from '../lib/args.js';
import { log, logError, logSuccess } from '../lib/log.js';

async function run() {
  try {
    const stamp = new Date().toISOString().slice(0, 10);
    const rawDir = path.join('data/raw', stamp);
    const procDir = path.join('data/processed', stamp);
    
    // Parse command line arguments (supports --source=who or --source who)
    const source = getArg(process.argv, '--source') || 'all';
    
    log(`Starting life expectancy data pipeline for source: ${source}`);
    
    // Create directories
    await fs.mkdir(rawDir, { recursive: true });
    await fs.mkdir(procDir, { recursive: true });
    
    let allData: LifeRow[] = [];
    
    // Fetch data based on source
    if (source === 'worldbank' || source === 'all') {
      try {
        const wbData = await fetchWorldBank();
        await writeFileWithDirs(
          path.join(rawDir, 'worldbank_life_expectancy.json'),
          JSON.stringify(wbData, null, 2)
        );
        allData.push(...wbData);
        logSuccess(`World Bank: ${wbData.length} records`);
      } catch (error) {
        logError('World Bank fetch failed', error);
      }
    }
    
    if (source === 'who' || source === 'all') {
      try {
        const whoData = await fetchWHO();
        await writeFileWithDirs(
          path.join(rawDir, 'who_life_expectancy.json'),
          JSON.stringify(whoData, null, 2)
        );
        allData.push(...whoData);
        logSuccess(`WHO: ${whoData.length} records`);
      } catch (error) {
        logError('WHO fetch failed', error);
      }
    }
    
    if (source === 'oecd' || source === 'all') {
      try {
        const oecdData = await fetchOECD();
        await writeFileWithDirs(
          path.join(rawDir, 'oecd_life_expectancy.json'),
          JSON.stringify(oecdData, null, 2)
        );
        allData.push(...oecdData);
        logSuccess(`OECD: ${oecdData.length} records`);
      } catch (error) {
        logError('OECD fetch failed', error);
      }
    }
    
    if (source === 'manual' || source === 'all') {
      try {
        const manualData = await fetchManualData();
        if (manualData.length > 0) {
          await writeFileWithDirs(
            path.join(rawDir, 'manual_life_expectancy.json'),
            JSON.stringify(manualData, null, 2)
          );
        }
        allData.push(...manualData);
        logSuccess(`Manual: ${manualData.length} records`);
      } catch (error) {
        logError('Manual data fetch failed', error);
      }
    }
    
    // Deduplicate and validate
    const merged = dedupeKeepLatest(allData, lifeDataKey);
    log(`Merged ${allData.length} records into ${merged.length} unique records`);
    
    // Validate all records
    const validRecords: LifeRow[] = [];
    const invalidCount = { count: 0 };
    
    for (const record of merged) {
      try {
        const validRecord = LifeRow.parse(record);
        validRecords.push(validRecord);
      } catch (error) {
        invalidCount.count++;
        if (invalidCount.count <= 5) { // Log first 5 errors
          logError(`Invalid record: ${JSON.stringify(record)}`, error);
        }
      }
    }
    
    if (invalidCount.count > 0) {
      log(`Filtered out ${invalidCount.count} invalid records`);
    }
    
    // Write processed data
    await writeFileWithDirs(
      path.join(procDir, 'life_expectancy.json'),
      JSON.stringify(validRecords, null, 2)
    );
    
    // Copy to latest
    await fs.mkdir('data/latest', { recursive: true });
    await writeFileWithDirs(
      'data/latest/life_expectancy.json',
      JSON.stringify(validRecords, null, 2)
    );
    
    logSuccess(`Pipeline completed: ${validRecords.length} valid records processed`);
    
  } catch (error) {
    logError('Pipeline failed', error);
    process.exit(1);
  }
}

// Run if called directly
run();
