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

import type {APIClient} from '@wireapp/api-client';
import type {DebugOptions} from '@wireapp/api-client/src/asset';
import {ClientAction, Confirmation} from '@wireapp/protocol-messaging';
import UUID from 'uuidjs';

import {AbortReason, PayloadBundleSource, PayloadBundleState, PayloadBundleType} from '..';
import type {AssetService} from '../AssetService';
import type {
  ButtonActionConfirmationContent,
  ButtonActionContent,
  CallingContent,
  ClientActionContent,
  CompositeContent,
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
  LegalHoldStatus,
  LinkPreviewContent,
  LinkPreviewUploadedContent,
  LocationContent,
  ReactionContent,
  TextContent,
} from '../content';
import {CompositeContentBuilder} from './CompositeContentBuilder';
import type {
  ButtonActionConfirmationMessage,
  ButtonActionMessage,
  CallMessage,
  CompositeMessage,
  ConfirmationMessage,
  EditedTextMessage,
  FileAssetAbortMessage,
  FileAssetMessage,
  FileAssetMetaDataMessage,
  ImageAssetMessageOutgoing,
  LocationMessage,
  PingMessage,
  ReactionMessage,
  ResetSessionMessage,
  TextMessage,
} from './OtrMessage';
import {TextContentBuilder} from './TextContentBuilder';

interface BaseOptions {
  conversationId: string;
  messageId?: string;
}

interface CreateImageOptions extends BaseOptions {
  image: ImageContent;
  expectsReadConfirmation?: boolean;
  legalHoldStatus?: LegalHoldStatus;
  debugOptions?: DebugOptions;
}

interface CreateFileOptions {
  conversationId: string;
  file: FileContent;
  originalMessageId: string;
  expectsReadConfirmation?: boolean;
  legalHoldStatus?: LegalHoldStatus;
  debugOptions?: DebugOptions;
}

interface CreateEditedTextOptions extends BaseOptions {
  newMessageText: string;
  originalMessageId: string;
}

interface CreateFileMetadataOptions extends BaseOptions {
  metaData: FileMetaDataContent;
  expectsReadConfirmation?: boolean;
  legalHoldStatus?: LegalHoldStatus;
}

interface CreateFileAbortOptions {
  conversationId: string;
  reason: AbortReason;
  originalMessageId: string;
  expectsReadConfirmation?: boolean;
  legalHoldStatus?: LegalHoldStatus;
}

interface CreateLocationOptions extends BaseOptions {
  location: LocationContent;
}

interface CreateCallOptions extends BaseOptions {
  content: CallingContent;
}

interface CreateReactionOptions extends BaseOptions {
  reaction: ReactionContent;
}

interface CreateTextOptions extends BaseOptions {
  text: string;
}

interface CreateConfirmationOptions extends BaseOptions {
  firstMessageId: string;
  type: Confirmation.Type;
  moreMessageIds?: string[];
}

interface CreatePingOptions extends BaseOptions {
  ping?: KnockContent;
}

interface CreateConfirmationOptions extends BaseOptions {
  content: ButtonActionConfirmationContent;
}

interface CreateActionMessageOptions extends BaseOptions {
  content: ButtonActionContent;
}

export class MessageBuilder {
  private readonly apiClient: APIClient;
  private readonly assetService: AssetService;

  constructor(apiClient: APIClient, assetService: AssetService) {
    this.apiClient = apiClient;
    this.assetService = assetService;
  }

  public createEditedText({
    conversationId,
    newMessageText,
    originalMessageId,
    messageId = MessageBuilder.createId(),
  }: CreateEditedTextOptions): TextContentBuilder {
    const content: EditedTextContent = {
      originalMessageId,
      text: newMessageText,
    };

    const payloadBundle: EditedTextMessage = {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.MESSAGE_EDIT,
    };

    return new TextContentBuilder(payloadBundle);
  }

