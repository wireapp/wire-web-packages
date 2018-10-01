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

import {CONVERSATION_TYPE} from '@wireapp/api-client/dist/commonjs/conversation';
import {Account} from '@wireapp/core';
import {PayloadBundleOutgoingUnsent} from '@wireapp/core/dist/conversation/root';

class ConversationChooser {
  constructor(
    private readonly account: Account,
    private readonly payload: PayloadBundleOutgoingUnsent | Promise<PayloadBundleOutgoingUnsent>
  ) {}

  public async toAllConversations(): Promise<void> {
    if (this.account.service) {
      const allConversations = await this.account.service.conversation.getConversations();

      for (const conversation of allConversations) {
        await this.toConversation(conversation.id);
      }
    }
  }

  public async toConversation(conversationId: string): Promise<void> {
    if (this.account.service) {
      await this.account.service.conversation.send(conversationId, await this.payload);
    }
  }

  public async toConversations(conversationIds: string[]): Promise<void> {
    if (this.account.service) {
      for (const conversationId of conversationIds) {
        await this.toConversation(conversationId);
      }
    }
  }

  public async toConversationType(type: CONVERSATION_TYPE): Promise<void> {
    if (this.account.service) {
      const allConversations = await this.account.service.conversation.getConversations();
      const filteredConversations = allConversations.filter(conversation => conversation.type === type);

      for (const conversation of filteredConversations) {
        await this.toConversation(conversation.id);
      }
    }
  }
}

export {ConversationChooser};
