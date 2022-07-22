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

import {Invitee} from '@otak/core-crypto/platforms/web/corecrypto';
import {QualifiedId} from '@wireapp/api-client/src/user';
import {Encoder, Decoder} from 'bazinga64';
import {ConversationService} from '../../ConversationService';

type QualifiedUsers = QualifiedId & {skipOwn?: string};
export async function getCoreCryptoKeyPackagesPayload(this: ConversationService, qualifiedUsers: QualifiedUsers[]) {
  /**
   * @note We need to fetch key packages for all the users
   * we want to add to the new MLS conversations,
   * includes self user too.
   */
  const keyPackages = await Promise.all([
    ...qualifiedUsers.map(({id, domain, skipOwn}) =>
      this.apiClient.api.client.claimMLSKeyPackages(id, domain, skipOwn),
    ),
  ]);

  const coreCryptoKeyPackagesPayload = keyPackages.reduce<Invitee[]>((previousValue, currentValue) => {
    // skip users that have not uploaded their MLS key packages
    if (currentValue.key_packages.length > 0) {
      return [
        ...previousValue,
        ...currentValue.key_packages.map(keyPackage => ({
          id: Encoder.toBase64(keyPackage.client).asBytes,
          kp: Decoder.fromBase64(keyPackage.key_package).asBytes,
        })),
      ];
    }
    return previousValue;
  }, []);

  return coreCryptoKeyPackagesPayload;
}

export async function addUsersToExistingMLSConversation(
  this: ConversationService,
  groupIdDecodedFromBase64: Uint8Array,
  invitee: Invitee[],
) {
  const coreCryptoClient = this.coreCryptoClientProvider();
  const memberAddedMessages = await coreCryptoClient.addClientsToConversation(groupIdDecodedFromBase64, invitee);
  const sendingPromises: Promise<unknown>[] = [];
  if (memberAddedMessages?.welcome) {
    sendingPromises.push(
      this.apiClient.api.conversation.postMlsWelcomeMessage(Uint8Array.from(memberAddedMessages.welcome)),
    );
  }
  if (memberAddedMessages?.message) {
    sendingPromises.push(this.apiClient.api.conversation.postMlsMessage(Uint8Array.from(memberAddedMessages.message)));
  }
  await Promise.all(sendingPromises);
}
