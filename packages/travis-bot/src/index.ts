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
import {Config} from '@wireapp/api-client/dist/commonjs/Config';
import {Account} from '@wireapp/core';
import {MemoryEngine} from '@wireapp/store-engine';
import {LoginData} from '@wireapp/api-client/dist/commonjs/auth/';

export interface Commit {
  author: string;
  branch: string;
  message: string;
}

export interface Build {
  number: string | number;
  url: string;
}

export interface Content {
  conversationId: string;
  message: string;
}

export interface MessageData {
  commit: Commit;
  build: Build;
  conversationId: string;
}

class TravisBot {
  constructor(private loginData: LoginData, private messageData: MessageData) {}

  get message(): string {
    const {build: {number: buildNumber}} = this.messageData;
    const {commit: {branch, author, message}} = this.messageData;

    return (
      `**Travis build '${buildNumber}' deployed on '${branch}' environment.** ᕦ(￣ ³￣)ᕤ\n` +
      `- Last commit from: ${author}\n` +
      `- Last commit message: ${message}`
    );
  }

  async start(): Promise<void> {
    const {conversationId} = this.messageData;

    const engine = new MemoryEngine();
    await engine.init('');

    const client = new APIClient(new Config(engine, APIClient.BACKEND.PRODUCTION));

    const account = new Account(client);
    await account.listen(this.loginData);

    if (account.service) {
      await account.service.conversation.sendTextMessage(conversationId, this.message);
    }
  }
}

export {TravisBot};
