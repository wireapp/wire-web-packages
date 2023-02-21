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

import {AxiosRequestConfig} from 'axios';

import {OAuthAccessTokenRequest} from './OAuthAccessTokenRequest';
import {OAuthApplication} from './OAuthApplication';
import {OAuthBody} from './OAuthBody';
import {OAuthClient} from './OAuthClient';
import {OAuthRefreshAccessTokenRequest} from './OAuthRefreshAccessTokenRequest';
import {OAuthRevokeBody} from './OAuthRevokeBody';

import {BackendError, HttpClient} from '../http';

export class OAuthAPI {
  constructor(private readonly client: HttpClient) {}

  public static readonly URL = {
    APPLICATIONS: 'applications',
    AUTHORIZATION: 'authorization',
    CODE: 'code',
    CLIENTS: 'clients',
    REVOKE: 'revoke',
    TOKEN: 'token',
    OAUTH: '/oauth',
  };

  /**
   * Get all OAuth applications.
   */
  public async getApplications(): Promise<OAuthApplication[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${OAuthAPI.URL.OAUTH}/${OAuthAPI.URL.APPLICATIONS}`,
    };

    const response = await this.client.sendJSON<OAuthApplication[]>(config);
    return response.data;
  }

  /**
   * Remove an application by ID.
   */
  public async deleteApplication(applicationId: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: `${OAuthAPI.URL.OAUTH}/${OAuthAPI.URL.APPLICATIONS}/${applicationId}`,
    };
    // possibly catch 400 error here
    await this.client.sendJSON(config);
  }

  /**
   * Create an OAuth authorization code.
   */
  public async postOAuthCode(oauthBody: OAuthBody): Promise<void> {
    const config: AxiosRequestConfig = {
      data: oauthBody,
      method: 'post',
      url: `${OAuthAPI.URL.OAUTH}/${OAuthAPI.URL.AUTHORIZATION}/${OAuthAPI.URL.CODE}}}`,
    };
    try {
      await this.client.sendJSON(config);
    } catch (error) {
      throw new BackendError(error);
    }
  }

  /**
   * Get OAuth client information.
   */
  public async getClient(applicationId: string): Promise<OAuthClient> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${OAuthAPI.URL.OAUTH}/${OAuthAPI.URL.CLIENTS}/${applicationId}}`,
    };

    const response = await this.client.sendJSON<OAuthClient>(config);
    return response.data;
  }

  /**
   * Revoke an OAuth refresh token.
   */
  public async revokeCode(revokeBody: OAuthRevokeBody): Promise<[]> {
    const config: AxiosRequestConfig = {
      data: revokeBody,
      method: 'post',
      url: `${OAuthAPI.URL.OAUTH}/${OAuthAPI.URL.REVOKE}`,
    };

    const response = await this.client.sendJSON<[]>(config);
    return response.data;
  }

  /**
   * Obtain a new access token from an authorization code or a refresh token.
   */
  public async createToken(OAuthTokenRequest: OAuthAccessTokenRequest | OAuthRefreshAccessTokenRequest): Promise<void> {
    const config: AxiosRequestConfig = {
      data: OAuthTokenRequest,
      method: 'post',
      url: `${OAuthAPI.URL.OAUTH}/${OAuthAPI.URL.TOKEN}`,
    };

    await this.client.sendJSON(config);
  }
}
