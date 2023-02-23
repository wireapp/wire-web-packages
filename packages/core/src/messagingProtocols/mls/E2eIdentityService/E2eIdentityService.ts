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
import logdown from 'logdown';

import {AcmeConnectionService, AcmeConnectionService} from './Connection';
import {
  CreateNewAccountReturnValue,
  CreateNewOrderParams,
  CreateNewOrderReturnValue,
  GetAuthorizationParams,
  GetAuthorizationReturnValue,
  GetClientAccessTokenParams,
  User,
} from './E2eIdentityService.types';
import {jsonToByteArray} from './Helper';

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
    return `impp:wireapp=${this.clientId}`;
  }

  // ############ Main Functions ############

  private async getDirectory(): Promise<void> {
    if (this.Identity) {
      const directory = await this.ConnectionService.getDirectory();

      if (directory) {
        const parsedDirectory = this.Identity.directoryResponse(directory);
        this.directory = parsedDirectory;
      }
    }
  }

  private async getInitialNonce(): Promise<string | undefined> {
    if (this.directory?.newNonce) {
      return await this.ConnectionService.getInitialNonce(this.directory.newNonce);
    }
    return undefined;
  }

  private async createNewAccount(initialNonce: string): CreateNewAccountReturnValue {
    if (this.Identity && this.directory?.newAccount) {
      const reqBody = this.Identity.newAccountRequest(this.directory, initialNonce);
      const response = await this.ConnectionService.createNewAccount(this.directory.newAccount, reqBody);
      if (response?.account && !!response.account.status.length && !!response.nonce.length) {
        return {
          account: this.Identity.newAccountResponse(jsonToByteArray(JSON.stringify(response.account))),
          nonce: response.nonce,
        };
      }
    }
    return undefined;
  }

  private async createNewOrder({account, nonce}: CreateNewOrderParams): CreateNewOrderReturnValue {
    if (this.Identity && this.directory?.newOrder) {
      const {displayName, handle, domain} = this.user;
      const reqBody = this.Identity.newOrderRequest(
        displayName,
        domain,
        this.getClientIdentifier(),
        handle,
        this.expiryDays,
        this.directory,
        account,
        nonce,
      );

      const response = await this.ConnectionService.createNewOrder(this.directory.newOrder, reqBody);
      if (response?.order && !!response.order.status.length && !!response.nonce.length) {
        return {
          order: this.Identity.newOrderResponse(jsonToByteArray(JSON.stringify(response.order))),
          authzUrl: response.order.authorizations[0],
          nonce: response.nonce,
        };
      }
    }
    return undefined;
  }

  private async getAuthorization({account, authzUrl, nonce}: GetAuthorizationParams): GetAuthorizationReturnValue {
    if (this.Identity) {
      const reqBody = this.Identity.newAuthzRequest(authzUrl, account, nonce);
      const response = await this.ConnectionService.getAuthorization(authzUrl, reqBody);
      if (response?.authorization && !!response.authorization.status.length && !!response.nonce.length) {
        return {
          authorization: this.Identity.newAuthzResponse(jsonToByteArray(JSON.stringify(response.authorization))),
          nonce: response.nonce,
        };
      }
    }
    return undefined;
  }

  private async getClientNonce(): Promise<string | undefined> {
    try {
      return await this.apiClient.api.client.getNonce(this.clientId);
    } catch (e) {
      this.logger.error('Could not get client nonce', e);
      return undefined;
    }
  }

  private async getClientAccessToken({clientNonce, wireHttpChallenge}: GetClientAccessTokenParams) {
    if (this.Identity) {
      try {
        const dpopToken = this.Identity.createDpopToken(
          this.apiClient.api.client.getAccessTokenUrl(this.clientId),
          this.user.id,
          BigInt(this.clientId),
          this.user.domain,
          wireHttpChallenge,
          clientNonce,
          this.expiryDays,
        );
        return await this.apiClient.api.client.getAccessToken(this.clientId, dpopToken);
      } catch (e) {
        this.logger.error('Could not get client access token', e);
        return undefined;
      }
    }
    return undefined;
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
    const accountData = await this.createNewAccount(nonce);
    if (!accountData) {
      throw new Error('No account-data received');
    }

    // Step 3: Create a new order
    const orderData = await this.createNewOrder({
      account: accountData.account,
      nonce: accountData.nonce,
    });
    if (!orderData) {
      throw new Error('No order-data received');
    }

    // Step 4: Get authorization challenges
    const authData = await this.getAuthorization({
      account: accountData.account,
      authzUrl: orderData.authzUrl,
      nonce: orderData.nonce,
    });
    if (!authData) {
      throw new Error('No authorization-data received');
    }

    // Step 5: Get a client nonce
    const clientNonce = await this.getClientNonce();
    if (!clientNonce) {
      throw new Error('No client-nonce received');
    }

    // Step 6: Get a client access token
    const {wireHttpChallenge} = authData.authorization;
    if (!wireHttpChallenge) {
      throw new Error('No wireHttpChallenge received');
    }
    const clientAccessToken = await this.getClientAccessToken({
      clientNonce,
      wireHttpChallenge,
    });
    if (!clientAccessToken) {
      throw new Error('No client-access-token received');
    }

    console.info('adrian', clientNonce, clientAccessToken);
  }
}
