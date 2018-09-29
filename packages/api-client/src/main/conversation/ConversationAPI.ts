/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
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
import {
  ClientMismatch,
  Conversation,
  ConversationCode,
  ConversationIds,
  ConversationMessageTimerUpdate,
  ConversationUpdate,
  Conversations,
  Invite,
  Member,
  MemberUpdate,
  NewConversation,
  NewOTRMessage,
  Typing,
} from '../conversation/';
import {ConversationEvent, ConversationMemberJoinEvent, ConversationMemberLeaveEvent} from '../event/';
import {HttpClient} from '../http/';
import {ValidationError} from '../validation/';

class ConversationAPI {
  static readonly MAX_CHUNK_SIZE = 500;
  static readonly URL = {
    BOTS: 'bots',
    CLIENTS: '/clients',
    CODE_CHECK: '/code-check',
    CONVERSATIONS: '/conversations',
    JOIN: '/join',
    MEMBERS: 'members',
    MESSAGES: 'messages',
    OTR: 'otr',
    SELF: 'self',
    TYPING: 'typing',
  };

  constructor(private readonly client: HttpClient) {}

  /**
   * Remove bot from conversation.
   * @param conversationId The conversation ID to remove the bot from
   * @param botId The ID of the bot to be removed from the conversation
   */
  public async deleteBot(conversationId: string, botId: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/${ConversationAPI.URL.BOTS}/${botId}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Remove member from conversation.
   * @param conversationId The conversation ID to remove the user from
   * @param userId The user to remove
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/removeMember
   */
  public deleteMember(conversationId: string, userId: string): Promise<ConversationMemberLeaveEvent> {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/${ConversationAPI.URL.MEMBERS}/${userId}`,
    };

    return this.client.sendJSON<ConversationMemberLeaveEvent>(config).then(response => response.data);
  }

  /**
   * Get all conversations.
   */
  public getAllConversations(): Promise<Conversation[]> {
    let allConversations: Conversation[] = [];

    const getConversationChunks = async (conversationId?: string): Promise<Conversation[]> => {
      const {conversations, has_more} = await this.getConversations(conversationId, ConversationAPI.MAX_CHUNK_SIZE);

      if (conversations.length) {
        allConversations = allConversations.concat(conversations);
      }

      if (has_more) {
        const lastConversation = conversations.pop();
        if (lastConversation) {
          return getConversationChunks(lastConversation.id);
        }
      }

      return allConversations;
    };

    return getConversationChunks();
  }

  /**
   * Get a conversation by ID.
   * @param conversationId The conversation ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/conversation
   */
  public getConversation(conversationId: string): Promise<Conversation> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}`,
    };

    return this.client.sendJSON<Conversation>(config).then(response => response.data);
  }

