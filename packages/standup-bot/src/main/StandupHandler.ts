import {Account} from '@wireapp/core';
import {TextContent} from '@wireapp/core/dist/conversation/content/';
import {PayloadBundleIncoming} from '@wireapp/core/dist/conversation/root';
import LRUCache from '@wireapp/lru-cache';
import {MessageHandler} from './MessageHandler';

const logdown = require('logdown');

class StandupHandler implements MessageHandler {
  private readonly logger: any = logdown('@wireapp/standup-bot/StandupHandler', {
    logger: console,
    markdown: false,
  });
  private readonly participants: LRUCache<string>;
  private readonly targetConversationId: string;

  constructor(targetConversationId: string, limit: number) {
    this.participants = new LRUCache<string>(limit);
    this.targetConversationId = targetConversationId;
  }

  addParticipant(userId: string): string | undefined {
    const removedUserId = this.participants.set(userId, userId);
    return removedUserId;
  }

  async handleText(account: Account, payload: PayloadBundleIncoming) {
    if ((payload.content as TextContent).text === '/remote') {
      this.logger.log('WAGOO', payload);
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
