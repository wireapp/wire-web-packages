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

const storageKey = 'conferenceSubconversations';

const getAllGroupIds = (): string[] => {
  const storedState = localStorage.getItem(storageKey);
  if (!storedState) {
    return [];
  }
  return JSON.parse(storedState);
};

const removeGroupId = (groupId: string) => {
  const storedState = getAllGroupIds();
  const newStoredState = storedState.filter(g => g !== groupId);
  localStorage.setItem(storageKey, JSON.stringify(newStoredState));
};

const storeGroupId = (groupId: string) => {
  const storedState = getAllGroupIds();
  if (storedState.includes(groupId)) {
    return;
  }

  storedState.push(groupId);
  localStorage.setItem(storageKey, JSON.stringify(storedState));
};

export const conferenceSubconversationsStore = {
  getAllGroupIds,
  removeGroupId,
  storeGroupId,
};
