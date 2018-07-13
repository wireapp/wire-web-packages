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

  async handleText(account: Account, incomingPayload: PayloadBundleIncoming) {
    const conversationId = incomingPayload.conversation;
    const text = (incomingPayload.content as TextContent).text;

    this.logger.debug(`Received text message in conversation "${conversationId}".`);

    switch (text) {
      case '/conversation':
        const conversationText = account.service!.conversation.createText(
          `The ID of this conversation is "${conversationId}".`
        );
        await account.service!.conversation.send(conversationId, conversationText);
        break;
      case '/user':
        const userText = account.service!.conversation.createText(`Your user ID is "${incomingPayload.from}".`);
        await account.service!.conversation.send(conversationId, userText);
        break;
      case '/wfh':
        const sender = incomingPayload.from;
        const removedUserID = this.addParticipant(sender);
        if (removedUserID) {
          await account.service!.conversation.removeUser(this.targetConversationId, removedUserID);
        }
        await account.service!.conversation.addUser(this.targetConversationId, sender);
        break;
    }
  }
}

export {StandupHandler};
