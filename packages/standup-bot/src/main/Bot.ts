import APIClient = require('@wireapp/api-client');
import LRUCache from '@wireapp/lru-cache';

import {ClientType} from '@wireapp/api-client/dist/commonjs/client/';
import {Config} from '@wireapp/api-client/dist/commonjs/Config';
import {Account} from '@wireapp/core';
import {PayloadBundleIncoming} from '@wireapp/core/dist/conversation/root';
import {MemoryEngine} from '@wireapp/store-engine';
import {BotConfiguration} from './BotConfiguration';

const logdown = require('logdown');

class Bot {
  private readonly config: BotConfiguration;
  private readonly logger: any = logdown('@wireapp/standup-bot/StandupBot', {
    logger: console,
    markdown: false,
  });
  private readonly participants: LRUCache<string>;

  constructor(config: BotConfiguration, limit: number) {
    this.config = config;
    this.participants = new LRUCache<string>(limit);
  }

  addParticipant(userId: string): string | undefined {
    const removedUserId = this.participants.set(userId, userId);
    return removedUserId;
  }

  isAllowedConversation(conversationId: string): boolean {
    if (this.config.conversations.length === 0) {
      return true;
    } else {
      return this.config.conversations.includes(conversationId);
    }
  }

  isOwner(userId: string): boolean {
    if (this.config.owners.length === 0) {
      return true;
    } else {
      return this.config.owners.includes(userId);
    }
  }

  async login(email: string, password: string) {
    const login = {
      clientType: ClientType.TEMPORARY,
      email,
      password,
    };
    const backend = APIClient.BACKEND.PRODUCTION;
    const engine = new MemoryEngine();
    await engine.init(email);
    const apiClient = new APIClient(new Config(engine, backend));
    const account = new Account(apiClient);
    account.on(Account.INCOMING.TEXT_MESSAGE, async (payload: PayloadBundleIncoming) => {
      if (this.validateMessage(String(payload.conversation), payload.from)) {
        this.logger.info('Processing message ...');
        // TODO: Assign a message handler (which is supplied from the outside, Interface)
      }
    });
    await account.login(login);
    await account.listen();
    return account;
  }

  validateMessage(conversationID: string, userID: string): boolean {
    if (!this.isAllowedConversation(conversationID)) {
      this.logger.info(
        `Skipping message because conversation "${conversationID}" is not in the list of allowed conversations.`
      );
    }

    if (!this.isOwner(userID)) {
      this.logger.info(`Skipping message because sender "${userID}" is not in the list of owners.`);
    }

    return this.isAllowedConversation(conversationID) && this.isOwner(userID);
  }
}

export {Bot};
