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

import {ClientClassification, ClientType} from '@wireapp/api-client/lib/client';
import {CoreCrypto} from '@wireapp/core-crypto/platforms/web/corecrypto';

import {APIClient} from '@wireapp/api-client';
import {MemoryEngine} from '@wireapp/store-engine';

import {coreCryptoMock} from './CoreCryptoHelper';
import {getUUID} from './PayloadHelper';

import {CryptographyService} from '../cryptography';
import {ProteusService} from '../messagingProtocols/proteus';

export const buildProteusService = (
  federated = false,
): [ProteusService, {apiClient: APIClient; coreCrypto: CoreCrypto; cryptographyService: CryptographyService}] => {
  const apiClient = new APIClient({urls: APIClient.BACKEND.STAGING});
  jest.spyOn(apiClient.api.user, 'postListClients').mockImplementation(() =>
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

  jest.spyOn(apiClient.api.user, 'postMultiPreKeyBundles').mockImplementation(jest.fn());
  jest.spyOn(apiClient.api.user, 'postQualifiedMultiPreKeyBundles').mockImplementation(jest.fn());

  apiClient.context = {
    clientType: ClientType.NONE,
    userId: getUUID(),
    clientId: getUUID(),
  };

  const cryptographyService = new CryptographyService(apiClient, new MemoryEngine(), {
    useQualifiedIds: federated,
    nbPrekeys: 1,
  });

  const proteusService = new ProteusService(apiClient, cryptographyService, coreCryptoMock, {
    useQualifiedIds: federated,
  });
  return [proteusService, {apiClient, coreCrypto: coreCryptoMock, cryptographyService}];
};
