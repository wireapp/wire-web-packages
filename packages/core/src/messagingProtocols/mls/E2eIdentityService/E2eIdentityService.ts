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
import {Encoder} from 'bazinga64';
import logdown from 'logdown';

import {APIClient} from '@wireapp/api-client';

import {AcmeConnectionService} from './Connection';
import {User} from './E2eIdentityService.types';
import {createNewAccount} from './Steps/Account';
import {getAuthorization} from './Steps/Authorization';
import {doWireDpopChallenge} from './Steps/DpopChallenge';
import {doWireOidcChallenge} from './Steps/OidcChallenge';
import {createNewOrder} from './Steps/Order';

export class E2eIdentityService {
  private readonly logger = logdown('@wireapp/core/E2EIdentityService');
  private readonly ConnectionService: AcmeConnectionService = new AcmeConnectionService();
  private readonly expiryDays = 90;
  private Identity: WireE2eIdentity | undefined;
  private directory: AcmeDirectory | undefined;

  constructor(
    private readonly apiClient: APIClient,
    private readonly coreCryptoClient: CoreCrypto,
    private readonly user: User,
    private readonly clientId: string,
  ) {}

  // ############ Helper Functions ############

  private getClientIdentifier(): string {
    return `impp:wireapp=${Encoder.toBase64(this.user.id).asString}/${this.clientId}@${this.user.domain}`;
  }

  // ############ Main Functions ############

  private async getDirectory(): Promise<void> {
    try {
      if (this.Identity) {
        const directory = await this.ConnectionService.getDirectory();

        if (directory) {
          const parsedDirectory = this.Identity.directoryResponse(directory);
          this.directory = parsedDirectory;
        }
      }
    } catch (e) {
      throw new Error('Error while trying to receive a directory', {cause: e});
    }
  }

  private async getInitialNonce(): Promise<string> {
    try {
      if (!this.directory) {
        throw new Error('No directory');
      }
      const nonce = await this.ConnectionService.getInitialNonce(this.directory.newNonce);
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
    // If no Identity is found, create a new one
    if (!this.Identity) {
      this.logger.info('No Identity found, creating new E2E Identity');
      this.Identity = await this.coreCryptoClient.newAcmeEnrollment();
    }
    // If no directory is found, get the directory
    if (!this.directory) {
      this.logger.info('No Directory found, fetching new E2E Directory');
      await this.getDirectory();
      if (!this.directory) {
        throw new Error('No directory received');
      }
    }

    // Step 1: Get a new nonce from ACME server
    const nonce = await this.getInitialNonce();
    if (!nonce) {
      throw new Error('No nonce received');
    }

    // Step 2: Create a new account
    const accountData = await createNewAccount({
      connection: this.ConnectionService,
      directory: this.directory,
      identity: this.Identity,
      nonce,
    });

    // Step 3: Create a new order
    const orderData = await createNewOrder({
      clientIdentifier: this.getClientIdentifier(),
      connection: this.ConnectionService,
      directory: this.directory,
      expiryDays: this.expiryDays,
      identity: this.Identity,
      user: this.user,
      account: accountData.account,
      nonce: accountData.nonce,
    });

    // Step 4: Get authorization challenges
    const authData = await getAuthorization({
      connection: this.ConnectionService,
      identity: this.Identity,
      account: accountData.account,
      authzUrl: orderData.authzUrl,
      nonce: orderData.nonce,
    });

    // Step 5: Do DPOP Challenge
    const dpopData = await doWireDpopChallenge({
      connection: this.ConnectionService,
      identity: this.Identity,
      apiClient: this.apiClient,
      clientId: this.clientId,
      user: this.user,
      expiryDays: this.expiryDays,
      account: accountData.account,
      nonce: authData.nonce,
      authData,
    });

    // Step 6: Do OIDC client challenge
    const oidcData = await doWireOidcChallenge({
      connection: this.ConnectionService,
      identity: this.Identity,
      user: this.user,
      account: accountData.account,
      nonce: authData.nonce,
      authData,
    });

    console.log(dpopData, oidcData);
  }
}
