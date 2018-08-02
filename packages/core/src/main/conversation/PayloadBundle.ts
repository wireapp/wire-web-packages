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
  ASSET = 'Account.INCOMING.ASSET',
  AVAILABILITY = 'Account.INCOMING.AVAILABILITY',
  CALL = 'Account.INCOMING.CALL',
  CLIENT_ACTION = 'Account.INCOMING.CLIENT_ACTION',
  CONFIRMATION = 'Account.INCOMING.CONFIRMATION',
  CONNECTION = 'Account.INCOMING.CONNECTION',
  CONVERSATION_CLEAR = 'Account.INCOMING.CONVERSATION_CLEAR',
  CONVERSATION_RENAME = 'Account.INCOMING.CONVERSATION_RENAME',
  DELETED = 'Account.INCOMING.DELETED',
  HIDDEN = 'Account.INCOMING.HIDDEN',
  IMAGE = 'Account.INCOMING.IMAGE',
  LAST_READ_UPDATE = 'Account.INCOMING.LAST_READ_UPDATE',
  LOCATION = 'Account.INCOMING.LOCATION',
  MEMBER_JOIN = 'Account.INCOMING.MEMBER_JOIN',
  MESSAGE_EDIT = 'Account.INCOMING.MESSAGE_EDIT',
  MESSAGE_TIMER_UPDATE = 'Account.INCOMING.MESSAGE_TIMER_UPDATE',
  PING = 'Account.INCOMING.PING',
  REACTION = 'Account.INCOMING.REACTION',
  TEXT_MESSAGE = 'Account.INCOMING.TEXT_MESSAGE',
  TYPING = 'Account.INCOMING.TYPING',
  UNKNOWN = 'Account.INCOMING.UNKNOWN',
}

export {
  PayloadBundle,
  PayloadBundleType,
  PayloadBundleIncoming,
  PayloadBundleOutgoing,
  PayloadBundleOutgoingUnsent,
  PayloadBundleState,
};
