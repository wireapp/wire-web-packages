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

import {CONVERSATION_TYPING} from '@wireapp/api-client/dist/commonjs/event/';
import {Account} from '@wireapp/core';
import {PayloadBundleIncoming, ReactionType} from '@wireapp/core/dist/conversation/';
import {
  FileContent,
  FileMetaDataContent,
  ImageContent,
  LinkPreviewContent,
  LocationContent,
  MentionContent,
} from '@wireapp/core/dist/conversation/content/';
import {Asset} from '@wireapp/protocol-messaging';

abstract class MessageHandler {
  public account: Account | undefined = undefined;

  abstract handleEvent(payload: PayloadBundleIncoming): void;

  public async addUser(conversationId: string, userId: string): Promise<void> {
    if (this.account && this.account.service) {
      await this.account.service.conversation.addUser(conversationId, userId);
    }
  }

  async clearConversation(conversationId: string): Promise<void> {
    if (this.account && this.account.service) {
      await this.account.service.conversation.clearConversation(conversationId);
    }
  }

  public async removeUser(conversationId: string, userId: string): Promise<void> {
    if (this.account && this.account.service) {
      await this.account.service.conversation.removeUser(conversationId, userId);
    }
  }

  public async sendConfirmation(conversationId: string, confirmMessageId: string): Promise<void> {
    if (this.account && this.account.service) {
      const confirmationPayload = this.account.service.conversation.createConfirmation(confirmMessageId);
      await this.account.service.conversation.send(conversationId, confirmationPayload);
    }
  }

  public async sendConnectionRequest(userId: string): Promise<void> {
    if (this.account && this.account.service) {
      await this.account.service.connection.createConnection(userId);
    }
  }

  public async sendConnectionResponse(userId: string, accept: boolean): Promise<void> {
    if (this.account && this.account.service) {
      if (accept) {
        await this.account.service.connection.acceptConnection(userId);
      } else {
        await this.account.service.connection.ignoreConnection(userId);
      }
    }
  }

  public async sendEditedText(
    conversationId: string,
    originalMessageId: string,
    newMessageText: string,
    newMentions?: MentionContent[],
    newLinkPreview?: LinkPreviewContent,
    userIds?: string[]
  ): Promise<void> {
    if (this.account && this.account.service) {
      const editedPayload = this.account.service.conversation
        .createEditedText(newMessageText, originalMessageId)
        .withMentions(newMentions)
        .build();

      const editedMessage = await this.account.service.conversation.send(conversationId, editedPayload, userIds);

      if (newLinkPreview) {
        const linkPreviewPayload = await this.account.service.conversation.createLinkPreview(newLinkPreview);
        const editedWithPreviewPayload = this.account.service.conversation
          .createEditedText(newMessageText, originalMessageId, editedMessage.id)
          .withLinkPreviews([linkPreviewPayload])
          .withMentions(newMentions)
          .build();

        await this.account.service.conversation.send(conversationId, editedWithPreviewPayload, userIds);
      }
    }
  }

  public async sendFile(conversationId: string, file: FileContent, metadata: FileMetaDataContent): Promise<void> {
    if (this.account && this.account.service) {
      const metadataPayload = this.account.service.conversation.createFileMetadata(metadata);
      await this.account.service.conversation.send(conversationId, metadataPayload);

      try {
        const filePayload = await this.account.service.conversation.createFileData(file, metadataPayload.id);
        await this.account.service.conversation.send(conversationId, filePayload);
      } catch (error) {
        const abortPayload = await this.account.service.conversation.createFileAbort(
          Asset.NotUploaded.FAILED,
          metadataPayload.id
        );
        await this.account.service.conversation.send(conversationId, abortPayload);
      }
    }
  }

  public async sendImage(conversationId: string, image: ImageContent): Promise<void> {
    if (this.account && this.account.service) {
      const imagePayload = await this.account.service.conversation.createImage(image);
      await this.account.service.conversation.send(conversationId, imagePayload);
    }
  }

  public async sendLocation(conversationId: string, location: LocationContent): Promise<void> {
    if (this.account && this.account.service) {
      const locationPayload = this.account.service.conversation.createLocation(location);
      await this.account.service.conversation.send(conversationId, locationPayload);
    }
  }

  public async sendPing(conversationId: string): Promise<void> {
    if (this.account && this.account.service) {
      const pingPayload = this.account.service.conversation.createPing();
      await this.account.service.conversation.send(conversationId, pingPayload);
    }
  }

  public async sendReaction(conversationId: string, originalMessageId: string, type: ReactionType): Promise<void> {
    if (this.account && this.account.service) {
      const reactionPayload = this.account.service.conversation.createReaction(originalMessageId, type);
      await this.account.service.conversation.send(conversationId, reactionPayload);
    }
  }

  public async sendText(
    conversationId: string,
    text: string,
    mentions?: MentionContent[],
    linkPreview?: LinkPreviewContent,
    userIds?: string[]
  ): Promise<void> {
    if (this.account && this.account.service) {
      const payload = await this.account.service.conversation
        .createText(text)
        .withMentions(mentions)
        .build();
      const sentMessage = await this.account.service.conversation.send(conversationId, payload, userIds);

      if (linkPreview) {
        const linkPreviewPayload = await this.account.service.conversation.createLinkPreview(linkPreview);
        const editedWithPreviewPayload = this.account.service.conversation
          .createText(text, sentMessage.id)
          .withLinkPreviews([linkPreviewPayload])
          .withMentions(mentions)
          .build();

        await this.account.service.conversation.send(conversationId, editedWithPreviewPayload, userIds);
      }
    }
  }

  public async sendTyping(conversationId: string, status: CONVERSATION_TYPING): Promise<void> {
    if (this.account && this.account.service) {
      if (status === CONVERSATION_TYPING.STARTED) {
        await this.account.service.conversation.sendTypingStart(conversationId);
      } else {
        await this.account.service.conversation.sendTypingStop(conversationId);
      }
    }
  }
}

export {MessageHandler};
