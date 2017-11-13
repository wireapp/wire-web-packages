/* eslint-disable no-magic-numbers */
/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
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

const Client = require('@wireapp/api-client/dist/commonjs/Client');
const {AuthAPI} = require('@wireapp/api-client/dist/commonjs/auth/');
const {UserAPI} = require('@wireapp/api-client/dist/commonjs/user/');

describe('Client', () => {
  const baseURL = Client.BACKEND.PRODUCTION.rest;

  let accessTokenData = {
    access_token:
      'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==.v=1.k=1.d=1498600993.t=a.l=.u=aaf9a833-ef30-4c22-86a0-9adc8a15b3b4.c=15037015562284012115',
    expires_in: 900,
    token_type: 'Bearer',
    user: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
  };

  describe('"constructor"', () => {
    it('constructs a client with production backend by default', () => {
      const client = new Client();
      expect(client.transport.http.baseURL).toBe(Client.BACKEND.PRODUCTION.rest);
      expect(client.transport.ws.baseURL).toBe(Client.BACKEND.PRODUCTION.ws);
    });
  });

  describe('"init"', () => {
    it('loads an access token from the storage by default', done => {
      const client = new Client();
      const TABLE = client.accessTokenStore.ACCESS_TOKEN_TABLE;
      const PRIMARY_KEY = client.accessTokenStore.ACCESS_TOKEN_KEY;
      accessTokenData = {
        access_token: 'initial-access-token-data',
        expires_in: 900,
        token_type: 'Bearer',
        user: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
      };

      client.accessTokenStore.tokenStore
        .create(TABLE, PRIMARY_KEY, accessTokenData)
        .then(primaryKey => {
          expect(primaryKey).toBe(PRIMARY_KEY);
          return client.init();
        })
        .then(context => {
          expect(context.userID).toBe(accessTokenData.user);
          expect(client.accessTokenStore.accessToken).toBe(accessTokenData);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('"login"', () => {
    accessTokenData = {
      access_token:
        'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==.v=1.k=1.d=1498600993.t=a.l=.u=aaf9a833-ef30-4c22-86a0-9adc8a15b3b4.c=15037015562284012115',
      expires_in: 900,
      token_type: 'Bearer',
      user: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
    };

    const loginData = {
      email: 'me@mail.com',
      password: 'top-secret',
      persist: false,
    };

    const userData = [
      {
        accent_id: 0,
        assets: [],
        handle: 'webappbot',
        id: '062418ea-9b93-4d93-b59b-11aba3f702d8',
        name: 'Webapp Bot',
        picture: [
          {
            content_length: 7023,
            content_type: 'image/jpeg',
            data: null,
            id: 'bb5c861e-b133-46e1-a92b-555218ecdf52',
            info: {
              correlation_id: '83f6d538-fc38-4e24-97ae-312f079f3594',
              height: 280,
              nonce: '83f6d538-fc38-4e24-97ae-312f079f3594',
              original_height: 1080,
              original_width: 1920,
              public: true,
              tag: 'smallProfile',
              width: 280,
            },
          },
          {
            content_length: 94027,
            content_type: 'image/jpeg',
            data: null,
            id: 'efd732aa-2ff2-4959-968a-a621dda342b6',
            info: {
              correlation_id: '83f6d538-fc38-4e24-97ae-312f079f3594',
              height: 1080,
              nonce: '83f6d538-fc38-4e24-97ae-312f079f3594',
              original_height: 1080,
              original_width: 1920,
              public: true,
              tag: 'medium',
              width: 1920,
            },
          },
        ],
      },
    ];

    beforeEach(() => {
      nock(baseURL)
        .post(`${AuthAPI.URL.LOGIN}`, {
          email: loginData.email,
          password: loginData.password,
        })
        .query({persist: loginData.persist})
        .reply(200, accessTokenData);

      nock(baseURL)
        .post(`${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`)
        .reply(200, undefined);
    });

    it('creates a context from a successful login', done => {
      const client = new Client();
      client.login(loginData).then(context => {
        expect(context.userID).toBe(accessTokenData.user);
        expect(client.accessTokenStore.accessToken.access_token).toBe(accessTokenData.access_token);
        done();
      });
    });

    it('can login after a logout', done => {
      const client = new Client();
      client
        .login(loginData)
        .then(() => client.logout())
        .then(done)
        .catch(done.fail);
    });

    it('refreshes an access token when it gets invalid', done => {
      nock(baseURL)
        .get(UserAPI.URL.USERS)
        .query({handles: 'webappbot'})
        .once()
        .reply(401, undefined);

      nock(baseURL)
        .get(UserAPI.URL.USERS)
        .query({handles: 'webappbot'})
        .twice()
        .reply(200, userData);

      nock(baseURL)
        .post(AuthAPI.URL.ACCESS)
        .reply(200, accessTokenData);

      const client = new Client();
      client
        .login(loginData)
        .then(context => {
          expect(context.userID).toBe(accessTokenData.user);
          // Overwrite access token
          client.accessTokenStore.accessToken.access_token = undefined;
          // Make a backend call
          return client.user.api.getUsers({handles: ['webappbot']});
        })
        .then(response => {
          expect(response.name).toBe(userData.name);
          expect(client.accessTokenStore.accessToken.access_token).toBeDefined();
          done();
        })
        .catch(done.fail);
    });
  });

  describe('"logout"', () => {
    beforeEach(() => {
      nock(baseURL)
        .post(`${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`)
        .reply(200, undefined);
    });

    it('can logout a user', done => {
      const client = new Client();
      client
        .logout()
        .then(done)
        .catch(done.fail);
    });
  });

  describe('"register"', () => {
    const registerData = {
      accent_id: 0,
      assets: [],
      email: 'user@wire.com',
      id: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
      locale: 'de',
      name: 'unique_username',
      picture: [],
    };

    beforeEach(() => {
      nock(baseURL)
        .post(AuthAPI.URL.REGISTER, registerData)
        .reply(200, registerData);

      nock(baseURL)
        .post(AuthAPI.URL.ACCESS)
        .reply(200, accessTokenData);
    });

    it('automatically gets an access token after registration', done => {
      const client = new Client();
      client
        .register(registerData)
        .then(context => {
          expect(context.userID).toBe(registerData.id);
          expect(client.accessTokenStore.accessToken.access_token).toBe(accessTokenData.access_token);
          done();
        })
        .catch(done.fail);
    });
  });
});
