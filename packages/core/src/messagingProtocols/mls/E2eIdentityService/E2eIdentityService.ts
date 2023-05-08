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

import {AcmeService} from './Connection/AcmeServer';
import {User} from './E2eIdentityService.types';
import {getE2eClientId} from './Helper';
import {createNewAccount} from './Steps/Account';
import {getAuthorization} from './Steps/Authorization';
import {doWireDpopChallenge} from './Steps/DpopChallenge';
import {createNewOrder} from './Steps/Order';

export class E2eIdentityService {
  //private readonly logger = logdown('@wireapp/core/E2EIdentityService');
  private readonly expiryDays = 2;
  private readonly expirySecs = 20;

  constructor(
    private readonly apiClient: APIClient,
    private readonly coreCryptoClient: CoreCrypto,
    private readonly user: User,
    private readonly clientId: string,
  ) {}

  // ############ Internal Functions ############

  private async getDirectory(identity: WireE2eIdentity, connection: AcmeService): Promise<AcmeDirectory | undefined> {
    try {
      const directory = await connection.getDirectory();

      if (directory) {
        const parsedDirectory = identity.directoryResponse(directory);
        return parsedDirectory;
      }
    } catch (e) {
      throw new Error('Error while trying to receive a directory', {cause: e});
    }
    return undefined;
  }

  private async getInitialNonce(directory: AcmeDirectory, connection: AcmeService): Promise<string> {
    try {
      const nonce = await connection.getInitialNonce(directory.newNonce);
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
    const connection = new AcmeService();
    const identity = await this.coreCryptoClient.newAcmeEnrollment(
      e2eClientId,
      this.user.displayName,
      this.user.handle,
      this.expiryDays,
    );
    console.log(
      'acme Identity created with: ',
      JSON.stringify({e2eClientId, expiryDays: this.expiryDays, user: this.user}),
    );
    // Get the directory
    const directory = await this.getDirectory(identity, connection);
    if (!directory) {
      throw new Error('No directory received');
    }

    // Step 1: Get a new nonce from ACME server
    const nonce = await this.getInitialNonce(directory, connection);
    if (!nonce) {
      throw new Error('No nonce received');
    }

    // Step 2: Create a new account
    const newAccountNonce = await createNewAccount({
      connection,
      directory,
      identity,
      nonce,
    });
    console.log('acme newAccountNonce', JSON.stringify(newAccountNonce));

    // Step 3: Create a new order
    const orderData = await createNewOrder({
      directory,
      connection,
      identity,
      nonce: newAccountNonce,
    });
    console.log('acme orderData', JSON.stringify(orderData));

    // Step 4: Get authorization challenges
    const authData = await getAuthorization({
      connection,
      identity,
      authzUrl: orderData.authzUrl,
      nonce: orderData.nonce,
    });
    console.log('acme authData', JSON.stringify(authData));

    // Step 5: Do DPOP Challenge
    const dpopData = await doWireDpopChallenge({
      authData,
      connection,
      identity,
      userDomain: this.user.domain,
      clientId: this.clientId,
      apiClient: this.apiClient,
      expirySecs: this.expirySecs,
      nonce: authData.nonce,
    });
    console.log('acme dpopData', JSON.stringify(dpopData));

    // Step 6: Start E2E OAuth flow

    // const oAuthIdToken =
    //   'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NzU5NjE3NTYsImV4cCI6MTY3NjA0ODE1NiwibmJmIjoxNjc1OTYxNzU2LCJpc3MiOiJodHRwOi8vaWRwLyIsInN1YiI6ImltcHA6d2lyZWFwcD1OREV5WkdZd05qYzJNekZrTkRCaU5UbGxZbVZtTWpReVpUSXpOVGM0TldRLzY1YzNhYzFhMTYzMWMxMzZAZXhhbXBsZS5jb20iLCJhdWQiOiJodHRwOi8vaWRwLyIsIm5hbWUiOiJTbWl0aCwgQWxpY2UgTSAoUUEpIiwiaGFuZGxlIjoiaW1wcDp3aXJlYXBwPWFsaWNlLnNtaXRoLnFhQGV4YW1wbGUuY29tIiwia2V5YXV0aCI6IlNZNzR0Sm1BSUloZHpSdEp2cHgzODlmNkVLSGJYdXhRLi15V29ZVDlIQlYwb0ZMVElSRGw3cjhPclZGNFJCVjhOVlFObEw3cUxjbWcifQ.0iiq3p5Bmmp8ekoFqv4jQu_GrnPbEfxJ36SCuw-UvV6hCi6GlxOwU7gwwtguajhsd1sednGWZpN8QssKI5_CDQ';

    // Step 7: Do OIDC client challenge
    // const oidcData = await doWireOidcChallenge({
    //   authData,
    //   connection,
    //   identity,
    //   oAuthIdToken,
    //   nonce: dpopData.nonce,
    // });

    console.log(authData, dpopData);
  }
}
