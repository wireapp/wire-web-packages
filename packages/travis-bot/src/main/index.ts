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
import * as Changelog from 'generate-changelog';

export interface Commit {
  author: string;
  branch: string;
  hash: string;
  message: string;
}

export interface Build {
  number: string | number;
  repositoryName: string;
  url: string;
}

export interface Content {
  conversationId: string;
  message: string;
}

export interface MessageData {
  commit: Commit;
  build: Build;
  conversationIds?: Array<string>;
}

class TravisBot {
  constructor(private loginData: LoginData, private messageData: MessageData) {}

  get message(): string {
    const {build: {number: buildNumber, repositoryName}} = this.messageData;
    const {commit: {branch, author, hash, message}} = this.messageData;

    return (
      `**${repositoryName}: Travis build '${buildNumber}' deployed on '${branch}' environment.** ᕦ(￣ ³￣)ᕤ\n` +
      `- Last commit from: ${author}\n` +
      `- Last commit message: ${message}\n` +
      `- https://github.com/${repositoryName}/commit/${hash}`
    );
  }

  async start(): Promise<void> {
    let {conversationIds} = this.messageData;

    const engine = new MemoryEngine();
    await engine.init('');

    const client = new APIClient(new Config(engine, APIClient.BACKEND.PRODUCTION));

    const account = new Account(client);
    await account.listen(this.loginData);

    if (!conversationIds) {
      const conversations = await client.conversation.api.getConversations(500);
      const groupConversations = conversations.conversations.filter(c => c.type === 0);
      conversationIds = groupConversations.map(c => c.id);
    }

    if (account.service) {
      for (const id of conversationIds) {
        console.info(`Sending message to conversation ${id} ...`);
        await account.service.conversation.sendTextMessage(id, this.message);
      }
    } else {
      throw new Error('Account service is not set!');
    }
  }

  static async generateChangelog(repoSlug: string, gitTag: string, maximumChars?: number): Promise<string> {
    const headlines = new RegExp('^#+ (.*)$', 'gm');
    const listItems = new RegExp('^\\* (.*) \\(\\[.*$', 'gm');

    const changelog = await Changelog.generate({
      repoUrl: `https://github.com/${repoSlug}`,
      tag: gitTag,
    });

    const styledChangelog = changelog.replace(headlines, '**$1**').replace(listItems, '– $1');

    return changelog.substring(0, maximumChars);
  }
}

export {TravisBot};
