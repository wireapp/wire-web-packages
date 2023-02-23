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

import {AcmeDirectory} from '@wireapp/core-crypto/platforms/web/corecrypto';
import axios, {AxiosInstance} from 'axios';
import logdown from 'logdown';

export class AcmeConnectionService {
  private logger = logdown('@wireapp/core/AcmeConnectionService');
  private readonly axiosInstance: AxiosInstance = axios.create();

  private readonly IDENTIFIER = 'acme';
  private readonly CA = 'acme';
  private readonly ACME_BACKEND = `https://localhost:9000/${this.CA}/${this.IDENTIFIER}`;
  private readonly URL = {
    CHALLENGE: '/challenge',
    DIRECTORY: '/directory',
  };

  constructor() {}

  public async getDirectory(): Promise<Uint8Array> {
    try {
      const {data} = await this.axiosInstance.get(`${this.ACME_BACKEND}${this.URL.DIRECTORY}`);
      return new TextEncoder().encode(JSON.stringify(data));
    } catch (e) {
      this.logger.error('Error getting E2E/ACME Directory', e);
      return new Uint8Array();
    }
  }

  public async getInitialNonce(url: AcmeDirectory['newNonce']): Promise<string> {
    try {
      const {headers} = await this.axiosInstance.head(url);
      if (!headers['replay-nonce'].length) {
        throw new Error('No nonce found in headers');
      }
      return headers['replay-nonce'];
    } catch (e) {
      this.logger.error('Error getting E2E/ACME Nonce', e);
      return '';
    }
  }

  public async createNewAccount(url: AcmeDirectory['newAccount'], payload: Uint8Array): Promise<Uint8Array> {
    try {
      const {data} = await this.axiosInstance.post(url, payload, {
        headers: {
          'Content-Type': 'application/jose+json',
        },
      });
      return new TextEncoder().encode(JSON.stringify(data));
    } catch (e) {
      this.logger.error('Error creating E2E/ACME Account', e);
      return new Uint8Array();
    }
  }
}
