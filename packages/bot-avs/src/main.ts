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

import * as path from 'path';
import {FileEngine} from '@wireapp/store-engine-fs';
import {Account} from '@wireapp/core';
import {APIClient} from '@wireapp/api-client';
import {ClientType} from '@wireapp/api-client/dist/client';
import {
  AUTH_TABLE_NAME,
  AUTH_COOKIE_KEY,
  AUTH_ACCESS_TOKEN_KEY,
  AccessTokenData,
  Cookie,
  LoginData,
} from '@wireapp/api-client/dist/auth';
import {CRUDEngine} from '@wireapp/store-engine';
import {PayloadBundleType} from '@wireapp/core/dist/conversation';
import {Avs} from './avs';
import {getLogger} from './util/Logger';

require('dotenv').config();
const {WIRE_EMAIL, WIRE_PASSWORD} = process.env;
const CLIENT_TYPE = ClientType.TEMPORARY;

const loginData: LoginData = {
  clientType: CLIENT_TYPE,
  email: WIRE_EMAIL,
  password: WIRE_PASSWORD,
};

const logger = getLogger('App');

if (!WIRE_EMAIL || !WIRE_PASSWORD) {
  logger.error('You need to set WIRE_EMAIL & WIRE_PASSWORD');
  process.exit();
}

class App {
  storagePath = path.join(process.cwd(), '.tmp', WIRE_EMAIL || '');
  storeOptions = {fileExtension: '.json'};
  storeEngine: CRUDEngine = new FileEngine(this.storagePath, this.storeOptions);
  cookie?: Cookie;
  account?: Account;

  public async start() {
    await this.storeEngine.init(this.storagePath, this.storeOptions);
    const config = {
      store: this.storeEngine,
      urls: APIClient.BACKEND.STAGING,
    };
    const apiClient = new APIClient(config);
    const account = new Account(apiClient, async (): Promise<CRUDEngine> => this.storeEngine);
    this.account = account;

    apiClient.on(APIClient.TOPIC.ACCESS_TOKEN_REFRESH, async (accessToken: AccessTokenData) => {
      await this.storeEngine.updateOrCreate(AUTH_TABLE_NAME, AUTH_ACCESS_TOKEN_KEY, accessToken);
    });

    apiClient.on(APIClient.TOPIC.COOKIE_REFRESH, async (cookie?: Cookie) => {
      logger.log('Cookie', cookie);
      if (!cookie) {
        return;
      }
      this.cookie = cookie;
      const entity = {expiration: cookie.expiration, zuid: cookie.zuid};
      await this.storeEngine.updateOrCreate(AUTH_TABLE_NAME, AUTH_COOKIE_KEY, entity);
    });

    await this.getCookie();

    let userId: string;
    try {
      if (!this.cookie) {
        throw new Error('No cookie found');
      }
      userId = (await account.init(CLIENT_TYPE, this.cookie)).userId;
    } catch (error) {
      logger.log('Failed to get new access token with cookie');
      userId = (await account.login(loginData)).userId;
    }
    const {
      localClient: {id: clientId},
    } = await account.initClient(loginData);

    const avs = new Avs(this.account);
    await avs.initAvs(userId, clientId);

    account.on(PayloadBundleType.CALL, call => {
      avs.onIncomingCallMessage(call);
    });

    await account.listen();
  }

  async getCookie(): Promise<Cookie | undefined> {
    try {
      const {expiration, zuid} = await this.storeEngine.read(AUTH_TABLE_NAME, AUTH_COOKIE_KEY);
      const cookie = new Cookie(zuid, expiration);
      this.cookie = cookie;
      return cookie;
    } catch (error) {
      logger.log('no cookie found');
      return undefined;
    }
  }
}

const instance = new App();

instance
  .start()
  .then(logger.log)
  .catch(error => logger.log('Failed to start bot with error:', error));
