/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
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

import {HttpClient} from '../http';
import {CompletePasswordReset} from '../user';
import {LoginProviderData} from './LoginProviderData';
import {RegisteredProvider} from './RegisteredProvider';
import {NewProvider} from './NewProvider';
import {UpdateProviderData} from './UpdateProviderData';

export class ProviderAPI {
  constructor(private readonly client: HttpClient) {}

  public static readonly URL = {
    COMPLETE: 'complete',
    LOGIN: 'login',
    PASSWORD_RESET: 'password-reset',
    PROVIDER: '/provider',
    REGISTER: 'register',
  };

  async deleteProvider(data: {password: string}): Promise<void> {
    const config: AxiosRequestConfig = {
      data,
      method: 'delete',
      url: `${ProviderAPI.URL.PROVIDER}`,
    };

    await this.client.sendJSON(config);
  }

  async getProvider(): Promise<RegisteredProvider> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${ProviderAPI.URL.PROVIDER}`,
    };

    const response = await this.client.sendJSON<RegisteredProvider>(config);
    return response.data;
  }

  async postLoginProvider(data: LoginProviderData): Promise<RegisteredProvider> {
    const config: AxiosRequestConfig = {
      data,
      method: 'post',
      url: `${ProviderAPI.URL.PROVIDER}/${ProviderAPI.URL.LOGIN}`,
    };

    const response = await this.client.sendJSON<RegisteredProvider>(config);
    return response.data;
  }

  async postPasswordReset(data: {email: string}): Promise<void> {
    const config: AxiosRequestConfig = {
      data,
      method: 'post',
      url: `${ProviderAPI.URL.PROVIDER}/${ProviderAPI.URL.PASSWORD_RESET}`,
    };

    await this.client.sendJSON(config);
  }

  async postPasswordResetComplete(data: CompletePasswordReset): Promise<void> {
    const config: AxiosRequestConfig = {
      data,
      method: 'post',
      url: `${ProviderAPI.URL.PROVIDER}/${ProviderAPI.URL.PASSWORD_RESET}/${ProviderAPI.URL.COMPLETE}`,
    };

    await this.client.sendJSON(config);
  }

  async postRegisterProvider(data: NewProvider): Promise<RegisteredProvider> {
    const config: AxiosRequestConfig = {
      data,
      method: 'post',
      url: `${ProviderAPI.URL.PROVIDER}/${ProviderAPI.URL.REGISTER}`,
    };

    const response = await this.client.sendJSON<RegisteredProvider>(config);
    return response.data;
  }

  async putProvider(data: UpdateProviderData): Promise<void> {
    const config: AxiosRequestConfig = {
      data,
      method: 'put',
      url: `${ProviderAPI.URL.PROVIDER}`,
    };

    await this.client.sendJSON(config);
  }
}
