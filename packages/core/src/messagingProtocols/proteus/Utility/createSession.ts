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

import {PreKey} from '@wireapp/api-client/lib/auth';
import {QualifiedId} from '@wireapp/api-client/lib/user';
import {CoreCrypto} from '@wireapp/core-crypto/platforms/web/corecrypto';
import {Decoder} from 'bazinga64';

import {APIClient} from '@wireapp/api-client';

interface CreateSessionParams {
  coreCryptoClient: CoreCrypto;
  apiClient: APIClient;
  sessionId: string;
  userId: QualifiedId;
  clientId: string;
  initialPrekey?: PreKey;
}
const createSession = async ({
  clientId,
  coreCryptoClient,
  apiClient,
  sessionId,
  userId,
  initialPrekey,
}: CreateSessionParams): Promise<void> => {
  const prekey = initialPrekey ?? (await apiClient.api.user.getClientPreKey(userId, clientId)).prekey;
  const prekeyBuffer = Decoder.fromBase64(prekey.key).asBytes;
  return coreCryptoClient.proteusSessionFromPrekey(sessionId, prekeyBuffer);
};

export {createSession};