  public async createFileData({
    conversationId,
    file,
    originalMessageId,
    expectsReadConfirmation,
    legalHoldStatus,
    debugOptions,
  }: CreateFileOptions): Promise<FileAssetMessage> {
    const imageAsset = await this.assetService.uploadFileAsset(file, {debug: debugOptions});

    const content: FileAssetContent = {
      asset: imageAsset,
      expectsReadConfirmation,
      file,
      legalHoldStatus,
    };

    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: originalMessageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET,
    };
  }

  public createFileMetadata({
    conversationId,
    metaData,
    messageId = MessageBuilder.createId(),
    expectsReadConfirmation,
    legalHoldStatus,
  }: CreateFileMetadataOptions): FileAssetMetaDataMessage {
    const content: FileAssetMetaDataContent = {
      expectsReadConfirmation,
      legalHoldStatus,
      metaData,
    };

    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_META,
    };
  }

  public async createFileAbort({
    conversationId,
    reason,
    originalMessageId,
    expectsReadConfirmation,
    legalHoldStatus,
  }: CreateFileAbortOptions): Promise<FileAssetAbortMessage> {
    const content: FileAssetAbortContent = {
      expectsReadConfirmation,
      legalHoldStatus,
      reason,
    };

    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: originalMessageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_ABORT,
    };
  }

  public async createImage({
    conversationId,
    image,
    messageId = MessageBuilder.createId(),
    expectsReadConfirmation,
    legalHoldStatus,
    debugOptions,
  }: CreateImageOptions): Promise<ImageAssetMessageOutgoing> {
    const imageAsset = await this.assetService.uploadImageAsset(image, {debug: debugOptions});

    const content: ImageAssetContent = {
      asset: imageAsset,
      expectsReadConfirmation,
      image,
      legalHoldStatus,
    };

    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_IMAGE,
    };
  }

  public createLocation({
    conversationId,
    location,
    messageId = MessageBuilder.createId(),
  }: CreateLocationOptions): LocationMessage {
    return {
      content: location,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.LOCATION,
    };
  }

  public createCall({conversationId, content, messageId = MessageBuilder.createId()}: CreateCallOptions): CallMessage {
    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CALL,
    };
  }

  public createReaction({
    conversationId,
    reaction,
    messageId = MessageBuilder.createId(),
  }: CreateReactionOptions): ReactionMessage {
    return {
      content: reaction,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.REACTION,
    };
  }

  public createText({
    conversationId,
    text,
    messageId = MessageBuilder.createId(),
  }: CreateTextOptions): TextContentBuilder {
    const content: TextContent = {text};

    const payloadBundle: TextMessage = {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.TEXT,
    };

    return new TextContentBuilder(payloadBundle);
  }

  public createConfirmation({
    conversationId,
    firstMessageId,
    type,
    messageId = MessageBuilder.createId(),
    moreMessageIds,
  }: CreateConfirmationOptions): ConfirmationMessage {
    const content: ConfirmationContent = {firstMessageId, moreMessageIds, type};
    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CONFIRMATION,
    };
  }

  createButtonActionMessage({
    conversationId,
    content,
    messageId = MessageBuilder.createId(),
  }: CreateActionMessageOptions): ButtonActionMessage {
    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.BUTTON_ACTION,
    };
  }

  createButtonActionConfirmationMessage({
    conversationId,
    content,
    messageId = MessageBuilder.createId(),
  }: CreateConfirmationOptions): ButtonActionConfirmationMessage {
    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.BUTTON_ACTION_CONFIRMATION,
    };
  }

  createComposite({conversationId, messageId = MessageBuilder.createId()}: BaseOptions): CompositeContentBuilder {
    const content: CompositeContent = {};

    const payloadBundle: CompositeMessage = {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.COMPOSITE,
    };
    return new CompositeContentBuilder(payloadBundle);
  }

  public createPing({
    conversationId,
    ping = {
      hotKnock: false,
    },
    messageId = MessageBuilder.createId(),
  }: CreatePingOptions): PingMessage {
    return {
      content: ping,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.PING,
    };
  }

  public createSessionReset({conversationId, messageId = MessageBuilder.createId()}: BaseOptions): ResetSessionMessage {
    const content: ClientActionContent = {
      clientAction: ClientAction.RESET_SESSION,
    };

    return {
      content,
      conversation: conversationId,
      from: this.getSelfUserId(),
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CLIENT_ACTION,
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

  public static createId(): string {
    return UUID.genV4().toString();
  }

  private getSelfUserId(): string {
    return this.apiClient.context!.userId;
  }
}
