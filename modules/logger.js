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

module.exports = { createLogger };
