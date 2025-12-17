const XlsxPopulate = require('xlsx-populate');

function convertXlsxData() {
    return { toJson, toXlsx };
}

async function toXlsx(data, schema, templatePath) {
    const { cellField, metaData } = schema;
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(metaData.sheetIndex);
    const onjArr = Object.entries(cellField).map(([key, value]) => ({
        key: key,
        value: value
    }));
    for (const o of onjArr) {
        sheet.cell(cellField[o.key]).value(data[o.key]);
    }
    return workbook;
}

function toJson(data, schema) {
    const { cellField, metaData } = schema;
    const sheet = data.sheet(metaData.sheetIndex);
    const onjArr = Object.entries(cellField).map(([key, value]) => ({
        key: key,
        value: value
    }));
    const result = {};
    for (const o of onjArr) {
        result[o.key] = sheet.cell(cellField[o.key]).value();
    }
    return result;
}

module.exports = convertXlsxData;
module.exports.toXlsx = toXlsx;
module.exports.toJson = toJson;