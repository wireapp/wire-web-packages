const logdown = require('logdown');
const program = require('commander');

const {description, version} = require('../package.json');
const logger = logdown('@wireapp/standup-bot/start', {
  logger: console,
  markdown: false,
});

program
  .description(description)
  .version(version)
  .option('-c, --conversations <conversationId,...>', 'The conversation IDs to act in')
  .option('-e, --email <address>', 'Your email address')
  .option('-p, --password <password>', 'Your password')
  .parse(process.argv);

logger.info('email', program.email);
