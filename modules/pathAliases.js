const path = require('path');
const moduleAlias = require('module-alias');
const packageJson = require('../package.json');

function registerPathAliases() {
    const { paths = {} } = packageJson;
    const aliases = {};

    Object.entries(paths).forEach(([aliasPattern, targets]) => {
        if (!Array.isArray(targets) || targets.length === 0) return;

        const alias = aliasPattern.replace(/\/\*$/, '');
        const targetBase = targets[0].replace(/\/\*$/, '');
        aliases[alias] = path.join(__dirname, '..', targetBase);
    });

    moduleAlias.addAliases(aliases);
}

module.exports = { registerPathAliases };