  /**
   * Get all conversation IDs.
   * @param limit Max. number of IDs to return
   * @param conversationId Conversation ID to start from (exclusive)
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/conversationIds
   */
  public getConversationIds(limit: number, conversationId?: string): Promise<ConversationIds> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        size: limit,
        start: conversationId,
      },
      url: `${ConversationAPI.URL.CONVERSATIONS}/ids`,
    };

    return this.client.sendJSON<ConversationIds>(config).then(response => response.data);
  }

  /**
   * Get conversations as chunks.
   * Note: At most 500 conversations are returned per request.
   * @param startConversationId Conversation ID to start from (exclusive). Mutually exclusive with `conversationIds`.
   * @param limit Max. number of conversations to return
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/conversations
   */
  public getConversations(
    startConversationId?: string,
    limit = ConversationAPI.MAX_CHUNK_SIZE
  ): Promise<Conversations> {
    return this._getConversations(startConversationId, undefined, limit);
  }

  /**
   * Get conversations.
   * Note: At most 500 conversations are returned per request.
   * @param conversationId Conversation ID to start from (exclusive). Mutually exclusive with `conversationIds`.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/conversations
   */
  public async getConversationsByIds(filteredConversationIds: string[]): Promise<Conversation[]> {
    let allConversations: Conversation[] = [];

    const getConversationChunk = async (chunkedConversationIds: string[]): Promise<Conversation[]> => {
      const {conversations} = await this._getConversations(
        undefined,
        chunkedConversationIds,
        ConversationAPI.MAX_CHUNK_SIZE
      );
      return conversations;
    };

    for (let index = 0; index < filteredConversationIds.length; index += ConversationAPI.MAX_CHUNK_SIZE) {
      const requestChunk = filteredConversationIds.slice(index, index + ConversationAPI.MAX_CHUNK_SIZE);
      if (requestChunk.length) {
        const conversationChunk = await getConversationChunk(requestChunk);

        if (conversationChunk.length) {
          allConversations = allConversations.concat(conversationChunk);
        }
      }
    }

    return allConversations;
  }

  /**
   * Get conversations.
   * Note: At most 500 conversations are returned per request.
   * @param startConversationId Conversation ID to start from (exclusive). Mutually exclusive with `conversationIds`.
   * @param filteredConversationIds Mutually exclusive with `startConversationId`. At most 32 IDs per request.
   * @param limit Max. number of conversations to return
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/conversations
   */
  private _getConversations(
    startConversationId?: string,
    filteredConversationIds?: string[],
    limit = ConversationAPI.MAX_CHUNK_SIZE
  ): Promise<Conversations> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        size: limit,
        start: startConversationId,
      },
      url: `${ConversationAPI.URL.CONVERSATIONS}`,
    };

    if (filteredConversationIds) {
      config.params.ids = filteredConversationIds.join(',');
    }

    return this.client.sendJSON<Conversations>(config).then(response => response.data);
  }

  /**
   * Get self membership properties.
   * @param conversationId The Conversation ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/getSelf
   */
  public getMembershipProperties(conversationId: string): Promise<Member> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/self`,
    };

    return this.client.sendJSON<Member>(config).then(response => response.data);
  }

  /**
   * Create a 1:1-conversation.
   * @param conversationData The new conversation
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/createOne2OneConversation
   */
  public async post1to1(conversationData: NewConversation): Promise<void> {
    const config: AxiosRequestConfig = {
      data: conversationData,
      method: 'post',
      url: `${ConversationAPI.URL.CONVERSATIONS}/one2one`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Add users to an existing conversation.
   * @param conversationId The conversation ID
   * @param invitationData The new conversation
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/addMembers
   */
  public postAddMembers(conversationId: string, invitationData: Invite): Promise<ConversationEvent> {
    const config: AxiosRequestConfig = {
      data: invitationData,
      method: 'post',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/${ConversationAPI.URL.MEMBERS}`,
    };

    return this.client.sendJSON<ConversationEvent>(config).then(response => response.data);
  }

  /**
   * Add a bot to an existing conversation.
   * @param conversationId ID of the conversation to add bots to
   * @param providerId ID of the bot provider
   * @param serviceId ID of the service provider
   */
  public async postBot(conversationId: string, providerId: string, serviceId: string): Promise<void> {
    const config: AxiosRequestConfig = {
      data: {
        provider: providerId,
        service: serviceId,
      },
      method: 'post',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/${ConversationAPI.URL.BOTS}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Create a new conversation
   * @param conversationData The new conversation
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/createGroupConversation
   */
  public postConversation(conversationData: NewConversation): Promise<Conversation> {
    const config: AxiosRequestConfig = {
      data: conversationData,
      method: 'post',
      url: ConversationAPI.URL.CONVERSATIONS,
    };

    return this.client.sendJSON<Conversation>(config).then(response => response.data);
  }

  /**
   * Validates conversation code
   * @param conversationCode The conversation code
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/checkConversationCode
   */
  public async postConversationCodeCheck(conversationCode: ConversationCode): Promise<void> {
    const config: AxiosRequestConfig = {
      data: conversationCode,
      method: 'post',
      url: `${ConversationAPI.URL.CONVERSATIONS}${ConversationAPI.URL.CODE_CHECK}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Join a conversation by conversation code.
   * @param conversationCode The conversation code
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/joinConversationByCode
   */
  public postJoinByCode(conversationCode: ConversationCode): Promise<ConversationEvent> {
    const config: AxiosRequestConfig = {
      data: conversationCode,
      method: 'post',
      url: `${ConversationAPI.URL.CONVERSATIONS}${ConversationAPI.URL.JOIN}`,
    };

    return this.client.sendJSON<ConversationEvent>(config).then(response => response.data);
  }

  /**
   * Join a conversation.
   * @param conversationId The conversation ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/joinConversation
   */
  public postJoin(conversationId: string): Promise<ConversationEvent> {
    const config: AxiosRequestConfig = {
      data: {},
      method: 'post',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}`,
    };

    return this.client.sendJSON<ConversationEvent>(config).then(response => response.data);
  }

  /**
   * Post an encrypted message to a conversation.
   * @param clientId The sender's client ID
   * @param conversationId The conversation ID
   * @param messageData The message content
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/postOtrMessage
   */
  public postOTRMessage(
    clientId: string,
    conversationId: string,
    messageData?: NewOTRMessage,
    params?: {
      ignore_missing?: boolean;
      report_missing?: string;
    }
  ): Promise<ClientMismatch> {
    if (!clientId) {
      throw new ValidationError('Unable to send OTR message without client ID.');
    }
    if (!messageData) {
      messageData = {
        recipients: {},
        sender: clientId,
      };
    }

    const config: AxiosRequestConfig = {
      data: messageData,
      method: 'post',
      params: {
        ignore_missing: !!messageData.data,
        ...params,
      },
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/${ConversationAPI.URL.OTR}/${
        ConversationAPI.URL.MESSAGES
      }`,
    };

    if (typeof messageData.recipients === 'object') {
      return this.client.sendJSON<ClientMismatch>(config).then(response => response.data);
    }

    return this.client.sendProtocolBuffer<ClientMismatch>(config).then(response => response.data);
  }

  /**
   * Create a self-conversation.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/createSelfConversation
   */
  public postSelf(): Promise<Conversation> {
    const config: AxiosRequestConfig = {
      data: {},
      method: 'post',
      url: `${ConversationAPI.URL.CONVERSATIONS}/self`,
    };

    return this.client.sendJSON<Conversation>(config).then(response => response.data);
  }

  /**
   * Send typing notifications.
   * @param conversationId The Conversation ID
   * @param typingData The typing status
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/isTyping
   */
  public async postTyping(conversationId: string, typingData: Typing): Promise<void> {
    const config: AxiosRequestConfig = {
      data: typingData,
      method: 'post',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/${ConversationAPI.URL.TYPING}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Update conversation properties.
   * @param conversationId The conversation ID
   * @param conversationData The new conversation
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/updateConversation
   */
  public putConversation(conversationId: string, conversationData: ConversationUpdate): Promise<ConversationEvent> {
    const config: AxiosRequestConfig = {
      data: conversationData,
      method: 'put',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}`,
    };

    return this.client.sendJSON<ConversationEvent>(config).then(response => response.data);
  }

  /**
   * Update the message timer for a conversation.
   * @param conversationId The conversation ID
   * @param conversationData The new message timer
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/updateConversationMessageTimer
   */
  public putConversationMessageTimer(
    conversationId: string,
    messageTimerData: ConversationMessageTimerUpdate
  ): Promise<ConversationEvent> {
    const config: AxiosRequestConfig = {
      data: messageTimerData,
      method: 'put',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/message-timer`,
    };

    return this.client.sendJSON<ConversationEvent>(config).then(response => response.data);
  }

  /**
   * Add users to an existing conversation.
   * @param conversationId The conversation ID to add the users to
   * @param userIds List of user IDs to add to a conversation
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/addMembers
   */
  public postMembers(conversationId: string, userIds: string[]): Promise<ConversationMemberJoinEvent> {
    const config: AxiosRequestConfig = {
      data: {
        users: userIds,
      },
      method: 'post',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/${ConversationAPI.URL.MEMBERS}`,
    };

    return this.client.sendJSON<ConversationMemberJoinEvent>(config).then(response => response.data);
  }

  /**
   * Update self membership properties.
   * @param conversationId The Conversation ID
   * @param memberData The new conversation
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/updateSelf
   */
  public async putMembershipProperties(conversationId: string, memberData: MemberUpdate): Promise<void> {
    const config: AxiosRequestConfig = {
      data: memberData,
      method: 'put',
      url: `${ConversationAPI.URL.CONVERSATIONS}/${conversationId}/${ConversationAPI.URL.SELF}`,
    };

    await this.client.sendJSON(config);
  }
}

export {ConversationAPI};
