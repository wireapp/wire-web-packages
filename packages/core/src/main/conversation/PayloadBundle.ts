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

import {ClientActionType} from '../conversation/root';

import {Connection} from '@wireapp/api-client/dist/commonjs/connection';
import {
  AssetContent,
  ClientActionContent,
  ConfirmationContent,
  DeletedContent,
  EditedTextContent,
  HiddenContent,
  ImageAssetContent,
  ImageContent,
  ReactionContent,
  TextContent,
} from '../conversation/content/';

enum PayloadBundleState {
  INCOMING = 'PayloadBundleState.INCOMING',
  OUTGOING_SENT = 'PayloadBundleState.OUTGOING_SENT',
  OUTGOING_UNSENT = 'PayloadBundleState.OUTGOING_UNSENT',
}

type PayloadBundleIncoming = PayloadBundle & {
  conversation: string;
  messageTimer: number;
  state: PayloadBundleState.INCOMING;
};
type PayloadBundleOutgoing = PayloadBundle & {
  conversation: string;
  messageTimer: number;
  state: PayloadBundleState.OUTGOING_SENT;
};
type PayloadBundleOutgoingUnsent = PayloadBundle & {state: PayloadBundleState.OUTGOING_UNSENT};

interface PayloadBundle {
  content?:
    | AssetContent
    | ClientActionContent
    | ClientActionType
    | ConfirmationContent
    | Connection
    | DeletedContent
    | EditedTextContent
    | HiddenContent
    | ImageAssetContent
    | ImageContent
    | ReactionContent
    | TextContent;
  from: string;
  id: string;
  state: PayloadBundleState;
  timestamp: number;
  type: PayloadBundleType;
}

enum PayloadBundleType {
  ASSET = 'PayloadBundleType.ASSET',
  AVAILABILITY = 'PayloadBundleType.AVAILABILITY',
  CALL = 'PayloadBundleType.CALL',
  CLIENT_ACTION = 'PayloadBundleType.CLIENT_ACTION',
  CONFIRMATION = 'PayloadBundleType.CONFIRMATION',
  CONNECTION = 'PayloadBundleType.CONNECTION',
  CONVERSATION_CLEAR = 'PayloadBundleType.CONVERSATION_CLEAR',
  CONVERSATION_RENAME = 'PayloadBundleType.CONVERSATION_RENAME',
  DELETED = 'PayloadBundleType.DELETED',
  HIDDEN = 'PayloadBundleType.HIDDEN',
  IMAGE = 'PayloadBundleType.IMAGE',
  LAST_READ_UPDATE = 'PayloadBundleType.LAST_READ_UPDATE',
  LOCATION = 'PayloadBundleType.LOCATION',
  MEMBER_JOIN = 'PayloadBundleType.MEMBER_JOIN',
  MESSAGE_EDIT = 'PayloadBundleType.MESSAGE_EDIT',
  MESSAGE_TIMER_UPDATE = 'PayloadBundleType.MESSAGE_TIMER_UPDATE',
  PING = 'PayloadBundleType.PING',
  REACTION = 'PayloadBundleType.REACTION',
  TEXT_MESSAGE = 'PayloadBundleType.TEXT_MESSAGE',
  TYPING = 'PayloadBundleType.TYPING',
  UNKNOWN = 'PayloadBundleType.UNKNOWN',
}

export {
  PayloadBundle,
  PayloadBundleType,
  PayloadBundleIncoming,
  PayloadBundleOutgoing,
  PayloadBundleOutgoingUnsent,
  PayloadBundleState,
};
