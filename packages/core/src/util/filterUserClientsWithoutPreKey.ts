/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import {UserClients} from '@wireapp/api-client/lib/conversation';
import {UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';

import {isUserClients} from './TypePredicateUtil';

export const filterUserClientsWithoutPreKey = (users: UserPreKeyBundleMap | UserClients): UserClients => {
  if (isUserClients(users)) {
    return users;
  }

  return Object.entries(users).reduce<UserClients>((acc, [userId, clientsObj]) => {
    acc[userId] = Object.entries(clientsObj)
      .map(([clientId, preKey]) => preKey && clientId)
      // We filter out clients that have `null` prekey
      .filter((x): x is string => typeof x === 'string');
    return acc;
  }, {});
};
