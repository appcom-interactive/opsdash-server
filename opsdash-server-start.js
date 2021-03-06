#!/usr/bin/env node

const program = require('commander');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const compose = require('docker-compose');
const logger = require('./logger');

program
  .option('-v, --verbose', 'Enable verbose output')
  .parse(process.argv);

const { args } = program;
const name = args[0] || 'default';

logger.info(`Starting server with profile ${chalk.blue(name)}`);

const destination = path.join(os.homedir(), '.opsdash-server', name);

if (!fs.existsSync(path.join(destination, 'docker-compose.yml'))) {
  logger.info(`Could not found previous data for profile ${chalk.blue(name)}. Creating it from scratch`);
  fs.copySync(path.join(__dirname, 'data'), destination);
} else {
  logger.info(`There already is data for profile ${chalk.blue(name)}`);
}

const options = {
  cwd: destination,
  log: program.verbose
};

logger.info('Building and running opsdash server');

compose.buildAll(options)
  .then(() => compose.upAll(options))
  .then(() => logger.info(`Successfully built and started opsdash server with profile ${chalk.blue(name)}`))
  .catch((error) => {
    logger.warn(`There was an error starting opsdash server for profile ${chalk.blue(name)}`);
    logger.error(error);
  });
