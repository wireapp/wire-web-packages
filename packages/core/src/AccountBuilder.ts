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

import {RegisterData, Context, Cookie, LoginData} from '@wireapp/api-client/lib/auth';
import {ClientClassification, ClientType} from '@wireapp/api-client/lib/client/';
import {Encoder} from 'bazinga64';
import logdown from 'logdown';

import {APIClient} from '@wireapp/api-client';
import {CoreCrypto} from '@wireapp/core-crypto';
import {CRUDEngine, MemoryEngine} from '@wireapp/store-engine';

import {Account, AccountOptions} from './Account';
import {LoginSanitizer} from './auth/';
import {ClientInfo} from './client/';
import {HandledEventPayload} from './notification/';
import {openDB} from './storage/CoreDB';
import {createCustomEncryptedStore, createEncryptedStore, EncryptedStore} from './util/encryptedStore';

const coreDefaultClient: ClientInfo = {
  classification: ClientClassification.DESKTOP,
  cookieLabel: 'default',
  model: '@wireapp/core',
};

export type ProcessedEventPayload = HandledEventPayload;

export class AccountBuilder<T = any> {
  private secretsDb?: EncryptedStore<any>;
  private readonly logger: logdown.Logger;

  /**
   * @param apiClient The apiClient instance to use in the core (will create a new new one if undefined)
   * @param accountOptions
   */
  constructor(private apiClient: APIClient = new APIClient(), private accountOptions: AccountOptions<T> = {}) {
    this.logger = logdown('@wireapp/core/Account', {
      logger: console,
      markdown: false,
    });
  }

  /**
   * Will set the APIClient to use a specific version of the API (by default uses version 0)
   * It will fetch the API Config and use the highest possible version
   * @param acceptedVersions Which version the consumer supports
   * @param useDevVersion allow the api-client to use development version of the api (if present). The dev version also need to be listed on the supportedVersions given as parameters
   *   If we have version 2 that is a dev version, this is going to be the output of those calls
   *   - useVersion([0, 1, 2], true) > version 2 is used
   *   - useVersion([0, 1, 2], false) > version 1 is used
   *   - useVersion([0, 1], true) > version 1 is used
   * @return The highest version that is both supported by client and backend
   */
  public async useAPIVersion(supportedVersions: number[], useDevVersion?: boolean) {
    const features = await this.apiClient.useVersion(supportedVersions, useDevVersion);
    return features;
  }

  /**
   * Will register a new user to the backend
   *
   * @param registration The user's data
   * @param clientType Type of client to create (temporary or permanent)
   */
  public async register(registration: RegisterData, clientType: ClientType) {
    const context = await this.apiClient.register(registration, clientType);
    return this.buildAccount(context);
  }

  /**
   * Will init the core with an already existing client (both on backend and local)
   *
   * @param clientType The type of client the user is using (temporary or permanent)
   */
  public async init(clientType: ClientType, cookie?: Cookie) {
    const context = await this.apiClient.init(clientType, cookie);
    const account = await this.buildAccount(context);
    return account;
  }

  /**
   * Will log the user in with the given credential.
   * Will also create the local client and store it in DB
   *
   * @param loginData The credentials of the user
   * @param initClient Should the call also create the local client
   * @param clientInfo Info about the client to create (name, type...)
   */
  public async login(loginData: LoginData) {
    LoginSanitizer.removeNonPrintableCharacters(loginData);
    const context = await this.apiClient.login(loginData);
    const account = await this.buildAccount(context);
    return account;
  }

  private async buildAccount(context: Context): Promise<Account<T>> {
    const coreCryptoClient = await this.initCoreCrypto(context);
    const storeEngine = await this.initEngine(context);
    const db = await openDB(this.generateCoreDbName(context));
    const stores = {
      app: storeEngine,
      secrets: this.secretsDb!,
      core: db,
    };
    return new Account(context, this.apiClient, coreCryptoClient, stores, this.accountOptions);
  }

  private async initCoreCrypto(context: Context) {
    const coreCryptoKeyId = 'corecrypto-key';
    const dbName = this.generateSecretsDbName(context);

    const systemCrypto = this.accountOptions.cryptoProtocolConfig?.systemCrypto;
    this.secretsDb = systemCrypto
      ? await createCustomEncryptedStore(dbName, systemCrypto)
      : await createEncryptedStore(dbName);

    let key = await this.secretsDb.getsecretValue(coreCryptoKeyId);
    if (!key) {
      key = crypto.getRandomValues(new Uint8Array(16));
      await this.secretsDb.saveSecretValue(coreCryptoKeyId, key);
    }

    return CoreCrypto.deferredInit(
      `corecrypto-${this.generateDbName(context)}`,
      Encoder.toBase64(key).asString,
      undefined, // We pass a placeholder entropy data. It will be set later on by calling `reseedRng`
      this.accountOptions.cryptoProtocolConfig?.coreCrypoWasmFilePath,
    );
  }

  private generateDbName(context: Context) {
    const clientType = context.clientType === ClientType.NONE ? '' : `@${context.clientType}`;
    return `wire@${this.apiClient.config.urls.name}@${context.userId}${clientType}`;
  }

  private generateSecretsDbName(context: Context) {
    return `secrets-${this.generateDbName(context)}`;
  }

  private generateCoreDbName(context: Context) {
    return `core-${this.generateDbName(context)}`;
  }

  private async initEngine(context: Context): Promise<CRUDEngine> {
    const dbName = this.generateDbName(context);
    this.logger.log(`Initialising store with name "${dbName}"...`);
    const openDb = async () => {
      const initializedDb = await this.accountOptions.createStore?.(dbName, context);
      if (initializedDb) {
        this.logger.log(`Initialized store with existing engine "${dbName}".`);
        return initializedDb;
      }
      this.logger.log(`Initialized store with new memory engine "${dbName}".`);
      const memoryEngine = new MemoryEngine();
      await memoryEngine.init(dbName);
      return memoryEngine;
    };
    const storeEngine = await openDb();
    return storeEngine;
  }
}
