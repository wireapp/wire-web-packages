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
  RotateBundle,
  WireE2eIdentity,
} from '@wireapp/core-crypto/platforms/web/corecrypto';
import {Decoder, Encoder} from 'bazinga64';
import logdown from 'logdown';

import {APIClient} from '@wireapp/api-client';

import {AcmeService} from './Connection/AcmeServer';
import {InitParams} from './E2eIdentityService.types';
import {getE2eClientId, isResponseStatusValid} from './Helper';
import {createNewAccount} from './Steps/Account';
import {getAuthorization} from './Steps/Authorization';
import {getCertificate} from './Steps/Certificate';
import {doWireDpopChallenge} from './Steps/DpopChallenge';
import {doWireOidcChallenge} from './Steps/OidcChallenge';
import {createNewOrder, finalizeOrder} from './Steps/Order';
import {AcmeStorage} from './Storage/AcmeStorage';

import {OIDCService} from '../../../oauth';

class E2eIdentityService {
  private static instance: E2eIdentityService;
  private readonly logger = logdown('@wireapp/core/E2EIdentityService');
  private readonly coreCryptoClient: CoreCrypto;
  private readonly apiClient: APIClient;
  private readonly keyPackagesAmount;
  private identity?: WireE2eIdentity;
  private acmeService?: AcmeService;
  private isInitialized = false;
  private isInProgress = false;

  private constructor(coreCryptClient: CoreCrypto, apiClient: APIClient, keyPackagesAmount: number = 100) {
    this.coreCryptoClient = coreCryptClient;
    this.apiClient = apiClient;
    this.keyPackagesAmount = keyPackagesAmount;
  }

  // ############ Public Functions ############

  public static async getInstance(params?: InitParams): Promise<E2eIdentityService> {
    if (!E2eIdentityService.instance) {
      if (!params) {
        throw new Error('GracePeriodTimer is not initialized. Please call getInstance with params.');
      }
      const {skipInit = false, coreCryptClient, apiClient, keyPackagesAmount} = params;
      E2eIdentityService.instance = new E2eIdentityService(coreCryptClient, apiClient, keyPackagesAmount);
      if (!skipInit) {
        const {discoveryUrl, user, clientId} = params;
        if (!discoveryUrl || !user || !clientId) {
          throw new Error('discoveryUrl, user and clientId are required to initialize E2eIdentityService');
        }
        AcmeStorage.storeInitialData({discoveryUrl, user, clientId});
        await E2eIdentityService.instance.init({clientId, discoveryUrl, user});
      }
    }
    return E2eIdentityService.instance;
  }

  public async getNewCertificate(): Promise<RotateBundle | undefined> {
    // Step 0: Check if we have a handle in local storage
    // If we don't have a handle, we need to start a new OAuth flow
    this.isInProgress = AcmeStorage.hasHandle();

    if (this.isInProgress) {
      try {
        return this.continueOAuthFlow();
      } catch (error) {
        return this.exitWithError('Error while trying to continue OAuth flow with error:', error);
      }
    } else {
      try {
        return this.startNewOAuthFlow();
      } catch (error) {
        return this.exitWithError('Error while trying to start OAuth flow with error:', error);
      }
    }
  }

  // ############ Internal Functions ############

  private exitWithError(message: string, error?: unknown) {
    this.logger.error(message, error);
    return undefined;
  }

