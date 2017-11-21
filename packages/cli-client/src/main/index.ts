const {Account} = require('@wireapp/core');
const {StoreEngine} = require('@wireapp/store-engine');
const program = require('commander');
const { description, version } = require('../package.json');

program
  .version(version)
  .description(description)
  .option('-e, --email <address>', 'E-Mail')
  .parse(process.argv);
