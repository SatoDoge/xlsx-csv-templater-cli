const fs = require('fs');

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

module.exports = { ensureFileExists, loadSchema };
