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

import {QualifiedId} from '@wireapp/api-client/lib/user';

const serializeQualifiedId = ({id, domain}: QualifiedId): `${string}@${string}` => `${id}@${domain}`;

const parseQualifiedId = (multiplexedId: string): QualifiedId => {
  const [id, domain] = multiplexedId.split('@');
  return {domain, id};
};

const storageKey = 'conferenceSubconversations';

const getAllConversationIdsRaw = (): string[] => {
  const storedState = localStorage.getItem(storageKey);
  if (!storedState) {
    return [];
  }

  const conversationIds = (storedState ? JSON.parse(storedState) : []) as string[];
  return conversationIds;
};

const getAllConversationIds = (): QualifiedId[] => {
  const conversationIds = getAllConversationIdsRaw();
  return conversationIds.map(parseQualifiedId);
};

const removeConversationId = (conversationId: QualifiedId) => {
  const storedState = getAllConversationIdsRaw();

  const serializedQualifiedId = serializeQualifiedId(conversationId);
  const newStoredState = storedState.filter(c => c !== serializedQualifiedId);

  localStorage.setItem(storageKey, JSON.stringify(newStoredState));
};

const storeConversationId = (conversationId: QualifiedId) => {
  const storedState = getAllConversationIdsRaw();
  const serializedQualifiedId = serializeQualifiedId(conversationId);

  if (storedState.includes(serializedQualifiedId)) {
    return;
  }

  storedState.push(serializedQualifiedId);
  localStorage.setItem(storageKey, JSON.stringify(storedState));
};

export const conferenceSubconversationsStore = {
  getAllConversationIds,
  removeConversationId,
  storeConversationId,
};
