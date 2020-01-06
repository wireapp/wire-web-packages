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

import {
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
  time: string;
  type: CONVERSATION_EVENT;
}

export interface ConversationAccessUpdateEvent extends BaseConversationEvent {
  data: ConversationAccessUpdateData;
  type: CONVERSATION_EVENT.ACCESS_UPDATE;
}

export interface ConversationCodeDeleteEvent extends BaseConversationEvent {
  data: null;
  type: CONVERSATION_EVENT.CODE_DELETE;
}

export interface ConversationCodeUpdateEvent extends BaseConversationEvent {
  data: ConversationCodeUpdateData;
  type: CONVERSATION_EVENT.CODE_UPDATE;
}

export interface ConversationConnectRequestEvent extends BaseConversationEvent {
  data: ConversationConnectRequestData;
  type: CONVERSATION_EVENT.CONNECT_REQUEST;
}

export interface ConversationCreateEvent extends BaseConversationEvent {
  data: ConversationCreateData;
  type: CONVERSATION_EVENT.CREATE;
}

export interface ConversationDeleteEvent extends BaseConversationEvent {
  data: null;
  type: CONVERSATION_EVENT.DELETE;
}

export interface ConversationMemberJoinEvent extends BaseConversationEvent {
  data: ConversationMemberJoinData;
  type: CONVERSATION_EVENT.MEMBER_JOIN;
}

export interface ConversationMemberLeaveEvent extends BaseConversationEvent {
  data: ConversationMemberLeaveData;
  type: CONVERSATION_EVENT.MEMBER_LEAVE;
}

export interface ConversationMemberUpdateEvent extends BaseConversationEvent {
  data: ConversationMemberUpdateData;
  type: CONVERSATION_EVENT.MEMBER_UPDATE;
}

export interface ConversationMessageTimerUpdateEvent extends BaseConversationEvent {
  data: ConversationMessageTimerUpdateData;
  type: CONVERSATION_EVENT.MESSAGE_TIMER_UPDATE;
}

export interface ConversationOtrMessageAddEvent extends BaseConversationEvent {
  data: ConversationOtrMessageAddData;
  type: CONVERSATION_EVENT.OTR_MESSAGE_ADD;
}

export interface ConversationReceiptModeUpdateEvent extends BaseConversationEvent {
  data: ConversationReceiptModeUpdateData;
  type: CONVERSATION_EVENT.RECEIPT_MODE_UPDATE;
}

export interface ConversationRenameEvent extends BaseConversationEvent {
  data: ConversationRenameData;
  type: CONVERSATION_EVENT.RENAME;
}

export interface ConversationTypingEvent extends BaseConversationEvent {
  data: ConversationTypingData;
  type: CONVERSATION_EVENT.TYPING;
}
