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

import type {Conversation, UserClients} from '@wireapp/api-client/src/conversation';
import {CONVERSATION_TYPING} from '@wireapp/api-client/src/conversation/data';
import type {ConversationEvent, TeamEvent, UserEvent} from '@wireapp/api-client/src/event';
import type {User} from '@wireapp/api-client/src/user/';
import type {Account} from '@wireapp/core';
import type {PayloadBundle, ReactionType} from '@wireapp/core/src/main/conversation/';
import type {
  ButtonActionConfirmationContent,
  CallingContent,
  FileContent,
  FileMetaDataContent,
  ImageContent,
  LinkPreviewContent,
  LocationContent,
  MentionContent,
} from '@wireapp/core/src/main/conversation/content/';
import type {QuotableMessage} from '@wireapp/core/src/main/conversation/message/OtrMessage';
import {Asset, Confirmation, Text} from '@wireapp/protocol-messaging';
import {promisify} from 'util';
import fs from 'fs';
import path from 'path';
import FileType = require('file-type');
import {DefaultConversationRoleName} from '@wireapp/api-client/src/conversation';
import {MessageBuilder} from '@wireapp/core/src/main/conversation/message/MessageBuilder';

export abstract class MessageHandler {
  account: Account | undefined = undefined;

  abstract handleEvent(payload: PayloadBundle | ConversationEvent | UserEvent | TeamEvent): void;

  async addUser(conversationId: string, userId: string): Promise<void> {
    if (this.account?.service) {
      await this.account.service.conversation.addUser(conversationId, userId);
    }
  }

  async clearConversation(conversationId: string): Promise<void> {
    if (this.account?.service) {
      await this.account.service.conversation.clearConversation(conversationId);
    }
  }

  getConversation(conversationId: string): Promise<Conversation> {
    return this.account!.service!.conversation.getConversations(conversationId);
  }

  getConversations(conversationIds?: string[]): Promise<Conversation[]> {
    return this.account!.service!.conversation.getConversations(conversationIds);
  }

  async getUser(userId: string): Promise<User> {
    return this.account!.service!.user.getUser(userId);
  }

  async getUsers(userIds: string[]): Promise<User[]> {
    return this.account!.service!.user.getUsers(userIds);
  }

  async removeUser(conversationId: string, userId: string): Promise<void> {
    if (this.account?.service) {
      await this.account.service.conversation.removeUser(conversationId, userId);
    }
  }

  public async setAdminRole(conversationId: string, userId: string): Promise<void> {
    return this.account!.service!.conversation.setMemberConversationRole(
      conversationId,
      userId,
      DefaultConversationRoleName.WIRE_ADMIN,
    );
  }

  public async setMemberRole(conversationId: string, userId: string): Promise<void> {
    return this.account!.service!.conversation.setMemberConversationRole(
      conversationId,
      userId,
      DefaultConversationRoleName.WIRE_MEMBER,
    );
  }

