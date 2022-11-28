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

import type {OTRRecipients, UserClients} from '@wireapp/api-client/lib/conversation';

import {constructSessionId} from '../SessionHandler';

interface ExtractEncryptedAndMissingFromBatchedPayloadProps {
  payload: Map<string, Uint8Array>;
  users: UserClients;
  domain: string;
}

export const extractEncryptedAndMissingFromBatchedPayload = ({
  payload,
  users,
  domain = '',
}: ExtractEncryptedAndMissingFromBatchedPayloadProps): {missing: UserClients; encrypted: OTRRecipients<Uint8Array>} => {
  const encrypted: OTRRecipients<Uint8Array> = {};
  const missing: UserClients = {};

  const userClientsArr = Object.entries(users);
  for (const [userId, clientIds] of userClientsArr) {
    for (const clientId of clientIds) {
      const sessionId = constructSessionId({userId, clientId, domain});

      if (payload.has(sessionId)) {
        encrypted[userId] ||= {};
        encrypted[userId][clientId] = payload.get(sessionId)!;
      } else {
        missing[userId] ||= [];
        missing[userId].push(clientId);
      }
    }
  }

  return {encrypted, missing};
};
