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

import {CoreCrypto} from '@wireapp/core-crypto/platforms/web/corecrypto';
import {Decoder} from 'bazinga64';
import logdown from 'logdown';

interface DecryptParams {
  coreCryptoClient: CoreCrypto;
  sessionId: string;
  encodedCiphertext: string;
  logger: logdown.Logger;
}

const decrypt = ({coreCryptoClient, encodedCiphertext, logger, sessionId}: DecryptParams): Promise<Uint8Array> => {
  logger.log(`Decrypting message for session ID "${sessionId}"`);
  const messageBytes = Decoder.fromBase64(encodedCiphertext).asBytes;
  return coreCryptoClient.proteusDecrypt(sessionId, messageBytes);
};

export {decrypt};
