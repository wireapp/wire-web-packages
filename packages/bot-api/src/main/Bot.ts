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
import {Connection, ConnectionStatus} from '@wireapp/api-client/dist/commonjs/connection/';
import {Account} from '@wireapp/core';
import {PayloadBundleIncoming, PayloadBundleType} from '@wireapp/core/dist/conversation/root';
import {MemoryEngine} from '@wireapp/store-engine';
import * as logdown from 'logdown';
import UUID from 'pure-uuid';
import {BotConfig} from './BotConfig';
import {MessageHandler} from './MessageHandler';

class Bot {
  public account: Account | undefined;

  private readonly credentials: {email: string; password: string};
  private readonly config: BotConfig;
  private readonly handlers: Map<string, MessageHandler>;
  private readonly logger: logdown.Logger = logdown('@wireapp/standup-bot/StandupBot', {
    logger: console,
    markdown: false,
  });

  constructor(credentials: {email: string; password: string}, config: BotConfig = {conversations: [], owners: []}) {
    this.config = config;
    this.credentials = credentials;
    this.handlers = new Map();
  }

  public addHandler(handler: MessageHandler) {
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

  public async start(): Promise<void> {
    const login = {
      clientType: ClientType.TEMPORARY,
      email: this.credentials.email,
      password: this.credentials.password,
    };
    const engine = new MemoryEngine();
    await engine.init(this.credentials.email);
    const apiClient = new APIClient({store: engine, urls: APIClient.BACKEND.PRODUCTION});
    this.account = new Account(apiClient);

    this.account.on(PayloadBundleType.ASSET, this.handlePayload);
    this.account.on(PayloadBundleType.ASSET_ABORT, this.handlePayload);
    this.account.on(PayloadBundleType.ASSET_IMAGE, this.handlePayload);
    this.account.on(PayloadBundleType.ASSET_META, this.handlePayload);
    this.account.on(PayloadBundleType.AVAILABILITY, this.handlePayload);
    this.account.on(PayloadBundleType.CALL, this.handlePayload);
    this.account.on(PayloadBundleType.CLIENT_ACTION, this.handlePayload);
    this.account.on(PayloadBundleType.CONFIRMATION, this.handlePayload);
    this.account.on(PayloadBundleType.CONNECTION_REQUEST, this.handlePayload);
    this.account.on(PayloadBundleType.CONVERSATION_CLEAR, this.handlePayload);
    this.account.on(PayloadBundleType.CONVERSATION_RENAME, this.handlePayload);
    this.account.on(PayloadBundleType.LAST_READ_UPDATE, this.handlePayload);
    this.account.on(PayloadBundleType.LOCATION, this.handlePayload);
    this.account.on(PayloadBundleType.MEMBER_JOIN, this.handlePayload);
    this.account.on(PayloadBundleType.MESSAGE_DELETE, this.handlePayload);
    this.account.on(PayloadBundleType.MESSAGE_EDIT, this.handlePayload);
    this.account.on(PayloadBundleType.MESSAGE_HIDE, this.handlePayload);
    this.account.on(PayloadBundleType.PING, this.handlePayload);
    this.account.on(PayloadBundleType.REACTION, this.handlePayload);
    this.account.on(PayloadBundleType.TEXT, this.handlePayload);

    await this.account.login(login);
    await this.account.listen();

    this.handlers.forEach(handler => (handler.account = this.account));
  }

  private handlePayload(payload: PayloadBundleIncoming): void {
    if (this.validateMessage(payload.conversation, payload.from)) {
      this.handlers.forEach(handler => handler.handleEvent(payload));
    }
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
