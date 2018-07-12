import {Account} from '@wireapp/core';
import {TextContent} from '@wireapp/core/dist/conversation/content/root';
import {PayloadBundleIncoming} from '@wireapp/core/dist/conversation/root';
import {MessageHandler} from './MessageHandler';

import LRUCache from '@wireapp/lru-cache';

class StandupHandler implements MessageHandler {
  private readonly participants: LRUCache<string>;

  constructor(private readonly targetConversationId: string, limit: number) {
    this.participants = new LRUCache<string>(limit);
  }

  addParticipant(userId: string): string | undefined {
    const removedUserId = this.participants.set(userId, userId);
    return removedUserId;
  }

  async handleText(account: Account, payload: PayloadBundleIncoming) {
    if ((payload.content as TextContent).text === '/remote') {
      const sender = payload.from;
      const removedUserID = this.addParticipant(sender);
      if (removedUserID) {
        await account.service!.conversation.removeUser(this.targetConversationId, removedUserID);
      }
      await account.service!.conversation.addUser(this.targetConversationId, sender);
    }
  }
}

export {StandupHandler};
