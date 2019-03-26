/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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

import {APIClient} from '@wireapp/api-client';
import {ClientAction, Confirmation} from '@wireapp/protocol-messaging';
import {AbortReason, PayloadBundleOutgoingUnsent, PayloadBundleState, PayloadBundleType, ReactionType} from '.';
import {AssetService} from './AssetService';
import {
  ClientActionContent,
  ConfirmationContent,
  EditedTextContent,
  FileAssetAbortContent,
  FileAssetContent,
  FileAssetMetaDataContent,
  FileContent,
  FileMetaDataContent,
  ImageAssetContent,
  ImageContent,
  KnockContent,
  LinkPreviewContent,
  LinkPreviewUploadedContent,
  LocationContent,
  ReactionContent,
  TextContent,
} from './content';
import {TextContentBuilder} from './TextContentBuilder';

const UUID = require('pure-uuid');

class MessageBuilder {
  constructor(private readonly apiClient: APIClient, private readonly assetService: AssetService) {}

  public createEditedText(
    newMessageText: string,
    originalMessageId: string,
    messageId: string = MessageBuilder.createId(),
    conversationId: string
  ): TextContentBuilder {
    const content: EditedTextContent = {
      originalMessageId,
      text: newMessageText,
    };

    const payloadBundle: PayloadBundleOutgoingUnsent = {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.MESSAGE_EDIT,
    };

    return new TextContentBuilder(payloadBundle);
  }

  public async createFileData(
    conversationId: string,
    file: FileContent,
    originalMessageId: string,
    expectsReadConfirmation?: boolean
  ): Promise<PayloadBundleOutgoingUnsent> {
    const imageAsset = await this.assetService.uploadFileAsset(file);

    const content: FileAssetContent = {
      asset: imageAsset,
      expectsReadConfirmation,
      file,
    };

    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: originalMessageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET,
    };
  }

  public createFileMetadata(
    conversationId: string,
    metaData: FileMetaDataContent,
    expectsReadConfirmation?: boolean,
    messageId: string = MessageBuilder.createId()
  ): PayloadBundleOutgoingUnsent {
    const content: FileAssetMetaDataContent = {
      expectsReadConfirmation,
      metaData,
    };

    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_META,
    };
  }

  public async createFileAbort(
    conversationId: string,
    reason: AbortReason,
    originalMessageId: string,
    expectsReadConfirmation?: boolean
  ): Promise<PayloadBundleOutgoingUnsent> {
    const content: FileAssetAbortContent = {
      expectsReadConfirmation,
      reason,
    };

    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: originalMessageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_ABORT,
    };
  }

  public async createImage(
    conversationId: string,
    image: ImageContent,
    expectsReadConfirmation?: boolean,
    messageId: string = MessageBuilder.createId()
  ): Promise<PayloadBundleOutgoingUnsent> {
    const imageAsset = await this.assetService.uploadImageAsset(image);

    const content: ImageAssetContent = {
      asset: imageAsset,
      expectsReadConfirmation,
      image,
    };

    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_IMAGE,
    };
  }

  public async createLinkPreview(linkPreview: LinkPreviewContent): Promise<LinkPreviewUploadedContent> {
    const linkPreviewUploaded: LinkPreviewUploadedContent = {
      ...linkPreview,
    };

    const linkPreviewImage = linkPreview.image;

    if (linkPreviewImage) {
      const imageAsset = await this.assetService.uploadImageAsset(linkPreviewImage);

      delete linkPreviewUploaded.image;

      linkPreviewUploaded.imageUploaded = {
        asset: imageAsset,
        image: linkPreviewImage,
      };
    }

    return linkPreviewUploaded;
  }

  public createLocation(
    location: LocationContent,
    messageId: string = MessageBuilder.createId(),
    conversationId: string
  ): PayloadBundleOutgoingUnsent {
    return {
      content: location,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.LOCATION,
    };
  }

  public createReaction(
    conversationId: string,
    originalMessageId: string,
    type: ReactionType,
    messageId: string = MessageBuilder.createId()
  ): PayloadBundleOutgoingUnsent {
    const content: ReactionContent = {originalMessageId, type};

    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.REACTION,
    };
  }

  public createText(
    conversationId: string,
    text: string,
    messageId: string = MessageBuilder.createId()
  ): TextContentBuilder {
    const content: TextContent = {text};

    const payloadBundle: PayloadBundleOutgoingUnsent = {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.TEXT,
    };

    return new TextContentBuilder(payloadBundle);
  }

  public createConfirmationDelivered(
    conversationId: string,
    firstMessageId: string,
    moreMessageIds?: string[],
    messageId: string = MessageBuilder.createId()
  ): PayloadBundleOutgoingUnsent {
    const content: ConfirmationContent = {firstMessageId, moreMessageIds, type: Confirmation.Type.DELIVERED};
    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CONFIRMATION,
    };
  }

  public createConfirmationRead(
    conversationId: string,
    firstMessageId: string,
    moreMessageIds?: string[],
    messageId: string = MessageBuilder.createId()
  ): PayloadBundleOutgoingUnsent {
    const content: ConfirmationContent = {firstMessageId, moreMessageIds, type: Confirmation.Type.READ};
    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CONFIRMATION,
    };
  }

  public createPing(
    conversationId: string,
    ping?: KnockContent,
    messageId: string = MessageBuilder.createId()
  ): PayloadBundleOutgoingUnsent {
    return {
      content: ping,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.PING,
    };
  }

  public createSessionReset(
    conversationId: string,
    messageId: string = MessageBuilder.createId()
  ): PayloadBundleOutgoingUnsent {
    const content: ClientActionContent = {
      clientAction: ClientAction.RESET_SESSION,
    };
    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CLIENT_ACTION,
    };
  }

  public static createId(): string {
    return new UUID(4).format();
  }

  private getSelfUserId(): string {
    return this.apiClient.context!.userId;
  }
}

export {MessageBuilder};
