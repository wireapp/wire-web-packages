/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
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

import {HttpClient} from '../../http';
import {ConversationAPI} from './ConversationAPI';
import {proteus} from '@wireapp/protocol-messaging/web/otr';

const httpClientMock = jasmine.createSpyObj('httpClient', {sendProtocolBuffer: () => ({data: ''})});

describe('ConversationAPI', () => {
  const conversationApi = new ConversationAPI(httpClientMock as HttpClient, {
    version: 0,
    federationEndpoints: false,
    isFederated: false,
  });
  describe('postORTMessage', () => {
    it('add ignore_missing and report_missing parameters', async () => {
      const message = new proteus.NewOtrMessage({sender: {client: 1e6}});
      await conversationApi.postOTRMessage('conv-id', message, false);
      expect(httpClientMock.sendProtocolBuffer).toHaveBeenCalledWith(
        jasmine.objectContaining({
          params: {ignore_missing: false},
        }),
        true,
      );

      await conversationApi.postOTRMessage('conv-id', new proteus.NewOtrMessage({sender: {client: 1e6}}), true);
      expect(httpClientMock.sendProtocolBuffer).toHaveBeenCalledWith(
        jasmine.objectContaining({params: {ignore_missing: true}}),
        true,
      );

      await conversationApi.postOTRMessage('conv-id', new proteus.NewOtrMessage({sender: {client: 1e6}}), [
        'user1',
        'user2',
      ]);
      expect(httpClientMock.sendProtocolBuffer).toHaveBeenCalledWith(
        jasmine.objectContaining({
          params: {ignore_missing: 'user1,user2'},
        }),
        true,
      );
    });
  });
});
