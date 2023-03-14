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

import {AcmeChallenge, AcmeDirectory} from '@wireapp/core-crypto/platforms/web/corecrypto';
import axios, {AxiosInstance} from 'axios';
import logdown from 'logdown';

import {
  GetAuthorizationReturnValue,
  GetDirectoryReturnValue,
  GetInitialNonceReturnValue,
  GetNewAccountReturnValue,
  GetNewOrderReturnValue,
  ValidateDpopChallengeReturnType,
  ValidateOidcChallengeReturnType,
} from './AcmeConnectionService.types';
import {
  AuthorizationResponseDataSchema,
  DirectoryResponseDataSchema,
  NewAccountResponseDataSchema,
  NewOrderResponseDataSchema,
  ResponseHeaderNonce,
  ResponseHeaderNonceSchema,
  ValidateDpopChallengeResponseDataSchema,
  ValidateOidcChallengeResponseDataSchema,
} from './schema';

export class AcmeConnectionService {
  private logger = logdown('@wireapp/core/AcmeConnectionService');
  private readonly axiosInstance: AxiosInstance = axios.create();

  private readonly CA = 'acme';
  private readonly ACME_PROVISIONER = 'acme';
  private readonly ACME_BACKEND = `https://balderdash.hogwash.work:9000/${this.CA}/${this.ACME_PROVISIONER}`;
  private readonly URL = {
    DIRECTORY: '/directory',
    CHALLENGE: '/challenge',
  };

  constructor() {}

  private extractNonce(headers: any): ResponseHeaderNonce['replay-nonce'] {
    return ResponseHeaderNonceSchema.parse(headers)['replay-nonce'];
  }

  public async getDirectory(): GetDirectoryReturnValue {
    try {
      const {data} = await this.axiosInstance.get(`${this.ACME_BACKEND}${this.URL.DIRECTORY}`);
      const directory = DirectoryResponseDataSchema.parse(data);
      return new TextEncoder().encode(JSON.stringify(directory));
    } catch (e) {
      this.logger.error('Error while receiving Directory', e);
      return undefined;
    }
  }

  public async getInitialNonce(url: AcmeDirectory['newNonce']): GetInitialNonceReturnValue {
    try {
      const {headers} = await this.axiosInstance.head(url);
      const nonce = this.extractNonce(headers);
      return nonce;
    } catch (e) {
      this.logger.error('Error while receiving intial Nonce', e);
      return undefined;
    }
  }

  public async createNewAccount(url: AcmeDirectory['newAccount'], payload: Uint8Array): GetNewAccountReturnValue {
    try {
      const {data, headers} = await this.axiosInstance.post(url, payload, {
        headers: {
          'Content-Type': 'application/jose+json',
        },
      });
      const nonce = this.extractNonce(headers);
      const accountData = NewAccountResponseDataSchema.parse(data);
      return {
        account: accountData,
        nonce,
      };
    } catch (e) {
      this.logger.error('Error while creating new Account', e);
      return undefined;
    }
  }

  public async createNewOrder(url: AcmeDirectory['newOrder'], payload: Uint8Array): GetNewOrderReturnValue {
    try {
      const {data, headers} = await this.axiosInstance.post(url, payload, {
        headers: {
          'Content-Type': 'application/jose+json',
        },
      });
      const nonce = this.extractNonce(headers);
      const orderData = NewOrderResponseDataSchema.parse(data);
      return {
        order: orderData,
        nonce,
      };
    } catch (e) {
      this.logger.error('Error while creating new Order', e);
      return undefined;
    }
  }

  public async getAuthorization(authUrl: string, payload: Uint8Array): GetAuthorizationReturnValue {
    try {
      const {data, headers} = await this.axiosInstance.post(authUrl, payload, {
        headers: {
          'Content-Type': 'application/jose+json',
        },
      });
      const nonce = this.extractNonce(headers);
      const authorizationData = AuthorizationResponseDataSchema.parse(data);

      return {
        authorization: authorizationData,
        nonce,
      };
    } catch (e) {
      this.logger.error('Error while receiving Authorization', e);
      return undefined;
    }
  }

  public async validateDpopChallenge(url: AcmeChallenge['url'], payload: Uint8Array): ValidateDpopChallengeReturnType {
    try {
      const {data, headers} = await this.axiosInstance.post(url, payload, {
        headers: {
          'Content-Type': 'application/jose+json',
        },
      });

      const nonce = this.extractNonce(headers);
      const validateDpopChallengeData = ValidateDpopChallengeResponseDataSchema.parse(data);
      return {
        challengeResult: validateDpopChallengeData,
        nonce,
      };
    } catch (e) {
      this.logger.error('Error while validating DPOP challenge', e);
      return undefined;
    }
  }

  public async validateOidcChallenge(url: AcmeChallenge['url'], payload: Uint8Array): ValidateOidcChallengeReturnType {
    try {
      const {data, headers} = await this.axiosInstance.post(url, payload, {
        headers: {
          'Content-Type': 'application/jose+json',
        },
      });
      const nonce = this.extractNonce(headers);
      const validateOidcChallengeData = ValidateOidcChallengeResponseDataSchema.parse(data);
      return {
        challengeResult: validateOidcChallengeData,
        nonce,
      };
    } catch (e) {
      this.logger.error('Error while validating OIDC challenge', e);
      return undefined;
    }
  }
}
