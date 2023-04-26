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
  GetDirectoryReturnValue,
  GetInitialNonceReturnValue,
  PostJoseRequestParams,
  PostJoseRequestReturnValue,
} from './AcmeService.types';
import {
  AuthorizationResponseData,
  AuthorizationResponseDataSchema,
  DirectoryResponseDataSchema,
  NewAccountResponseData,
  NewAccountResponseDataSchema,
  NewOrderResponseData,
  NewOrderResponseDataSchema,
  ResponseHeaderNonce,
  ResponseHeaderNonceSchema,
  ValidateDpopChallengeResponseData,
  ValidateDpopChallengeResponseDataSchema,
  ValidateOidcChallengeResponseData,
  ValidateOidcChallengeResponseDataSchema,
} from './schema';

export class AcmeService {
  private logger = logdown('@wireapp/core/AcmeService');
  private readonly axiosInstance: AxiosInstance = axios.create();
  private readonly certificateAuthority = 'acme';
  private readonly acmeProvisioner = 'wire';
  private readonly acmeBackendUri = 'https://136.243.148.68:9000';
  private readonly url = {
    DIRECTORY: '/directory',
  };

  constructor() {}

  // ############ Internal Functions ############

  private extractNonce(headers: any): ResponseHeaderNonce['replay-nonce'] {
    return ResponseHeaderNonceSchema.parse(headers)['replay-nonce'];
  }

  private async postJoseRequest<T>({
    payload,
    schema,
    url,
    errorMessage,
  }: PostJoseRequestParams<T>): PostJoseRequestReturnValue<T> {
    try {
      const {data, headers} = await this.axiosInstance.post(url, payload, {
        headers: {
          'Content-Type': 'application/jose+json',
        },
      });
      const nonce = this.extractNonce(headers);
      const accountData = schema.parse(data);
      return {
        data: accountData,
        nonce,
      };
    } catch (e) {
      this.logger.error(errorMessage, e);
      return undefined;
    }
  }

  // ############ Public Functions ############

  public async getDirectory(): GetDirectoryReturnValue {
    try {
      const {data} = await this.axiosInstance.get(
        `${this.acmeBackendUri}/${this.certificateAuthority}/${this.acmeProvisioner}${this.url.DIRECTORY}`,
      );
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

  public async createNewAccount(url: AcmeDirectory['newAccount'], payload: Uint8Array) {
    return this.postJoseRequest<NewAccountResponseData>({
      errorMessage: 'Error while creating new Account',
      payload,
      schema: NewAccountResponseDataSchema,
      url,
    });
  }

  public async createNewOrder(url: AcmeDirectory['newOrder'], payload: Uint8Array) {
    return this.postJoseRequest<NewOrderResponseData>({
      errorMessage: 'Error while creating new Order',
      payload,
      schema: NewOrderResponseDataSchema,
      url,
    });
  }

  public async getAuthorization(url: string, payload: Uint8Array) {
    return this.postJoseRequest<AuthorizationResponseData>({
      errorMessage: 'Error while receiving Authorization',
      payload,
      schema: AuthorizationResponseDataSchema,
      url,
    });
  }

  public async validateDpopChallenge(url: AcmeChallenge['url'], payload: Uint8Array) {
    return this.postJoseRequest<ValidateDpopChallengeResponseData>({
      errorMessage: 'Error while validating DPOP challenge',
      payload,
      schema: ValidateDpopChallengeResponseDataSchema,
      url,
    });
  }

  public async validateOidcChallenge(url: AcmeChallenge['url'], payload: Uint8Array) {
    return this.postJoseRequest<ValidateOidcChallengeResponseData>({
      errorMessage: 'Error while validating OIDC challenge',
      payload,
      schema: ValidateOidcChallengeResponseDataSchema,
      url,
    });
  }
}
