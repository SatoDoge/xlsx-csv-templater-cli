const fs = require('fs');

async function loadCsv(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const headers = lines[0].split(',');
    const records = lines.slice(1).map(line => {
        const values = line.split(',');
        const record = {};
        headers.forEach((header, index) => {
            let value = values[index] || "";
            if (value.length > 0) {
                if (value[0] === '"' || value[0] === "'") {
                    value = value.slice(1);
                }
                if (value.length > 0 && (value[value.length - 1] === '"' || value[value.length - 1] === "'")) {
                    value = value.slice(0, -1);
                }
            }
            values[index] = value;
            record[header] = values[index];
        });
        return record;
    });
    return records;
}

module.exports = loadCsv;