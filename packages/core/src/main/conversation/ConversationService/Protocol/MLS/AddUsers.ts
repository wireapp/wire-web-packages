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

import {QualifiedId} from '@wireapp/api-client/src/user';
import {Decoder} from 'bazinga64';
import {ConversationService} from '../../ConversationService';

export type AddUsersParams = {
  conversationId: QualifiedId;
  userIds: QualifiedId[];
  groupId?: string;
};

export async function addUsers(this: ConversationService, {conversationId, userIds, groupId}: AddUsersParams) {
  const groupIdDecodedFromBase64 = Decoder.fromBase64(groupId!).asBytes;
  console.info('addUsersToMLSGroup', conversationId, userIds, groupIdDecodedFromBase64);
}
