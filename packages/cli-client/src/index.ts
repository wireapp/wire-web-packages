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

import {APIClient} from '@wireapp/api-client';
import {ClientType, RegisteredClient} from '@wireapp/api-client/src/client/';
import {BackendErrorLabel} from '@wireapp/api-client/src/http/';
import {Account} from '@wireapp/core';
import {PayloadBundleType} from '@wireapp/core/dist/conversation/';
import {FileEngine} from '@wireapp/store-engine-fs';
import {AxiosError} from 'axios';
import program from 'commander';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

dotenv.config();

const {
  bin,
  description,
  version,
}: {bin: Record<string, string>; description: string; version: string} = require('../package.json');

program
  .name(Object.keys(bin)[0])
  .version(version)
  .description(description)
  .option('-e, --email <address>', 'Your email address')
  .option('-p, --password <password>', 'Your password')
  .option('-c, --conversation <conversationId>', 'The conversation to write in')
  .parse(process.argv);

const loginData = {
  clientType: ClientType.PERMANENT,
  email: program.email || process.env.WIRE_LOGIN_EMAIL,
  password: program.password || process.env.WIRE_LOGIN_PASSWORD,
};

if (!loginData.email || !loginData.password) {
  console.error('Email and password both need to be set');
  program.help();
}

const conversationID = program.conversation || process.env.WIRE_CONVERSATION_ID;

const directory = path.join(os.homedir(), '.wire-cli', loginData.email);

const storeEngineProvider = async (storeName: string) => {
  const engine = new FileEngine(directory);
  await engine.init(storeName, {fileExtension: '.json'});
  return engine;
};

const apiClient = new APIClient({urls: APIClient.BACKEND.PRODUCTION});
const account = new Account(apiClient, storeEngineProvider);

account.on(PayloadBundleType.TEXT, textMessage => {
  console.info(
    `Received message from user ID "${textMessage.from}" in conversation ID "${textMessage.conversation}": ${textMessage.content}`,
  );
});

(async () => {
  try {
    await account.login(loginData);
    await account.listen();
  } catch (error) {
    const data = (error as AxiosError).response?.data;
    const errorLabel = data?.label;
    // TODO: The following is just a quick hack to continue if too many clients are registered!
    // We should expose this fail-safe method as an emergency function
    if (errorLabel === BackendErrorLabel.TOO_MANY_CLIENTS) {
      const clients = await apiClient.client.api.getClients();
      const client: RegisteredClient = clients[0];
      await apiClient.client.api.deleteClient(client.id, loginData.password);
      await account.logout();

      // TODO: Completely removing the Wire Cryptobox directoy isn't a good idea! The "logout" method should
      // handle already the cleanup of artifacts. Unfortunately "logout" sometimes has issues (we need to solve
      // these!)
      await fs.remove(directory);
      await account.login(loginData);
      await account.listen();
    }
    throw error;
  }

  const {clientId, userId} = apiClient.context!;
  console.info(`Connected to Wire — User ID "${userId}" — Client ID "${clientId}"`);

  const stdin = process.openStdin();
  stdin.addListener('data', async data => {
    const message = data.toString().trim();
    if (account.service) {
      const payload = account.service.conversation.messageBuilder.createText(conversationID, message).build();
      await account.service.conversation.send(payload);
    }
  });
})().catch((error: Error) => {
  console.error(error.message, error);
  process.exit(1);
});
