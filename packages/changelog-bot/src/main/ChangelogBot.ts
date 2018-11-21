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

import {exec} from 'child_process';
import * as Changelog from 'generate-changelog';
import * as logdown from 'logdown';
import {promisify} from 'util';

import {APIClient} from '@wireapp/api-client';
import {Account} from '@wireapp/core';
import {MemoryEngine} from '@wireapp/store-engine';
import {ChangelogData, LoginDataBackend} from './Interfaces';

const logger = logdown('@wireapp/changelog-bot/ChangelogBot', {
  logger: console,
  markdown: false,
});

logger.state.isEnabled = true;

class ChangelogBot {
  public static SETUP = {
    EXCLUDED_COMMIT_TYPES: ['build', 'chore', 'docs', 'refactor', 'test'],
  };

  constructor(private readonly loginData: LoginDataBackend, private readonly messageData: ChangelogData) {}

  get message(): string {
    const {content, isCustomMessage, repoSlug} = this.messageData;
    return isCustomMessage ? content : `\n**Changelog for "${repoSlug}":**\n\n${content}\n`;
  }

  async sendMessage(): Promise<void> {
    let {conversationIds} = this.messageData;

    const engine = new MemoryEngine();
    await engine.init('changelog-bot');

    const backendUrls = this.loginData.backend === 'staging' ? APIClient.BACKEND.STAGING : APIClient.BACKEND.PRODUCTION;

    const client = new APIClient({store: engine, urls: backendUrls});

    const account = new Account(client);
    await account.login(this.loginData);

    if (!conversationIds) {
      const allConversations = await client.conversation.api.getAllConversations();
      const groupConversations = allConversations.filter(conversation => conversation.type === 0);
      conversationIds = groupConversations.map(conversation => conversation.id);
    }

    if (!account.service) {
      throw new Error(`Account service is not set. Not logged in?`);
    }

    for (const conversationId of conversationIds) {
      if (conversationId) {
        logger.log(`Sending message to conversation "${conversationId}" ...`);
        const textPayload = await account.service.conversation.createText(this.message).build();
        await account.service.conversation.send(conversationId, textPayload);
      }
    }
  }

  static async generateChangelog(repoSlug: string, previousGitTag: string, maximumChars?: number): Promise<string> {
    const headlines = new RegExp('^#+ (.*)$', 'gm');
    const listItems = new RegExp('^\\* (.*) \\(\\[.*$', 'gm');
    const githubIssueLinks = new RegExp('\\[[^\\]]+\\]\\((https:[^)]+)\\)', 'gm');
    const omittedMessage = '... (content omitted)';

    const changelog = await Changelog.generate({
      exclude: ChangelogBot.SETUP.EXCLUDED_COMMIT_TYPES,
      repoUrl: `https://github.com/${repoSlug}`,
      tag: previousGitTag,
    });

    if (!changelog.match(listItems)) {
      const excludedTypes = ChangelogBot.SETUP.EXCLUDED_COMMIT_TYPES.join(', ');
      const errorMessage = `Could not generate a meaningful changelog from the commit types given (excluded ${excludedTypes}).`;
      throw new Error(errorMessage);
    }

    let styledChangelog = changelog
      .replace(headlines, '**$1**')
      .replace(listItems, '– $1')
      .replace(githubIssueLinks, '$1/files?diff=unified');

    if (maximumChars && styledChangelog.length > maximumChars) {
      styledChangelog = styledChangelog.substr(0, maximumChars - omittedMessage.length);

      const indexOfLastDash = styledChangelog.lastIndexOf('–');

      if (indexOfLastDash != -1) {
        styledChangelog = styledChangelog.substr(0, indexOfLastDash);
      }

      styledChangelog += `\n${omittedMessage}`;
    }

    return styledChangelog;
  }

  static async runCommand(command: string): Promise<string> {
    const {stderr, stdout} = await promisify(exec)(command);

    if (stderr) {
      throw new Error(`Command execution error: ${stderr}`);
    }

    return stdout.trim();
  }
}

export {ChangelogBot};
