import fs from 'node:fs/promises';
import path from 'node:path';
import { DrugUseMortalityRow } from '../types.js';
import { parse } from 'csv-parse';
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

    // Optional: manual CSV fallback if present
    try {
      const manualPathPrimary = path.join('data', 'manual', 'drug_use_mortality.csv');
      const manualPathLegacy = path.join('data', 'manual', 'cannabis_mortality.csv');
      const manualPath = await fs.access(manualPathPrimary).then(()=>manualPathPrimary).catch(async()=> (await fs.access(manualPathLegacy).then(()=>manualPathLegacy).catch(()=>'')));
      const exists = await fs.access(manualPath).then(() => true).catch(() => false);
      if (exists && (source === 'manual' || source === 'all')) {
        const content = await fs.readFile(manualPath, 'utf8');
        const manualRows: DrugUseMortalityRow[] = await new Promise((resolve, reject) => {
          parse(content, { columns: true, skip_empty_lines: true, comment: '#' }, (err, rows: any[]) => {
            if (err) return reject(err);
            try {
              const mapped: DrugUseMortalityRow[] = rows.map((r) => ({
                country_code: String(r.country_code),
                country_name: String(r.country_name),
                year: Number(r.year),
                drug_use_mortality_rate: Number(r.drug_use_mortality_rate ?? r.cannabis_mortality_rate),
                source: r.source || 'manual',
                retrieved_at: new Date().toISOString(),
              }));
              resolve(mapped);
            } catch (e) { reject(e); }
          });
        });
        if (manualRows.length) {
          await writeFileWithDirs(path.join(rawDir, 'manual_drug_use_mortality.json'), JSON.stringify(manualRows, null, 2));
          allData.push(...manualRows);
          logSuccess(`Manual drug/substance mortality: ${manualRows.length} records`);
        }
      }
    } catch (error) {
      logError('Manual drug/substance mortality load failed', error);
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
