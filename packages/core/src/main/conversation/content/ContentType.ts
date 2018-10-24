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
import {Connection} from '@wireapp/api-client/dist/commonjs/connection/';
import {ClientActionType} from '../';
import {
  AssetContent,
  ClearedContent,
  ClientActionContent,
  ConfirmationContent,
  ConversationContent,
  DeletedContent,
  EditedTextContent,
  FileAssetAbortContent,
  FileAssetContent,
  FileAssetMetaDataContent,
  HiddenContent,
  ImageAssetContent,
  ImageContent,
  LocationContent,
  ReactionContent,
  TextContent,
} from '../content/';

export const isAbortedAssetContent = (content: ConversationContent): content is AssetContent =>
  !!(content as AssetContent).abortReason;
export const isAssetContent = (content: ConversationContent): content is AssetContent =>
  !!((content as AssetContent).uploaded || (content as AssetContent).preview);
export const isClearedContent = (content: ConversationContent): content is ClearedContent =>
  !!(content as ClearedContent).clearedTimestamp;
export const isClientActionContent = (content: ConversationContent): content is ClientActionContent =>
  !!(content as ClientActionContent).clientAction;
export const isClientActionType = (content: ConversationContent): content is ClientActionType =>
  typeof content === 'number';
export const isConfirmationContent = (content: ConversationContent): content is ConfirmationContent =>
  !!(content as ConfirmationContent).confirmMessageId;
export const isConnection = (content: ConversationContent): content is Connection =>
  !!(content as Connection).from && !!(content as Connection).to;
export const isDeletedContent = (content: ConversationContent): content is DeletedContent =>
  !!(content as DeletedContent).originalMessageId && !(content as any).text;
export const isEditedTextContent = (content: ConversationContent): content is EditedTextContent =>
  !!(content as EditedTextContent).text && !!(content as EditedTextContent).originalMessageId;
export const isFileAssetAbortContent = (content: ConversationContent): content is FileAssetAbortContent =>
  !!(content as FileAssetAbortContent).reason;
export const isFileAssetContent = (content: ConversationContent): content is FileAssetContent =>
  !!(content as FileAssetContent).asset && !!(content as FileAssetContent).file;
export const isFileAssetMetaDataContent = (content: ConversationContent): content is FileAssetMetaDataContent =>
  !!(content as FileAssetMetaDataContent).metaData;
export const isHiddenContent = (content: ConversationContent): content is HiddenContent =>
  !!(content as HiddenContent).conversationId;
export const isImageAssetContent = (content: ConversationContent): content is ImageAssetContent =>
  !!(content as ImageAssetContent).asset && !!(content as ImageAssetContent).image;
export const isImageContent = (content: ConversationContent): content is ImageContent =>
  !!(content as ImageContent).data && !!(content as ImageContent).type;
export const isLocationContent = (content: ConversationContent): content is LocationContent =>
  !!(content as LocationContent).latitude && !!(content as LocationContent).longitude;
export const isReactionContent = (content: ConversationContent): content is ReactionContent =>
  !!(content as ReactionContent).type && !!(content as ReactionContent).originalMessageId;
export const isTextContent = (content: ConversationContent): content is TextContent => !!(content as TextContent).text;
