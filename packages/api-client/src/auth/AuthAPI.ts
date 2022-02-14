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

import type {AxiosRequestConfig, AxiosResponse} from 'axios';

import {BackendError, BackendErrorLabel, HttpClient} from '../http/';
import {ClientType} from '../client/';
import {ForbiddenPhoneNumberError, InvalidPhoneNumberError, PasswordExistsError} from './AuthenticationError';
import {retrieveCookie, sendRequestWithCookie} from '../shims/node/cookie';
import type {AccessTokenData, LoginData, SendLoginCode} from '../auth/';
import type {CookieList} from './CookieList';
import type {LoginCodeResponse} from './LoginCodeResponse';
import type {RegisterData} from './RegisterData';
import type {User} from '../user/';
import {VerificationActionType} from './VerificationActionType';

export class AuthAPI {
  constructor(private readonly client: HttpClient) {}

  public static readonly URL = {
    ACCESS: '/access',
    COOKIES: '/cookies',
    EMAIL: 'email',
    INITIATE_BIND: '/sso-initiate-bind',
    INITIATE_LOGIN: 'initiate-login',
    LOGIN: '/login',
    LOGOUT: 'logout',
    REGISTER: '/register',
    REMOVE: 'remove',
    SELF: 'self',
    SEND: 'send',
    SSO: '/sso',
    VERIFICATION: '/verification-code',
  };

  public getCookies(labels?: string[]): Promise<AxiosResponse<CookieList>> {
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
      url: `${AuthAPI.URL.COOKIES}/${AuthAPI.URL.REMOVE}`,
      withCredentials: true,
    };

    await this.client.sendJSON(config);
  }

  public async postLogin(loginData: LoginData): Promise<AccessTokenData> {
    const {verificationCode, ...rest} = loginData;
    const login = {
      ...rest,
      verification_code: verificationCode,
      clientType: undefined as any,
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

    const response = await this.client.sendJSON<AccessTokenData>(config);
    return retrieveCookie(response);
  }

  /**
   * Generates a verification code to be sent to the email address provided
   * @param email users email address
   * @param action whether the action is for a SCIM code generation or a user login
   */
  public async postVerificationCode(email: string, action: VerificationActionType): Promise<void> {
    const config: AxiosRequestConfig = {
      data: {email, action},
      method: 'post',
      url: `${AuthAPI.URL.VERIFICATION}/${AuthAPI.URL.SEND}`,
    };
    await this.client.sendJSON(config);
  }

  /**
   * This operation generates and sends a login code. A login code can be used only once and times out after 10
   * minutes. Only one login code may be pending at a time.
   * @param loginRequest Phone number to use for login SMS or voice call.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/tab.html#!/sendLoginCode
   */
  public async postLoginSend(loginRequest: SendLoginCode): Promise<LoginCodeResponse> {
    // https://github.com/zinfra/backend-issues/issues/974
    const defaultLoginRequest = {force: false};
    const config: AxiosRequestConfig = {
      data: {...defaultLoginRequest, ...loginRequest},
      method: 'post',
      url: `${AuthAPI.URL.LOGIN}/${AuthAPI.URL.SEND}`,
    };

    try {
      const response = await this.client.sendJSON<LoginCodeResponse>(config);
      return response.data;
    } catch (error) {
      const backendError = error as BackendError;
      switch (backendError.label) {
        case BackendErrorLabel.BAD_REQUEST: {
          throw new InvalidPhoneNumberError(backendError.message);
        }
        case BackendErrorLabel.INVALID_PHONE:
        case BackendErrorLabel.UNAUTHORIZED: {
          throw new ForbiddenPhoneNumberError(backendError.message);
        }
        case BackendErrorLabel.PASSWORD_EXISTS: {
          throw new PasswordExistsError(backendError.message);
        }
      }
      throw error;
    }
  }

  public async postLogout(): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`,
      withCredentials: true,
    };

    await sendRequestWithCookie(this.client, config);
  }

  public async postRegister(userAccount: RegisterData): Promise<User> {
    const config: AxiosRequestConfig = {
      data: userAccount,
      method: 'post',
      url: AuthAPI.URL.REGISTER,
      withCredentials: true,
    };

    const response = await this.client.sendJSON<User>(config);
    return retrieveCookie(response);
  }

  public async putEmail(emailData: {email: string}): Promise<void> {
    const config: AxiosRequestConfig = {
      data: emailData,
      method: 'put',
      url: `${AuthAPI.URL.ACCESS}/${AuthAPI.URL.SELF}/${AuthAPI.URL.EMAIL}`,
      withCredentials: true,
    };

    await this.client.sendJSON(config);
  }

  public async headInitiateLogin(ssoCode: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'head',
      url: `${AuthAPI.URL.SSO}/${AuthAPI.URL.INITIATE_LOGIN}/${ssoCode}`,
    };

    await this.client.sendJSON(config);
  }

  public async headInitiateBind(ssoCode: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'head',
      url: `${AuthAPI.URL.INITIATE_BIND}/${ssoCode}`,
    };

    await this.client.sendJSON(config);
  }
}
