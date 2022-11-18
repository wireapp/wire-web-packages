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
import logdown from 'logdown';

import {GenericMessage} from '@wireapp/protocol-messaging';

import {DecryptionParams} from './CryptMessage.types';
import {decrypt} from './decrypt';

import {constructSessionId} from '../Utility/constructSessionId';
import {generateDecryptionError} from '../Utility/generateDecryptionError';

const logger = logdown('@wireapp/core/messagingProtocols/proteus/ProteusService');

const decryptMessage = (params: DecryptionParams): Promise<Uint8Array> => decrypt({...params, logger});

interface DecryptMessageParams {
  otrMessage: ConversationOtrMessageAddEvent;
  coreCryptoClient: CoreCrypto;
  useQualifiedIds: boolean;
}
const decryptOtrMessage = async ({
  otrMessage,
  coreCryptoClient,
  useQualifiedIds,
}: DecryptMessageParams): Promise<GenericMessage> => {
  const {
    from,
    qualified_from,
    data: {sender, text: encodedCiphertext},
  } = otrMessage;

  const sessionId = constructSessionId({
    clientId: from,
    userId: sender,
    domain: qualified_from?.domain,
    useQualifiedIds,
  });
  try {
    const decryptedMessage = await decryptMessage({sessionId, encodedCiphertext, coreCryptoClient});
    return GenericMessage.decode(decryptedMessage);
  } catch (error) {
    throw generateDecryptionError(otrMessage, error, logger);
  }
};

export {decryptOtrMessage, decryptMessage};
