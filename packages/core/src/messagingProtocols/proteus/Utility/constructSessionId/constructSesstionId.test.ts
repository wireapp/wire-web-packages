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

import {constructSessionId} from './constructSessionId';

describe('constructSessionId', () => {
  describe('constructs a session ID', () => {
    it('without a domain', () => {
      const sessionId = constructSessionId({userId: 'user-id', clientId: 'client-id'});
      expect(sessionId).toBe('user-id@client-id');
    });

    it('with a domain', () => {
      const sessionId = constructSessionId({
        userId: 'user-id',
        clientId: 'client-id',
        domain: 'domain',
      });
      expect(sessionId).toBe('user-id@client-id');
    });

    it('with a domain and useQualifiedIds', () => {
      const sessionId = constructSessionId({
        userId: 'user-id',
        clientId: 'client-id',
        domain: 'domain',
        useQualifiedIds: true,
      });
      expect(sessionId).toBe('domain@user-id@client-id');
    });

    it('with a qualified ID', () => {
      const sessionId = constructSessionId({
        userId: {id: 'user-id', domain: 'domain'},
        clientId: 'client-id',
      });
      expect(sessionId).toBe('user-id@client-id');
    });

    it('with a qualified ID and useQualifiedIds', () => {
      const sessionId = constructSessionId({
        userId: {id: 'user-id', domain: 'domain'},
        clientId: 'client-id',
        useQualifiedIds: true,
      });
      expect(sessionId).toBe('domain@user-id@client-id');
    });
  });
});
