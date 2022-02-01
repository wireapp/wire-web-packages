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
import {ClientMismatch, UserClients} from '@wireapp/api-client/src/conversation';
import type {UserPreKeyBundleMap} from '@wireapp/api-client/src/user/';
import {GenericMessage} from '@wireapp/protocol-messaging';

import {MessageService} from '../conversation/message/MessageService';
import type {CryptographyService} from '../cryptography/';

export class BroadcastService {
  private readonly messageService: MessageService;

  constructor(private readonly apiClient: APIClient, private readonly cryptographyService: CryptographyService) {
    this.messageService = new MessageService(this.apiClient, this.cryptographyService);
  }

  /**
   * Will create a key bundle for all the users of the team
   *
   * @param teamId
   * @param skipOwnClients=false
   * @param onlyDirectConnections=false Will generate a bundle only for directly connected users (users the self user has conversation with). Allows avoiding broadcasting messages to too many people
   */
  public async getPreKeyBundlesFromTeam(
    teamId: string,
    skipOwnClients = false,
    onlyDirectConnections = false,
  ): Promise<UserPreKeyBundleMap> {
    const teamMembers = onlyDirectConnections
      ? (await this.apiClient.conversation.api.getConversations()).conversations
          .map(({members}) => members.others.map(user => user.id).concat(members.self.id))
          .flat()
      : (await this.apiClient.teams.member.api.getAllMembers(teamId)).members.map(({user}) => user);

    let members = Array.from(new Set(teamMembers)).map(member => ({id: member}));

    if (skipOwnClients) {
      const selfUser = await this.apiClient.self.api.getSelf();
      members = members.filter(member => member.id !== selfUser.id);
    }

    const preKeys = await Promise.all(members.map(member => this.apiClient.user.api.getUserPreKeys(member.id)));

    return preKeys.reduce<UserPreKeyBundleMap>((bundleMap, bundle) => {
      bundleMap[bundle.user] = {};
      for (const client of bundle.clients) {
        bundleMap[bundle.user][client.client] = client.prekey;
      }
      return bundleMap;
    }, {});
  }

  public async broadcastGenericMessage(
    genericMessage: GenericMessage,
    recipients: UserPreKeyBundleMap | UserClients,
    sendAsProtobuf?: boolean,
    onClientMismatch?: (mismatch: ClientMismatch) => void | boolean | Promise<boolean>,
  ): Promise<ClientMismatch> {
    const plainTextArray = GenericMessage.encode(genericMessage).finish();
    return this.messageService.sendMessage(this.apiClient.validatedClientId, recipients, plainTextArray, {
      sendAsProtobuf,
      reportMissing: Object.keys(recipients),
      onClientMismatch,
    });
  }
}
