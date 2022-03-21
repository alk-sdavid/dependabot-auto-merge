const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const util = require('util');
const yaml = require('js-yaml');

const readFile = util.promisify(fs.readFile);

module.exports.readConfigFile = async (params) => {
  const workspace = process.env.GITHUB_WORKSPACE || '/github/workspace';
  const configFilePath = path.join(
    workspace,
    params.configFile || '.github/auto-merge.yml'
  );

  const fileExists = await new Promise((resolve) => {
    fs.access(configFilePath, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });

  if (!fileExists) {
    throw new Error(`${configFilePath} file does not exists`);
  }

  const configFile = await readFile(configFilePath);
  const config = yaml.load(configFile);
  core.info(`Auto-merge config:\n${JSON.stringify(config, null, 2)}`);

  if (!Array.isArray(config) || config.length < 1) {
    throw new Error('Invalid config: it should be a list with at least 1 item');
  }

  return config;
};
