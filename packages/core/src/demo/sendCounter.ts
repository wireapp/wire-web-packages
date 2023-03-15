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
import {TimeUtil} from '@wireapp/commons';
import {Account, MessageBuilder} from '@wireapp/core';
import {APIClient} from '@wireapp/api-client';
import {ClientType} from '@wireapp/api-client/lib/client/';
import {ConversationProtocol} from '@wireapp/api-client/lib/conversation';
import 'fake-indexeddb/auto';
import {MemoryEngine} from '@wireapp/store-engine';

commander.option('-c, --conversationId <conversationId>').parse(process.argv);

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
  console.log(login);

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

  async function sendText(message: string): Promise<void> {
    const payload = MessageBuilder.buildTextMessage({text: message});
    try {
      const res = await account.service!.conversation.send({
        payload,
        protocol: ConversationProtocol.PROTEUS,
        conversationId: {id: '10fdf9ff-c581-463a-931a-388c8f03a9c4', domain: 'wire.com'},
      });
      console.log(res);
    } catch (e) {
      console.error(e);
    }
  }

  const twoSeconds = TimeUtil.TimeInMillis.SECOND * 2;
  let counter = 1;
  setInterval(() => sendText(`${counter++}`), twoSeconds);
})().catch(error => console.error(error));
