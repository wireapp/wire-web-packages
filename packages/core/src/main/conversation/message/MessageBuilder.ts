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

import type {CipherOptions} from '@wireapp/api-client/src/asset';
import {ClientAction, Confirmation} from '@wireapp/protocol-messaging';
import UUID from 'uuidjs';

import {AbortReason, PayloadBundleSource, PayloadBundleState, PayloadBundleType} from '..';
import {EncryptedAssetUploaded} from '../../cryptography';
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
  from: string;
  messageId?: string;
}

interface CreateImageOptions extends BaseOptions {
  cipherOptions?: CipherOptions;
  expectsReadConfirmation?: boolean;
  imageAsset: EncryptedAssetUploaded;
  image: ImageContent;
  legalHoldStatus?: LegalHoldStatus;
}

interface CreateFileOptions {
  cipherOptions?: CipherOptions;
  conversationId: string;
  expectsReadConfirmation?: boolean;
  asset: EncryptedAssetUploaded;
  file: FileContent;
  from: string;
  legalHoldStatus?: LegalHoldStatus;
  originalMessageId: string;
}

interface CreateEditedTextOptions extends BaseOptions {
  newMessageText: string;
  originalMessageId: string;
}

interface CreateFileMetadataOptions extends BaseOptions {
  expectsReadConfirmation?: boolean;
  legalHoldStatus?: LegalHoldStatus;
  metaData: FileMetaDataContent;
}

interface CreateFileAbortOptions {
  conversationId: string;
  expectsReadConfirmation?: boolean;
  from: string;
  legalHoldStatus?: LegalHoldStatus;
  originalMessageId: string;
  reason: AbortReason;
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
  moreMessageIds?: string[];
  type: Confirmation.Type;
}

interface CreatePingOptions extends BaseOptions {
  ping?: KnockContent;
}

interface CreateButtonActionConfirmationOptions extends BaseOptions {
  content: ButtonActionConfirmationContent;
}

interface CreateActionMessageOptions extends BaseOptions {
  content: ButtonActionContent;
}

export class MessageBuilder {
  public static createEditedText({
    conversationId,
    messageId = MessageBuilder.createId(),
    newMessageText,
    originalMessageId,
    from,
  }: CreateEditedTextOptions): TextContentBuilder {
    const content: EditedTextContent = {
      originalMessageId,
      text: newMessageText,
    };

    const payloadBundle: EditedTextMessage = {
      content,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.MESSAGE_EDIT,
    };

    return new TextContentBuilder(payloadBundle);
  }

  public createFileData({
    conversationId,
    expectsReadConfirmation,
    file,
    from,
    asset,
    legalHoldStatus,
    originalMessageId,
  }: CreateFileOptions): FileAssetMessage {
    const content: FileAssetContent = {
      asset,
      expectsReadConfirmation,
      file,
      legalHoldStatus,
    };

    return {
      content,
      conversation: conversationId,
      from,
      id: originalMessageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET,
    };
  }

  public static createFileMetadata({
    conversationId,
    expectsReadConfirmation,
    legalHoldStatus,
    messageId = MessageBuilder.createId(),
    metaData,
    from,
  }: CreateFileMetadataOptions): FileAssetMetaDataMessage {
    const content: FileAssetMetaDataContent = {
      expectsReadConfirmation,
      legalHoldStatus,
      metaData,
    };

    return {
      content,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_META,
    };
  }

  public async createFileAbort({
    conversationId,
    expectsReadConfirmation,
    from,
    legalHoldStatus,
    originalMessageId,
    reason,
  }: CreateFileAbortOptions): Promise<FileAssetAbortMessage> {
    const content: FileAssetAbortContent = {
      expectsReadConfirmation,
      legalHoldStatus,
      reason,
    };

    return {
      content,
      conversation: conversationId,
      from,
      id: originalMessageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_ABORT,
    };
  }

  public static createImage({
    conversationId,
    expectsReadConfirmation,
    from,
    image,
    imageAsset,
    legalHoldStatus,
    messageId = MessageBuilder.createId(),
  }: CreateImageOptions): ImageAssetMessageOutgoing {
    const content: ImageAssetContent = {
      asset: imageAsset,
      expectsReadConfirmation,
      image,
      legalHoldStatus,
    };

    return {
      content,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_IMAGE,
    };
  }

  public static createLocation({
    conversationId,
    location,
    from,
    messageId = MessageBuilder.createId(),
  }: CreateLocationOptions): LocationMessage {
    return {
      content: location,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.LOCATION,
    };
  }

  public static createCall({
    content,
    from,
    conversationId,
    messageId = MessageBuilder.createId(),
  }: CreateCallOptions): CallMessage {
    return {
      content,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CALL,
    };
  }

  public static createReaction({
    conversationId,
    from,
    messageId = MessageBuilder.createId(),
    reaction,
  }: CreateReactionOptions): ReactionMessage {
    return {
      content: reaction,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.REACTION,
    };
  }

  public static createText({
    conversationId,
    from,
    messageId = MessageBuilder.createId(),
    text,
  }: CreateTextOptions): TextContentBuilder {
    const content: TextContent = {text};

    const payloadBundle: TextMessage = {
      content,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.TEXT,
    };

    return new TextContentBuilder(payloadBundle);
  }

  public static createConfirmation({
    conversationId,
    firstMessageId,
    from,
    messageId = MessageBuilder.createId(),
    moreMessageIds,
    type,
  }: CreateConfirmationOptions): ConfirmationMessage {
    const content: ConfirmationContent = {firstMessageId, moreMessageIds, type};
    return {
      content,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CONFIRMATION,
    };
  }

  createButtonActionMessage({
    content,
    conversationId,
    from,
    messageId = MessageBuilder.createId(),
  }: CreateActionMessageOptions): ButtonActionMessage {
    return {
      content,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.BUTTON_ACTION,
    };
  }

  createButtonActionConfirmationMessage({
    content,
    from,
    conversationId,
    messageId = MessageBuilder.createId(),
  }: CreateButtonActionConfirmationOptions): ButtonActionConfirmationMessage {
    return {
      content,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.BUTTON_ACTION_CONFIRMATION,
    };
  }

  createComposite({conversationId, from, messageId = MessageBuilder.createId()}: BaseOptions): CompositeContentBuilder {
    const content: CompositeContent = {};

    const payloadBundle: CompositeMessage = {
      content,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.COMPOSITE,
    };
    return new CompositeContentBuilder(payloadBundle);
  }

  public static createPing({
    conversationId,
    from,
    messageId = MessageBuilder.createId(),
    ping = {
      hotKnock: false,
    },
  }: CreatePingOptions): PingMessage {
    return {
      content: ping,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.PING,
    };
  }

  public static createSessionReset({
    conversationId,
    from,
    messageId = MessageBuilder.createId(),
  }: BaseOptions): ResetSessionMessage {
    const content: ClientActionContent = {
      clientAction: ClientAction.RESET_SESSION,
    };

    return {
      content,
      conversation: conversationId,
      from,
      id: messageId,
      source: PayloadBundleSource.LOCAL,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CLIENT_ACTION,
    };
  }

  public static createLinkPreview(linkPreview: LinkPreviewContent): LinkPreviewUploadedContent {
    if (linkPreview.image && linkPreview.imageAsset) {
      return {
        ...linkPreview,
        imageUploaded: {
          asset: linkPreview.imageAsset,
          image: linkPreview.image,
        },
      };
    }

    return linkPreview;
  }

  public static createId(): string {
    return UUID.genV4().toString();
  }
}
