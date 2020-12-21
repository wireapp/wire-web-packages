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

import type {ConversationEvent, TeamEvent, UserEvent} from '.';
import type {CONVERSATION_EVENT} from './ConversationEvent';
import type {TEAM_EVENT} from './TeamEvent';
import type {USER_EVENT} from './UserEvent';

export type BackendEvent = ConversationEvent | UserEvent | TeamEvent;
export type BackendEventType = CONVERSATION_EVENT | USER_EVENT | TEAM_EVENT;
