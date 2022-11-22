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

import type {UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';
import type {CoreCrypto} from '@wireapp/core-crypto/platforms/web/corecrypto';
import {Decoder} from 'bazinga64';

import type {Logger} from '@wireapp/commons';

import type {CryptographyService} from '../../../../../cryptography';

interface CreateSessionsFromPreKeysProps {
  preKeyBundleMap: UserPreKeyBundleMap;
  cryptographyService: CryptographyService;
  coreCryptoClient: CoreCrypto;
  domain?: string;
  logger?: Logger;
}

export const createSessionsFromPreKeys = async ({
  preKeyBundleMap,
  domain = '',
  cryptographyService,
  coreCryptoClient,
  logger,
}: CreateSessionsFromPreKeysProps): Promise<string[]> => {
  const sessions: string[] = [];

  for (const userId in preKeyBundleMap) {
    const userClients = preKeyBundleMap[userId];

    for (const clientId in userClients) {
      const prekey = userClients[clientId];

      if (!prekey) {
        logger?.error(
          `A prekey for client ${clientId} of user ${userId}${
            domain ? ` on domain ${domain}` : ''
          } was not found, session won't be created.`,
        );
        break;
      }

      const sessionId = cryptographyService.constructSessionId(userId, clientId, domain);
      const prekeyBuffer = Decoder.fromBase64(prekey.key).asBytes;

      const sessionExists = (await coreCryptoClient.proteusSessionExists(sessionId)) as unknown as boolean;

      if (!sessionExists) {
        await coreCryptoClient.proteusSessionFromPrekey(sessionId, prekeyBuffer);
      }

      sessions.push(sessionId);
    }
  }

  return sessions;
};
