/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
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

import {PublicClient} from './PublicClient';
import {Encoder} from 'bazinga64';

export interface QualifiedUserClientMap {
  [domain: string]: {
    [userId: string]: PublicClient[];
  };
}

export interface QualifiedPublicClients {
  qualified_user_map: QualifiedUserClientMap;
}

type UserId = string;
type ClientId = string;
type Domain = string;
export type ClientIdStringType = `${UserId}:${ClientId}@${Domain}`;

export const constructClientId = (userId: string, clientId: string, domain: string): ClientIdStringType =>
  `${userId}:${clientId}@${domain}`;

export const qualifiedUserMapToClientIds = (qualified_user_map: QualifiedUserClientMap) => {
  return Object.entries(qualified_user_map).flatMap(([domain, users]) => {
    const clients = Object.entries(users);
    return clients.flatMap(([userId, clients]) =>
      clients.map(client => Encoder.toBase64(constructClientId(userId, client.id, domain)).asBytes),
    );
  });
};
