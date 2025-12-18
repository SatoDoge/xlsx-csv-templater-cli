const fs = require('fs');
const path = require('path');
const { loadSchema, ensureFileExists } = require('@/modules/schema');
const csvParse = require('@/modules/csvParse');
const { validateCsvRows } = require('@/modules/csvValidator');
const { toXlsx } = require('@/modules/convertXlsxData');

async function generateFromCsv(options, log) {
    const { csv, template, schema: schemaPath, outputPrefix, index, outputDir } = options;

    ensureFileExists(csv, 'CSV file');
    ensureFileExists(template, 'Template file');
    ensureFileExists(schemaPath, 'Schema file');

    log.info('Loading schema...', schemaPath);
    const schema = loadSchema(schemaPath, index);

    log.info('Reading CSV data...', csv);
    const csvData = await csvParse(csv);
    log.info(`Loaded ${csvData.length} rows.`);

    validateCsvRows(csvData, schema, outputPrefix);

    const resolvedOutputDir = path.resolve(outputDir);
    fs.mkdirSync(resolvedOutputDir, { recursive: true });
    log.info('Output directory ready:', resolvedOutputDir);

    for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const outputName = String(row[outputPrefix]);
        const outPath = path.join(resolvedOutputDir, `${outputName}.xlsx`);
        log.info(`Processing row ${i + 1}/${csvData.length}: writing ${outPath}`);
        log.debug('Row data:', row);

        const workbook = await toXlsx(row, schema, template);
        await workbook.toFileAsync(outPath);
    }

    log.info('All files generated successfully.');
}

module.exports = { generateFromCsv };
