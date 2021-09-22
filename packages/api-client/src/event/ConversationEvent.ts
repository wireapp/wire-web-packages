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

import type {
  ConversationAccessUpdateData,
  ConversationCodeUpdateData,
  ConversationConnectRequestData,
  ConversationCreateData,
  ConversationMemberJoinData,
  ConversationMemberLeaveData,
  ConversationMemberUpdateData,
  ConversationMessageTimerUpdateData,
  ConversationOtrMessageAddData,
  ConversationReceiptModeUpdateData,
  ConversationRenameData,
  ConversationTypingData,
} from '../conversation/data/';
import {QualifiedId} from '../user';

export enum CONVERSATION_EVENT {
  ACCESS_UPDATE = 'conversation.access-update',
  CODE_DELETE = 'conversation.code-delete',
  CODE_UPDATE = 'conversation.code-update',
  CONNECT_REQUEST = 'conversation.connect-request',
  CREATE = 'conversation.create',
  DELETE = 'conversation.delete',
  MEMBER_JOIN = 'conversation.member-join',
  MEMBER_LEAVE = 'conversation.member-leave',
  MEMBER_UPDATE = 'conversation.member-update',
  MESSAGE_TIMER_UPDATE = 'conversation.message-timer-update',
  OTR_MESSAGE_ADD = 'conversation.otr-message-add',
  RECEIPT_MODE_UPDATE = 'conversation.receipt-mode-update',
  RENAME = 'conversation.rename',
  TYPING = 'conversation.typing',
}

export type ConversationEventData =
  | ConversationAccessUpdateData
  | ConversationCodeUpdateData
  | ConversationConnectRequestData
  | ConversationCreateData
  | ConversationMemberJoinData
  | ConversationMemberLeaveData
  | ConversationMemberUpdateData
  | ConversationMessageTimerUpdateData
  | ConversationOtrMessageAddData
  | ConversationReceiptModeUpdateData
  | ConversationRenameData
  | ConversationTypingData
  | null;

export type ConversationEvent =
  | ConversationAccessUpdateEvent
  | ConversationCodeDeleteEvent
  | ConversationConnectRequestEvent
  | ConversationCreateEvent
  | ConversationDeleteEvent
  | ConversationMemberJoinEvent
  | ConversationMemberLeaveEvent
  | ConversationMemberUpdateEvent
  | ConversationMessageTimerUpdateEvent
  | ConversationOtrMessageAddEvent
  | ConversationReceiptModeUpdateEvent
  | ConversationRenameEvent
  | ConversationTypingEvent;

export interface BaseConversationEvent {
  conversation: string;
  data: ConversationEventData;
  from: string;
  qualified_conversation?: QualifiedId;
  qualified_from?: QualifiedId;
  time: string;
  server_time?: string;
  type: CONVERSATION_EVENT;
}

export interface ConversationAccessUpdateEvent extends BaseConversationEvent {
  data: ConversationAccessUpdateData;
  type: typeof CONVERSATION_EVENT.ACCESS_UPDATE;
}

export interface ConversationCodeDeleteEvent extends BaseConversationEvent {
  data: null;
  type: typeof CONVERSATION_EVENT.CODE_DELETE;
}

export interface ConversationCodeUpdateEvent extends BaseConversationEvent {
  data: ConversationCodeUpdateData;
  type: typeof CONVERSATION_EVENT.CODE_UPDATE;
}

export interface ConversationConnectRequestEvent extends BaseConversationEvent {
  data: ConversationConnectRequestData;
  type: typeof CONVERSATION_EVENT.CONNECT_REQUEST;
}

export interface ConversationCreateEvent extends BaseConversationEvent {
  data: ConversationCreateData;
  type: typeof CONVERSATION_EVENT.CREATE;
}

export interface ConversationDeleteEvent extends BaseConversationEvent {
  data: null;
  type: typeof CONVERSATION_EVENT.DELETE;
}

export interface ConversationMemberJoinEvent extends BaseConversationEvent {
  data: ConversationMemberJoinData;
  type: typeof CONVERSATION_EVENT.MEMBER_JOIN;
}

export interface ConversationMemberLeaveEvent extends BaseConversationEvent {
  data: ConversationMemberLeaveData;
  type: typeof CONVERSATION_EVENT.MEMBER_LEAVE;
}

export interface ConversationMemberUpdateEvent extends BaseConversationEvent {
  data: ConversationMemberUpdateData;
  type: typeof CONVERSATION_EVENT.MEMBER_UPDATE;
}

export interface ConversationMessageTimerUpdateEvent extends BaseConversationEvent {
  data: ConversationMessageTimerUpdateData;
  type: typeof CONVERSATION_EVENT.MESSAGE_TIMER_UPDATE;
}

export interface ConversationOtrMessageAddEvent extends BaseConversationEvent {
  data: ConversationOtrMessageAddData;
  type: typeof CONVERSATION_EVENT.OTR_MESSAGE_ADD;
}

export interface ConversationReceiptModeUpdateEvent extends BaseConversationEvent {
  data: ConversationReceiptModeUpdateData;
  type: typeof CONVERSATION_EVENT.RECEIPT_MODE_UPDATE;
}

export interface ConversationRenameEvent extends BaseConversationEvent {
  data: ConversationRenameData;
  type: typeof CONVERSATION_EVENT.RENAME;
}

export interface ConversationTypingEvent extends BaseConversationEvent {
  data: ConversationTypingData;
  type: typeof CONVERSATION_EVENT.TYPING;
}
