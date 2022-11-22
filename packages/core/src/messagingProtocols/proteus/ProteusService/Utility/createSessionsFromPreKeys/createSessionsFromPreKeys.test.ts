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

import {UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';
import {Decoder} from 'bazinga64';

import {createSessionsFromPreKeys} from './createSessionsFromPreKeys';

import {buildProteusService} from '../../../../../test/ProteusHelper';

describe('"createSessionsFromPreKeys"', () => {
  it('creates a session from prekey when session does not exist', async () => {
    const [proteusService, {coreCrypto, cryptographyService}] = buildProteusService();

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
      cryptographyService,
    });

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
