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

import {AuthAPI} from '@wireapp/api-client/lib/auth';
import {ClientAPI, ClientClassification, ClientType, RegisteredClient} from '@wireapp/api-client/lib/client';
import {ConversationAPI} from '@wireapp/api-client/lib/conversation';
import {CONVERSATION_EVENT} from '@wireapp/api-client/lib/event';
import {BackendError, BackendErrorLabel} from '@wireapp/api-client/lib/http';
import {Self, SelfAPI} from '@wireapp/api-client/lib/self';
import {ConsumableNotification} from '@wireapp/api-client/lib/tcp';
import {ReconnectingWebsocket} from '@wireapp/api-client/lib/tcp/ReconnectingWebsocket';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import {WS} from 'jest-websocket-mock';
import nock, {cleanAll} from 'nock';
import {v4 as uuidv4} from 'uuid';

import {APIClient} from '@wireapp/api-client';
import {AccentColor, ValidationUtil} from '@wireapp/commons';
import {GenericMessage, Text} from '@wireapp/protocol-messaging';

import {Account, ConnectionState} from './Account';
import {NotificationSource} from './notification';

const BASE_URL = 'mock-backend.wire.com';
const MOCK_BACKEND = {
  name: 'mock',
  rest: `https://${BASE_URL}`,
  ws: `wss://${BASE_URL}`,
};

async function createAccount(): Promise<{account: Account; apiClient: APIClient}> {
  const apiClient = new APIClient({urls: MOCK_BACKEND});
  const account = new Account(apiClient);
  await account['initServices']({
    clientType: ClientType.TEMPORARY,
    userId: '',
  });
  return {account, apiClient};
}

const waitFor = (assertion: () => void) => {
  const maxAttempts = 500;
  let attempts = 0;
  return new Promise<void>(resolve => {
    const attempt = () => {
      attempts++;
      try {
        assertion();
        resolve();
      } catch (e) {
        if (attempts > maxAttempts) {
          throw e;
        }
        setTimeout(attempt, 10);
      }
    };
    attempt();
  });
};

/* eslint-disable jest/no-conditional-expect */

