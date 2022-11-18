/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

/* eslint-disable import/order */
import * as Recipients from '../Utility/Recipients';

import {ConversationProtocol} from '@wireapp/api-client/lib/conversation';

import {MessageTargetMode} from '../../../conversation';
import {buildTextMessage} from '../../../conversation/message/MessageBuilder';
import {SendProteusMessageParams} from './ProteusService.types';

import {buildProteusService} from './ProteusService.mocks';

jest.mock('../Utility/Recipients', () => ({
  ...jest.requireActual('../Utility/Recipients'),
  getRecipientsForConversation: jest.fn(),
  getQualifiedRecipientsForConversation: jest.fn(),
}));
const MockedRecipients = Recipients as jest.Mocked<typeof Recipients>;

describe('ProteusService', () => {
  describe('getRemoteFingerprint', () => {
    it('create a session if session does not exists', async () => {
      const [proteusService, {apiClient, coreCrypto}] = buildProteusService();
      const expectedFingerprint = 'fingerprint-client1';

      const getPrekeyMock = jest.spyOn(apiClient.api.user, 'getClientPreKey').mockResolvedValue({
        client: 'client1',
        prekey: {
          id: 123,
          key: 'pQABARhIAqEAWCCaJpFa9c626ORmjj1aV6OnOYgmTjfoiE3ynOfNfGAOmgOhAKEAWCD60VMzRrLfO+1GSjgyhnVp2N7L58DM+eeJhZJi1tBLfQT2',
        },
      });
      jest.spyOn(coreCrypto, 'proteusFingerprintRemote').mockResolvedValue(expectedFingerprint);
      jest.spyOn(coreCrypto as any, 'proteusSessionExists').mockResolvedValue(false);

      const userId = {id: 'user1', domain: 'domain.com'};
      const clientId = 'client1';

      const result = await proteusService.getRemoteFingerprint(userId, clientId);

      expect(getPrekeyMock).toHaveBeenCalledWith(userId, clientId);
      expect(result).toBe(expectedFingerprint);
    });

    it('create a session from given prekey if session does not exists', async () => {
      const [proteusService, {apiClient, coreCrypto}] = buildProteusService();
      const expectedFingerprint = 'fingerprint-client1';

      const getPrekeyMock = jest.spyOn(apiClient.api.user, 'getClientPreKey');
      jest.spyOn(coreCrypto, 'proteusFingerprintRemote').mockResolvedValue(expectedFingerprint);
      jest.spyOn(coreCrypto as any, 'proteusSessionExists').mockResolvedValue(false);

      const userId = {id: 'user1', domain: 'domain.com'};
      const clientId = 'client1';

      const result = await proteusService.getRemoteFingerprint(userId, clientId, {
        key: 'pQABARhIAqEAWCCaJpFa9c626ORmjj1aV6OnOYgmTjfoiE3ynOfNfGAOmgOhAKEAWCD60VMzRrLfO+1GSjgyhnVp2N7L58DM+eeJhZJi1tBLfQT2',
        id: 123,
      });

      expect(getPrekeyMock).not.toHaveBeenCalled();
      expect(result).toBe(expectedFingerprint);
    });

    it('returns the fingerprint from existing session', async () => {
      const [proteusService, {apiClient, coreCrypto}] = buildProteusService();
      const expectedFingerprint = 'fingerprint-client1';

      const getPrekeyMock = jest.spyOn(apiClient.api.user, 'getClientPreKey');
      const sessionFromPrekeyMock = jest.spyOn(coreCrypto, 'proteusSessionFromPrekey');
      jest.spyOn(coreCrypto, 'proteusFingerprintRemote').mockResolvedValue(expectedFingerprint);
      jest.spyOn(coreCrypto as any, 'proteusSessionExists').mockResolvedValue(true);

      const userId = {id: 'user1', domain: 'domain.com'};
      const clientId = 'client1';

      const result = await proteusService.getRemoteFingerprint(userId, clientId);

      expect(getPrekeyMock).not.toHaveBeenCalled();
      expect(sessionFromPrekeyMock).not.toHaveBeenCalled();
      expect(result).toBe(expectedFingerprint);
    });
  });

  describe('"encrypt"', () => {
    it('calls proteusEncryptBatched method on core-crypto', async () => {
      const [proteusService, {coreCrypto}] = buildProteusService();

      const userId = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const clientId = 'be67218b77d02d30';

      const preKeyBundleMap = {
        [userId]: {
          [clientId]: {
            id: 72,
            key: '',
          },
        },
      };

      const text = new Uint8Array(Buffer.from('Hello', 'utf8'));
      await proteusService.encrypt(text, preKeyBundleMap);

      expect(coreCrypto.proteusEncryptBatched).toHaveBeenCalledWith(`${userId}@${clientId}`, text);
    });

    it('generates a set of encrypted data based on PreKeys from multiple clients.', async () => {
      const [proteusService] = buildProteusService();

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';
      const noPrekeyClient = 'ae87218e77d02d30';

      const firstClientId = '2b83ee08d7ac550d';

      const preKeyBundleMap = {
        [firstUserID]: {
          '5e80ea7886680975': {
            id: 1337,
            key: 'pQABARn//wKhAFggJ1Fbpg5l6wnzKOJE+vXpRnkqUYhIvVnR5lNXEbO2o/0DoQChAFggHxZvgvtDktY/vqBcpjjo6rQnXvcNQhfwmy8AJQJKlD0E9g==',
          },
          be67218b77d02d30: {
            id: 72,
            key: 'pQABARn//wKhAFggTWwHUoppQ8aXWhbH95YWnNp6uOYMxo2y4wbarWbF+EEDoQChAFggUiFoPtsiR0WFowIvl0myD+bVnFQJBYarqieI0Gly46QE9g==',
          },
          [noPrekeyClient]: null,
          [firstClientId]: {
            id: 42,
            key: 'pQABARn//wKhAFggWcbwny0jdqlcnnn0j4QSENIVVq/KgyQ3mmdpunfvGZQDoQChAFggrsQBkQkrVZ8sWhr8wTeaC+dmctuJ3oRqfdHsymTtKmgE9g==',
          },
        },
        [secondUserID]: {
          '5bad8cdeddc5a90f': {
            id: 1,
            key: 'pQABARn//wKhAFggEYATUNJBQ7E2tfHT7HMLxa4O3Ckd7PciUdyKiGNNWbYDoQChAFggP/s0BHmHQDNwrO4pC1dqdNHsW7bnpmF9mBadrbep4PoE9g==',
          },
          bc78eded90386d20: {
            id: 65535,
            key: 'pQABARn//wKhAFgg1xOfzMpWmpN2aBGW+0RG23L0I301pncd/HXqUm+pVyoDoQChAFggnl+dmwGW45AArcPutjUkAjYmhIbXBPrqkVrNyg0ZI08E9g==',
          },
        },
      };
      const text = new Uint8Array(Buffer.from('Hello', 'utf8'));
      const {encrypted} = await proteusService.encrypt(text, preKeyBundleMap);
      expect(Object.keys(encrypted).length).toBe(2);
      expect(Object.keys(encrypted[firstUserID]).length).toBe(3);
      expect(Object.keys(encrypted[secondUserID]).length).toBe(2);
      expect(encrypted[firstUserID][firstClientId]).toEqual(expect.any(Uint8Array));
      expect(encrypted[firstUserID][noPrekeyClient]).not.toBeDefined();
    });
  });

  describe('sendGenericMessage', () => {
    describe('targetted messages', () => {
      const message = buildTextMessage({text: 'test'});
      // eslint-disable-next-line jest/no-done-callback

      it('fails if no userIds are given', async () => {
        const [proteusService] = buildProteusService();

        let errorMessage;

        const params: SendProteusMessageParams = {
          conversationId: {id: 'conv1', domain: ''},
          payload: message,
          protocol: ConversationProtocol.PROTEUS,
          targetMode: MessageTargetMode.USERS,
        };

        try {
          await proteusService.sendMessage(params);
        } catch (error) {
          errorMessage = (error as {message: string}).message;
        } finally {
          expect(errorMessage).toContain('no userIds are given');
        }
      });

      [{user1: ['client1'], user2: ['client11', 'client12']}, ['user1', 'user2']].forEach(recipients => {
        it(`forwards the list of users to report (${JSON.stringify(recipients)})`, async () => {
          const [proteusService] = buildProteusService();

          MockedRecipients.getRecipientsForConversation.mockResolvedValue({} as any);

          jest.spyOn(proteusService['messageService'], 'sendMessage').mockReturnValue(Promise.resolve({} as any));
          await proteusService.sendMessage({
            protocol: ConversationProtocol.PROTEUS,
            payload: message,
            targetMode: MessageTargetMode.USERS,
            userIds: recipients,
            conversationId: {id: 'conv1', domain: ''},
          });

          expect(proteusService['messageService'].sendMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Object),
            expect.any(Uint8Array),
            expect.objectContaining({reportMissing: ['user1', 'user2']}),
          );
        });
      });

      [
        {domain1: {user1: ['client1'], user2: ['client11', 'client12']}, domain2: {user3: ['client1']}},
        [
          {id: 'user1', domain: 'domain1'},
          {id: 'user2', domain: 'domain1'},
          {id: 'user3', domain: 'domain2'},
        ],
      ].forEach(recipients => {
        it(`forwards the list of users to report for federated message (${JSON.stringify(recipients)})`, async () => {
          const [proteusService] = buildProteusService(true);
          MockedRecipients.getQualifiedRecipientsForConversation.mockResolvedValue({} as any);
          jest.spyOn(proteusService['messageService'], 'sendFederatedMessage').mockResolvedValue({} as any);
          await proteusService.sendMessage({
            protocol: ConversationProtocol.PROTEUS,
            conversationId: {id: 'conv1', domain: 'domain1'},
            payload: message,
            targetMode: MessageTargetMode.USERS,
            userIds: recipients,
          });

          expect(proteusService['messageService'].sendFederatedMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Object),
            expect.any(Uint8Array),
            expect.objectContaining({
              reportMissing: [
                {id: 'user1', domain: 'domain1'},
                {id: 'user2', domain: 'domain1'},
                {id: 'user3', domain: 'domain2'},
              ],
            }),
          );
        });
      });

      [{user1: ['client1'], user2: ['client11', 'client12']}, ['user1', 'user2']].forEach(recipients => {
        it(`ignores all missing user/client pair if targetMode is USER_CLIENTS`, async () => {
          const [proteusService] = buildProteusService(false);
          MockedRecipients.getRecipientsForConversation.mockReturnValue(Promise.resolve({} as any));
          jest.spyOn(proteusService['messageService'], 'sendMessage').mockReturnValue(Promise.resolve({} as any));
          await proteusService.sendMessage({
            conversationId: {id: 'conv1', domain: ''},
            protocol: ConversationProtocol.PROTEUS,
            payload: message,
            targetMode: MessageTargetMode.USERS_CLIENTS,
            userIds: recipients,
          });

          expect(proteusService['messageService'].sendMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Object),
            expect.any(Uint8Array),
            expect.objectContaining({reportMissing: false}),
          );
        });
      });

      [
        {domain1: {user1: ['client1'], user2: ['client11', 'client12']}, domain2: {user3: ['client1']}},
        [
          {id: 'user1', domain: 'domain1'},
          {id: 'user2', domain: 'domain1'},
          {id: 'user3', domain: 'domain2'},
        ],
      ].forEach(recipients => {
        it(`ignores all missing user/client pair if targetMode is USER_CLIENTS on federated env`, async () => {
          const [proteusService] = buildProteusService(true);

          MockedRecipients.getQualifiedRecipientsForConversation.mockResolvedValue({} as any);
          jest
            .spyOn(proteusService['messageService'], 'sendFederatedMessage')
            .mockReturnValue(Promise.resolve({} as any));
          await proteusService.sendMessage({
            protocol: ConversationProtocol.PROTEUS,
            conversationId: {id: 'conv1', domain: 'domain1'},
            payload: message,
            targetMode: MessageTargetMode.USERS_CLIENTS,
            userIds: recipients,
          });

          expect(proteusService['messageService'].sendFederatedMessage).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Object),
            expect.any(Uint8Array),
            expect.objectContaining({
              reportMissing: false,
            }),
          );
        });
      });
    });
  });
});
