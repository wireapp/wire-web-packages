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
import type {UserClients} from '@wireapp/api-client/lib/conversation';
import type {UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';

import {buildProteusService} from '../../ProteusService.mocks';
import {preKeyBundleToUserClients} from '../preKeyBundleToUserClients';

import {getSessionsAndClientsFromRecipients} from './';

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
    const {apiClient, coreCrypto, cryptographyService} = (await prepareProteusService())[1];

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
      cryptographyService,
    });

    expect(userClientsResult).toEqual(userClients);
  });

  it('returns userClients for qualified clients', async () => {
    const {apiClient, coreCrypto, cryptographyService} = (await prepareProteusService())[1];

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
      cryptographyService,
    });

    expect(userClients).toEqual(preKeyBundleToUserClients(userPreKeyBundleMap));
  });
});
