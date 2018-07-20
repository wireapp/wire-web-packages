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

import {MessageHandler} from '@wireapp/bot-api';
import LRUCache from '@wireapp/lru-cache';

const logdown = require('logdown');

class StandupHandler extends MessageHandler {
  private readonly logger: any = logdown('@wireapp/bot-samples/StandupHandler', {
    logger: console,
    markdown: false,
  });
  private readonly participants: LRUCache<string>;
  private readonly targetConversationId: string;

  constructor(targetConversationId: string, limit: number) {
    super();
    this.participants = new LRUCache<string>(limit);
    this.targetConversationId = targetConversationId;
  }

  addParticipant(userId: string): string | undefined {
    const removedUserId = this.participants.set(userId, userId);
    return removedUserId;
  }

  async handleText(conversationId: string, fromId: string, text: string): Promise<void> {
    this.logger.debug(`Received text message in conversation "${conversationId}".`);

    switch (text) {
      case '/conversation':
        const conversationText = `The ID of this conversation is "${conversationId}".`;
        await this.sendText(conversationId, conversationText);
        break;
      case '/user':
        const userText = `Your user ID is "${fromId}".`;
        await this.sendText(conversationId, userText);
        break;
      case '/remote':
        const removerUserId = this.addParticipant(fromId);
        if (removerUserId) {
          await this.removeUser(this.targetConversationId, removerUserId);
        }
        await this.addUser(this.targetConversationId, fromId);
        break;
    }
  }
}

export {StandupHandler};
