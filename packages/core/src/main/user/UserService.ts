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

import type {APIClient} from '@wireapp/api-client';
import type {QualifiedId, User} from '@wireapp/api-client/src/user/';
import {Availability, GenericMessage} from '@wireapp/protocol-messaging';
import UUID from 'uuidjs';

import type {AvailabilityType, BroadcastService} from '../broadcast/';
import {isQualifiedIdArray} from '../util/TypePredicateUtil';

export class UserService {
  private readonly apiClient: APIClient;
  private readonly broadcastService: BroadcastService;

  constructor(apiClient: APIClient, broadcastService: BroadcastService) {
    this.apiClient = apiClient;
    this.broadcastService = broadcastService;
  }

  public getUser(userId: string | QualifiedId): Promise<User> {
    return this.apiClient.user.api.getUser(userId as QualifiedId);
  }

  public async getUsers(userIds: string[] | QualifiedId[]): Promise<User[]> {
    if (!userIds.length) {
      return [];
    }
    return isQualifiedIdArray(userIds)
      ? this.apiClient.user.api.postListUsers({qualified_ids: userIds})
      : this.apiClient.user.api.getUsers({ids: userIds});
  }

  public setAvailability(teamId: string, type: AvailabilityType, sendAsProtobuf?: boolean): Promise<void> {
    const genericMessage = GenericMessage.create({
      availability: new Availability({type}),
      messageId: UUID.genV4().toString(),
    });

    return this.broadcastService.broadcastGenericMessage(teamId, genericMessage, sendAsProtobuf);
  }
}
