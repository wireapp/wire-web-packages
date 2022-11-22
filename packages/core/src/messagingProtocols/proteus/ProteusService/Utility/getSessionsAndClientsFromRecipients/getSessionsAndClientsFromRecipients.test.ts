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

import type {UserClients} from '@wireapp/api-client/lib/conversation';
import type {UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';

import {getSessionsAndClientsFromRecipients} from './getSessionsAndClientsFromRecipients';

import {buildProteusService} from '../../../../../test/ProteusHelper';
import {preKeyBundleToUserClients} from '../../../../../util/preKeyBundleToUserClients';
import {createSessions} from '../createSessions/createSessions';

describe('getSessionsAndClientsFromRecipients', () => {
  it('returns userClients for legacy clients', async () => {
    const {apiClient, coreCrypto, cryptographyService} = buildProteusService()[1];

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
    const {apiClient, coreCrypto, cryptographyService} = buildProteusService()[1];

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
