let mode, config;

let argMode = process.argv.slice(2).indexOf('-p') > -1 ? 'production' : undefined;
mode = argMode || process.env.NODE_ENV || 'development';

module.exports = require('./config/webpack.build').default(mode);

console.log(`Build Mode: ${mode}\n`);
