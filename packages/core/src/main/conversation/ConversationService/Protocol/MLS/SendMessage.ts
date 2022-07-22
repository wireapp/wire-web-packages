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

import {Decoder} from 'bazinga64';
import {OtrMessage} from '../../../message/OtrMessage';
import {PayloadBundleState} from '../../../message/PayloadBundle';
import {GenericMessage} from '@wireapp/protocol-messaging';
import {SendCommonParams, ConversationService} from '../..';

export type SendMlsMessageParams<T> = SendCommonParams<T> & {
  /**
   * The groupId of the conversation to send the message to (Needed only for MLS)
   */
  groupId: string;
};
export async function sendMessage<T extends OtrMessage>(
  this: ConversationService,
  params: SendMlsMessageParams<T>,
  genericMessage: GenericMessage,
  content: T['content'],
): Promise<T> {
  const {groupId, onSuccess, payload} = params;
  const groupIdBytes = Decoder.fromBase64(groupId).asBytes;

  const coreCryptoClient = this.coreCryptoClientProvider();
  const encrypted = await coreCryptoClient.encryptMessage(groupIdBytes, GenericMessage.encode(genericMessage).finish());

  try {
    const {time = ''} = await this.apiClient.api.conversation.postMlsMessage(encrypted);
    onSuccess?.(genericMessage, time?.length > 0 ? time : new Date().toISOString());
    return {
      ...payload,
      content,
      messageTimer: genericMessage.ephemeral?.expireAfterMillis || 0,
      state: PayloadBundleState.OUTGOING_SENT,
    };
  } catch {
    return {
      ...payload,
      content,
      messageTimer: genericMessage.ephemeral?.expireAfterMillis || 0,
      state: PayloadBundleState.CANCELLED,
    };
  }
}
