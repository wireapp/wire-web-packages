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
import {UserClients} from '@wireapp/api-client/lib/conversation';
import {CoreCrypto} from '@wireapp/core-crypto/platforms/web/corecrypto';

import {APIClient} from '@wireapp/api-client';
import {MemoryEngine} from '@wireapp/store-engine';

import {ProteusService} from '../..';
import {CryptographyService} from '../../../../../cryptography';
import {getUUID} from '../../../../../test/PayloadHelper';

const buildProteusService = (federated = false): [ProteusService, {apiClient: APIClient; coreCrypto: CoreCrypto}] => {
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

  const coreCrypto = {
    getRemoteFingerprint: jest.fn(),
    getLocalFingerprint: jest.fn(),
    proteusSessionExists: jest.fn(),
    proteusSessionFromPrekey: jest.fn(),
    proteusFingerprintRemote: jest.fn(),
    proteusEncryptBatched: jest.fn(),
  } as unknown as CoreCrypto;

  const proteusService = new ProteusService(apiClient, cryptographyService, coreCrypto, {useQualifiedIds: federated});
  return [proteusService, {apiClient, coreCrypto}];
};

describe('extractEncryptedAndMissingFromBatchedPayload', () => {
  it('properly extracts missing and encrypted from payload (without missing)', async () => {
    const [proteusService] = buildProteusService();

    const domain = 'staging.zinfra.io';

    const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
    const firstUserClient1 = '5e80ea7886680975';
    const firstUserClient2 = 'be67218b77d02d30';

    const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';
    const secondUserClient = '5bad8cdeddc5a90f';

    const userClients: UserClients = {
      [firstUserID]: [firstUserClient1, firstUserClient2],
      [secondUserID]: [secondUserClient],
    };

    const textPayload = new Uint8Array();

    const batchedEncryptPayload: Map<string, Uint8Array> = new Map(
      [
        [firstUserID, firstUserClient1, domain],
        [firstUserID, firstUserClient2, domain],
        [secondUserID, secondUserClient, domain],
      ].map(([u, c, d]) => [proteusService['cryptographyService'].constructSessionId(u, c, d), textPayload]),
    );

    const {encrypted, missing} = proteusService['extractEncryptedAndMissingFromBatchedPayload'](
      batchedEncryptPayload,
      userClients,
      domain,
    );

    expect(encrypted).toEqual({
      [firstUserID]: {[firstUserClient1]: textPayload, [firstUserClient2]: textPayload},
      [secondUserID]: {[secondUserClient]: textPayload},
    });

    expect(missing).toEqual({});
  });

  it('properly extracts missing and encrypted from payload (with missing)', async () => {
    const [proteusService] = buildProteusService();

    const domain = 'staging.zinfra.io';

    const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
    const firstUserClient1 = '5e80ea7886680975';
    const firstUserClient2 = 'be67218b77d02d30';

    const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';
    const secondUserClient = '5bad8cdeddc5a90f';

    const userClients: UserClients = {
      [firstUserID]: [firstUserClient1, firstUserClient2],
      [secondUserID]: [secondUserClient],
    };

    const textPayload = new Uint8Array();

    const batchedEncryptPayload: Map<string, Uint8Array> = new Map([
      [proteusService['cryptographyService'].constructSessionId(firstUserID, firstUserClient1, domain), textPayload],
    ]);

    const {encrypted, missing} = proteusService['extractEncryptedAndMissingFromBatchedPayload'](
      batchedEncryptPayload,
      userClients,
      domain,
    );

    expect(encrypted).toEqual({
      [firstUserID]: {[firstUserClient1]: textPayload},
    });

    expect(missing).toEqual({[firstUserID]: [firstUserClient2], [secondUserID]: [secondUserClient]});
  });
});
