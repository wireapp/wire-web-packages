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

const nock = require('nock');

const {Account} = require('@wireapp/core');
const {UserAPI} = require('@wireapp/api-client/dist/commonjs/user/');
const {MemberAPI} = require('@wireapp/api-client/dist/commonjs/team/member/');
const {TeamAPI} = require('@wireapp/api-client/dist/commonjs/team/team/');
const {BroadcastAPI} = require('@wireapp/api-client/dist/commonjs/broadcast/');
const {StatusCode} = require('@wireapp/api-client/dist/commonjs/http/');
const {Backend} = require('@wireapp/api-client/dist/commonjs/env/');
const {Permission} = require('@wireapp/api-client/dist/commonjs/team/member/');

const PayloadHelper = require('../test/PayloadHelper');

describe('UserService', () => {
  let hasState;
  let requestedUserId;

  afterAll(() => {
    nock.cleanAll();
  });

  beforeAll(() => {
    nock(Backend.PRODUCTION.rest)
      .get(UserAPI.URL.USERS)
      .query(() => true)
      .reply(uri => {
        const ids = PayloadHelper.getUrlParameter(uri, 'ids');

        const userPayloads = ids.split(',').map(userId => {
          return PayloadHelper.mockUserPayload(userId);
        });

        return [StatusCode.OK, JSON.stringify(userPayloads)];
      })
      .persist();

    nock(Backend.PRODUCTION.rest)
      .post(BroadcastAPI.URL.BROADCAST, body => {
        hasState[body.sender] = true;
        return true;
      })
      .query(() => true)
      .reply(StatusCode.OK, '{}')
      .persist();

    nock(Backend.PRODUCTION.rest)
      .get(uri => {
        if (uri.startsWith(TeamAPI.URL.TEAMS) && uri.endsWith(MemberAPI.URL.MEMBERS)) {
          return true;
        }
        return false;
      })
      .query(() => true)
      .reply(() => {
        const data = {
          members: [
            {
              permissions: {
                copy: Permission.DELETE_TEAM | Permission.GET_BILLING | Permission.SET_BILLING,
                self: Permission.DELETE_TEAM | Permission.GET_BILLING | Permission.SET_BILLING,
              },
              user: PayloadHelper.getUUID(),
            },
          ],
        };

        return [StatusCode.OK, JSON.stringify(data)];
      })
      .persist();

    nock(Backend.PRODUCTION.rest)
      .get(uri => {
        if (uri.startsWith(UserAPI.URL.USERS) && uri.endsWith(UserAPI.URL.PRE_KEYS)) {
          requestedUserId = uri.replace(`${UserAPI.URL.USERS}/`, '').replace(`/${UserAPI.URL.PRE_KEYS}`, '');
          return true;
        }
        return false;
      })
      .query(() => true)
      .reply(() => {
        const data = {
          clients: [
            {
              client: PayloadHelper.getUUID(),
              prekey: {},
            },
          ],
          user: requestedUserId,
        };

        return [StatusCode.OK, JSON.stringify(data)];
      })
      .persist();
  });

  beforeEach(() => {
    hasState = {};
    requestedUserId = '';
  });

  describe('getUsers', () => {
    it('fetches users', async () => {
      const userIds = [PayloadHelper.getUUID(), PayloadHelper.getUUID()];
      const account = new Account();
      await account.init();
      const users = await account.service.user.getUsers(userIds);
      expect(users.length).toBe(userIds.length);
    });
  });

  describe('setAvailability', () => {
    it('sets the availability', async () => {
      const teamId = PayloadHelper.getUUID();
      const account = new Account();
      await account.init();
      const clientId = PayloadHelper.getUUID();

      account.service.conversation.setClientID(clientId);
      expect(hasState[clientId]).toBeUndefined();

      await account.service.user.setAvailability(teamId, 1);
      expect(hasState[clientId]).toBe(true);
    });
  });
});
