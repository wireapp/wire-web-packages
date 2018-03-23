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

import {BackendEvent} from './BackendEvent';

interface ConversationEvent extends BackendEvent {
  type: string;
}

interface ConversationAccessUpdateEvent extends ConversationEvent {
  type: 'conversation.access-update';
}

interface ConversationCodeDeleteEvent extends ConversationEvent {
  type: 'conversation.code-delete';
}

interface ConversationCodeUpdateEvent extends ConversationEvent {
  type: 'conversation.code-update';
}

interface ConversationConnectRequestEvent extends ConversationEvent {
  type: 'conversation.connect-request';
}

interface ConversationCreateEvent extends ConversationEvent {
  type: 'conversation.create';
}

interface ConversationDeleteEvent extends ConversationEvent {
  type: 'conversation.delete';
}

interface ConversationMemberJoinEvent extends ConversationEvent {
  type: 'conversation.member-join';
}

interface ConversationMemberLeaveEvent extends ConversationEvent {
  type: 'conversation.member-leave';
}

interface ConversationMemberUpdateEvent extends ConversationEvent {
  type: 'conversation.member-update';
}

interface ConversationOtrMessageAddEvent extends ConversationEvent {
  type: 'conversation.member-update';
}

interface ConversationRenameEvent extends ConversationEvent {
  type: 'conversation.rename';
}

interface ConversationTypingEvent extends ConversationEvent {
  type: 'conversation.typing';
}

export {
  ConversationEvent,
  ConversationAccessUpdateEvent,
  ConversationCodeDeleteEvent,
  ConversationCodeUpdateEvent,
  ConversationConnectRequestEvent,
  ConversationCreateEvent,
  ConversationDeleteEvent,
  ConversationMemberJoinEvent,
  ConversationMemberLeaveEvent,
  ConversationMemberUpdateEvent,
  ConversationOtrMessageAddEvent,
  ConversationRenameEvent,
  ConversationTypingEvent,
};
