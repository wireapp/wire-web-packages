import {Bot} from './index';
import {StandupHandler} from './StandupHandler';

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
  .option('-c, --conversations <conversationId,...>', 'The conversation ID(s) for the bot to act in')
  .option('-e, --email <address>', 'Bot email address')
  .option('-o, --owners <userId,...>', 'The user ID(s) of the bot owner')
  .option('-p, --password <password>', 'Bot password')
  .parse(process.argv);

(async () => {
  const conversationIds: string[] = program.conversations ? program.conversations.trim().split(',') : [];
  const ownerIds: string[] = program.owners ? program.owners.trim().split(',') : [];

  const messageHandler = new StandupHandler('', 4);

  const bot = new Bot(
    {
      conversations: conversationIds,
      owners: ownerIds,
    },
    messageHandler
  );

  try {
    await bot.login(program.email, program.password);
    logger.info(`Running stand-up bot with "${program.email}" ...`);
  } catch (error) {
    logger.error(`Failed to run stand-up bot with "${program.email}": ${error.message}`, error);
  }
})();
