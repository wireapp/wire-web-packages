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

interface TeamEvent extends BackendEvent {
  type: string;
}

interface TeamConversationCreateEvent extends TeamEvent {
  type: 'team.conversation-create';
}

interface TeamConversationDeleteEvent extends TeamEvent {
  type: 'team.conversation-delete';
}

interface TeamCreateEvent extends TeamEvent {
  type: 'team.create';
}

interface TeamDeleteEvent extends TeamEvent {
  type: 'team.delete';
}

interface TeamMemberJoinEvent extends TeamEvent {
  type: 'team.member-join';
}

interface TeamMemberLeaveEvent extends TeamEvent {
  type: 'team.member-leave';
}

interface TeamMemberUpdateEvent extends TeamEvent {
  type: 'team.member-update';
}

interface TeamUpdateEvent extends TeamEvent {
  type: 'team.update';
}

export {
  TeamEvent,
  TeamConversationCreateEvent,
  TeamConversationDeleteEvent,
  TeamCreateEvent,
  TeamDeleteEvent,
  TeamMemberJoinEvent,
  TeamMemberLeaveEvent,
  TeamMemberUpdateEvent,
  TeamUpdateEvent,
};
