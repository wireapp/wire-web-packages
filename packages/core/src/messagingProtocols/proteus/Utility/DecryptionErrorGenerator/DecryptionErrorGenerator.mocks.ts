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

import {ConversationOtrMessageAddEvent, CONVERSATION_EVENT} from '@wireapp/api-client/lib/event';

export const conversationOtrMessageAddEventMock: ConversationOtrMessageAddEvent = {
  conversation: 'conversation-id',
  from: 'user-id',
  time: '2020-01',
  data: {
    recipient: 'recipient-id',
    sender: 'sender-id',
    text: 'text',
  },
  type: CONVERSATION_EVENT.OTR_MESSAGE_ADD,
};