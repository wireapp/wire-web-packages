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

import {ConversationOtrMessageAddEvent} from '@wireapp/api-client/lib/event';
import {CoreCrypto} from '@wireapp/core-crypto/platforms/web/corecrypto';
import {Decoder} from 'bazinga64';
import logdown from 'logdown';

import {APIClient} from '@wireapp/api-client';
import {GenericMessage} from '@wireapp/protocol-messaging';

import {generateDecryptionError} from '../Utility/DecryptionErrorGenerator/DecryptionErrorGenerator';
import {constructSessionId} from '../Utility/SessionHandler';

const logger = logdown('@wireapp/core/MessageDecryption');

export interface DecryptMessageParams {
  otrMessage: ConversationOtrMessageAddEvent;
  coreCryptoClient: CoreCrypto;
  apiClient: APIClient;
  useQualifiedIds: boolean;
}
const decryptOtrMessage = async ({
  otrMessage,
  coreCryptoClient,
  useQualifiedIds,
}: DecryptMessageParams): Promise<GenericMessage> => {
  const {
    from: userId,
    qualified_from,
    data: {sender: clientId, text: encodedCiphertext},
  } = otrMessage;

  const sessionId = constructSessionId({
    clientId,
    userId,
    domain: qualified_from?.domain,
    useQualifiedIds,
  });
  const sessionExists = (await coreCryptoClient.proteusSessionExists(sessionId)) as unknown as boolean;
  try {
    const messageBytes = Decoder.fromBase64(encodedCiphertext).asBytes;

    const decryptedMessage: Uint8Array = !sessionExists
      ? ((await coreCryptoClient.proteusSessionFromMessage(sessionId, messageBytes)) as unknown as Uint8Array) //TODO: fix types once defined in core-crypto
      : await coreCryptoClient.proteusDecrypt(sessionId, messageBytes);

    if (!sessionExists) {
      await coreCryptoClient.proteusSessionSave(sessionId);
      logger.info(`Craeted a new session from message for session ID "${sessionId}" and decrypt the message`);
    } else {
      logger.info(`Decrypted message for session ID "${sessionId}"`);
    }

    return GenericMessage.decode(decryptedMessage);
  } catch (error) {
    throw generateDecryptionError(otrMessage, error, logger);
  }
};

export {decryptOtrMessage};
