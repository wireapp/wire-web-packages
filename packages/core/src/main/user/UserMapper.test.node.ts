/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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

import {Connection, ConnectionStatus} from '@wireapp/api-client/dist/connection';
import {USER_EVENT, UserConnectionEvent} from '@wireapp/api-client/dist/event';

import {PayloadBundle, PayloadBundleSource, PayloadBundleState, PayloadBundleType} from '../conversation';
import {UserMapper} from './UserMapper';

describe('UserMapper', () => {
  describe('"mapUserEvent"', () => {
    it('maps "user.connection" events', () => {
      const selfUserId = '95dbbc18-5e22-41dc-acce-0d9d983c1a60';
      const event: UserConnectionEvent = {
        connection: {
          conversation: '19dbbc18-5e22-41dc-acce-0d9d983c1a60',
          from: '39b7f597-dfd1-4dff-86f5-fe1b79cb70a0',
          last_update: '2018-07-06T09:38:52.286Z',
          message: ' ',
          status: ConnectionStatus.SENT,
          to: 'e023c681-7e51-43dd-a5d8-0f821e70a9c0',
        },
        type: USER_EVENT.CONNECTION,
        user: {
          name: 'Someone',
        },
      };

      const incomingEvent = UserMapper.mapUserEvent(
        event,
        selfUserId,
        PayloadBundleSource.WEBSOCKET,
      ) as PayloadBundle & {content: Connection};

      expect(incomingEvent.content).toBe(event.connection);
      expect(incomingEvent.conversation).toBe(event.connection.conversation);
      expect(incomingEvent.from).toBe(event.connection.from);
      expect(typeof incomingEvent.id).toBe('string');
      expect(incomingEvent.messageTimer).toBe(0);
      expect(incomingEvent.state).toBe(PayloadBundleState.INCOMING);
      expect(incomingEvent.timestamp).toBe(new Date(event.connection.last_update).getTime());
      expect(incomingEvent.type).toBe(PayloadBundleType.CONNECTION_REQUEST);
    });
  });
});
