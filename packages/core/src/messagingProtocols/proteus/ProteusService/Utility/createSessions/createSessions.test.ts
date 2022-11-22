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

import type {QualifiedUserClients, UserClients} from '@wireapp/api-client/lib/conversation';
import type {QualifiedUserPreKeyBundleMap, UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';

import {createSessions} from './createSessions';

import {buildProteusService} from '../../../../../test/ProteusHelper';

describe('createSessions', () => {
  it('returns sessions for qualified clients type', async () => {
    const {apiClient, coreCrypto, cryptographyService} = buildProteusService()[1];

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
      cryptographyService,
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
    const {apiClient, coreCrypto, cryptographyService} = buildProteusService()[1];

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
      cryptographyService,
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
