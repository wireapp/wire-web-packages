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
const {APIClient} = require('@wireapp/api-client');
const UUID = require('pure-uuid');
const {Account} = require('@wireapp/core');
const {GenericMessage, Text} = require('@wireapp/protocol-messaging');
const {MemoryEngine} = require('@wireapp/store-engine');

const createMessage = content => {
  const customTextMessage = GenericMessage.create({
    messageId: new UUID(4).format(),
    text: Text.create({content}),
  });

  return GenericMessage.encode(customTextMessage).finish();
};

const generatePreKeyBundle = (userCount, clientsPerUser) => {
  const prekeyBundle = {};
  for (let userIndex = 0; userIndex < userCount; userIndex++) {
    const userId = new UUID(4).format();
    prekeyBundle[userId] = {};
    for (let clientIndex = 0; clientIndex < clientsPerUser; clientIndex++) {
      const clientId = new UUID(4).format();
      prekeyBundle[userId][clientId] = {};
    }
  }
  return prekeyBundle;
};

describe('ConversationService', () => {
  let account;

  beforeAll(async done => {
    const engine = new MemoryEngine();
    await engine.init('');

    const client = new APIClient({store: engine, urls: APIClient.BACKEND.STAGING});
    account = new Account(client);
    await account.init();

    done();
  });

  describe("'shouldSendAsExternal'", () => {
    it('returns true for a big payload', () => {
      const {conversation} = account.service;
      const preKeyBundles = generatePreKeyBundle(128, 4);

      const longMessage =
        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem';
      const plainText = createMessage(longMessage);

      const shouldSendAsExternal = conversation.shouldSendAsExternal(plainText, preKeyBundles);
      expect(shouldSendAsExternal).toBe(true);
    });

    it('returns false for a small payload', async done => {
      const {conversation} = account.service;
      const preKeyBundles = generatePreKeyBundle(2, 1);

      const shortMessage = new UUID(4).format();
      const plainText = createMessage(shortMessage);

      const shouldSendAsExternal = conversation.shouldSendAsExternal(plainText, preKeyBundles);
      expect(shouldSendAsExternal).toBe(false);

      done();
    });

    it('adds missing prekeys', async done => {
      const {conversation} = account.service;

      const recipientId = new UUID(4).format();
      const missingClientId = new UUID(4).format();
      const initialPreKeyBundles = {
        [recipientId]: {
          [new UUID(4).format()]: {},
        },
      };

      spyOn(account.apiClient.conversation.api, 'postOTRMessage').and.callFake(
        (sendingClientId, conversationId, message) => {
          if (message.recipients[recipientId] && !message.recipients[recipientId][missingClientId]) {
            return {
              response: {
                data: {
                  deleted: {},
                  missing: {
                    [recipientId]: [missingClientId],
                  },
                  redundant: {},
                  time: new Date().toISOString(),
                },
                status: 412,
              },
            };
          }
        }
      );
      spyOn(account.apiClient.user.api, 'postMultiPreKeyBundles').and.returnValue(
        Promise.resolve({
          [recipientId]: {
            [missingClientId]: {},
          },
        })
      );
      const payload = createMessage('Hello, world!');
      const recipients = await account.service.cryptography.encrypt(payload, initialPreKeyBundles);
      await conversation.sendOTRMessage(new UUID(4).format(), new UUID(4).format(), recipients, payload);
      done();
    });

    it('removes deleted prekeys', async done => {
      const {conversation} = account.service;

      const recipientId = new UUID(4).format();
      const deletedClientId = new UUID(4).format();
      const initialPreKeyBundles = {
        [recipientId]: {
          [new UUID(4).format()]: {},
        },
      };

      spyOn(account.apiClient.conversation.api, 'postOTRMessage').and.callFake(
        (sendingClientId, conversationId, message) => {
          if (message.recipients[recipientId] && message.recipients[recipientId][deletedClientId]) {
            return {
              response: {
                data: {
                  deleted: {
                    [recipientId]: [deletedClientId],
                  },
                  missing: {},
                  redundant: {},
                  time: new Date().toISOString(),
                },
                status: 412,
              },
            };
          }
        }
      );
      spyOn(account.apiClient.user.api, 'postMultiPreKeyBundles').and.returnValue(
        Promise.resolve({
          [recipientId]: {
            [deletedClientId]: {},
          },
        })
      );
      const payload = createMessage('Hello, world!');
      const recipients = await account.service.cryptography.encrypt(payload, initialPreKeyBundles);
      await conversation.sendOTRMessage(new UUID(4).format(), new UUID(4).format(), recipients, payload);
      done();
    });
  });
});
