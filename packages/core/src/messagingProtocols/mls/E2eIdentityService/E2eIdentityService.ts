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

import {
  AcmeChallenge,
  AcmeDirectory,
  Ciphersuite,
  CoreCrypto,
  WireE2eIdentity,
} from '@wireapp/core-crypto/platforms/web/corecrypto';
import {Decoder, Encoder} from 'bazinga64';
import logdown from 'logdown';

import {APIClient} from '@wireapp/api-client';

import {AcmeService} from './Connection/AcmeServer';
import {InitParams, User} from './E2eIdentityService.types';
import {getE2eClientId} from './Helper';
import {createNewAccount} from './Steps/Account';
import {getAuthorization} from './Steps/Authorization';
import {createNewOrder} from './Steps/Order';
import {AcmeStorage} from './Storage/AcmeStorage';

import {OIDCService} from '../../../oauth';

class E2eIdentityService {
  private static instance: E2eIdentityService;
  private readonly logger = logdown('@wireapp/core/E2EIdentityService');
  private readonly expiryDays = 2;
  private readonly coreCryptoClient: CoreCrypto;
  //private readonly apiClient: APIClient;
  private identity?: WireE2eIdentity;
  private acmeService?: AcmeService;
  private user?: User;
  private clientId?: string;
  private e2eClientId?: string;
  private isInitialized = false;
  private isInProgress = false;

  private constructor(coreCryptClient: CoreCrypto, apiClient: APIClient) {
    this.coreCryptoClient = coreCryptClient;
    console.log(apiClient);
    //this.apiClient = apiClient;
  }

  // ############ Public Functions ############

  public static async getInstance(params?: InitParams): Promise<E2eIdentityService> {
    if (!E2eIdentityService.instance) {
      if (!params) {
        throw new Error('GracePeriodTimer is not initialized. Please call getInstance with params.');
      }
      const {skipInit = false, coreCryptClient, apiClient} = params;
      E2eIdentityService.instance = new E2eIdentityService(coreCryptClient, apiClient);
      if (!skipInit) {
        const {discoveryUrl, user, clientId} = params;
        if (!discoveryUrl || !user || !clientId) {
          throw new Error('discoveryUrl, user and clientId are required to initialize E2eIdentityService');
        }
        await E2eIdentityService.instance.init({clientId, discoveryUrl, user});
      }
    }
    return E2eIdentityService.instance;
  }

  public async getNewCertificate(): Promise<boolean> {
    // Step 0: Check if we have a handle in local storage
    // If we don't have a handle, we need to start a new OAuth flow
    this.isInProgress = AcmeStorage.hasHandle();

    if (this.isInProgress) {
      try {
        return await this.continueOAuthFlow();
      } catch (error) {
        return this.exitWithError('Error while trying to continue OAuth flow with error:', error);
      }
    } else {
      try {
        return await this.startNewOAuthFlow();
      } catch (error) {
        return this.exitWithError('Error while trying to start OAuth flow with error:', error);
      }
    }

    // Step 7: Do OIDC client challenge
    // const oidcData = await doWireOidcChallenge({
    //   authData,
    //   connection,
    //   identity,
    //   oAuthIdToken,
    //   nonce: dpopData.nonce,
    // });

    // Step 5: Do DPOP Challenge
    // const dpopData = await doWireDpopChallenge({
    //   authData,
    //   connection,
    //   identity,
    //   userDomain: this.user.domain,
    //   clientId: this.clientId,
    //   apiClient: this.apiClient,
    //   expirySecs: this.expirySecs,
    //   nonce: authData.nonce,
    // });
    //console.log('acme dpopData', JSON.stringify(dpopData));

    //console.log(authData, dpopData);
  }

  // ############ Internal Functions ############

  private exitWithError(message: string, error?: unknown) {
    this.logger.error(message, error);
    return false;
  }

