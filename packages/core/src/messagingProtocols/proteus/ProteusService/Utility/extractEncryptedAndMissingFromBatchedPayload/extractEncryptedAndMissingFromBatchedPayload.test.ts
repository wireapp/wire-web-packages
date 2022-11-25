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

import {buildProteusService} from '../../ProteusService.mocks';

import {extractEncryptedAndMissingFromBatchedPayload} from './';

describe('extractEncryptedAndMissingFromBatchedPayload', () => {
  it('properly extracts missing and encrypted from payload (without missing)', async () => {
    const [proteusService, {cryptographyService}] = await buildProteusService();

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

    const {encrypted, missing} = extractEncryptedAndMissingFromBatchedPayload({
      payload: batchedEncryptPayload,
      users: userClients,
      domain,
      cryptographyService,
    });

    expect(encrypted).toEqual({
      [firstUserID]: {[firstUserClient1]: textPayload, [firstUserClient2]: textPayload},
      [secondUserID]: {[secondUserClient]: textPayload},
    });

    expect(missing).toEqual({});
  });

  it('properly extracts missing and encrypted from payload (with missing)', async () => {
    const [proteusService, {cryptographyService}] = await buildProteusService();

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

    const {encrypted, missing} = extractEncryptedAndMissingFromBatchedPayload({
      payload: batchedEncryptPayload,
      users: userClients,
      domain,
      cryptographyService,
    });

    expect(encrypted).toEqual({
      [firstUserID]: {[firstUserClient1]: textPayload},
    });

    expect(missing).toEqual({[firstUserID]: [firstUserClient2], [secondUserID]: [secondUserClient]});
  });
});
