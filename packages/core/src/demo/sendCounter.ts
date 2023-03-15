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

/* eslint-disable no-inner-declarations */

process.on('uncaughtException', error =>
  console.error(`Uncaught exception "${error.constructor.name}": ${error.message}`, error),
);
process.on('unhandledRejection', (reason, promise) =>
  console.error('Unhandled Rejection at:', promise, 'reason:', reason),
);

import {program as commander} from 'commander';
import logdown from 'logdown';
import * as path from 'path';
import {Account, MessageBuilder} from '@wireapp/core';
import {APIClient} from '@wireapp/api-client';
import {ClientType} from '@wireapp/api-client/lib/client/';
import {ConversationProtocol} from '@wireapp/api-client/lib/conversation';
import 'fake-indexeddb/auto';
import {MemoryEngine} from '@wireapp/store-engine';

commander.requiredOption('-name, <webbyName>').parse(process.argv);
commander.requiredOption('-id, <webbyId>').parse(process.argv);

require('dotenv').config({path: path.join(__dirname, 'sender.env')});

const logger = logdown('@wireapp/core/src/demo/send-counter.ts', {
  logger: console,
  markdown: false,
});
logger.state.isEnabled = true;
const {EMAIL, PASS} = process.env;

(async () => {
  const login = {
    clientType: ClientType.TEMPORARY,
    email: EMAIL,
    password: PASS,
  };

  const webbyName = commander.opts().webbyName;
  const webbyId = commander.opts().webbyId;

  const backend = APIClient.BACKEND.PRODUCTION;
  const engine = new MemoryEngine();

  const apiClient = new APIClient({urls: backend});
  const account = new Account(apiClient, {createStore: () => Promise.resolve(engine)});
  await account.useAPIVersion(1, 4, true);
  const context = await account.login(login);
  await account.registerClient(login);

  logger.log('User ID', context.userId);
  logger.log('Client ID', context.clientId);
  logger.log('Domain', context.domain);

  const payload = MessageBuilder.buildTextMessage({
    text: `@${webbyName}, you are Dev on Duty this week. Don't forget to:
  - regularly check the nightly run
  - keep an eye for upcoming releases
  `,
    mentions: [
      {
        length: webbyName.length + 1,
        start: 0,
        userId: webbyId,
        qualifiedUserId: {
          domain: 'staging.zinfra.io',
          id: webbyId,
        },
      },
    ],
  });
  try {
    const res = await account.service!.conversation.send({
      payload,
      protocol: ConversationProtocol.PROTEUS,
      conversationId: {id: '12021b8c-bb07-42ef-a514-d163687a6127', domain: 'staging.zinfra.io'},
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }

  await account.logout();
})().catch(error => console.error(error));
