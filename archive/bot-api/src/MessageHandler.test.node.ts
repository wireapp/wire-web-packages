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

import {ClientType} from '@wireapp/api-client/lib/client';
import {Connection} from '@wireapp/api-client/lib/connection';
import {ConversationProtocol} from '@wireapp/api-client/lib/conversation';
import {CONVERSATION_TYPING} from '@wireapp/api-client/lib/conversation/data/';
import {MessageHandler} from '@wireapp/bot-api';
import {MessageBuilder} from '@wireapp/core';
import {Account} from '@wireapp/core';
import {PayloadBundleState} from '@wireapp/core/lib/conversation';
import {createId} from '@wireapp/core/lib/conversation/message/MessageBuilder';
import UUID from 'uuidjs';

describe('MessageHandler', () => {
  let mainHandler: MessageHandler;

  const MainHandler = class extends MessageHandler {
    constructor() {
      super();
    }

    async handleEvent() {}
  };

  beforeEach(async () => {
    mainHandler = new MainHandler();
    mainHandler.account = new Account();
    await mainHandler.account!.initServices({userId: 'user-id', clientType: ClientType.NONE});
    await mainHandler.account!['apiClient']['createContext']('user-id', ClientType.NONE);

    jest
      .spyOn(mainHandler.account!.service!.conversation, 'send')
      .and.returnValue(
        Promise.resolve({state: PayloadBundleState.OUTGOING_SENT, sentAt: new Date().toISOString(), id: createId()}),
      );
  });

  describe('sendConnectionResponse', () => {
    it('sends the correct data when accepting the connection', async () => {
      const userId = UUID.genV4().toString();
      const acceptConnection = true;

      jest
        .spyOn(mainHandler.account!.service!.connection, 'acceptConnection')
        .and.returnValue(Promise.resolve({} as Connection));
      jest
        .spyOn(mainHandler.account!.service!.connection, 'ignoreConnection')
        .and.returnValue(Promise.resolve({} as Connection));

      await mainHandler.sendConnectionResponse(userId, acceptConnection);
      expect(mainHandler.account!.service!.connection.acceptConnection).toHaveBeenCalledWith(userId);
      expect(mainHandler.account!.service!.connection.ignoreConnection).not.toHaveBeenCalled();
    });

    it('sends the correct data when ignoring the connection', async () => {
      const userId = UUID.genV4().toString();
      const acceptConnection = false;

      jest
        .spyOn(mainHandler.account!.service!.connection, 'acceptConnection')
        .and.returnValue(Promise.resolve({} as Connection));
      jest
        .spyOn(mainHandler.account!.service!.connection, 'ignoreConnection')
        .and.returnValue(Promise.resolve({} as Connection));

      await mainHandler.sendConnectionResponse(userId, acceptConnection);
      expect(mainHandler.account!.service!.connection.ignoreConnection).toHaveBeenCalledWith(userId);
      expect(mainHandler.account!.service!.connection.acceptConnection).not.toHaveBeenCalled();
    });
  });

  describe('sendText', () => {
    it('sends the correct data', async () => {
      const conversationId = UUID.genV4().toString();
      const messageText = UUID.genV4().toString();
      const mentionData = [
        {
          data: UUID.genV4().toString(),
          length: 1,
          start: 0,
        },
      ];

      jest.spyOn(MessageBuilder, 'buildTextMessage');

      await mainHandler.sendText(conversationId, messageText, mentionData);

      expect(MessageBuilder.buildTextMessage).toHaveBeenCalledWith({
        text: messageText,
      });
      expect(mainHandler.account!.service!.conversation.send).toHaveBeenCalledWith(
        expect.objectContaining({
          protocol: ConversationProtocol.PROTEUS,
          payload: expect.objectContaining({
            content: expect.objectContaining({mentions: mentionData, text: messageText}),
          }),
        }),
      );
    });

    it('sends the correct data with mentions', async () => {
      const conversationId = UUID.genV4().toString();
      const message = UUID.genV4().toString();

      jest.spyOn(MessageBuilder, 'buildTextMessage');

      await mainHandler.sendText(conversationId, message);

      expect(MessageBuilder.buildTextMessage).toHaveBeenCalledWith({
        text: message,
      });
      expect(mainHandler.account!.service!.conversation.send).toHaveBeenCalledWith(
        expect.objectContaining({
          protocol: ConversationProtocol.PROTEUS,
          payload: expect.objectContaining({content: expect.objectContaining({text: message})}),
        }),
      );
    });

    it('sends the correct data to target users', async () => {
      const conversationId = UUID.genV4().toString();
      const message = UUID.genV4().toString();
      const userIds = [UUID.genV4().toString(), UUID.genV4().toString()];

      jest.spyOn(MessageBuilder, 'buildTextMessage');

      await mainHandler.sendText(conversationId, message, undefined, undefined, userIds);

      expect(MessageBuilder.buildTextMessage).toHaveBeenCalledWith({
        text: message,
      });
      expect(mainHandler.account!.service!.conversation.send).toHaveBeenCalledWith(
        expect.objectContaining({
          protocol: ConversationProtocol.PROTEUS,
          payload: expect.objectContaining({content: expect.objectContaining({text: message})}),
          userIds,
        }),
      );
    });
  });

  describe('sendTyping', () => {
    it('sends the correct data when typing started', async () => {
      const conversationId = UUID.genV4().toString();

      jest.spyOn(mainHandler.account!.service!.conversation, 'sendTypingStart').mockReturnValue(Promise.resolve());
      jest.spyOn(mainHandler.account!.service!.conversation, 'sendTypingStop').mockReturnValue(Promise.resolve());

      await mainHandler.sendTyping(conversationId, CONVERSATION_TYPING.STARTED);

      expect(mainHandler.account!.service!.conversation.sendTypingStart).toHaveBeenCalled();
      expect(mainHandler.account!.service!.conversation.sendTypingStop).not.toHaveBeenCalled();
    });

    it('sends the correct data when typing stopped', async () => {
      const conversationId = UUID.genV4().toString();

      jest.spyOn(mainHandler.account!.service!.conversation, 'sendTypingStart').mockReturnValue(Promise.resolve());
      jest.spyOn(mainHandler.account!.service!.conversation, 'sendTypingStop').mockReturnValue(Promise.resolve());

      await mainHandler.sendTyping(conversationId, CONVERSATION_TYPING.STOPPED);

      expect(mainHandler.account!.service!.conversation.sendTypingStart).not.toHaveBeenCalled();
      expect(mainHandler.account!.service!.conversation.sendTypingStop).toHaveBeenCalled();
    });
  });
});
