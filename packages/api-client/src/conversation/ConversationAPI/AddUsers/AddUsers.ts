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

import {AxiosRequestConfig} from 'axios';
import {ConversationAPI} from '..';
import {ConversationMemberJoinEvent} from '../../../event';
import {BackendError, BackendErrorLabel} from '../../../http';
import {QualifiedId} from '../../../user';
import {ConversationLegalholdMissingConsentError} from '../../ConversationError';
import {DefaultConversationRoleName} from '../../ConversationRole';

/**
 * Add users to an existing conversation.
 * @param conversationId The conversation ID to add the users to
 * @param userIds List of user IDs to add to a conversation
 * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/addMembers
 */
export async function postMembersV0(this: ConversationAPI, conversationId: string, userIds: string[]) {
  const config: AxiosRequestConfig = {
    data: {
      conversation_role: DefaultConversationRoleName.WIRE_MEMBER,
      users: userIds,
    },
    method: 'post',
    url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/${ConversationAPI.URL.MEMBERS}`,
  };

  try {
    const response = await this.client.sendJSON<ConversationMemberJoinEvent>(config);
    return response.data;
  } catch (error) {
    const backendError = error as BackendError;
    switch (backendError.label) {
      case BackendErrorLabel.LEGAL_HOLD_MISSING_CONSENT: {
        throw new ConversationLegalholdMissingConsentError(backendError.message);
      }
    }
    throw error;
  }
}

/**
 * Add qualified members to an existing Proteus conversation.
 * @param conversationId The conversation ID to add the users to
 * @param users List of users to add to a conversation
 */
export async function addProteusUsers(this: ConversationAPI, conversationId: QualifiedId, users: QualifiedId[]) {
  if (!this.backendFeatures.federationEndpoints) {
    return this.postMembersV0(
      conversationId.id,
      users.map(user => user.id),
    );
  }

  const config: AxiosRequestConfig = {
    data: {
      conversation_role: DefaultConversationRoleName.WIRE_MEMBER,
      qualified_users: users,
    },
    method: 'post',
    url:
      this.backendFeatures.version >= 2
        ? `${ConversationAPI.URL.CONVERSATIONS}/${conversationId.domain}/${conversationId.id}/${ConversationAPI.URL.MEMBERS}`
        : `${ConversationAPI.URL.CONVERSATIONS}/${conversationId.id}/${ConversationAPI.URL.MEMBERS}/${ConversationAPI.URL.V2}`,
  };

  try {
    const response = await this.client.sendJSON<ConversationMemberJoinEvent>(config);
    return response.data;
  } catch (error) {
    const backendError = error as BackendError;
    switch (backendError.label) {
      case BackendErrorLabel.LEGAL_HOLD_MISSING_CONSENT: {
        throw new ConversationLegalholdMissingConsentError(backendError.message);
      }
    }
    throw error;
  }
}

/**
 * Add qualified members to an existing MLS conversation.
 * @param groupId The conversation ID to add the users to
 * @param users List of users to add to a conversation
 */
export async function addMLSUsers(this: ConversationAPI, groupId: string, users: string[]) {
  console.info('addMLSUsers', groupId, users);
}