  async sendButtonActionConfirmation(
    conversationId: string,
    userId: string,
    referenceMessageId: string,
    buttonId: string,
  ) {
    if (this.account?.service) {
      const buttonActionConfirmationContent: ButtonActionConfirmationContent = {
        buttonId,
        referenceMessageId,
      };

      const buttonActionConfirmationMessage = MessageBuilder.createButtonActionConfirmationMessage({
        conversationId,
        from: this.account.clientId,
        content: buttonActionConfirmationContent,
      });

      await this.account.service.conversation.send({payloadBundle: buttonActionConfirmationMessage, userIds: [userId]});
    }
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  async sendCall(conversationId: string, content: CallingContent, userIds?: string[] | UserClients): Promise<void> {
    if (this.account?.service) {
      const callPayload = MessageBuilder.createCall({conversationId, from: this.account.clientId, content});
      await this.account.service.conversation.send({payloadBundle: callPayload, userIds});
    }
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  async sendPoll(
    conversationId: string,
    text: string,
    buttons: string[],
    userIds?: string[] | UserClients,
  ): Promise<void> {
    if (this.account?.service) {
      const message = MessageBuilder.createComposite({conversationId, from: this.account.clientId}).addText(
        Text.create({content: text}),
      );
      buttons.forEach(button => message.addButton(button));
      await this.account.service.conversation.send({payloadBundle: message.build(), userIds});
    }
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  async sendConfirmation(
    conversationId: string,
    firstMessageId: string,
    userIds?: string[] | UserClients,
  ): Promise<void> {
    if (this.account?.service) {
      const confirmationPayload = MessageBuilder.createConfirmation({
        conversationId,
        from: this.account.clientId,
        firstMessageId,
        type: Confirmation.Type.DELIVERED,
      });
      await this.account.service.conversation.send({payloadBundle: confirmationPayload, userIds});
    }
  }

  async sendConnectionRequest(userId: string): Promise<void> {
    if (this.account?.service) {
      await this.account.service.connection.createConnection(userId);
    }
  }

  async sendConnectionResponse(userId: string, accept: boolean): Promise<void> {
    if (this.account?.service) {
      if (accept) {
        await this.account.service.connection.acceptConnection(userId);
      } else {
        await this.account.service.connection.ignoreConnection(userId);
      }
    }
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  async sendEditedText(
    conversationId: string,
    originalMessageId: string,
    newMessageText: string,
    newMentions?: MentionContent[],
    newLinkPreview?: LinkPreviewContent,
    userIds?: string[] | UserClients,
  ): Promise<void> {
    if (this.account?.service) {
      const editedPayload = MessageBuilder.createEditedText({
        conversationId,
        from: this.account.clientId,
        newMessageText,
        originalMessageId,
      })
        .withMentions(newMentions)
        .build();

      const editedMessage = await this.account.service.conversation.send({payloadBundle: editedPayload, userIds});

      if (newLinkPreview) {
        const editedWithPreviewPayload = MessageBuilder.createEditedText({
          from: this.account.clientId,
          conversationId,
          newMessageText,
          originalMessageId,
          messageId: editedMessage.id,
        })
          .withLinkPreviews([await this.account.service.linkPreview.uploadLinkPreviewImage(newLinkPreview)])
          .withMentions(newMentions)
          .build();

        await this.account.service.conversation.send({payloadBundle: editedWithPreviewPayload, userIds});
      }
    }
  }

  async sendFileByPath(conversationId: string, filePath: string, userIds?: string[] | UserClients): Promise<void> {
    const data = await promisify(fs.readFile)(filePath);
    const fileType = await FileType.fromBuffer(data);
    const metadata: FileMetaDataContent = {
      length: data.length,
      name: path.basename(filePath),
      type: fileType ? fileType.mime : 'text/plain',
    };
    return this.sendFile(
      conversationId,
      {
        data,
      },
      metadata,
      userIds,
    );
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  async sendFile(
    conversationId: string,
    file: FileContent,
    metadata: FileMetaDataContent,
    userIds?: string[] | UserClients,
  ): Promise<void> {
    if (this.account?.service) {
      const metadataPayload = MessageBuilder.createFileMetadata({
        conversationId,
        metaData: metadata,
        from: this.account.clientId,
      });
      await this.account.service.conversation.send({payloadBundle: metadataPayload, userIds});

      try {
        const filePayload = MessageBuilder.createFileData({
          conversationId,
          from: this.account.clientId,
          file,
          asset: await this.account.service!.asset.uploadFileAsset(file),
          originalMessageId: metadataPayload.id,
        });
        await this.account.service.conversation.send({payloadBundle: filePayload, userIds});
      } catch (error) {
        const abortPayload = await MessageBuilder.createFileAbort({
          conversationId,
          from: this.account.clientId,
          reason: Asset.NotUploaded.FAILED,
          originalMessageId: metadataPayload.id,
        });
        await this.account.service.conversation.send({payloadBundle: abortPayload, userIds});
      }
    }
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  async sendImage(conversationId: string, image: ImageContent, userIds?: string[] | UserClients): Promise<void> {
    if (this.account?.service) {
      const imagePayload = MessageBuilder.createImage({
        conversationId,
        from: this.account.clientId,
        image,
        imageAsset: await this.account.service!.asset.uploadImageAsset(image),
      });
      await this.account.service.conversation.send({payloadBundle: imagePayload, userIds});
    }
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  async sendLocation(
    conversationId: string,
    location: LocationContent,
    userIds?: string[] | UserClients,
  ): Promise<void> {
    if (this.account?.service) {
      const locationPayload = MessageBuilder.createLocation({
        conversationId,
        from: this.account.clientId,
        location,
      });
      await this.account.service.conversation.send({payloadBundle: locationPayload, userIds});
    }
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  async sendPing(conversationId: string, userIds?: string[] | UserClients): Promise<void> {
    if (this.account?.service) {
      const pingPayload = MessageBuilder.createPing({conversationId, from: this.account.clientId});
      await this.account.service.conversation.send({payloadBundle: pingPayload, userIds});
    }
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  async sendReaction(
    conversationId: string,
    originalMessageId: string,
    type: ReactionType,
    userIds?: string[] | UserClients,
  ): Promise<void> {
    if (this.account?.service) {
      const reactionPayload = MessageBuilder.createReaction({
        conversationId,
        from: this.account.clientId,
        reaction: {
          originalMessageId,
          type,
        },
      });
      await this.account.service.conversation.send({payloadBundle: reactionPayload, userIds});
    }
  }

  async sendQuote(
    conversationId: string,
    quotedMessage: QuotableMessage,
    text: string,
    userIds?: string[] | UserClients,
  ): Promise<void> {
    if (this.account?.service) {
      const replyPayload = MessageBuilder.createText({conversationId, text, from: this.account.clientId})
        .withQuote(quotedMessage)
        .build();
      await this.account.service.conversation.send({payloadBundle: replyPayload, userIds});
    }
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  sendReply(
    conversationId: string,
    quotedMessage: QuotableMessage,
    text: string,
    userIds?: string[] | UserClients,
  ): Promise<void> {
    return this.sendQuote(conversationId, quotedMessage, text, userIds);
  }

  /**
   * @param userIds Only send message to specified user IDs or to certain clients of specified user IDs
   */
  async sendText(
    conversationId: string,
    text: string,
    mentions?: MentionContent[],
    linkPreview?: LinkPreviewContent,
    userIds?: string[] | UserClients,
  ): Promise<void> {
    if (this.account?.service) {
      const payload = MessageBuilder.createText({conversationId, text, from: this.account.clientId})
        .withMentions(mentions)
        .build();
      const sentMessage = await this.account.service.conversation.send({payloadBundle: payload, userIds});

      if (linkPreview) {
        const editedWithPreviewPayload = MessageBuilder.createText({
          conversationId,
          text,
          from: this.account.clientId,
          messageId: sentMessage.id,
        })
          .withLinkPreviews([await this.account.service!.linkPreview.uploadLinkPreviewImage(linkPreview)])
          .withMentions(mentions)
          .build();

        await this.account.service.conversation.send({payloadBundle: editedWithPreviewPayload, userIds});
      }
    }
  }

  async sendTyping(conversationId: string, status: CONVERSATION_TYPING): Promise<void> {
    if (this.account?.service) {
      if (status === CONVERSATION_TYPING.STARTED) {
        await this.account.service.conversation.sendTypingStart(conversationId);
      } else {
        await this.account.service.conversation.sendTypingStop(conversationId);
      }
    }
  }
}
