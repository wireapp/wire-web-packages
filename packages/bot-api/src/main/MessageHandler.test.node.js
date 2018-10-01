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

const {MessageHandler} = require('@wireapp/bot-api');
const {Account} = require('@wireapp/core');
const {ReactionType} = require('@wireapp/core/dist/conversation/root');
const {CONVERSATION_TYPING} = require('@wireapp/api-client/dist/commonjs/event');

const UUID = require('pure-uuid');
const UUID_VERSION = 4;

describe('MessageHandler', () => {
  let mainHandler;

  const MainHandler = class extends MessageHandler {
    constructor() {
      super();
    }
    async handleEvent() {}
  };

  beforeEach(async () => {
    mainHandler = new MainHandler();
    mainHandler.account = new Account();
    await mainHandler.account.init();
    mainHandler.account.apiClient.createContext('', '');

    spyOn(mainHandler.account.service.conversation, 'send').and.returnValue(Promise.resolve());
  });

  describe('"sendConfirmation"', () => {
    it('calls send() with account and service', async () => {
      const confirmMessageId = new UUID(UUID_VERSION).format();
      const conversationId = new UUID(UUID_VERSION).format();

      const confirmationPayload = {
        data: confirmMessageId,
      };

      spyOn(mainHandler.account.service.conversation, 'createConfirmation').and.returnValue(confirmationPayload);

      await mainHandler.sendConfirmation(conversationId, confirmMessageId);
      expect(mainHandler.account.service.conversation.createConfirmation).toHaveBeenCalledWith(confirmMessageId);
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(conversationId, confirmationPayload);
    });
  });

  describe('"sendConnectionResponse"', () => {
    it('sends the correct data when accepting the connection', async () => {
      const userId = new UUID(UUID_VERSION).format();
      const acceptConnection = true;

      spyOn(mainHandler.account.service.connection, 'acceptConnection').and.returnValue(Promise.resolve());
      spyOn(mainHandler.account.service.connection, 'ignoreConnection').and.returnValue(Promise.resolve());

      await mainHandler.sendConnectionResponse(userId, acceptConnection);
      expect(mainHandler.account.service.connection.acceptConnection).toHaveBeenCalledWith(userId);
      expect(mainHandler.account.service.connection.ignoreConnection).not.toHaveBeenCalled();
    });

    it('sends the correct data when ignoring the connection', async () => {
      const userId = new UUID(UUID_VERSION).format();
      const acceptConnection = false;

      spyOn(mainHandler.account.service.connection, 'acceptConnection').and.returnValue(Promise.resolve());
      spyOn(mainHandler.account.service.connection, 'ignoreConnection').and.returnValue(Promise.resolve());

      await mainHandler.sendConnectionResponse(userId, acceptConnection);
      expect(mainHandler.account.service.connection.ignoreConnection).toHaveBeenCalledWith(userId);
      expect(mainHandler.account.service.connection.acceptConnection).not.toHaveBeenCalled();
    });
  });

  describe('"sendEditedText"', () => {
    it('sends the correct data', async () => {
      const conversationId = new UUID(UUID_VERSION).format();
      const originalMessageId = new UUID(UUID_VERSION).format();
      const newMessageText = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.conversation, 'createEditedText').and.callThrough();

      await mainHandler.sendEditedText(conversationId, originalMessageId, newMessageText);
      expect(mainHandler.account.service.conversation.createEditedText).toHaveBeenCalledWith(
        newMessageText,
        originalMessageId
      );
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(
        conversationId,
        jasmine.objectContaining({content: jasmine.objectContaining({originalMessageId, text: newMessageText})})
      );
    });

    it('sends the correct data with mentions', async () => {
      const conversationId = new UUID(UUID_VERSION).format();
      const originalMessageId = new UUID(UUID_VERSION).format();
      const newMessageText = new UUID(UUID_VERSION).format();
      const mentionData = [
        {
          data: new UUID(UUID_VERSION).format(),
        },
      ];

      spyOn(mainHandler.account.service.conversation, 'createEditedText').and.callThrough();

      await mainHandler.sendEditedText(conversationId, originalMessageId, newMessageText, mentionData);
      expect(mainHandler.account.service.conversation.createEditedText).toHaveBeenCalledWith(
        newMessageText,
        originalMessageId
      );
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(
        conversationId,
        jasmine.objectContaining({
          content: jasmine.objectContaining({mentions: mentionData, originalMessageId, text: newMessageText}),
        })
      );
    });
  });

  describe('"sendFile"', () => {
    it('sends the correct data', async () => {
      const conversationId = new UUID(UUID_VERSION).format();
      const file = new UUID(UUID_VERSION).format();
      const metadata = new UUID(UUID_VERSION).format();

      const filePayload = {
        data: file,
      };
      const metadataPayload = {
        id: new UUID(UUID_VERSION).format(),
      };

      spyOn(mainHandler.account.service.conversation, 'createFileMetadata').and.returnValue(metadataPayload);
      spyOn(mainHandler.account.service.conversation, 'createFileData').and.returnValue(Promise.resolve(filePayload));
      spyOn(mainHandler.account.service.conversation, 'createFileAbort').and.returnValue(Promise.resolve());

      await mainHandler.sendFile(conversationId, file, metadata);
      expect(mainHandler.account.service.conversation.createFileMetadata).toHaveBeenCalledWith(metadata);
      expect(mainHandler.account.service.conversation.createFileData).toHaveBeenCalledWith(file, metadataPayload.id);
      expect(mainHandler.account.service.conversation.createFileAbort).not.toHaveBeenCalled();
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(conversationId, filePayload);
    });

    it('sends the correct data if uploading fails', async () => {
      const conversationId = new UUID(UUID_VERSION).format();
      const file = new UUID(UUID_VERSION).format();
      const metadata = new UUID(UUID_VERSION).format();

      const abortPayload = {
        data: file,
      };
      const metadataPayload = {
        id: new UUID(UUID_VERSION).format(),
      };

      spyOn(mainHandler.account.service.conversation, 'createFileMetadata').and.returnValue(metadataPayload);
      spyOn(mainHandler.account.service.conversation, 'createFileData').and.returnValue(Promise.reject(new Error()));
      spyOn(mainHandler.account.service.conversation, 'createFileAbort').and.returnValue(Promise.resolve(abortPayload));

      await mainHandler.sendFile(conversationId, file, metadata);
      expect(mainHandler.account.service.conversation.createFileMetadata).toHaveBeenCalledWith(metadata);
      expect(mainHandler.account.service.conversation.createFileData).toHaveBeenCalledWith(file, metadataPayload.id);
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(conversationId, abortPayload);
    });
  });

  describe('"sendImage"', () => {
    it('sends the correct data', async () => {
      const conversationId = new UUID(UUID_VERSION).format();

      const imagePayload = {
        data: new UUID(UUID_VERSION).format(),
      };

      const imageData = {
        data: Buffer.from(new UUID(UUID_VERSION).format()),
        height: new UUID(UUID_VERSION).format(),
        type: new UUID(UUID_VERSION).format(),
        width: 1,
      };

      spyOn(mainHandler.account.service.conversation, 'createImage').and.returnValue(Promise.resolve(imagePayload));

      await mainHandler.sendImage(conversationId, imageData);
      expect(mainHandler.account.service.conversation.createImage).toHaveBeenCalledWith(imageData);
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(conversationId, imagePayload);
    });
  });

  describe('"sendReaction"', () => {
    it('sends the correct data', async () => {
      const conversationId = new UUID(UUID_VERSION).format();
      const originalMessageId = new UUID(UUID_VERSION).format();
      const reactionType = ReactionType.LIKE;

      const reactionData = {
        data: new UUID(UUID_VERSION).format(),
      };

      spyOn(mainHandler.account.service.conversation, 'createReaction').and.returnValue(reactionData);

      await mainHandler.sendReaction(conversationId, originalMessageId, reactionType);
      expect(mainHandler.account.service.conversation.createReaction).toHaveBeenCalledWith(
        originalMessageId,
        reactionType
      );
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(conversationId, reactionData);
    });
  });

  describe('"sendText"', () => {
    it('sends the correct data', async () => {
      const conversationId = new UUID(UUID_VERSION).format();
      const messageText = new UUID(UUID_VERSION).format();
      const mentionData = [
        {
          data: new UUID(UUID_VERSION).format(),
        },
      ];

      spyOn(mainHandler.account.service.conversation, 'createText').and.callThrough();

      await mainHandler.sendText(conversationId, messageText, mentionData);

      expect(mainHandler.account.service.conversation.createText).toHaveBeenCalledWith(messageText);
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(
        conversationId,
        jasmine.objectContaining({content: jasmine.objectContaining({mentions: mentionData, text: messageText})})
      );
    });

    it('sends the correct data with mentions', async () => {
      const conversationId = new UUID(UUID_VERSION).format();
      const message = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.conversation, 'createText').and.callThrough();

      await mainHandler.sendText(conversationId, message);

      expect(mainHandler.account.service.conversation.createText).toHaveBeenCalledWith(message);
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(
        conversationId,
        jasmine.objectContaining({content: jasmine.objectContaining({text: message})})
      );
    });
  });

  describe('"sendTyping"', () => {
    it('sends the correct data when typing started', async () => {
      const conversationId = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.conversation, 'sendTypingStart').and.returnValue(Promise.resolve());
      spyOn(mainHandler.account.service.conversation, 'sendTypingStop').and.returnValue(Promise.resolve());

      await mainHandler.sendTyping(conversationId, CONVERSATION_TYPING.STARTED);

      expect(mainHandler.account.service.conversation.sendTypingStart).toHaveBeenCalled();
      expect(mainHandler.account.service.conversation.sendTypingStop).not.toHaveBeenCalled();
    });

    it('sends the correct data when typing stopped', async () => {
      const conversationId = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.conversation, 'sendTypingStart').and.returnValue(Promise.resolve());
      spyOn(mainHandler.account.service.conversation, 'sendTypingStop').and.returnValue(Promise.resolve());

      await mainHandler.sendTyping(conversationId, CONVERSATION_TYPING.STOPPED);

      expect(mainHandler.account.service.conversation.sendTypingStart).not.toHaveBeenCalled();
      expect(mainHandler.account.service.conversation.sendTypingStop).toHaveBeenCalled();
    });
  });
});
