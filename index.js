const core = require('@actions/core');

function errorHandler({ message, stack }) {
  core.error(`${message}\n${stack}`);
  process.exit(1);
}

process.on('unhandledRejection', errorHandler);
process.on('uncaughtException', errorHandler);

require('./src').catch(errorHandler);
