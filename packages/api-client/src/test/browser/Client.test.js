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

import Client from '../../../dist/commonjs/Client';
import Context from '../../../dist/commonjs/auth/Context';

describe('Client', () => {
  describe('"connect"', () => {
    it('processes WebSocket messages when executed in a web browser.', done => {
      const apiClient = new Client(Client.BACKEND.STAGING);
      const accessTokenData = {
        access_token:
          'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==.v=1.k=1.d=1498600993.t=a.l=.u=aaf9a833-ef30-4c22-86a0-9adc8a15b3b4.c=15037015562284012115',
        expires_in: 900,
        token_type: 'Bearer',
        user: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
      };
      const dataBuffer = new TextEncoder('utf-8').encode('{}').buffer;
      const message = new MessageEvent('message', {data: dataBuffer});
      apiClient.context = new Context('userID', undefined);
      apiClient.accessTokenStore.accessToken = accessTokenData;
      const promise = apiClient.connect();
      apiClient.transport.ws.socket.onopen(message);
      promise
        .then(socket => {
          expect(socket).toBeDefined();
          apiClient.transport.ws.socket.onmessage(message);
        })
        .then(done);
    });
  });
});
