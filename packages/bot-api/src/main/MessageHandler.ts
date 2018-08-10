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

import {CONVERSATION_TYPE} from '@wireapp/api-client/dist/commonjs/conversation/';
import {Account} from '@wireapp/core';
import {PayloadBundleIncoming, ReactionType} from '@wireapp/core/dist/conversation/root';

abstract class MessageHandler {
  public account: Account | undefined = undefined;

  abstract handleEvent(payload: PayloadBundleIncoming): void;

  public async addUser(conversationId: string, userId: string): Promise<void> {
    if (this.account && this.account.service) {
      await this.account.service.conversation.addUser(conversationId, userId);
    }
  }

  public async removeUser(conversationId: string, userId: string): Promise<void> {
    if (this.account && this.account.service) {
      await this.account.service.conversation.removeUser(conversationId, userId);
    }
  }

  public async sendText(conversationId: string, text: string): Promise<void> {
    if (this.account && this.account.service) {
      const textPayload = this.account.service.conversation.createText(text);
      await this.account.service.conversation.send(conversationId, textPayload);
    }
  }

  public async sendTextToAllConversations(text: string, type?: CONVERSATION_TYPE): Promise<void> {
    if (this.account && this.account.service) {
      let allConversations = await this.account.service.conversation.getConversations();
      if (type) {
        allConversations = allConversations.filter(conversation => conversation.type === type);
      }
      const conversationIds: string[] = allConversations.map(conversation => conversation.id);
      await Promise.all(conversationIds.map(id => this.sendText(id, text)));
    }
  }

  public async sendConnectionRequest(userId: string): Promise<void> {
    if (this.account && this.account.service) {
      await this.account.service.connection.createConnection(userId);
    }
  }

  public async sendConnectionResponse(userId: string, accept: boolean): Promise<void> {
    if (this.account && this.account.service) {
      if (accept) {
        await this.account.service.connection.acceptConnection(userId);
      } else {
        await this.account.service.connection.ignoreConnection(userId);
      }
    }
  }

  public async sendReaction(conversationId: string, originalMessageId: string, type: ReactionType): Promise<void> {
    if (this.account && this.account.service) {
      const reactionPayload = this.account.service.conversation.createReaction(originalMessageId, type);
      await this.account.service.conversation.send(conversationId, reactionPayload);
    }
  }
}

export {MessageHandler};