  private async init(params: Required<Pick<InitParams, 'user' | 'clientId' | 'discoveryUrl'>>): Promise<void> {
    const {user, clientId, discoveryUrl} = params;
    if (!user || !clientId) {
      this.logger.error('user and clientId are required to initialize E2eIdentityService');
      throw new Error();
    }
    this.acmeService = new AcmeService(discoveryUrl);
    this.user = user;
    this.clientId = clientId;
    this.e2eClientId = getE2eClientId(this.user, this.clientId);
    this.identity = await this.coreCryptoClient.e2eiNewEnrollment(
      this.e2eClientId,
      this.user.displayName,
      this.user.handle,
      this.expiryDays,
      Ciphersuite.MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519,
    );
    this.isInitialized = true;
  }

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

  private getOidcService(challenge: AcmeChallenge): OIDCService {
    const oidcService = new OIDCService({
      audience: '338888153072-ktbh66pv3mr0ua0dn64sphgimeo0p7ss.apps.googleusercontent.com',
      authorityUrl: 'https://accounts.google.com' || challenge.target,
      redirectUri: 'https://local.zinfra.io:8081/oidc',
      clientSecret: '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',
    });
    return oidcService;
  }

  private async startNewOAuthFlow() {
    if (this.isInProgress) {
      return this.exitWithError('Error while trying to start OAuth flow. There is already a flow in progress');
    }
    if (!this.isInitialized || !this.identity || !this.acmeService) {
      return this.exitWithError('Error while trying to start OAuth flow. E2eIdentityService is not fully initialized');
    }

    // Get the directory
    const directory = await this.getDirectory(this.identity, this.acmeService);
    if (!directory) {
      return this.exitWithError('Error while trying to start OAuth flow. No directory received');
    }

    // Step 1: Get a new nonce from ACME server
    const nonce = await this.getInitialNonce(directory, this.acmeService);
    if (!nonce) {
      return this.exitWithError('Error while trying to start OAuth flow. No nonce received');
    }

    // Step 2: Create a new account
    const newAccountNonce = await createNewAccount({
      connection: this.acmeService,
      directory,
      identity: this.identity,
      nonce,
    });
    console.log('acme newAccountNonce', JSON.stringify(newAccountNonce));

    // Step 3: Create a new order
    const orderData = await createNewOrder({
      directory,
      connection: this.acmeService,
      identity: this.identity,
      nonce: newAccountNonce,
    });
    console.log('acme orderData', JSON.stringify(orderData));

    // Step 4: Get authorization challenges
    const authData = await getAuthorization({
      connection: this.acmeService,
      identity: this.identity,
      authzUrl: orderData.authzUrl,
      nonce: orderData.nonce,
    });
    // Manual copy of the data because of a problem with copying the wasm object

    console.log('acme authData', authData);
    // Step 6: Start E2E OAuth flow
    const {
      authorization: {wireOidcChallenge},
    } = authData;
    if (wireOidcChallenge) {
      // stash the identity for later use
      const handle = await this.coreCryptoClient.e2eiEnrollmentStash(this.identity);
      // stash the handle in local storage
      AcmeStorage.storeHandle(Encoder.toBase64(handle).asString);
      AcmeStorage.storeAuthData(authData);
      // this will cause a redirect to the OIDC provider
      const oidcService = this.getOidcService(wireOidcChallenge);
      await oidcService.authenticate();
    }
    return true;
  }

  private async continueOAuthFlow() {
    // If we have a handle, the user has already started the process to authenticate with the OIDC provider. We can continue the flow.
    try {
      const handle = AcmeStorage.getAndVerifyHandle();
      const {
        authorization: {wireOidcChallenge},
        //nonce,
      } = AcmeStorage.getAndVerifyAuthData();
      if (!wireOidcChallenge) {
        return this.exitWithError('Error while trying to continue OAuth flow. No wireOidcChallenge received');
      }
      this.identity = await this.coreCryptoClient.e2eiEnrollmentStashPop(Decoder.fromBase64(handle).asBytes);
      this.logger.log('retrieved identity from stash');
      const service = this.getOidcService(wireOidcChallenge);
      const user = service.handleAuthentication();
      this.logger.log('received user data', user);
    } catch (error) {
      this.logger.error('Error while trying to continue OAuth flow');
      throw error;
    }
    return true;
  }
}

export {E2eIdentityService};
