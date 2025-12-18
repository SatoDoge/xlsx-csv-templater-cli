const { registerPathAliases } = require('./modules/pathAliases');
registerPathAliases();

const { parseArgs, printUsage } = require('@/modules/cliArgs');
const { createLogger } = require('@/modules/logger');
const { generateFromCsv } = require('@/modules/generator');

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
