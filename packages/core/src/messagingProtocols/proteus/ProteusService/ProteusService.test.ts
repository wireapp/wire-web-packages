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

import {ConversationProtocol, QualifiedUserClients, UserClients} from '@wireapp/api-client/lib/conversation';

import {MessageTargetMode} from '../../../conversation';
import {buildTextMessage} from '../../../conversation/message/MessageBuilder';
import {SendProteusMessageParams} from './ProteusService.types';
import {Decoder} from 'bazinga64';

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
      const [proteusService, {coreCrypto, apiClient}] = buildProteusService();

      const userId = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const clientId = 'be67218b77d02d30';

      const clientSessionId = `${userId}@${clientId}`;

      const prekeyBundleBundleMap = {
        [userId]: {
          [clientId]: {id: 0, key: ''},
        },
      };

      const sessionToPayloadMap = new Map([[clientSessionId, new Uint8Array([])]]);

      jest
        .spyOn(apiClient.api.user, 'postMultiPreKeyBundles')
        .mockImplementationOnce(() => Promise.resolve(prekeyBundleBundleMap));

      jest
        .spyOn(coreCrypto, 'proteusEncryptBatched')
        .mockImplementationOnce(() => Promise.resolve(sessionToPayloadMap));

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

      expect(coreCrypto.proteusEncryptBatched).toHaveBeenCalledWith([clientSessionId], text);
    });
  });

  describe('"createSessionsFromPreKeys"', () => {
    it('creates a session from prekey when session does not exist', async () => {
      const [proteusService, {coreCrypto}] = buildProteusService();

      jest.spyOn(coreCrypto, 'proteusSessionExists').mockResolvedValueOnce(false as any); //todo: fix type

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const firstUserClient1 = '5e80ea7886680975';

      const validPreKey = {
        id: 1337,
        key: 'pQABARn//wKhAFggJ1Fbpg5l6wnzKOJE+vXpRnkqUYhIvVnR5lNXEbO2o/0DoQChAFggHxZvgvtDktY/vqBcpjjo6rQnXvcNQhfwmy8AJQJKlD0E9g==',
      };

      const preKeyBundleMap = {
        [firstUserID]: {
          [firstUserClient1]: validPreKey,
        },
      };

      const sessions = await proteusService['createSessionsFromPreKeys'](preKeyBundleMap);

      const sessionId = proteusService['cryptographyService'].constructSessionId(firstUserID, firstUserClient1);
      const prekeyBuffer = Decoder.fromBase64(validPreKey.key).asBytes;

      expect(coreCrypto.proteusSessionFromPrekey).toHaveBeenCalledWith(sessionId, prekeyBuffer);
      expect(sessions).toContain(sessionId);
    });

    it('does not create a new session when it does exist already', async () => {
      const [proteusService, {coreCrypto}] = buildProteusService();

      jest.spyOn(coreCrypto, 'proteusSessionExists').mockResolvedValueOnce(true as any); //todo: fix type

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const firstUserClient1 = '5e80ea7886680975';

      const validPreKey = {
        id: 1337,
        key: 'pQABARn//wKhAFggJ1Fbpg5l6wnzKOJE+vXpRnkqUYhIvVnR5lNXEbO2o/0DoQChAFggHxZvgvtDktY/vqBcpjjo6rQnXvcNQhfwmy8AJQJKlD0E9g==',
      };

      const preKeyBundleMap = {
        [firstUserID]: {
          [firstUserClient1]: validPreKey,
        },
      };

      const sessions = await proteusService['createSessionsFromPreKeys'](preKeyBundleMap);
      const sessionId = proteusService['cryptographyService'].constructSessionId(firstUserID, firstUserClient1);

      expect(coreCrypto.proteusSessionFromPrekey).not.toHaveBeenCalled();
      expect(sessions).toContain(sessionId);
    });

    it('creates a list of sessions based on passed preKeyBundleMap', async () => {
      const [proteusService] = buildProteusService();

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const firstUserClient1 = '5e80ea7886680975';
      const firstUserClient2 = 'be67218b77d02d30';

      const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';
      const secondUserClient = '5bad8cdeddc5a90f';
      const noPrekeyClient = 'ae87218e77d02d30';

      const validPreKey = {
        id: 1337,
        key: 'pQABARn//wKhAFggJ1Fbpg5l6wnzKOJE+vXpRnkqUYhIvVnR5lNXEbO2o/0DoQChAFggHxZvgvtDktY/vqBcpjjo6rQnXvcNQhfwmy8AJQJKlD0E9g==',
      };

      const preKeyBundleMap = {
        [firstUserID]: {
          [firstUserClient1]: validPreKey,
          [firstUserClient2]: validPreKey,
          [noPrekeyClient]: null,
        },
        [secondUserID]: {
          [secondUserClient]: validPreKey,
        },
      };

      const sessions = await proteusService['createSessionsFromPreKeys'](preKeyBundleMap);
      expect(sessions).toEqual(
        expect.arrayContaining([
          proteusService['cryptographyService'].constructSessionId(firstUserID, firstUserClient1),
          proteusService['cryptographyService'].constructSessionId(firstUserID, firstUserClient2),
          proteusService['cryptographyService'].constructSessionId(secondUserID, secondUserClient),
        ]),
      );
      expect(sessions).not.toContain(
        proteusService['cryptographyService'].constructSessionId(firstUserID, noPrekeyClient),
      );
    });
  });

  describe('createSessions', () => {
    it('calls createLegacySessions for UserClients type', async () => {
      const [proteusService] = buildProteusService();

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const firstUserClient1 = '5e80ea7886680975';
      const firstUserClient2 = 'be67218b77d02d30';

      const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';
      const secondUserClient = '5bad8cdeddc5a90f';

      const userClients: UserClients = {
        [firstUserID]: [firstUserClient1, firstUserClient2],
        [secondUserID]: [secondUserClient],
      };

      jest.spyOn(proteusService, 'createLegacySessions' as any);

      await proteusService['createSessions'](userClients);

      expect(proteusService['createLegacySessions']).toHaveBeenCalledWith(userClients);
    });

    it('calls createQualifiedSessions for QualifiedUserClients type', async () => {
      const [proteusService] = buildProteusService();

      const domain = 'staging.zinfra.io';

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const firstUserClient1 = '5e80ea7886680975';
      const firstUserClient2 = 'be67218b77d02d30';

      const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';
      const secondUserClient = '5bad8cdeddc5a90f';

      const qualifiedUserClients: QualifiedUserClients = {
        [domain]: {
          [firstUserID]: [firstUserClient1, firstUserClient2],
          [secondUserID]: [secondUserClient],
        },
      };

      jest.spyOn(proteusService, 'createQualifiedSessions' as any);

      await proteusService['createSessions'](qualifiedUserClients);

      expect(proteusService['createQualifiedSessions']).toHaveBeenCalledWith(qualifiedUserClients);
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
