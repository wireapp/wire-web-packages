/*
 * Wire
 * Copyright (C) 2023 Wire Swiss GmbH
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

import {QualifiedId} from '@wireapp/api-client/lib/user';
import {Decoder} from 'bazinga64';
import logdown from 'logdown';

import {Ciphersuite, CoreCrypto, E2eiConversationState, WireIdentity} from '@wireapp/core-crypto';

import {getE2EIClientId, uuidTobase64url} from './Helper';
import {E2EIStorage} from './Storage/E2EIStorage';

import {parseFullQualifiedClientId} from '../../../util/fullyQualifiedClientIdUtils';

// This export is meant to be accessible from the outside (e.g the Webapp / UI)
export class E2EIServiceExternal {
  private readonly logger = logdown('@wireapp/core/E2EIdentityServiceExternal');

  public constructor(private coreCryptoClient: CoreCrypto) {}

  // Checks if there is a certificate stored in the local storage
  public hasActiveCertificate(): boolean {
    return E2EIStorage.has.certificateData();
  }

  // Returns the certificate data stored in the local storage
  public getCertificateData(): string | undefined {
    try {
      return E2EIStorage.get.certificateData();
    } catch (error) {
      this.logger.error('ACME: Failed to get stored certificate', error);
      return undefined;
    }
  }

  // If we have a handle in the local storage, we are in the enrollment process (this handle is saved before oauth redirect)
  public isEnrollmentInProgress(): boolean {
    return E2EIStorage.has.handle();
  }

  public clearAllProgress(): void {
    E2EIStorage.remove.temporaryData();
  }

  public getConversationState(conversationId: Uint8Array): Promise<E2eiConversationState> {
    return this.coreCryptoClient.e2eiConversationState(conversationId);
  }

  public isE2EIEnabled(ciphersuite: Ciphersuite): Promise<boolean> {
    return this.coreCryptoClient.e2eiIsEnabled(ciphersuite);
  }

  public async getUsersIdentities(groupId: string, userIds: QualifiedId[]) {
    // We keep track of the ID we give to CoreCrypto in order to map it back to regular userIds afterwards
    const hashedIdMap = new Map(userIds.map(userId => [uuidTobase64url(userId.id).asString, userId]));

    const userIdentities = await this.coreCryptoClient.getUserIdentities(
      Decoder.fromBase64(groupId).asBytes,
      Array.from(hashedIdMap.keys()),
    );

    const mappedUserIdentities = new Map();
    for (const [base64Id, identities] of userIdentities) {
      // remapping coreCrypto user ids to regular userIds
      const userId = hashedIdMap.get(base64Id);
      if (userId) {
        mappedUserIdentities.set(
          userId.id,
          identities.map(identity => ({
            ...identity,
            deviceId: parseFullQualifiedClientId((identity as any).client_id).client,
          })),
        );
      }
    }

    return mappedUserIdentities;
  }

  // Returns devices e2ei certificates
  public async getDevicesIdentities(
    groupId: string,
    userClientsMap: Record<string, QualifiedId>,
  ): Promise<WireIdentity[]> {
    const clientIds = Object.entries(userClientsMap).map(
      ([clientId, userId]) => getE2EIClientId(clientId, userId.id, userId.domain).asBytes,
    );
    return this.coreCryptoClient.getDeviceIdentities(Decoder.fromBase64(groupId).asBytes, clientIds);
  }
}
