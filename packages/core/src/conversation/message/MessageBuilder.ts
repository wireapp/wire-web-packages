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

import {QualifiedId} from '@wireapp/api-client/lib/user';
import {genV4} from 'uuidjs';

import {
  IComposite,
  Asset,
  ButtonAction,
  ButtonActionConfirmation,
  Calling,
  ClientAction,
  Composite,
  Confirmation,
  DataTransfer,
  Ephemeral,
  GenericMessage,
  Knock,
  Location,
  MessageDelete,
  MessageEdit,
  MessageHide,
  Reaction,
  LastRead,
  Cleared,
  IConfirmation,
  IButtonActionConfirmation,
  IButtonAction,
  IMessageEdit,
  IKnock,
  ICalling,
  IMessageDelete,
  IMessageHide,
} from '@wireapp/protocol-messaging';

import {AssetTransferState} from '../AssetTransferState';
import {
  FileAssetAbortContent,
  FileAssetContent,
  FileAssetMetaDataContent,
  ImageAssetContent,
  LocationContent,
  ReactionContent,
  TextContent,
} from '../content';
import {GenericMessageType} from '../GenericMessageType';
import {MessageToProtoMapper} from '../message/MessageToProtoMapper';

export function createId() {
  return genV4().toString();
}

export function buildButtonActionMessage(payload: IButtonAction): GenericMessage {
  return GenericMessage.create({
    [GenericMessageType.BUTTON_ACTION]: ButtonAction.create(payload),
    messageId: createId(),
  });
}

export function buildButtonActionConfirmationMessage(payload: IButtonActionConfirmation): GenericMessage {
  return GenericMessage.create({
    [GenericMessageType.BUTTON_ACTION_CONFIRMATION]: ButtonActionConfirmation.create(payload),
    messageId: createId(),
  });
}

export function buildCompositeMessage(payload: IComposite): GenericMessage {
  return GenericMessage.create({
    [GenericMessageType.COMPOSITE]: Composite.create(payload),
    messageId: createId(),
  });
}

export function buildConfirmationMessage(payload: IConfirmation): GenericMessage {
  const content = Confirmation.create(payload);

  return GenericMessage.create({
    [GenericMessageType.CONFIRMATION]: content,
    messageId: createId(),
  });
}

export function buildEditedTextMessage(payload: IMessageEdit, messageId: string = createId()): GenericMessage {
  const editedMessage = MessageEdit.create(payload);

  return GenericMessage.create({
    [GenericMessageType.EDITED]: editedMessage,
    messageId,
  });
}

export function buildFileDataMessage(payload: FileAssetContent, messageId: string = createId()): GenericMessage {
  const {asset, expectsReadConfirmation, legalHoldStatus} = payload;

  const remoteData = Asset.RemoteData.create({
    assetId: asset.key,
    assetToken: asset.token,
    otrKey: asset.keyBytes,
    sha256: asset.sha256,
    assetDomain: asset.domain,
  });

  const assetMessage = Asset.create({
    expectsReadConfirmation,
    legalHoldStatus,
    uploaded: remoteData,
  });

  assetMessage.status = AssetTransferState.UPLOADED;

  const genericMessage = GenericMessage.create({
    [GenericMessageType.ASSET]: assetMessage,
    messageId,
  });

  return genericMessage;
}

export function buildFileMetaDataMessage(payload: FileAssetMetaDataContent): GenericMessage {
  const {expectsReadConfirmation, legalHoldStatus, metaData} = payload;

  const original = Asset.Original.create({
    audio: metaData.audio,
    mimeType: metaData.type,
    name: metaData.name,
    size: metaData.length,
    video: metaData.video,
    image: metaData.image,
  });

  const assetMessage = Asset.create({
    expectsReadConfirmation,
    legalHoldStatus,
    original,
  });

  const genericMessage = GenericMessage.create({
    [GenericMessageType.ASSET]: assetMessage,
    messageId: createId(),
  });

  return genericMessage;
}

export function buildFileAbortMessage(payload: FileAssetAbortContent, messageId: string = createId()): GenericMessage {
  const {expectsReadConfirmation, legalHoldStatus, reason} = payload;

  const assetMessage = Asset.create({
    expectsReadConfirmation,
    legalHoldStatus,
    notUploaded: reason,
  });

  assetMessage.status = AssetTransferState.NOT_UPLOADED;

  const genericMessage = GenericMessage.create({
    [GenericMessageType.ASSET]: assetMessage,
    messageId,
  });

  return genericMessage;
}

export function buildLastReadMessage(conversationId: QualifiedId, lastReadTimestamp: number) {
  const lastRead = new LastRead({
    conversationId: conversationId.id,
    lastReadTimestamp,
  });

  return GenericMessage.create({
    [GenericMessageType.LAST_READ]: lastRead,
    messageId: createId(),
  });
}

