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

import {APIClient} from '@wireapp/api-client';
import {ClientType} from '@wireapp/api-client/dist/commonjs/client/';
import {Config} from '@wireapp/api-client/dist/commonjs/Config';
import {ConnectionStatus} from '@wireapp/api-client/dist/commonjs/connection/';
import {UserConnectionEvent} from '@wireapp/api-client/dist/commonjs/event/';
import {Account} from '@wireapp/core';
import {PayloadBundleIncoming} from '@wireapp/core/dist/conversation/root';
import {MemoryEngine} from '@wireapp/store-engine';
import UUID from 'pure-uuid';
import {BotConfig} from './BotConfig';
import {Event} from './Event';
import {EventHandler} from './EventHandler';

const logdown = require('logdown');

class Bot {
  public account: Account | undefined;

  private readonly credentials: {email: string; password: string};
  private readonly config: BotConfig;
  private readonly handlers: Map<string, EventHandler>;
  private readonly logger: any = logdown('@wireapp/standup-bot/StandupBot', {
    logger: console,
    markdown: false,
  });

  constructor(credentials: {email: string; password: string}, config: BotConfig = {conversations: [], owners: []}) {
    this.config = config;
    this.credentials = credentials;
    this.handlers = new Map();
  }

  public addHandler(handler: EventHandler) {
    this.handlers.set(new UUID(4).format(), handler);
  }

  public removeHandler(key: string) {
    this.handlers.delete(key);
  }

  private isAllowedConversation(conversationId: string): boolean {
    return this.config.conversations.length === 0 ? true : this.config.conversations.includes(conversationId);
  }

  private isOwner(userId: string): boolean {
    return this.config.owners.length === 0 ? true : this.config.owners.includes(userId);
  }

  public async start(): Promise<boolean> {
    const login = {
      clientType: ClientType.TEMPORARY,
      email: this.credentials.email,
      password: this.credentials.password,
    };
    const backend = APIClient.BACKEND.PRODUCTION;
    const engine = new MemoryEngine();
    await engine.init(this.credentials.email);
    const apiClient = new APIClient(new Config(engine, backend));
    this.account = new Account(apiClient);
    this.account.on(Account.INCOMING.TEXT_MESSAGE, async (payload: PayloadBundleIncoming) => {
      const conversationId = String(payload.conversation);
      if (this.validateMessage(conversationId, payload.from)) {
        this.logger.info('Processing message ...');
        try {
          const event: Event = {
            conversationId,
            data: payload,
            fromId: payload.from,
            type: Account.INCOMING.TEXT_MESSAGE,
          };
          this.handlers.forEach(handler => handler.handleEvent(event));
        } catch (error) {
          this.logger.error(`An error occurred during text handling: ${error.message}`, error);
        }
      }
    });
    this.account.on(Account.INCOMING.CONNECTION, async (payload: UserConnectionEvent) => {
      if (payload.connection.status === ConnectionStatus.PENDING && payload.connection.conversation) {
        const {
          connection: {conversation, to: userId},
        } = payload;
        if (this.validateMessage(String(conversation), userId)) {
          this.logger.info('Processing connection request ...');
          try {
            const event: Event = {
              conversationId: conversation,
              data: payload,
              fromId: userId,
              type: Account.INCOMING.CONNECTION,
            };
            this.handlers.forEach(handler => handler.handleEvent(event));
          } catch (error) {
            this.logger.error(`An error occured during connection request handling: ${error.message}`, error);
          }
        }
      }
    });
    await this.account.login(login);
    await this.account.listen();
    this.handlers.forEach(handler => (handler.account = this.account));
    return true;
  }

  private validateMessage(conversationID: string, userID: string): boolean {
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
