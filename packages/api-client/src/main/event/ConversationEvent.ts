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
  | ConversationRenameData
  | ConversationTypingData
  | null;

export interface ConversationEvent {
  conversation: string;
  data: ConversationEventData;

  from: string;
  time: string;
  type: CONVERSATION_EVENT;
}

export interface ConversationAccessUpdateEvent extends ConversationEvent {
  data: ConversationAccessUpdateData;
  type: CONVERSATION_EVENT.ACCESS_UPDATE;
}

export interface ConversationCodeDeleteEvent extends ConversationEvent {
  // TODO: Explicitly set data to null like ConversationDeleteEvent.data?
  type: CONVERSATION_EVENT.CODE_DELETE;
}

export interface ConversationCodeUpdateEvent extends ConversationEvent {
  data: ConversationCodeUpdateData;
  type: CONVERSATION_EVENT.CODE_UPDATE;
}

export interface ConversationConnectRequestEvent extends ConversationEvent {
  data: ConversationConnectRequestData;
  type: CONVERSATION_EVENT.CONNECT_REQUEST;
}

export interface ConversationCreateEvent extends ConversationEvent {
  data: ConversationCreateData;
  type: CONVERSATION_EVENT.CREATE;
}

export interface ConversationDeleteEvent extends ConversationEvent {
  data: null;
  type: CONVERSATION_EVENT.DELETE;
}

export interface ConversationMemberJoinEvent extends ConversationEvent {
  data: ConversationMemberJoinData;
  type: CONVERSATION_EVENT.MEMBER_JOIN;
}

export interface ConversationMemberLeaveEvent extends ConversationEvent {
  data: ConversationMemberLeaveData;
  type: CONVERSATION_EVENT.MEMBER_LEAVE;
}

export interface ConversationMemberUpdateEvent extends ConversationEvent {
  data: ConversationMemberUpdateData;
  type: CONVERSATION_EVENT.MEMBER_UPDATE;
}

export interface ConversationMessageTimerUpdateEvent extends ConversationEvent {
  data: ConversationMessageTimerUpdateData;
  type: CONVERSATION_EVENT.MESSAGE_TIMER_UPDATE;
}

export interface ConversationOtrMessageAddEvent extends ConversationEvent {
  data: ConversationOtrMessageAddData;
  type: CONVERSATION_EVENT.OTR_MESSAGE_ADD;
}

export interface ConversationRenameEvent extends ConversationEvent {
  data: ConversationRenameData;
  type: CONVERSATION_EVENT.RENAME;
}

export interface ConversationTypingEvent extends ConversationEvent {
  data: ConversationTypingData;
  type: CONVERSATION_EVENT.TYPING;
}
