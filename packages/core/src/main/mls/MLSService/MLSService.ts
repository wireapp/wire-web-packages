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

import {
  CommitBundle,
  ConversationConfiguration,
  ConversationId,
  CoreCrypto,
  DecryptedMessage,
  Invitee,
} from '@otak/core-crypto/platforms/web/corecrypto';
import {APIClient} from '@wireapp/api-client';
import {QualifiedUsers} from '../../conversation';
import {Decoder, Encoder} from 'bazinga64';

//@todo: this function is temporary, we wait for the update from core-crypto side
//they are returning regular array instead of Uint8Array for commit and welcome messages
export const optionalToUint8Array = (array: Uint8Array | []): Uint8Array => {
  return Array.isArray(array) ? Uint8Array.from(array) : array;
};

export class MLSService {
  constructor(
    private readonly apiClient: APIClient,
    private readonly coreCryptoClientProvider: () => CoreCrypto | undefined,
  ) {}

  private getCoreCryptoClient() {
    const client = this.coreCryptoClientProvider();
    if (!client) {
      throw new Error('Could not get coreCryptoClient');
    }
    return client;
  }

  public async uploadCoreCryptoCommitBundle(groupIdDecodedFromBase64: Uint8Array, commitBundle: CommitBundle) {
    const coreCryptoClient = this.getCoreCryptoClient();

    if (commitBundle.welcome) {
      //@todo: it's temporary - we wait for core-crypto fix to return the actual Uint8Array instead of regular array
      await this.apiClient.api.conversation.postMlsWelcomeMessage(optionalToUint8Array(commitBundle.welcome));
    }
    if (commitBundle.commit) {
      const messageResponse = await this.apiClient.api.conversation.postMlsMessage(
        //@todo: it's temporary - we wait for core-crypto fix to return the actual Uint8Array instead of regular array
        optionalToUint8Array(commitBundle.commit),
      );
      await coreCryptoClient.commitAccepted(groupIdDecodedFromBase64);
      return messageResponse;
    }
    return null;
  }

  public async addUsersToExistingMLSConversation(groupIdDecodedFromBase64: Uint8Array, invitee: Invitee[]) {
    const coreCryptoClient = this.getCoreCryptoClient();
    const memberAddedMessages = await coreCryptoClient.addClientsToConversation(groupIdDecodedFromBase64, invitee);

    if (memberAddedMessages?.welcome) {
      //@todo: it's temporary - we wait for core-crypto fix to return the actual Uint8Array instead of regular array
      await this.apiClient.api.conversation.postMlsWelcomeMessage(optionalToUint8Array(memberAddedMessages.welcome));
    }
    if (memberAddedMessages?.commit) {
      const messageResponse = await this.apiClient.api.conversation.postMlsMessage(
        //@todo: it's temporary - we wait for core-crypto fix to return the actual Uint8Array instead of regular array
        optionalToUint8Array(memberAddedMessages.commit),
      );
      await coreCryptoClient.commitAccepted(groupIdDecodedFromBase64);
      return messageResponse;
    }
    return null;
  }

  public async getCoreCryptoKeyPackagesPayload(qualifiedUsers: QualifiedUsers[]) {
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

  public async processWelcomeMessage(welcomeMessage: Uint8Array): Promise<ConversationId> {
    return this.getCoreCryptoClient().processWelcomeMessage(welcomeMessage);
  }

  public async decryptMessage(conversationId: ConversationId, payload: Uint8Array): Promise<DecryptedMessage> {
    return this.getCoreCryptoClient().decryptMessage(conversationId, payload);
  }

  public async updateKeyingMaterial(conversationId: ConversationId): Promise<CommitBundle> {
    return this.getCoreCryptoClient().updateKeyingMaterial(conversationId);
  }

  public async createConversation(
    conversationId: ConversationId,
    configuration?: ConversationConfiguration,
  ): Promise<any> {
    return this.getCoreCryptoClient().createConversation(conversationId, configuration);
  }

  public async encryptMessage(conversationId: ConversationId, message: Uint8Array): Promise<Uint8Array> {
    return this.getCoreCryptoClient().encryptMessage(conversationId, message);
  }

  public async removeClientsFromConversation(
    conversationId: ConversationId,
    clientIds: Uint8Array[],
  ): Promise<CommitBundle> {
    return this.getCoreCryptoClient().removeClientsFromConversation(conversationId, clientIds);
  }

  public async commitPendingProposals(conversationId: ConversationId): Promise<CommitBundle> {
    return this.getCoreCryptoClient().commitPendingProposals(conversationId);
  }
}
