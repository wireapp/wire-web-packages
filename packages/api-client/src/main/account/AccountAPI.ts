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

import {AxiosRequestConfig} from 'axios';
import {HttpClient} from '../http';

class AccountAPI {
  constructor(private readonly client: HttpClient) {}

  static URL = {
    ACTIVATE: '/activate',
    DELETE: '/delete',
    PASSWORD_RESET: '/password-reset',
    PASSWORD_RESET_COMPLETE: 'complete',
    PROVIDER: '/provider',
  };

  public async postDeleteAccount(key: string, code: string): Promise<void> {
    const config: AxiosRequestConfig = {
      data: {
        code,
        key,
      },
      method: 'post',
      url: `${AccountAPI.URL.DELETE}`,
    };

    await this.client.sendJSON(config);
  }

  public async postPasswordReset(email: string): Promise<void> {
    const config: AxiosRequestConfig = {
      data: {
        email,
      },
      method: 'post',
      url: `${AccountAPI.URL.PASSWORD_RESET}`,
    };

    await this.client.sendJSON(config);
  }

  public async postPasswordResetComplete(password: string, key: string, code: string): Promise<void> {
    const config: AxiosRequestConfig = {
      data: {
        code,
        key,
        password,
      },
      method: 'post',
      url: `${AccountAPI.URL.PASSWORD_RESET}/${AccountAPI.URL.PASSWORD_RESET_COMPLETE}`,
    };

    await this.client.sendJSON(config);
  }

  public async getVerifyEmail(key: string, code: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        code,
        key,
      },
      url: `${AccountAPI.URL.ACTIVATE}`,
    };

    await this.client.sendJSON(config);
  }

  public async getVerifyBot(key: string, code: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        code,
        key,
      },
      url: `${AccountAPI.URL.PROVIDER}${AccountAPI.URL.ACTIVATE}`,
    };

    await this.client.sendJSON(config);
  }
}

export {AccountAPI};
