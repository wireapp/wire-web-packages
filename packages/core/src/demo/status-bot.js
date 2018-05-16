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

//@ts-check

const APIClient = require('@wireapp/api-client');
const {version} = require('../../package.json');
const {Account} = require('@wireapp/core');
const {Config} = require('@wireapp/api-client/dist/commonjs/Config');
const {MemoryEngine} = require('@wireapp/store-engine');

['WIRE_STATUS_BOT_EMAIL', 'WIRE_STATUS_BOT_PASSWORD', 'WIRE_STATUS_BOT_CONVERSATION_ID'].forEach(
  (envVar, index, array) => {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable "${envVar}" is not set. Required variables: ${array.join(', ')}.`);
    }
  }
);

(async () => {
  const {WIRE_STATUS_BOT_EMAIL, WIRE_STATUS_BOT_PASSWORD, WIRE_STATUS_BOT_CONVERSATION_ID} = process.env;

  const login = {
    email: WIRE_STATUS_BOT_EMAIL,
    password: WIRE_STATUS_BOT_PASSWORD,
    persist: false,
  };

  try {
    const engine = new MemoryEngine();
    await engine.init('');

    const apiClient = new APIClient(new Config(engine, APIClient.BACKEND.STAGING));
    const account = new Account(apiClient);
    await account.login(login);

    await account.service.conversation.sendTextMessage(
      WIRE_STATUS_BOT_CONVERSATION_ID,
      `@wireapp/core v${version} deployed.`
    );
  } catch (error) {
    console.error('error:', error);
  }
})();
