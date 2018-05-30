#!/usr/bin/env node

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

import {LoginData} from '@wireapp/api-client/dist/commonjs/auth/';
import {ChangelogBot, MessageData} from './index';

const logdown = require('logdown');
const {version}: {version: string} = require('../package.json');

const logger = logdown('@wireapp/changelog-bot/cli', {
  logger: console,
  markdown: false,
});

const scriptName = require('path').basename(process.argv[1]);

const requiredEnvVars = ['WIRE_CHANGELOG_BOT_EMAIL', 'WIRE_CHANGELOG_BOT_PASSWORD', 'WIRE_CHANGELOG_BOT_PROJECT_DIR'];

const setBold = (text: string): string => `\x1b[1m${text}\x1b[0m`;

const usage = (): void => {
  console.info(`${setBold('Usage:')} ${scriptName} <conversation id(s)>\n`);
  console.info(
    `${setBold(
      'Example:'
    )} ${scriptName} "e4302e84-75fd-4dc7-8a16-67018bd94ce7,44be7db8-7b7c-4acf-887d-86fbb9a5508f" "/path/to/git/project"`
  );
};
const envVarUsage = (): void => console.info(setBold('Required environment variables:'), requiredEnvVars.join(', '));

const start = async (): Promise<ChangelogBot> => {
  const {
    WIRE_CHANGELOG_BOT_EMAIL,
    WIRE_CHANGELOG_BOT_PASSWORD,
    WIRE_CHANGELOG_BOT_CONVERSATION_IDS,
    WIRE_CHANGELOG_BOT_PROJECT_DIR,
  } = process.env;

  const loginData: LoginData = {
    email: WIRE_CHANGELOG_BOT_EMAIL,
    password: WIRE_CHANGELOG_BOT_PASSWORD,
    persist: false,
  };

  const previousCommit = await ChangelogBot.runCommand(
    `cd "${WIRE_CHANGELOG_BOT_PROJECT_DIR}" && git rev-parse HEAD~1`
  );
  console.log('previousCommit', previousCommit);

  const changelog = await ChangelogBot.generateChangelog('wireapp/wire-webapp', previousCommit);

  const messageData: MessageData = {
    content: changelog,
  };

  console.log('messageData', messageData);
  process.exit();

  if (WIRE_CHANGELOG_BOT_CONVERSATION_IDS) {
    messageData.conversationIds = WIRE_CHANGELOG_BOT_CONVERSATION_IDS.replace(' ', '').split(',');
  }

  logger.info('Booting up ...');

  const bot = new ChangelogBot(loginData, messageData);
  await bot.start();

  return bot;
};

logger.info(setBold(`wire-changelog-bot v${version}`) + '\n');

const SECOND_ARGUMENT = 2;
const THIRD_ARGUMENT = 3;

switch (process.argv[SECOND_ARGUMENT]) {
  case '-help':
  case '--help':
  case '-h':
  case '--h': {
    usage();
    envVarUsage();
    process.exit(0);
  }
  default:
    {
      if (process.argv[SECOND_ARGUMENT]) {
        process.env.WIRE_CHANGELOG_BOT_CONVERSATION_IDS = process.argv[SECOND_ARGUMENT];
      }
    }

    if (process.argv[THIRD_ARGUMENT]) {
      process.env.WIRE_CHANGELOG_BOT_PROJECT_DIR = process.argv[THIRD_ARGUMENT];
    }
}

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable "${envVar}" is not set.`);
    envVarUsage();
    process.exit(1);
  }
});

(async () => {
  try {
    await start();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
