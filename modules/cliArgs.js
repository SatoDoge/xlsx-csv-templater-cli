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

module.exports = { parseArgs, printUsage };
