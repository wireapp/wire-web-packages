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

import {AcmeDirectory, CoreCrypto, WireE2eIdentity} from '@wireapp/core-crypto/platforms/web/corecrypto';

import {APIClient} from '@wireapp/api-client';

import {AcmeConnectionService} from './Connection';
import {User} from './E2eIdentityService.types';
import {getE2eClientId} from './Helper';
import {createNewAccount} from './Steps/Account';
import {getAuthorization} from './Steps/Authorization';
import {doWireDpopChallenge} from './Steps/DpopChallenge/DpopChallenge';
import {doWireOidcChallenge} from './Steps/OidcChallenge';
import {createNewOrder} from './Steps/Order';

export class E2eIdentityService {
  //private readonly logger = logdown('@wireapp/core/E2EIdentityService');
  private readonly connectionService: AcmeConnectionService = new AcmeConnectionService();
  private readonly expiryDays = 90;

  constructor(
    private readonly apiClient: APIClient,
    private readonly coreCryptoClient: CoreCrypto,
    private readonly user: User,
    private readonly clientId: string,
  ) {}

  // ############ Internal Functions ############

  private async getDirectory(identity: WireE2eIdentity): Promise<AcmeDirectory | undefined> {
    try {
      const directory = await this.connectionService.getDirectory();

      if (directory) {
        const parsedDirectory = identity.directoryResponse(directory);
        return parsedDirectory;
      }
    } catch (e) {
      throw new Error('Error while trying to receive a directory', {cause: e});
    }
    return undefined;
  }

  private async getInitialNonce(directory: AcmeDirectory): Promise<string> {
    try {
      const nonce = await this.connectionService.getInitialNonce(directory.newNonce);
      if (nonce) {
        return nonce;
      }
      throw new Error('No initial-nonce received');
    } catch (e) {
      throw new Error('Error while trying to receive a nonce', {cause: e});
    }
  }

  // ############ Public Functions ############

  public async getNewCertificate(): Promise<void> {
    // Create a new identity
    const e2eClientId = getE2eClientId(this.user, this.clientId);
    const identity = await this.coreCryptoClient.newAcmeEnrollment(
      e2eClientId,
      this.user.displayName,
      this.user.handle,
      this.expiryDays,
    );
    // Get the directory
    const directory = await this.getDirectory(identity);
    if (!directory) {
      throw new Error('No directory received');
    }

    // Step 1: Get a new nonce from ACME server
    const nonce = await this.getInitialNonce(directory);
    if (!nonce) {
      throw new Error('No nonce received');
    }

    // Step 2: Create a new account
    const newAccountNonce = await createNewAccount({
      connection: this.connectionService,
      directory,
      identity,
      nonce,
    });

    // Step 3: Create a new order
    const orderData = await createNewOrder({
      identity,
      directory,
      connection: this.connectionService,
      nonce: newAccountNonce,
    });

    // Step 4: Get authorization challenges
    const authData = await getAuthorization({
      identity,
      connection: this.connectionService,
      authzUrl: orderData.authzUrl,
      nonce: orderData.nonce,
    });

    // Step 5: Do DPOP Challenge
    const dpopData = await doWireDpopChallenge({
      authData,
      identity,
      clientId: this.clientId,
      connection: this.connectionService,
      apiClient: this.apiClient,
      nonce: authData.nonce,
    });

    // Step 6: Do OIDC client challenge
    const oidcData = await doWireOidcChallenge({
      authData,
      identity,
      connection: this.connectionService,
      OAuthIdToken: this.user.OAuthIdToken,
      nonce: dpopData.nonce,
    });

    console.log(dpopData, oidcData);
  }
}
