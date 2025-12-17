const fs = require('fs');
const path = require('path');
const { toXlsx } = require('./modules/convertXlsxData');
const csvParse = require('./modules/csvParse');

function createLogger(verbose) {
    const timestamp = () => new Date().toISOString();
    return {
        info: (...args) => console.log(`[INFO ${timestamp()}]`, ...args),
        warn: (...args) => console.warn(`[WARN ${timestamp()}]`, ...args),
        error: (...args) => console.error(`[ERROR ${timestamp()}]`, ...args),
        debug: (...args) => {
            if (verbose) {
                console.log(`[DEBUG ${timestamp()}]`, ...args);
            }
        }
    };
}

function printUsage() {
    console.log('Usage: node main.js --csv <file> --template <file> --schema <file> [options]');
    console.log('Options:');
    console.log('  --csv <file>           Path to CSV data file (required)');
    console.log('  --template <file>      Path to template .xlsx file (required)');
    console.log('  --schema <file>        Path to schema JSON file (required)');
    console.log('  --output-prefix <key>  CSV column to use for output file name (default: path)');
    console.log('  --output-dir <dir>     Directory to write generated .xlsx files (default: current directory)');
    console.log('  --index <number>       Sheet index in the template to use (default: 0)');
    console.log('  --verbose              Enable verbose logging');
    console.log('  --help, -h             Show this help message');
    console.log('Examples:');
    console.log('  node main.js --csv base.csv --template template.xlsx --schema schema.json');
    console.log('  node main.js --csv base.csv --template template.xlsx --schema schema.json --output-dir out --verbose');
}

function parseArgs(argv) {
    const options = {
        outputPrefix: 'path',
        outputDir: process.cwd(),
        index: 0,
        verbose: false
    };
    const unknown = [];

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (!arg.startsWith('--')) {
            unknown.push(arg);
            continue;
        }

        const [flag, inlineValue] = arg.split('=', 2);
        const nextValue = argv[i + 1];
        const hasNextValue = nextValue && !nextValue.startsWith('--');
        let value = inlineValue !== undefined ? inlineValue : (hasNextValue ? nextValue : true);

        switch (flag) {
            case '--csv':
                options.csv = value;
                if (hasNextValue && inlineValue === undefined) i++;
                break;
            case '--template':
                options.template = value;
                if (hasNextValue && inlineValue === undefined) i++;
                break;
            case '--schema':
                options.schema = value;
                if (hasNextValue && inlineValue === undefined) i++;
                break;
            case '--output-prefix':
                options.outputPrefix = value;
                if (hasNextValue && inlineValue === undefined) i++;
                break;
            case '--output-dir':
                options.outputDir = value;
                if (hasNextValue && inlineValue === undefined) i++;
                break;
            case '--index': {
                const parsed = Number(value);
                options.index = Number.isNaN(parsed) ? value : parsed;
                if (hasNextValue && inlineValue === undefined) i++;
                break;
            }
            case '--verbose':
                options.verbose = value === true || String(value).toLowerCase() === 'true';
                if (hasNextValue && inlineValue === undefined) i++;
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
            default:
                unknown.push(flag);
                if (hasNextValue && inlineValue === undefined) {
                    unknown.push(value);
                    i++;
                }
                break;
        }
    }

    return { options, unknown };
}

function ensureFileExists(filePath, label) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`${label} not found: ${filePath}`);
    }
}

function loadSchema(schemaPath, sheetIndexOverride) {
    const raw = fs.readFileSync(schemaPath, 'utf8');
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        throw new Error(`Schema JSON parse failed: ${error.message}`);
    }

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Schema must be a JSON object containing cellField and metaData.');
    }

    if (!parsed.cellField || typeof parsed.cellField !== 'object') {
        throw new Error('Schema must include a cellField object.');
    }

    const metaData = parsed.metaData && typeof parsed.metaData === 'object' ? { ...parsed.metaData } : {};
    if (sheetIndexOverride !== undefined && sheetIndexOverride !== null) {
        const parsedIndex = Number(sheetIndexOverride);
        if (Number.isNaN(parsedIndex)) {
            throw new Error(`Sheet index must be a number. Received: ${sheetIndexOverride}`);
        }
        metaData.sheetIndex = parsedIndex;
    }

    if (metaData.sheetIndex === undefined) {
        metaData.sheetIndex = 0;
    }

    if (Number.isNaN(Number(metaData.sheetIndex))) {
        throw new Error(`Sheet index in schema must be numeric. Received: ${metaData.sheetIndex}`);
    }

    return { cellField: parsed.cellField, metaData };
}

function validateCsvRows(rows, schema, outputPrefix) {
    const requiredKeys = Object.keys(schema.cellField || {});
    const problems = [];

    rows.forEach((row, idx) => {
        const missing = requiredKeys.filter(key => !(key in row) || row[key] === null || row[key] === undefined || row[key] === '');
        if (missing.length > 0) {
            problems.push(`Row ${idx + 1}: missing values for ${missing.join(', ')}`);
        }

        if (!(outputPrefix in row) || row[outputPrefix] === null || row[outputPrefix] === undefined || row[outputPrefix] === '') {
            problems.push(`Row ${idx + 1}: output-prefix column "${outputPrefix}" is missing or empty.`);
        }
    });

    if (problems.length > 0) {
        throw new Error(`CSV validation failed:\n${problems.join('\n')}`);
    }
}

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

async function main() {
    const { options, unknown } = parseArgs(process.argv.slice(2));
    const log = createLogger(options.verbose);

    try {
        if (options.help) {
            printUsage();
            return;
        }

        if (unknown.length > 0) {
            log.warn('Unknown arguments:', unknown.join(' '));
        }

        if (!options.csv || !options.template || !options.schema) {
            printUsage();
            throw new Error('Missing required arguments: --csv, --template, and --schema are required.');
        }

        await generateFromCsv(options, log);
    } catch (error) {
        log.error(error.message);
        process.exitCode = 1;
    }
}

main();
