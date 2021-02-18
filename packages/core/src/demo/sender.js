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

//@ts-check

/* eslint-disable no-unused-vars, no-inner-declarations */

process.on('uncaughtException', error =>
  console.error(`Uncaught exception "${error.constructor.name}": ${error.message}`, error),
);
process.on('unhandledRejection', (reason, promise) =>
  console.error('Unhandled Rejection at:', promise, 'reason:', reason),
);

const commander = require('commander');
const logdown = require('logdown');
const fs = require('fs');
const path = require('path');
const {TimeUtil} = require('@wireapp/commons');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);

commander.option('-c, --conversationId <conversationId>').parse(process.argv);

require('dotenv').config({path: path.join(__dirname, 'sender.env')});

const logger = logdown('@wireapp/core/demo/sender.js', {
  logger: console,
  markdown: false,
});
logger.state.isEnabled = true;

const {Account} = require('@wireapp/core');
const {APIClient} = require('@wireapp/api-client');
const {ClientType} = require('@wireapp/api-client/src/client/');
const {FileEngine} = require('@wireapp/store-engine-fs');

void (async () => {
  try {
    const CONVERSATION_ID = commander.opts().conversationId || process.env.WIRE_CONVERSATION_ID;
    const MESSAGE_TIMER = TimeUtil.TimeInMillis.SECOND * 5;
    const WIRE_TEAM_ID = process.env.WIRE_TEAM_ID;

    const login = {
      clientType: ClientType.TEMPORARY,
      email: process.env.WIRE_EMAIL,
      password: process.env.WIRE_PASSWORD,
    };

    const backend = process.env.WIRE_BACKEND === 'staging' ? APIClient.BACKEND.STAGING : APIClient.BACKEND.PRODUCTION;
    const engine = new FileEngine(path.join(__dirname, '.tmp', 'sender'));
    await engine.init(undefined, {fileExtension: '.json'});

    const apiClient = new APIClient({urls: backend});
    const account = new Account(apiClient, () => Promise.resolve(engine));
    await account.login(login);
    await account.listen();

    account.on(Account.TOPIC.ERROR, error => logger.error(error));

    const name = await account.service.self.getName();

    logger.log('Name', name);
    logger.log('User ID', account['apiClient'].context.userId);
    logger.log('Client ID', account['apiClient'].context.clientId);

    async function sendAndDeleteMessage() {
      const deleteTextPayload = account.service.conversation.messageBuilder
        .createText(CONVERSATION_ID, 'Delete me!')
        .build();
      const {id: messageId} = await account.service.conversation.send(deleteTextPayload, undefined, true);

      const fiveSecondsInMillis = TimeUtil.TimeInMillis.SECOND * 5;
      setTimeout(async () => {
        await account.service.conversation.deleteMessageEveryone(CONVERSATION_ID, messageId);
      }, fiveSecondsInMillis);
    }

    async function sendConversationLevelTimer(timeInMillis = TimeUtil.TimeInMillis.YEAR) {
      await account['apiClient'].conversation.api.putConversationMessageTimer(CONVERSATION_ID, {
        message_timer: timeInMillis,
      });
    }

    async function sendEphemeralText(expiry = MESSAGE_TIMER) {
      account.service.conversation.messageTimer.setMessageLevelTimer(CONVERSATION_ID, expiry);
      const payload = account.service.conversation.messageBuilder
        .createText(CONVERSATION_ID, `Expires after ${expiry}ms ...`)
        .build();
      await account.service.conversation.send(payload, undefined, true);
      account.service.conversation.messageTimer.setMessageLevelTimer(CONVERSATION_ID, 0);
    }

    async function sendPing(expiry = MESSAGE_TIMER) {
      account.service.conversation.messageTimer.setMessageLevelTimer(CONVERSATION_ID, expiry);
      const payload = account.service.conversation.messageBuilder.createPing(CONVERSATION_ID);
      await account.service.conversation.send(payload, undefined, true);
      account.service.conversation.messageTimer.setMessageLevelTimer(CONVERSATION_ID, 0);
    }

    async function sendText() {
      const payload = account.service.conversation.messageBuilder.createText(CONVERSATION_ID, 'Hello, World!').build();
      await account.service.conversation.send(payload, undefined, true);
    }

    async function sendAndEdit() {
      const payload = account.service.conversation.messageBuilder.createText(CONVERSATION_ID, 'Hello, Wolrd!').build();
      const {id: originalMessageId} = await account.service.conversation.send(payload, undefined, true);
      setInterval(async () => {
        const editedPayload = account.service.conversation.messageBuilder
          .createEditedText(CONVERSATION_ID, 'Hello, World!', originalMessageId)
          .build();
        await account.service.conversation.send(editedPayload, undefined, true);
      }, TimeUtil.TimeInMillis.SECOND * 2);
    }

    async function sendImage() {
      const data = await readFileAsync(path.join(__dirname, 'wire_logo.png'));
      const image = {
        data,
        height: 244,
        type: 'image/png',
        width: 500,
      };
      const imagePayload = await account.service.conversation.messageBuilder.createImage(CONVERSATION_ID, image);
      await account.service.conversation.send(imagePayload, undefined, true);
    }

    async function sendFile() {
      const filename = 'wire_logo.png';
      const data = await readFileAsync(path.join(__dirname, filename));
      const metadataPayload = account.service.conversation.messageBuilder.createFileMetadata(CONVERSATION_ID, {
        length: data.length,
        name: filename,
        type: 'image/png',
      });
      await account.service.conversation.send(metadataPayload, undefined, true);

      const filePayload = await account.service.conversation.messageBuilder.createFileData(
        CONVERSATION_ID,
        {data},
        metadataPayload.id,
      );
      await account.service.conversation.send(filePayload, undefined, true);
    }

    async function clearConversation() {
      await account.service.conversation.clearConversation(CONVERSATION_ID);
    }

    async function sendMentions() {
      const conversation = await account.service.conversation.getConversations(CONVERSATION_ID);
      const userIds = conversation.members.others.map(participant => participant.id);
      const users = await account.service.user.getUsers(userIds);

      let text = 'Hello';

      const mentions = users.map(user => {
        text += ' ';
        const mentionText = `@${user.name}`;
        const mention = {
          length: mentionText.length,
          start: text.length,
          userId: user.id,
        };
        text += mentionText;
        return mention;
      });

      const payload = account.service.conversation.messageBuilder
        .createText(CONVERSATION_ID, text)
        .withMentions(mentions)
        .build();

      await account.service.conversation.send(payload, undefined, true);
    }

    async function setAvailability() {
      await account.service.user.setAvailability(WIRE_TEAM_ID, 2);
    }

    async function sendQuote() {
      const text = 'Hello';

      const textPayload = account.service.conversation.messageBuilder.createText(CONVERSATION_ID, text).build();

      const {id: messageId} = await account.service.conversation.send(textPayload, undefined, true);

      const quoteText = 'Hello again';

      const quote = {
        content: textPayload.content,
        quotedMessageId: messageId,
      };

      const quotePayload = account.service.conversation.messageBuilder
        .createText(CONVERSATION_ID, quoteText)
        .withQuote(quote)
        .build();

      await account.service.conversation.send(quotePayload, undefined, true);
    }

    const methods = [
      sendAndDeleteMessage,
      sendAndEdit,
      sendEphemeralText,
      sendFile,
      sendImage,
      sendMentions,
      sendPing,
      sendQuote,
      sendText,
    ];

    const timeoutInMillis = TimeUtil.TimeInMillis.SECOND * 2;
    setInterval(() => {
      const randomMethod = methods[Math.floor(Math.random() * methods.length)];
      randomMethod();
    }, timeoutInMillis);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
