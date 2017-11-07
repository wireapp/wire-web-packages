const nock = require('nock');

const Client = require('../../../../dist/commonjs/Client');
const {AuthAPI} = require('../../../../dist/commonjs/auth/index');
const {UserAPI} = require('../../../../dist/commonjs/user/index');

describe('Client', () => {
  const baseURL = Client.BACKEND.PRODUCTION.rest;

  const accessTokenData = {
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
      const accessTokenData = {
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
    const accessTokenData = {
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
        handle: 'webappbot',
        accent_id: 0,
        picture: [
          {
            content_length: 7023,
            data: null,
            content_type: 'image/jpeg',
            id: 'bb5c861e-b133-46e1-a92b-555218ecdf52',
            info: {
              height: 280,
              tag: 'smallProfile',
              original_width: 1920,
              width: 280,
              correlation_id: '83f6d538-fc38-4e24-97ae-312f079f3594',
              original_height: 1080,
              nonce: '83f6d538-fc38-4e24-97ae-312f079f3594',
              public: true,
            },
          },
          {
            content_length: 94027,
            data: null,
            content_type: 'image/jpeg',
            id: 'efd732aa-2ff2-4959-968a-a621dda342b6',
            info: {
              height: 1080,
              tag: 'medium',
              original_width: 1920,
              width: 1920,
              correlation_id: '83f6d538-fc38-4e24-97ae-312f079f3594',
              original_height: 1080,
              nonce: '83f6d538-fc38-4e24-97ae-312f079f3594',
              public: true,
            },
          },
        ],
        name: 'Webapp Bot',
        id: '062418ea-9b93-4d93-b59b-11aba3f702d8',
        assets: [],
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
