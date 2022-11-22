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

import {BackendEvent, ConversationOtrMessageAddEvent, CONVERSATION_EVENT} from '@wireapp/api-client/lib/event';

import {GenericMessage} from '@wireapp/protocol-messaging';

import {GenericMessageType, PayloadBundle} from '../../../../../../conversation';
import {DecryptionError} from '../../../../../../errors/DecryptionError';
import {EventHandlerResult} from '../../../../../common.types';
import {decryptOtrMessage} from '../../../../CryptMessages/CryptMessages';
import {GenericMessageMapper} from '../../../../Utility/GenericMessageMapper';
import {EventHandlerParams, PayloadBundleSource} from '../../../EventHandler.types';

const mapGenericMessage = (
  otrMessage: ConversationOtrMessageAddEvent,
  genericMessage: GenericMessage,
  source: PayloadBundleSource,
): PayloadBundle => {
  if (genericMessage.content === GenericMessageType.EPHEMERAL) {
    const unwrappedMessage = GenericMessageMapper.mapGenericMessage(genericMessage.ephemeral, otrMessage, source);
    unwrappedMessage.id = genericMessage.messageId;
    if (genericMessage.ephemeral) {
      const expireAfterMillis = genericMessage.ephemeral.expireAfterMillis;
      unwrappedMessage.messageTimer =
        typeof expireAfterMillis === 'number' ? expireAfterMillis : expireAfterMillis.toNumber();
    }
    return unwrappedMessage;
  }
  return GenericMessageMapper.mapGenericMessage(genericMessage, otrMessage, source);
};

const isOtrMessageAddEvent = (event: BackendEvent): event is ConversationOtrMessageAddEvent =>
  event.type === CONVERSATION_EVENT.OTR_MESSAGE_ADD;

type HandleOtrMessageAddParams = Omit<EventHandlerParams, 'event'> & {
  event: ConversationOtrMessageAddEvent;
};
const handleOtrMessageAdd = async ({
  coreCryptoClient,
  apiClient,
  useQualifiedIds,
  event,
  source,
  dryRun = false,
}: HandleOtrMessageAddParams): EventHandlerResult => {
  if (dryRun) {
    // In case of a dry run, we do not want to decrypt messages
    // We just return the raw event to the caller
    return {event};
  }
  try {
    const decryptedData = await decryptOtrMessage({otrMessage: event, coreCryptoClient, useQualifiedIds, apiClient});
    return {
      mappedEvent: mapGenericMessage(event, decryptedData, source),
      event,
      decryptedData,
    };
  } catch (error) {
    if (error instanceof DecryptionError) {
      return {event, decryptionError: error};
    }
    return {event, decryptionError: error as DecryptionError};
  }
};

export {isOtrMessageAddEvent, handleOtrMessageAdd};
