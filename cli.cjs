#!/usr/bin/env node
// CJS launcher for pkg that loads the main script
try {
    require('./main.js');
} catch (error) {
    console.error(error);
    process.exit(1);
}
