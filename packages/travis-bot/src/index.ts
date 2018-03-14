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

import Client = require('@wireapp/api-client');
import {Config} from '@wireapp/api-client/dist/commonjs/Config';
import {Account} from '@wireapp/core';
import {MemoryEngine} from '@wireapp/store-engine/dist/commonjs/engine';

export interface Login {
  email: string;
  password: string;
  persist: boolean;
}

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

export interface Data {
  commit: Commit;
  build: Build;
  content: Content;
}

class TravisBot {
  constructor(private loginData: Login, private data: Data) {}

  async start(): Promise<void> {
    const engine = new MemoryEngine();
    await engine.init('');

    const client = new Client(new Config(engine, Client.BACKEND.PRODUCTION));

    const account = new Account(client);
    await account.listen(this.loginData);

    if (account.service) {
      await account.service.conversation.sendTextMessage(this.data.content.conversationId, this.data.content.message);
    }
  }
}

export {TravisBot};