export function buildDataTransferMessage(identifier: string) {
  const dataTransfer = new DataTransfer({
    trackingIdentifier: {
      identifier,
    },
  });

  return new GenericMessage({
    [GenericMessageType.DATA_TRANSFER]: dataTransfer,
    messageId: createId(),
  });
}

export function buildClearedMessage(conversationId: QualifiedId, timestamp: number = Date.now()) {
  const clearedMessage = Cleared.create({
    clearedTimestamp: timestamp,
    conversationId: conversationId.id,
  });

  return GenericMessage.create({
    [GenericMessageType.CLEARED]: clearedMessage,
    messageId: createId(),
  });
}

export function buildImageMessage(payload: ImageAssetContent, messageId: string = createId()): GenericMessage {
  const imageAsset = buildAsset(payload);

  const genericMessage = GenericMessage.create({
    [GenericMessageType.ASSET]: imageAsset,
    messageId,
  });

  return genericMessage;
}
export function buildLocationMessage(payload: LocationContent): GenericMessage {
  const {expectsReadConfirmation, latitude, legalHoldStatus, longitude, name, zoom} = payload;

  const locationMessage = Location.create({
    expectsReadConfirmation,
    latitude,
    legalHoldStatus,
    longitude,
    name,
    zoom,
  });

  const genericMessage = GenericMessage.create({
    [GenericMessageType.LOCATION]: locationMessage,
    messageId: createId(),
  });

  return genericMessage;
}
export function buildPingMessage(payload: IKnock): GenericMessage {
  const content = Knock.create(payload);

  const genericMessage = GenericMessage.create({
    [GenericMessageType.KNOCK]: content,
    messageId: createId(),
  });

  return genericMessage;
}

export function buildReactionMessage(payload: ReactionContent): GenericMessage {
  const {legalHoldStatus, originalMessageId, type} = payload;

  const reaction = Reaction.create({
    emoji: type,
    legalHoldStatus,
    messageId: originalMessageId,
  });

  const genericMessage = GenericMessage.create({
    [GenericMessageType.REACTION]: reaction,
    messageId: createId(),
  });
  return genericMessage;
}

export function buildSessionResetMessage(): GenericMessage {
  return GenericMessage.create({
    [GenericMessageType.CLIENT_ACTION]: ClientAction.RESET_SESSION,
    messageId: createId(),
  });
}

export function buildCallMessage(payload: ICalling): GenericMessage {
  const callMessage = Calling.create(payload);

  return GenericMessage.create({
    [GenericMessageType.CALLING]: callMessage,
    messageId: createId(),
  });
}

export function buildDeleteMessage(payload: IMessageDelete): GenericMessage {
  const content = MessageDelete.create(payload);

  return GenericMessage.create({
    [GenericMessageType.DELETED]: content,
    messageId: createId(),
  });
}

export function buildHideMessage(payload: IMessageHide): GenericMessage {
  const content = MessageHide.create(payload);

  return GenericMessage.create({
    [GenericMessageType.HIDDEN]: content,
    messageId: createId(),
  });
}

export function buildTextMessage(payload: TextContent, messageId: string = createId()): GenericMessage {
  const genericMessage = GenericMessage.create({
    messageId,
    [GenericMessageType.TEXT]: MessageToProtoMapper.mapText(payload),
  });

  return genericMessage;
}

function buildAsset(payload: ImageAssetContent): Asset {
  const {asset, expectsReadConfirmation, image, legalHoldStatus} = payload;

  const imageMetadata = Asset.ImageMetaData.create({
    height: image.height,
    width: image.width,
  });

  const original = Asset.Original.create({
    [GenericMessageType.IMAGE]: imageMetadata,
    mimeType: image.type,
    name: null,
    size: image.data.length,
  });

  const remoteData = Asset.RemoteData.create({
    assetId: asset.key,
    assetToken: asset.token,
    assetDomain: asset.domain,
    otrKey: asset.keyBytes,
    sha256: asset.sha256,
  });

  const assetMessage = Asset.create({
    expectsReadConfirmation,
    legalHoldStatus,
    original,
    uploaded: remoteData,
  });

  assetMessage.status = AssetTransferState.UPLOADED;

  return assetMessage;
}

export function wrapInEphemeral(originalGenericMessage: GenericMessage, expireAfterMillis: number): GenericMessage {
  const ephemeralMessage = Ephemeral.create({
    expireAfterMillis,
    [originalGenericMessage.content!]: originalGenericMessage[originalGenericMessage.content!],
  });

  const genericMessage = GenericMessage.create({
    [GenericMessageType.EPHEMERAL]: ephemeralMessage,
    messageId: originalGenericMessage.messageId,
  });

  return genericMessage;
}