describe('Account', () => {
  const CLIENT_ID = '4e37b32f57f6da55';

  // Fix for node 16, crypto.subtle.decrypt has a type problem
  jest.spyOn(global.crypto.subtle, 'decrypt').mockResolvedValue(new Uint8Array(32));
  const accessTokenData = {
    access_token:
      'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==.v=1.k=1.d=1498600993.t=a.l=.u=aaf9a833-ef30-4c22-86a0-9adc8a15b3b4.c=15037015562284012115',
    expires_in: 900,
    token_type: 'Bearer',
    user: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
  };

  beforeEach(() => {
    nock(MOCK_BACKEND.rest)
      .post(AuthAPI.URL.LOGIN, body => body.email && body.password)
      .query(() => true)
      .reply((_, body: any) => {
        if (body.password === 'wrong') {
          return [
            HTTP_STATUS.FORBIDDEN,
            JSON.stringify({
              code: HTTP_STATUS.FORBIDDEN,
              label: 'invalid-credentials',
              message: 'Authentication failed.',
            }),
          ];
        }
        return [HTTP_STATUS.OK, JSON.stringify(accessTokenData)];
      });

    nock(MOCK_BACKEND.rest).post(`${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`).reply(HTTP_STATUS.OK, undefined);

    nock(MOCK_BACKEND.rest).post(AuthAPI.URL.ACCESS).reply(HTTP_STATUS.OK, accessTokenData);

    nock(MOCK_BACKEND.rest).post(ClientAPI.URL.CLIENTS).reply(HTTP_STATUS.OK, {id: CLIENT_ID});

    nock(MOCK_BACKEND.rest)
      .post(
        new RegExp(
          `${ConversationAPI.URL.CONVERSATIONS}/.*/${ConversationAPI.URL.OTR}/${ConversationAPI.URL.MESSAGES}`,
        ),
      )
      .query({ignore_missing: false})
      .reply(HTTP_STATUS.OK)
      .persist();

    nock(MOCK_BACKEND.rest)
      .get(ClientAPI.URL.CLIENTS)
      .reply(HTTP_STATUS.OK, [{id: CLIENT_ID}] as RegisteredClient[]);

    nock(MOCK_BACKEND.rest)
      .get(SelfAPI.URL.SELF)
      .reply(HTTP_STATUS.OK, {
        email: 'email@example.com',
        handle: 'exampleuser',
        locale: 'en',
        qualified_id: {
          domain: 'example.com',
          id: '024174ec-c098-4104-9424-3849804acb78',
        },
        accent_id: AccentColor.AccentColorID.BRIGHT_ORANGE,
        picture: [],
        name: 'Example User',
        id: '024174ec-c098-4104-9424-3849804acb78',
        assets: [],
      } as Self);
  });

  afterEach(() => cleanAll());

  const currentClient: RegisteredClient = {
    id: CLIENT_ID,
    cookie: '',
    time: '',
    type: ClientType.TEMPORARY,
    class: ClientClassification.DESKTOP,
    mls_public_keys: {},
  };

  describe('init', () => {
    it('initializes the Protocol buffers', async () => {
      const account = new Account();

      await account['initServices']({clientType: ClientType.TEMPORARY, userId: ''});

      expect(account.service!.conversation).toBeDefined();

      const message = GenericMessage.create({
        messageId: '2d7cb6d8-118f-11e8-b642-0ed5f89f718b',
        text: Text.create({content: 'Hello, World!'}),
      });

      expect(message.content).toBe('text');
    });
  });

  describe('login', () => {
    it('logs in with correct credentials', async () => {
      const apiClient = new APIClient({urls: MOCK_BACKEND});
      const account = new Account(apiClient);

      await account['initServices']({clientType: ClientType.TEMPORARY, userId: ''});
      const {clientType, userId} = await account.login({
        clientType: ClientType.TEMPORARY,
        email: 'hello@example.com',
        password: 'my-secret',
      });

      expect(ValidationUtil.isUUIDv4(userId)).toBe(true);
      expect(clientType).toBe(ClientType.TEMPORARY);
    });

    it('does not log in with incorrect credentials', async () => {
      const apiClient = new APIClient({urls: MOCK_BACKEND});
      const account = new Account(apiClient);
      let backendError;

      await account['initServices']({clientType: ClientType.TEMPORARY, userId: ''});

      try {
        await account.login({
          clientType: ClientType.TEMPORARY,
          email: 'hello@example.com',
          password: 'wrong',
        });
        throw new Error('Should not be logged in');
      } catch (error) {
        backendError = error as BackendError;
      } finally {
        const {code, label} = backendError as {code: number; label: string};
        expect(code).toBe(HTTP_STATUS.FORBIDDEN);
        expect(label).toBe(BackendErrorLabel.INVALID_CREDENTIALS);
      }
    });
  });

  // TODO: Fix this test
  it.skip('emits text messages', () => {
    return new Promise<void>(async resolve => {
      const {account, apiClient} = await createAccount();

      await account.login({
        clientType: ClientType.TEMPORARY,
        email: 'hello@example.com',
        password: 'my-secret',
      });
      account['currentClient'] = currentClient;

      jest.spyOn(apiClient, 'connect').mockImplementation();
      jest.spyOn(account.service!.notification as any, 'handleEvent').mockReturnValue({
        status: 'handled',
        payload: {
          event: {type: CONVERSATION_EVENT.OTR_MESSAGE_ADD},
        },
      });

      const kill = account.listen({
        onEvent: ({event}) => {
          expect(event.type).toBe(CONVERSATION_EVENT.OTR_MESSAGE_ADD);
          resolve();
        },
      });

      apiClient.transport.liveEvents.emit(ConsumableNotification.TOPIC.ON_MESSAGE, {payload: [{}]});
      kill();
    });
  });

  describe('Websocket connection', () => {
    let server: WS;
    let dependencies: {account: Account; apiClient: APIClient};

    const callWhen = (expected: ConnectionState, cb: () => void, maxCalls = 1) => {
      let calls = 0;
      return (state: ConnectionState) => {
        if (state === expected && calls < maxCalls) {
          calls++;
          cb();
        }
      };
    };

    beforeEach(() => {
      server = new WS(`${MOCK_BACKEND.ws}/v8/events?access_token=${accessTokenData.access_token}`);
      ReconnectingWebsocket['RECONNECTING_OPTIONS'].maxRetries = 0;
    });

    beforeEach(async () => {
      dependencies = await createAccount();
      await dependencies.account.login({
        clientType: ClientType.TEMPORARY,
        email: 'hello@example.com',
        password: 'my-secret',
      });
      dependencies.account['currentClient'] = currentClient;
      jest
        .spyOn(dependencies.account.service!.notification, 'handleNotification')
        .mockImplementation(notif => notif.payload as any);
    });

    afterEach(() => server.close());

    describe('listen', () => {
      it('warns consumer of the connection state', () => {
        return new Promise<void>(resolve => {
          const expectedStates = [
            ConnectionState.CONNECTING,
            ConnectionState.PROCESSING_NOTIFICATIONS,
            ConnectionState.LIVE,
            ConnectionState.CLOSED,
          ];
          const disconnect = dependencies.account.listen({
            onConnectionStateChanged: state => {
              expect(state).toBe(expectedStates.shift());
              if (state === ConnectionState.LIVE) {
                disconnect();
              }
              if (state === ConnectionState.CLOSED) {
                resolve();
              }
            },
          });
        });
      });

      it('processes notification stream upon connection', () => {
        return new Promise<void>(async resolve => {
          const onEvent = jest.fn();

          const disconnect = dependencies.account.listen({
            onConnectionStateChanged: callWhen(ConnectionState.LIVE, async () => {
              expect(onEvent).not.toHaveBeenCalledWith(expect.any(Object), NotificationSource.NOTIFICATION_STREAM);
              disconnect();
              resolve();
            }),
            onEvent,
          });
        });
      });

      // TODO: Fix this test
      it.skip('forwards events from websocket to consumer after notification stream', () => {
        return new Promise<void>(async resolve => {
          const onEvent = jest.fn();

          jest
            .spyOn(dependencies.account.service!.notification, 'handleNotification')
            // @ts-ignore
            .mockImplementation((notification, source) => {
              return [
                {
                  event: {
                    type: CONVERSATION_EVENT.MESSAGE_TIMER_UPDATE,
                    data: {message_timer: 5000},
                    conversation: 'conv-id',
                  },
                },
              ];
            });

          const disconnect = dependencies.account.listen({
            onConnectionStateChanged: callWhen(ConnectionState.LIVE, async () => {
              server.send(JSON.stringify({id: uuidv4(), payload: [{}]}));
              await waitFor(() => expect(onEvent).toHaveBeenCalledTimes(1));
              expect(onEvent).toHaveBeenCalledWith(expect.any(Object), NotificationSource.WEBSOCKET);
              disconnect();
              resolve();
            }),
            onEvent,
          });
        });
      });

      // TODO: Fix this test
      it.skip('locks the websocket and waits for notification stream to be processed before forwarding events', () => {
        return new Promise<void>(async resolve => {
          const onEvent = jest.fn();

          jest
            .spyOn(dependencies.account.service!.notification, 'handleNotification')
            // @ts-ignore
            .mockImplementation((notification, source) => {
              return [
                {
                  event: {
                    type: CONVERSATION_EVENT.MESSAGE_TIMER_UPDATE,
                    data: {message_timer: 5000},
                    conversation: 'conv-id',
                  },
                },
              ];
            });

          const disconnect = dependencies.account.listen({
            onConnectionStateChanged: async state => {
              if (state === ConnectionState.PROCESSING_NOTIFICATIONS) {
                server.send(JSON.stringify({id: uuidv4(), payload: [{}]}));
              }
              if (state === ConnectionState.LIVE) {
                // onEvent.mockReset();
                // server.send(JSON.stringify({id: uuidv4(), payload: [{}]}));
                await waitFor(() => expect(onEvent).toHaveBeenCalledTimes(1));
                expect(onEvent).toHaveBeenCalledWith(expect.any(Object), NotificationSource.WEBSOCKET);
                disconnect();
                resolve();
              }
            },
            onEvent,
          });
        });
      });

      it('does not unlock the websocket if connection was aborted', () => {
        return new Promise<void>((resolve, reject) => {
          const onEvent = jest.fn();
          dependencies.account.listen({
            onConnectionStateChanged: async state => {
              if (state === ConnectionState.PROCESSING_NOTIFICATIONS) {
                server.close();
              }
              if (state === ConnectionState.LIVE) {
                reject(new Error('Should not go LIVE'));
              }
              if (state === ConnectionState.CLOSED) {
                expect(onEvent).not.toHaveBeenCalledWith(expect.any(Object), NotificationSource.WEBSOCKET);
                resolve();
              }
            },
            onEvent,
          });
        });
      });

      // TODO: Fix this test
      it.skip('cancels notification stream if socket disconnects', () => {
        const onEvent = jest
          .fn()
          .mockImplementationOnce(() => {})
          .mockImplementationOnce(() => {
            server.close();
          });

        jest
          .spyOn(dependencies.account.service!.notification, 'handleNotification')
          // @ts-ignore
          .mockImplementation((notification, source) => {
            return [
              {
                event: {
                  type: CONVERSATION_EVENT.MESSAGE_TIMER_UPDATE,
                  data: {message_timer: 5000},
                  conversation: 'conv-id-1',
                },
              },
              {
                event: {
                  type: CONVERSATION_EVENT.MESSAGE_TIMER_UPDATE,
                  data: {message_timer: 5000},
                  conversation: 'conv-id-2',
                },
              },
              {
                event: {
                  type: CONVERSATION_EVENT.MESSAGE_TIMER_UPDATE,
                  data: {message_timer: 5000},
                  conversation: 'conv-id-3',
                },
              },
            ];
          });

        return new Promise<void>(resolve => {
          dependencies.account.listen({
            onConnectionStateChanged: state => {
              if (state === ConnectionState.CLOSED) {
                try {
                  expect(onEvent).toHaveBeenCalledTimes(2);
                  // expect(onEvent).toHaveBeenCalledWith(expect.any(Object), NotificationSource.WEBSOCKET);
                } catch (err) {
                  console.error('ASSERTION ERROR:', err);
                  throw err;
                }

                resolve();
              }
            },
            onEvent,
          });
        });
      });
    });
  });
});
