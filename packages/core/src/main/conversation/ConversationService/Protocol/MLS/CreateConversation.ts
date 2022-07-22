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

import {NewConversation, Conversation} from '@wireapp/api-client/src/conversation';
import {Decoder} from 'bazinga64';
import {ConversationService} from '../../ConversationService';
import {addUsersToExistingMLSConversation, getCoreCryptoKeyPackagesPayload} from './Common';

export async function creatConversation(
  this: ConversationService,
  conversationData: NewConversation,
): Promise<Conversation> {
  /**
   * @note For creating MLS conversations the users & qualified_users
   * field must be empty as backend is not aware which users
   * are in a MLS conversation because of the MLS architecture.
   */
  const newConversation = await this.apiClient.api.conversation.postConversation({
    ...conversationData,
    users: undefined,
    qualified_users: undefined,
  });
  const {group_id: groupId} = newConversation;
  const groupIdDecodedFromBase64 = Decoder.fromBase64(groupId!).asBytes;
  const {qualified_users: qualifiedUsers = [], selfUserId} = conversationData;
  if (!selfUserId) {
    throw new Error('You need to pass self user qualified id in order to create an MLS conversation');
  }
  const coreCryptoClient = this.coreCryptoClientProvider();

  await coreCryptoClient.createConversation(groupIdDecodedFromBase64);

  const coreCryptoKeyPackagesPayload = await getCoreCryptoKeyPackagesPayload.bind(this)([
    {
      id: selfUserId.id,
      domain: selfUserId.domain,
      /**
       * we should skip fetching key packages for current self client,
       * it's already added by the backend on the group creation time
       */
      skipOwn: conversationData.creator_client,
    },
    ...qualifiedUsers,
  ]);

  await addUsersToExistingMLSConversation.bind(this)(groupIdDecodedFromBase64, coreCryptoKeyPackagesPayload);

  await this.notificationService.saveConversationGroupId(newConversation);
  // We fetch the fresh version of the conversation created on backend with the newly added users

  return this.getConversations(newConversation.id);
}
