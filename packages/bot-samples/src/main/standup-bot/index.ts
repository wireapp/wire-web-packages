/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {Bot} from '@wireapp/bot-api';
import {StandupHandler} from './StandupHandler';

const logdown = require('logdown');
const program = require('commander');

const {description, version} = require('../../package.json');
const logger = logdown('@wireapp/standup-bot', {
  logger: console,
  markdown: false,
});

program
  .description(description)
  .version(version)
  .option('-c, --conversation <conversationId>', 'The conversation ID of the stand-up chat')
  .option('-e, --email <address>', 'Bot email address')
  .option('-o, --owners <userId,...>', 'The user ID(s) of the bot owner')
  .option('-p, --password <password>', 'Bot password')
  .parse(process.argv);

(async () => {
  const PARTICIPANT_LIMIT = 3;
  const ownerIds: string[] = program.owners ? program.owners.trim().split(',') : [];

  const bot = new Bot({
    conversations: [],
    owners: ownerIds,
  });
  bot.addHandler(new StandupHandler(program.conversation, PARTICIPANT_LIMIT));

  try {
    await bot.start(program.email, program.password);
    logger.info(`Running stand-up bot with "${program.email}" ...`);
  } catch (error) {
    logger.error(`Failed to run stand-up bot with "${program.email}": ${error.message}`, error);
  }
})();
