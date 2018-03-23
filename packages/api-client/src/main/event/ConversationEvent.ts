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
  conversation: string;
  from: string;
  time: string;
  data: {};
}

interface ConversationAccessUpdateEvent extends ConversationEvent {
  type: 'conversation.access-update';
  data: {
    access: 'private' | 'invite' | 'link' | 'code';
    access_role: 'private' | 'team' | 'activated' | 'non_activated';
  };
}

interface ConversationCodeDeleteEvent extends ConversationEvent {
  type: 'conversation.code-delete';
  // no further data
}

interface ConversationCodeUpdateEvent extends ConversationEvent {
  type: 'conversation.code-update';
  data: {
    key: string;
    code: string;
    uri: string;
  };
}

interface ConversationConnectRequestEvent extends ConversationEvent {
  type: 'conversation.connect-request';
  data: {
    recipient: string;
  };
}

interface ConversationCreateEvent extends ConversationEvent {
  type: 'conversation.create';
  data: {
    id: string;
    type: 0 | 1 | 2 | 3; //TODO: 0: regular, 1: self, 2: one2one, 3: connect
    creator: string;
    access: 'private' | 'invite' | 'link' | 'code';
    access_role: 'private' | 'team' | 'activated' | 'non_activated';
    name: string;
    members: string[];
    team?: string;
  };
}

interface ConversationDeleteEvent extends ConversationEvent {
  type: 'conversation.delete';
  // no further data
}

interface ConversationMemberJoinEvent extends ConversationEvent {
  type: 'conversation.member-join';
  data: {
    user_ids: string[];
  };
}

interface ConversationMemberLeaveEvent extends ConversationEvent {
  type: 'conversation.member-leave';
  data: {
    user_ids: string[];
  };
}

interface ConversationMemberUpdateEvent extends ConversationEvent {
  type: 'conversation.member-update';
  data: {
    otr_muted?: boolean;
    otr_muted_ref?: string;
    otr_archived?: boolean;
    otr_archived_ref?: string;
    hidden?: boolean;
    hidden_ref?: string;
  };
}

interface ConversationOtrMessageAddEvent extends ConversationEvent {
  type: 'conversation.member-update';
  data: {
    sender: string;
    recipient: string;
    text: string;
    data?: string;
  };
}

interface ConversationRenameEvent extends ConversationEvent {
  type: 'conversation.rename';
  data: {
    name: string;
  };
}

interface ConversationTypingEvent extends ConversationEvent {
  type: 'conversation.typing';
  data: {
    status: 'started' | 'stopped';
  };
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
