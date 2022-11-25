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

import {ClientClassification} from '@wireapp/api-client/lib/client';
import type {QualifiedUserClients, UserClients} from '@wireapp/api-client/lib/conversation';
import type {QualifiedUserPreKeyBundleMap, UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';
import {Decoder} from 'bazinga64';

import {
  constructSessionId,
  createSessions,
  createSessionsFromPreKeys,
  getSessionsAndClientsFromRecipients,
} from './SessionHandler';

import {buildProteusService} from '../../ProteusService/ProteusService.mocks';
import {preKeyBundleToUserClients} from '../PrekeyHandler';

describe('SessionHandler', () => {
  describe('constructSessionId', () => {
    describe('constructs a session ID', () => {
      it('without a domain', () => {
        const sessionId = constructSessionId({userId: 'user-id', clientId: 'client-id'});
        expect(sessionId).toBe('user-id@client-id');
      });

      it('with a domain', () => {
        const sessionId = constructSessionId({
          userId: 'user-id',
          clientId: 'client-id',
          domain: 'domain',
        });
        expect(sessionId).toBe('user-id@client-id');
      });

      it('with a domain and useQualifiedIds', () => {
        const sessionId = constructSessionId({
          userId: 'user-id',
          clientId: 'client-id',
          domain: 'domain',
          useQualifiedIds: true,
        });
        expect(sessionId).toBe('domain@user-id@client-id');
      });

      it('with a qualified ID', () => {
        const sessionId = constructSessionId({
          userId: {id: 'user-id', domain: 'domain'},
          clientId: 'client-id',
        });
        expect(sessionId).toBe('user-id@client-id');
      });

      it('with a qualified ID and useQualifiedIds', () => {
        const sessionId = constructSessionId({
          userId: {id: 'user-id', domain: 'domain'},
          clientId: 'client-id',
          useQualifiedIds: true,
        });
        expect(sessionId).toBe('domain@user-id@client-id');
      });
    });
  });

  describe('createSessions', () => {
    it('returns sessions for qualified clients type', async () => {
      const {apiClient, coreCrypto, cryptographyService} = (await buildProteusService())[1];

      const domain = 'staging.zinfra.io';

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const firstUserClient1 = '5e80ea7886680975';
      const firstUserClient2 = 'be67218b77d02d30';

      const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';
      const secondUserClient = '5bad8cdeddc5a90f';

      const validPreKey = {
        id: 1337,
        key: 'pQABARn//wKhAFggJ1Fbpg5l6wnzKOJE+vXpRnkqUYhIvVnR5lNXEbO2o/0DoQChAFggHxZvgvtDktY/vqBcpjjo6rQnXvcNQhfwmy8AJQJKlD0E9g==',
      };

      const qualifiedUserClients: QualifiedUserClients = {
        [domain]: {
          [firstUserID]: [firstUserClient1, firstUserClient2],
          [secondUserID]: [secondUserClient],
        },
      };

      const expectedResponse: QualifiedUserPreKeyBundleMap = {
        [domain]: {
          [firstUserID]: {[firstUserClient1]: validPreKey, [firstUserClient2]: validPreKey},
          [secondUserID]: {[secondUserClient]: validPreKey},
        },
      };

      jest.spyOn(apiClient.api.user, 'postQualifiedMultiPreKeyBundles').mockResolvedValueOnce(expectedResponse);

      const sessions = await createSessions({
        userClientMap: qualifiedUserClients,
        apiClient,
        coreCryptoClient: coreCrypto,
      });

      expect(sessions).toEqual(
        expect.arrayContaining([
          cryptographyService['constructSessionId'](firstUserID, firstUserClient1, domain),
          cryptographyService['constructSessionId'](firstUserID, firstUserClient2, domain),
          cryptographyService['constructSessionId'](secondUserID, secondUserClient, domain),
        ]),
      );
    });

    it('returns sessions for legacy clients type', async () => {
      const {apiClient, coreCrypto, cryptographyService} = (await buildProteusService())[1];

      const domain = 'staging.zinfra.io';

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const firstUserClient1 = '5e80ea7886680975';
      const firstUserClient2 = 'be67218b77d02d30';

      const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';
      const secondUserClient = '5bad8cdeddc5a90f';

      const validPreKey = {
        id: 1337,
        key: 'pQABARn//wKhAFggJ1Fbpg5l6wnzKOJE+vXpRnkqUYhIvVnR5lNXEbO2o/0DoQChAFggHxZvgvtDktY/vqBcpjjo6rQnXvcNQhfwmy8AJQJKlD0E9g==',
      };

      const qualifiedUserClients: UserClients = {
        [firstUserID]: [firstUserClient1, firstUserClient2],
        [secondUserID]: [secondUserClient],
      };

      const expectedResponse: UserPreKeyBundleMap = {
        [firstUserID]: {[firstUserClient1]: validPreKey, [firstUserClient2]: validPreKey},
        [secondUserID]: {[secondUserClient]: validPreKey},
      };

      jest.spyOn(apiClient.api.user, 'postMultiPreKeyBundles').mockResolvedValueOnce(expectedResponse);

      const sessions = await createSessions({
        userClientMap: qualifiedUserClients,
        apiClient,
        coreCryptoClient: coreCrypto,
      });

      expect(sessions).toEqual(
        expect.arrayContaining([
          cryptographyService['constructSessionId'](firstUserID, firstUserClient1, domain),
          cryptographyService['constructSessionId'](firstUserID, firstUserClient2, domain),
          cryptographyService['constructSessionId'](secondUserID, secondUserClient, domain),
        ]),
      );
    });
  });

  const prepareProteusService = async () => {
    const [proteusClient, services] = await buildProteusService();
    jest.spyOn(services.apiClient.api.user, 'postListClients').mockImplementation(() =>
      Promise.resolve({
        qualified_user_map: {
          'test-domain': {
            'test-id-1': [{class: ClientClassification.DESKTOP, id: 'test-client-id-1-user-1'}],
            'test-id-2': [
              {class: ClientClassification.DESKTOP, id: 'test-client-id-1-user-2'},
              {class: ClientClassification.PHONE, id: 'test-client-id-2-user-2'},
            ],
          },
        },
      }),
    );

    jest.spyOn(services.apiClient.api.user, 'postMultiPreKeyBundles').mockImplementation(jest.fn());
    jest.spyOn(services.apiClient.api.user, 'postQualifiedMultiPreKeyBundles').mockImplementation(jest.fn());

    return [proteusClient, {...services}] as const;
  };

  describe('getSessionsAndClientsFromRecipients', () => {
    it('returns userClients for legacy clients', async () => {
      const {apiClient, coreCrypto} = (await prepareProteusService())[1];

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const firstUserClient1 = '5e80ea7886680975';
      const firstUserClient2 = 'be67218b77d02d30';

      const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';
      const secondUserClient = '5bad8cdeddc5a90f';

      const userClients: UserClients = {
        [firstUserID]: [firstUserClient1, firstUserClient2],
        [secondUserID]: [secondUserClient],
      };

      const {userClients: userClientsResult} = await getSessionsAndClientsFromRecipients({
        recipients: userClients,
        apiClient,
        coreCryptoClient: coreCrypto,
      });

      expect(userClientsResult).toEqual(userClients);
    });

    it('returns userClients for qualified clients', async () => {
      const {apiClient, coreCrypto} = (await prepareProteusService())[1];

      const validPreKey = {
        id: 1337,
        key: 'pQABARn//wKhAFggJ1Fbpg5l6wnzKOJE+vXpRnkqUYhIvVnR5lNXEbO2o/0DoQChAFggHxZvgvtDktY/vqBcpjjo6rQnXvcNQhfwmy8AJQJKlD0E9g==',
      };

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const firstUserClient1 = '5e80ea7886680975';
      const firstUserClient2 = 'be67218b77d02d30';

      const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';
      const secondUserClient = '5bad8cdeddc5a90f';

      const userPreKeyBundleMap: UserPreKeyBundleMap = {
        [firstUserID]: {
          [firstUserClient1]: validPreKey,
          [firstUserClient2]: validPreKey,
        },
        [secondUserID]: {
          [secondUserClient]: validPreKey,
        },
      };

      const {userClients} = await getSessionsAndClientsFromRecipients({
        recipients: userPreKeyBundleMap,
        apiClient,
        coreCryptoClient: coreCrypto,
      });

      expect(userClients).toEqual(preKeyBundleToUserClients(userPreKeyBundleMap));
    });
  });

  describe('"createSessionsFromPreKeys"', () => {
    it('creates a session from prekey when session does not exist', async () => {
      const {coreCrypto} = (await buildProteusService())[1];

      jest.spyOn(coreCrypto, 'proteusSessionExists').mockResolvedValueOnce(false as any); //todo: fix type

      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const firstUserClient1 = '5e80ea7886680975';

      const validPreKey = {
        id: 1337,
        key: 'pQABARn//wKhAFggJ1Fbpg5l6wnzKOJE+vXpRnkqUYhIvVnR5lNXEbO2o/0DoQChAFggHxZvgvtDktY/vqBcpjjo6rQnXvcNQhfwmy8AJQJKlD0E9g==',
      };

      const preKeyBundleMap: UserPreKeyBundleMap = {
        [firstUserID]: {
          [firstUserClient1]: validPreKey,
        },
      };

      const sessions = await createSessionsFromPreKeys({
        preKeyBundleMap,
        coreCryptoClient: coreCrypto,
      });

      const sessionId = constructSessionId({userId: firstUserID, clientId: firstUserClient1});
      const prekeyBuffer = Decoder.fromBase64(validPreKey.key).asBytes;

      expect(coreCrypto.proteusSessionFromPrekey).toHaveBeenCalledWith(sessionId, prekeyBuffer);
      expect(sessions).toContain(sessionId);
    });

    it('does not create a new session when it does exist already', async () => {
      const {coreCrypto} = (await buildProteusService())[1];

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

      const sessions = await createSessionsFromPreKeys({
        preKeyBundleMap,
        coreCryptoClient: coreCrypto,
      });
      const sessionId = constructSessionId({userId: firstUserID, clientId: firstUserClient1});

      expect(coreCrypto.proteusSessionFromPrekey).not.toHaveBeenCalled();
      expect(sessions).toContain(sessionId);
    });

    it('creates a list of sessions based on passed preKeyBundleMap', async () => {
      const {coreCrypto} = (await buildProteusService())[1];

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

      const sessions = await createSessionsFromPreKeys({
        preKeyBundleMap,
        coreCryptoClient: coreCrypto,
      });
      expect(sessions).toEqual(
        expect.arrayContaining([
          constructSessionId({userId: firstUserID, clientId: firstUserClient1}),
          constructSessionId({userId: firstUserID, clientId: firstUserClient2}),
          constructSessionId({userId: secondUserID, clientId: secondUserClient}),
        ]),
      );
      expect(sessions).not.toContain(constructSessionId({userId: firstUserID, clientId: noPrekeyClient}));
    });
  });
});
