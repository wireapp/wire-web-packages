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

import {conferenceSubconversationsStore} from './conferenceSubconversationsStore';

describe('keyMaterialUpdatesStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds and retrieves subconversation groupIds to/from the store', () => {
    const groupId = 'groupId';
    conferenceSubconversationsStore.storeGroupId(groupId);
    expect(conferenceSubconversationsStore.getAllGroupIds()).toEqual([groupId]);
  });

  it('does not add groupId if it already exists in the store', () => {
    const groupId = 'groupId2';
    conferenceSubconversationsStore.storeGroupId(groupId);
    conferenceSubconversationsStore.storeGroupId(groupId);
    expect(conferenceSubconversationsStore.getAllGroupIds()).toEqual([groupId]);
  });

  it('removes groupId from the store', () => {
    const groupId = 'groupId3';
    conferenceSubconversationsStore.storeGroupId(groupId);
    expect(conferenceSubconversationsStore.getAllGroupIds()).toEqual([groupId]);
    conferenceSubconversationsStore.removeGroupId(groupId);
    expect(conferenceSubconversationsStore.getAllGroupIds()).toEqual([]);
  });
});
