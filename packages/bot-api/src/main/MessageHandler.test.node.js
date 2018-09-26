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
const UUID = require('pure-uuid');
const UUID_VERSION = 4;

describe('MessageHandler', () => {
  let mainHandler;

  const MainHandler = class extends MessageHandler {
    constructor() {
      super();
    }
    async handleEvent(payload) {}
  };

  beforeEach(async () => {
    mainHandler = new MainHandler();
    mainHandler.account = new Account();
    await mainHandler.account.init();
    mainHandler.account.apiClient.createContext('', '');
  });

  describe('"sendConfirmation"', () => {
    it('calls send() with account and service', async () => {
      const confirmMessageId = new UUID(UUID_VERSION).format();
      const conversationId = new UUID(UUID_VERSION).format();

      const confirmationPayload = {
        data: confirmMessageId,
      };

      spyOn(mainHandler.account.service.conversation, 'createConfirmation').and.returnValue(
        Promise.resolve(confirmationPayload)
      );
      spyOn(mainHandler.account.service.conversation, 'send').and.returnValue(Promise.resolve());

      await mainHandler.sendConfirmation(conversationId, confirmMessageId);
      expect(mainHandler.account.service.conversation.createConfirmation).toHaveBeenCalledWith(confirmMessageId);
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(conversationId, confirmationPayload);
    });
  });

  describe('"sendEditedText"', () => {
    it('calls send() with account and service', async () => {
      const conversationId = new UUID(UUID_VERSION).format();
      const originalMessageId = new UUID(UUID_VERSION).format();
      const newMessageText = new UUID(UUID_VERSION).format();

      spyOn(mainHandler.account.service.conversation, 'createEditedText').and.callThrough();
      spyOn(mainHandler.account.service.conversation, 'send').and.returnValue(Promise.resolve());

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
        data: metadata,
        id: new UUID(UUID_VERSION).format(),
      };

      spyOn(mainHandler.account.service.conversation, 'createFileMetadata').and.returnValue(
        Promise.resolve(metadataPayload)
      );
      spyOn(mainHandler.account.service.conversation, 'createFileData').and.returnValue(Promise.resolve(filePayload));
      spyOn(mainHandler.account.service.conversation, 'send').and.returnValue(Promise.resolve());

      await mainHandler.sendFile(conversationId, file, metadata);
      expect(mainHandler.account.service.conversation.createFileMetadata).toHaveBeenCalledWith(metadata);
      expect(mainHandler.account.service.conversation.createFileData).toHaveBeenCalledWith(file, metadataPayload.id);
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(conversationId, filePayload);
    });
  });

  describe('"sendImage"', () => {
    it('calls send() with account and service', async () => {
      const conversationId = new UUID(UUID_VERSION).format();

      const imagePayload = {
        data: new UUID(UUID_VERSION).format(),
      };

      const image = {
        data: new UUID(UUID_VERSION).format(),
      };

      spyOn(mainHandler.account.service.conversation, 'send').and.returnValue(Promise.resolve());
      spyOn(mainHandler.account.service.conversation, 'createImage').and.returnValue(Promise.resolve(imagePayload));

      await mainHandler.sendImage(conversationId, image);
      expect(mainHandler.account.service.conversation.createImage).toHaveBeenCalledWith(image);
      expect(mainHandler.account.service.conversation.send).toHaveBeenCalledWith(conversationId, imagePayload);
    });
  });
});
