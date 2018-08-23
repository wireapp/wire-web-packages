/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
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

import {PriorityQueue} from '@wireapp/priority-queue';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine';
import axios, {AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';
import * as EventEmitter from 'events';
import * as logdown from 'logdown';
import {AccessTokenData, AccessTokenStore, AuthAPI} from '../auth/';
import {BackendErrorLabel, BackendErrorMapper, ConnectionState, ContentType, NetworkError, StatusCode} from '../http/';
import {sendRequestWithCookie} from '../shims/node/cookie';

class HttpClient extends EventEmitter {
  private readonly logger = logdown('@wireapp/api-client/http/HttpClient', {
    logger: console,
    markdown: false,
  });
  private connectionState: ConnectionState;
  private readonly requestQueue: PriorityQueue;

  public static TOPIC = {
    ON_CONNECTION_STATE_CHANGE: 'HttpClient.TOPIC.ON_CONNECTION_STATE_CHANGE',
  };

  constructor(
    private readonly baseURL: string,
    public accessTokenStore: AccessTokenStore,
    private readonly engine: CRUDEngine
  ) {
    super();

    this.connectionState = ConnectionState.UNDEFINED;

    this.requestQueue = new PriorityQueue({
      maxRetries: 0,
      retryDelay: 1000,
    });

    // Log all failing HTTP requests
    axios.interceptors.response.use(undefined, (error: AxiosError) => {
      let backendResponse = '';

      if (error.response) {
        try {
          backendResponse = JSON.stringify(error.response.data);
        } finally {
          this.logger.error(
            `HTTP Error (${error.response.status}) on '${error.response.config.url}': ${
              error.message
            } (${backendResponse})`
          );
        }
      }

      return Promise.reject(error);
    });
  }

  private updateConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.emit(HttpClient.TOPIC.ON_CONNECTION_STATE_CHANGE, this.connectionState);
    }
  }

  public createUrl(url: string) {
    return `${this.baseURL}${url}`;
  }

  public _sendRequest(config: AxiosRequestConfig, tokenAsParam = false, firstTry = true): AxiosPromise {
    config.baseURL = this.baseURL;

    if (this.accessTokenStore.accessToken) {
      const {token_type, access_token} = this.accessTokenStore.accessToken;

      if (tokenAsParam) {
        config.params = {
          ...config.params,
          access_token,
        };
      } else {
        config.headers = {
          ...config.headers,
          Authorization: `${token_type} ${access_token}`,
        };
      }
    }

    return axios
      .request({
        ...config,
        maxContentLength: 104857600, // 100 Megabytes
      })
      .then((response: AxiosResponse) => {
        this.updateConnectionState(ConnectionState.CONNECTED);
        return response;
      })
      .catch(error => {
        const {response, request} = error;

        // Map Axios errors
        const isNetworkError = !response && request && !Object.keys(request).length;
        if (isNetworkError) {
          const message = `Cannot do "${error.config.method}" request to "${error.config.url}".`;
          const networkError = new NetworkError(message);
          this.updateConnectionState(ConnectionState.DISCONNECTED);
          return Promise.reject(networkError);
        }

        if (response) {
          const {data: errorData, status: errorStatus} = response;
          const isBackendError = errorData && errorData.code && errorData.label && errorData.message;

          if (isBackendError) {
            const isForbidden = errorStatus === StatusCode.FORBIDDEN;
            const isInvalidCredentials = errorData.label === BackendErrorLabel.INVALID_CREDENTIALS;
            const hasAccessToken = this.accessTokenStore && this.accessTokenStore.accessToken;
            if (isForbidden && isInvalidCredentials && hasAccessToken && firstTry) {
              return this.refreshAccessToken().then(() => this._sendRequest(config, tokenAsParam, true));
            }

            error = BackendErrorMapper.map(errorData);
          }
        }

        return Promise.reject(error);
      });
  }

  public async refreshAccessToken(): Promise<AccessTokenData> {
    let expiredAccessToken: AccessTokenData | undefined;
    if (this.accessTokenStore.accessToken && this.accessTokenStore.accessToken.access_token) {
      expiredAccessToken = this.accessTokenStore.accessToken;
    }

    const accessToken = await this.postAccess(expiredAccessToken);
    this.logger.info(`Saved updated access token. It will expire in "${accessToken.expires_in}" seconds.`, {
      ...accessToken,
      access_token: `${accessToken.access_token.substr(0, 10)}...`,
    });
    return this.accessTokenStore.updateToken(accessToken);
  }

  public postAccess(expiredAccessToken?: AccessTokenData): Promise<AccessTokenData> {
    const config: AxiosRequestConfig = {
      headers: {},
      method: 'post',
      url: `${AuthAPI.URL.ACCESS}`,
      withCredentials: true,
    };

    if (expiredAccessToken && expiredAccessToken.access_token) {
      config.headers['Authorization'] = `${expiredAccessToken.token_type} ${decodeURIComponent(
        expiredAccessToken.access_token
      )}`;
    }

    return sendRequestWithCookie(this, config, this.engine).then((response: AxiosResponse) => response.data);
  }

  public sendRequest(config: AxiosRequestConfig, tokenAsParam: boolean = false): AxiosPromise {
    return this.requestQueue.add(() => this._sendRequest(config, tokenAsParam));
  }

  public sendJSON(config: AxiosRequestConfig): AxiosPromise {
    config.headers = {
      ...config.headers,
      'Content-Type': ContentType.APPLICATION_JSON,
    };
    return this.sendRequest(config);
  }

  public sendProtocolBuffer(config: AxiosRequestConfig): AxiosPromise {
    config.headers = {
      ...config.headers,
      'Content-Type': ContentType.APPLICATION_PROTOBUF,
    };
    return this.sendRequest(config);
  }
}

export {HttpClient};
