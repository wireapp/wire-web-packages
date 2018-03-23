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

interface UserEvent extends BackendEvent {
  type: string;
}

interface UserActivateEvent extends UserEvent {
  type: 'user.activate';
}

interface UserClientAddEvent extends UserEvent {
  type: 'user.client-add';
}

interface UserClientRemoveEvent extends UserEvent {
  type: 'user.client-remove';
}

interface UserConnectionEvent extends UserEvent {
  type: 'user.connection';
}

interface UserDeleteEvent extends UserEvent {
  type: 'user.delete';
}

interface UserUpdateEvent extends UserEvent {
  type: 'user.update';
}

export {
  UserEvent,
  UserActivateEvent,
  UserClientAddEvent,
  UserClientRemoveEvent,
  UserConnectionEvent,
  UserDeleteEvent,
  UserUpdateEvent,
};
