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

  describe('"addUser"', () => {
    it('calls addUser() with conversation ID and user ID', async () => {
      const conversationId = new UUID(UUID_VERSION).format();
      const userId = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.conversation, 'addUser').and.returnValue(Promise.resolve());

      await mainHandler.addUser(conversationId, userId);
      expect(mainHandler.account.service.conversation.addUser).toHaveBeenCalledWith(conversationId, userId);
    });
  });

  describe('"clearConversation"', () => {
    it('calls clearConversation() with conversation ID', async () => {
      const conversationId = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.conversation, 'clearConversation').and.returnValue(Promise.resolve());

      await mainHandler.clearConversation(conversationId);
      expect(mainHandler.account.service.conversation.clearConversation).toHaveBeenCalledWith(conversationId);
    });
  });

  describe('"removeUser"', () => {
    it('calls removeUser() with conversation ID and user ID', async () => {
      const conversationId = new UUID(UUID_VERSION).format();
      const userId = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.conversation, 'removeUser').and.returnValue(Promise.resolve());

      await mainHandler.removeUser(conversationId, userId);
      expect(mainHandler.account.service.conversation.removeUser).toHaveBeenCalledWith(conversationId, userId);
    });
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

  describe('"sendConnectionRequest"', () => {
    it('calls createConnection() with userId', async () => {
      const userId = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.connection, 'createConnection').and.returnValue(Promise.resolve());

      await mainHandler.sendConnectionRequest(userId);
      expect(mainHandler.account.service.connection.createConnection).toHaveBeenCalledWith(userId);
    });
  });

  describe('"sendConnectionResponse"', () => {
    it('calls acceptConnection() with userId', async () => {
      const userId = new UUID(UUID_VERSION).format();
      const acceptConnection = true;

      spyOn(mainHandler.account.service.connection, 'acceptConnection').and.returnValue(Promise.resolve());
      spyOn(mainHandler.account.service.connection, 'ignoreConnection').and.returnValue(Promise.resolve());

      await mainHandler.sendConnectionResponse(userId, acceptConnection);
      expect(mainHandler.account.service.connection.acceptConnection).toHaveBeenCalledWith(userId);
      expect(mainHandler.account.service.connection.ignoreConnection).not.toHaveBeenCalled();
    });

    it('calls ignoreConnection() with userId', async () => {
      const userId = new UUID(UUID_VERSION).format();
      const acceptConnection = false;

      spyOn(mainHandler.account.service.connection, 'acceptConnection').and.returnValue(Promise.resolve());
      spyOn(mainHandler.account.service.connection, 'ignoreConnection').and.returnValue(Promise.resolve());

      await mainHandler.sendConnectionResponse(userId, acceptConnection);
      expect(mainHandler.account.service.connection.ignoreConnection).toHaveBeenCalledWith(userId);
      expect(mainHandler.account.service.connection.acceptConnection).not.toHaveBeenCalled();
    });
  });

  it('calls removeUser() with account and service', async () => {
    const conversationId = new UUID(UUID_VERSION).format();
    const userId = new UUID(UUID_VERSION).format();

    spyOn(mainHandler.account.service.conversation, 'removeUser').and.returnValue(Promise.resolve());

    await mainHandler.removeUser(conversationId, userId);
    expect(mainHandler.account.service.conversation.removeUser).toHaveBeenCalledWith(conversationId, userId);
  });

  describe('"sendEditedText"', () => {
    it('calls send() with account and service', async () => {
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
  });

  describe('"sendFile"', () => {
    it('calls send() with account and service', async () => {
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

    it('calls send() with abort payload if uploading fails', async () => {
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
    it('calls send() with account and service', async () => {
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

  describe('"sendLocation"', () => {
    it('calls send() with account and service', async () => {
      const conversationId = new UUID(UUID_VERSION).format();

      const locationPayload = {
        data: new UUID(UUID_VERSION).format(),
      };

      const locationData = {
        latitude: new UUID(UUID_VERSION).format(),
        longitude: new UUID(UUID_VERSION).format(),
      };

      spyOn(mainHandler.account.service.conversation, 'createLocation').and.returnValue(locationPayload);

      await mainHandler.sendLocation(conversationId, locationData);
      expect(mainHandler.account.service.conversation.createLocation).toHaveBeenCalledWith(locationData);
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(conversationId, locationPayload);
    });
  });

  describe('"sendPing"', () => {
    it('calls send() with account and service', async () => {
      const conversationId = new UUID(UUID_VERSION).format();

      const pingPayload = {
        data: new UUID(UUID_VERSION).format(),
      };

      spyOn(mainHandler.account.service.conversation, 'createPing').and.returnValue(pingPayload);

      await mainHandler.sendPing(conversationId);
      expect(mainHandler.account.service.conversation.createPing).toHaveBeenCalled();
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(conversationId, pingPayload);
    });
  });

  describe('"sendReaction"', () => {
    it('calls send() with account and service', async () => {
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
    it('calls send() with account and service', async () => {
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
    it('calls sendTypingStart()', async () => {
      const conversationId = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.conversation, 'sendTypingStart').and.returnValue(Promise.resolve());
      spyOn(mainHandler.account.service.conversation, 'sendTypingStop').and.returnValue(Promise.resolve());

      await mainHandler.sendTyping(conversationId, CONVERSATION_TYPING.STARTED);

      expect(mainHandler.account.service.conversation.sendTypingStart).toHaveBeenCalled();
      expect(mainHandler.account.service.conversation.sendTypingStop).not.toHaveBeenCalled();
    });

    it('calls sendTypingStop()', async () => {
      const conversationId = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.conversation, 'sendTypingStart').and.returnValue(Promise.resolve());
      spyOn(mainHandler.account.service.conversation, 'sendTypingStop').and.returnValue(Promise.resolve());

      await mainHandler.sendTyping(conversationId, CONVERSATION_TYPING.STOPPED);

      expect(mainHandler.account.service.conversation.sendTypingStart).not.toHaveBeenCalled();
      expect(mainHandler.account.service.conversation.sendTypingStop).toHaveBeenCalled();
    });
  });
});
