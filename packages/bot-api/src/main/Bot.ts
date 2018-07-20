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

import APIClient = require('@wireapp/api-client');
import {ClientType} from '@wireapp/api-client/dist/commonjs/client/';
import {Config} from '@wireapp/api-client/dist/commonjs/Config';
import {Account} from '@wireapp/core';
import {TextContent} from '@wireapp/core/dist/conversation/content';
import {PayloadBundleIncoming} from '@wireapp/core/dist/conversation/root';
import {MemoryEngine} from '@wireapp/store-engine';
import {BotConfig, MessageHandler} from './index';

const logdown = require('logdown');

class Bot {
  private account: Account;
  private readonly config: BotConfig;
  private readonly handlers: MessageHandler[];
  private readonly logger: any = logdown('@wireapp/standup-bot/StandupBot', {
    logger: console,
    markdown: false,
  });

  constructor(config: BotConfig) {
    this.config = config;
    this.account = new Account(new APIClient());
    this.handlers = [];
  }

  public addHandler(handler: MessageHandler) {
    handler.account = this.account;
    this.handlers.push(handler);
  }

  private isAllowedConversation(conversationId: string): boolean {
    if (this.config.conversations.length === 0) {
      return true;
    } else {
      return this.config.conversations.includes(conversationId);
    }
  }

  private isOwner(userId: string): boolean {
    if (this.config.owners.length === 0) {
      return true;
    } else {
      return this.config.owners.includes(userId);
    }
  }

  public async start(email: string, password: string): Promise<boolean> {
    const login = {
      clientType: ClientType.TEMPORARY,
      email,
      password,
    };
    const backend = APIClient.BACKEND.PRODUCTION;
    const engine = new MemoryEngine();
    await engine.init(email);
    const apiClient = new APIClient(new Config(engine, backend));
    this.account = new Account(apiClient);
    this.account.on(Account.INCOMING.TEXT_MESSAGE, async (payload: PayloadBundleIncoming) => {
      const conversationId = String(payload.conversation);
      const fromId = payload.from;
      const text = (payload.content as TextContent).text;
      if (this.validateMessage(conversationId, payload.from)) {
        this.logger.info('Processing message ...');
        try {
          await Promise.all(this.handlers.map(handler => handler.handleText(conversationId, fromId, text)));
        } catch (error) {
          this.logger.error(`An error occured during text handling: ${error.message}`, error);
        }
      }
    });
    await this.account.login(login);
    await this.account.listen();
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
