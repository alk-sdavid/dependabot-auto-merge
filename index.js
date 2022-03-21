const core = require('@actions/core');
const main = require('./src');

function errorHandler({ message, stack }) {
  core.error(`${message}\n${stack}`);
  process.exit(1);
}

process.on('unhandledRejection', errorHandler);
process.on('uncaughtException', errorHandler);

main().catch(errorHandler);
