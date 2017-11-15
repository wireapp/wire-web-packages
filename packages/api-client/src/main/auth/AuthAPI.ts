//
// Wire
// Copyright (C) 2017 Wire Swiss GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see http://www.gnu.org/licenses/.
//

import RegisterData from './RegisterData';
import {User} from '../user';
import {AccessTokenData, LoginData} from '../auth';
import {AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine';
import {retrieveCookie, sendRequestWithCookie} from '../shims/node/cookie';
import {HttpClient} from '../http';

export default class AuthAPI {
  constructor(private client: HttpClient, private engine: CRUDEngine) {}

  static get URL() {
    return {
      ACCESS: '/access',
      COOKIES: '/cookies',
      INVITATIONS: '/invitations',
      LOGIN: '/login',
      LOGOUT: 'logout',
      REGISTER: '/register',
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

  public postCookiesRemove(password: string, labels?: string[], ids?: string[]): AxiosPromise {
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

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public postLogin(login: LoginData): Promise<AccessTokenData> {
    login.password = login.password.toString();
    const config: AxiosRequestConfig = {
      data: login.email
        ? {
            email: login.email,
            password: login.password,
          }
        : {
            handle: login.handle,
            password: login.password,
          },
      method: 'post',
      params: {
        persist: login.persist.toString(),
      },
      url: AuthAPI.URL.LOGIN,
      withCredentials: true,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => retrieveCookie(response, this.engine));
  }

  public postLogout(): AxiosPromise {
    const config: AxiosRequestConfig = {
      withCredentials: true,
      method: 'post',
      url: `${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`,
    };

    return sendRequestWithCookie(this.client, config, this.engine).then((response: AxiosResponse) => response.data);
  }

  public postAccess(expiredAccessToken?: AccessTokenData): Promise<AccessTokenData> {
    const config: AxiosRequestConfig = {
      headers: {},
      withCredentials: true,
      method: 'post',
      url: `${AuthAPI.URL.ACCESS}`,
    };

    if (expiredAccessToken) {
      config.headers['Authorization'] = `${expiredAccessToken.token_type} ${decodeURIComponent(
        expiredAccessToken.access_token
      )}`;
    }

    return sendRequestWithCookie(this.client, config, this.engine).then((response: AxiosResponse) => response.data);
  }

  public postRegister(register: RegisterData): Promise<User> {
    const config: AxiosRequestConfig = {
      data: register,
      method: 'post',
      url: AuthAPI.URL.REGISTER,
      withCredentials: true,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }
}
