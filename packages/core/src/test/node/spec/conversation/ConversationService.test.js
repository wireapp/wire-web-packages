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

/* eslint-disable no-magic-numbers */
const APIClient = require('@wireapp/api-client');
const UUID = require('pure-uuid');
const {Account} = require('@wireapp/core');
const {Config} = require('@wireapp/api-client/dist/commonjs/Config');
const {MemoryEngine} = require('@wireapp/store-engine');

describe('ConversationService', () => {
  let account;

  beforeAll(async done => {
    const engine = new MemoryEngine();
    await engine.init('');

    const client = new APIClient(new Config(engine, APIClient.BACKEND.STAGING));
    account = new Account(client);
    await account.init();

    done();
  });

  describe('shouldSendAsExternal', () => {
    it('returns true for a big payload', async done => {
      const {conversation} = account.service;
      spyOn(conversation, 'getAllClientsInConversation').and.returnValue(Promise.resolve(new Array(128 * 4)));

      const longMessage =
        'massive external message massive external message massive external message massive external message massive external message massive external message massive external message massive external message massive external messagemassive external message massive external message massive external message massive external message massive external message massive external message massive external message massive external message massive external messagemassive external message massive external message massive external message massive external message massive external message massive external message massive external message massive external message massive external messagemassive external message massive external message massive external message massive external message massive external message massive external message massive external message massive external message massive external message';

      const customTextMessage = conversation.protocolBuffers.GenericMessage.create({
        messageId: new UUID(4).format(),
        text: conversation.protocolBuffers.Text.create({content: longMessage}),
      });

      const shouldSendAsExternal = await conversation.shouldSendAsExternal('', customTextMessage);
      expect(shouldSendAsExternal).toBe(true);

      done();
    });

    it('returns false for a small payload', async done => {
      const {conversation} = account.service;
      spyOn(conversation, 'getAllClientsInConversation').and.returnValue(Promise.resolve([0, 1]));

      const customTextMessage = conversation.protocolBuffers.GenericMessage.create({
        messageId: new UUID(4).format(),
        text: conversation.protocolBuffers.Text.create({content: new UUID(4).format()}),
      });

      const shouldSendAsExternal = await conversation.shouldSendAsExternal('', customTextMessage);
      expect(shouldSendAsExternal).toBe(false);

      done();
    });
  });
});
