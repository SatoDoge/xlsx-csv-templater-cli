function validateCsvRows(rows, schema, outputPrefix) {
    const requiredKeys = Object.keys(schema.cellField || {});
    const problems = [];

    rows.forEach((row, idx) => {
        const missing = requiredKeys.filter(key => !(key in row) || row[key] === null || row[key] === undefined);
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

module.exports = { validateCsvRows };
