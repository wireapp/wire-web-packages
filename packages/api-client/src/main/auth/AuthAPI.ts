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

import {CRUDEngine} from '@wireapp/store-engine';
import {AxiosRequestConfig, AxiosResponse} from 'axios';
import {AccessTokenData, LoginData} from '../auth/';
import {ClientType} from '../client/';
import {HttpClient} from '../http/';
import {sendRequestWithCookie} from '../shims/node/cookie';
import {User} from '../user/';
import {RegisterData} from './RegisterData';

class AuthAPI {
  constructor(private readonly client: HttpClient, private readonly engine: CRUDEngine) {}

  static get URL() {
    return {
      ACCESS: '/access',
      COOKIES: '/cookies',
      INITIATE_LOGIN: 'initiate-login',
      LOGIN: '/login',
      LOGOUT: 'logout',
      REGISTER: '/register',
      SSO: '/sso',
    };
  }

  public getCookies(labels?: string[]) {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {},
      url: AuthAPI.URL.COOKIES,
    };

    if (labels) {
      config.params.labels = labels.join(',');
    }

    return this.client.sendRequest(config);
  }

  public async postCookiesRemove(password: string, labels?: string[], ids?: string[]): Promise<void> {
    const config: AxiosRequestConfig = {
      data: {
        ids,
        labels,
        password,
      },
      method: 'post',
      url: `${AuthAPI.URL.COOKIES}/remove`,
      withCredentials: true,
    };

    await this.client.sendJSON(config);
  }

  public postLogin(loginData: LoginData): Promise<AxiosResponse<AccessTokenData>> {
    const login = {
      ...loginData,
      clientType: undefined,
      password: loginData.password ? String(loginData.password) : undefined,
    };

    const config: AxiosRequestConfig = {
      data: login,
      method: 'post',
      params: {
        persist: loginData.clientType === ClientType.PERMANENT,
      },
      url: AuthAPI.URL.LOGIN,
      withCredentials: true,
    };

    return this.client.sendJSON(config);
  }

  public async postLogout(): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`,
      withCredentials: true,
    };

    await sendRequestWithCookie(this.client, config, this.engine);
  }

  public postRegister(userAccount: RegisterData): Promise<User> {
    const config: AxiosRequestConfig = {
      data: userAccount,
      method: 'post',
      url: AuthAPI.URL.REGISTER,
      withCredentials: true,
    };

    return this.client.sendJSON<User>(config).then(response => response.data);
  }

  public async headInitiateLogin(ssoCode: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'head',
      url: `${AuthAPI.URL.SSO}/${AuthAPI.URL.INITIATE_LOGIN}/${ssoCode}`,
    };

    await this.client.sendJSON(config);
  }
}

export {AuthAPI};
