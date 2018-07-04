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

require('dotenv').config();

const {Account} = require('@wireapp/core');
const APIClient = require('@wireapp/api-client');
const {Config} = require('@wireapp/api-client/dist/commonjs/Config');
const {ClientType} = require('@wireapp/api-client/dist/commonjs/client/');
const {MemoryEngine} = require('@wireapp/store-engine');
const {ValidationUtil} = require('@wireapp/commons');
const logdown = require('logdown');

const logger = logdown('@wireapp/core/main/Account(SmokeTest)', {
  logger: console,
  markdown: false,
});
logger.state.isEnabled = true;

const CAN_RUN =
  process.env.ALICE_EMAIL && process.env.ALICE_PASSWORD && process.env.BOB_EMAIL && process.env.BOB_PASSWORD;

async function getAccount(email, password) {
  const login = {
    clientType: ClientType.TEMPORARY,
    email,
    password,
  };
  const backend = APIClient.BACKEND.STAGING;
  const engine = new MemoryEngine();
  await engine.init(email);
  const apiClient = new APIClient(new Config(engine, backend));
  const account = new Account(apiClient);
  await account.login(login);
  await account.listen();
  return account;
}

describe('Account', () => {
  let alice;
  let bob;

  beforeAll(async done => {
    if (CAN_RUN) {
      alice = await getAccount(process.env.ALICE_EMAIL, process.env.ALICE_PASSWORD);
      bob = await getAccount(process.env.BOB_EMAIL, process.env.BOB_PASSWORD);
    }
    done();
  });

  describe('Message Sending', () => {
    beforeAll(async done => {
      if (CAN_RUN) {
        expect(ValidationUtil.isUUIDv4(alice.apiClient.context.userId)).toBe(true);
        expect(ValidationUtil.isUUIDv4(bob.apiClient.context.userId)).toBe(true);
      }
      done();
    });

    it('can send and receive messages', async done => {
      if (!CAN_RUN) {
        logger.warn('Skipping smoke tests because environment variables are not set.');
        return done();
      }

      done();
    });
  });
});