  private async init(params: Required<Pick<InitParams, 'user' | 'clientId' | 'discoveryUrl'>>): Promise<void> {
    try {
      const {user, clientId, discoveryUrl} = params;
      if (!user || !clientId) {
        this.logger.error('user and clientId are required to initialize E2eIdentityService');
        throw new Error();
      }
      this.acmeService = new AcmeService(discoveryUrl);
      this.identity = await this.coreCryptoClient.e2eiNewActivationEnrollment(
        getE2eClientId(user, clientId),
        user.displayName,
        user.handle,
        2,
        Ciphersuite.MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519,
      );
      this.isInitialized = true;
    } catch (error) {
      this.logger.error('Error while trying to initialize E2eIdentityService', error);
      throw error;
    }
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
      redirectUri: 'https://local.elna.wire.link:8081/',
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

    // Step 3: Create a new order
    const orderData = await createNewOrder({
      directory,
      connection: this.acmeService,
      identity: this.identity,
      nonce: newAccountNonce,
    });

    // Step 4: Get authorization challenges
    const authData = await getAuthorization({
      connection: this.acmeService,
      identity: this.identity,
      authzUrl: orderData.authzUrl,
      nonce: orderData.nonce,
    });
    // Manual copy of the data because of a problem with copying the wasm object

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
      AcmeStorage.storeOrderData({orderUrl: orderData.orderUrl});
      // this will cause a redirect to the OIDC provider
      const oidcService = this.getOidcService(wireOidcChallenge);
      await oidcService.authenticate();
    }
    return undefined;
  }

  private async continueOAuthFlow() {
    // If we have a handle, the user has already started the process to authenticate with the OIDC provider. We can continue the flow.
    try {
      if (!this.acmeService) {
        return this.exitWithError('Error while trying to continue OAuth flow. AcmeService is not initialized');
      }

      const handle = AcmeStorage.getAndVerifyHandle();
      const authData = AcmeStorage.getAndVerifyAuthData();

      if (!authData.authorization.wireOidcChallenge) {
        return this.exitWithError('Error while trying to continue OAuth flow. No wireOidcChallenge received');
      }

      this.identity = await this.coreCryptoClient.e2eiEnrollmentStashPop(Decoder.fromBase64(handle).asBytes);
      this.logger.log('retrieved identity from stash');
      const service = this.getOidcService(authData.authorization.wireOidcChallenge);
      const oauthUser = await service.handleAuthentication();
      this.logger.log('received user data', oauthUser);

      if (!oauthUser || !oauthUser.id_token) {
        return this.exitWithError('Error while trying to continue OAuth flow. No user or id_token received');
      }

      // Step 7: Do OIDC client challenge
      const oidcData = await doWireOidcChallenge({
        oAuthIdToken: oauthUser.id_token,
        authData,
        connection: this.acmeService,
        identity: this.identity,
        nonce: authData.nonce,
      });
      this.logger.log('received oidcData', oidcData);

      if (!oidcData.data.validated) {
        return this.exitWithError('Error while trying to continue OAuth flow. OIDC challenge not validated');
      }

      const {user: wireUser, clientId} = AcmeStorage.getInitialData();
      //Step 8: Do DPOP Challenge
      const dpopData = await doWireDpopChallenge({
        authData,
        clientId,
        connection: this.acmeService,
        identity: this.identity,
        userDomain: wireUser.domain,
        apiClient: this.apiClient,
        expirySecs: 30,
        nonce: oidcData.nonce,
      });
      this.logger.log('acme dpopData', JSON.stringify(dpopData));
      if (!isResponseStatusValid(dpopData.data.status)) {
        return this.exitWithError('Error while trying to continue OAuth flow. DPOP challenge not validated');
      }

      //Step 9: Finalize Order
      const orderData = AcmeStorage.getAndVerifyOrderData();
      const finalizeOrderData = await finalizeOrder({
        connection: this.acmeService,
        identity: this.identity,
        nonce: dpopData.nonce,
        orderUrl: orderData.orderUrl,
      });
      if (!finalizeOrderData.certificateUrl) {
        return this.exitWithError('Error while trying to continue OAuth flow. No certificateUrl received');
      }

      // Step 9: Get certificate
      const {certificate} = await getCertificate({
        certificateUrl: finalizeOrderData.certificateUrl,
        nonce: finalizeOrderData.nonce,
        connection: this.acmeService,
        identity: this.identity,
      });
      if (!certificate) {
        return this.exitWithError('Error while trying to continue OAuth flow. No certificate received');
      }
      AcmeStorage.storeCertificate(certificate);
      // Step 10: Initialize MLS with the certificate
      // TODO: This is not working yet (since we initialize mls beforehand) and will be replaced by a new core-crypto function later on
      return await this.coreCryptoClient.e2eiRotateAll(this.identity, certificate, this.keyPackagesAmount);
    } catch (error) {
      this.logger.error('Error while trying to continue OAuth flow', error);
      throw error;
    }
  }
}

export {E2eIdentityService};
