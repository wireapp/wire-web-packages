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

import {APIClient} from '@wireapp/api-client';
import {LoginData, PreKey} from '@wireapp/api-client/dist/commonjs/auth/';
import {ClientClassification, ClientType, NewClient, RegisteredClient} from '@wireapp/api-client/dist/commonjs/client/';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine/';
import * as logdown from 'logdown';
import {CryptographyService} from '../cryptography/';
import {ClientInfo} from './';
import ClientBackendRepository from './ClientBackendRepository';
import ClientDatabaseRepository from './ClientDatabaseRepository';

const pkg = require('../../package.json');

export interface MetaClient extends RegisteredClient {
  meta: {
    primary_key: string;
    is_verified?: boolean;
  };
}

export default class ClientService {
  private readonly logger = logdown('@wireapp/core/client/ClientService', {
    logger: console,
    markdown: false,
  });

  private readonly database: ClientDatabaseRepository;
  private readonly backend: ClientBackendRepository;

  constructor(
    private readonly apiClient: APIClient,
    private readonly storeEngine: CRUDEngine,
    private readonly cryptographyService: CryptographyService
  ) {
    this.database = new ClientDatabaseRepository(this.storeEngine);
    this.backend = new ClientBackendRepository(this.apiClient);
  }

  public deleteLocalClient(): Promise<string> {
    this.logger.log('deleteLocalClient');
    return this.database.deleteLocalClient();
  }

  public getClients(): Promise<RegisteredClient[]> {
    return this.backend.getClients();
  }

  public getLocalClient(): Promise<MetaClient> {
    this.logger.log('getLocalClient');
    return this.database.getLocalClient();
  }

  public createLocalClient(client: RegisteredClient): Promise<MetaClient> {
    this.logger.log('createLocalClient');
    return this.database.createLocalClient(client);
  }

  public async synchronizeClients(): Promise<MetaClient[]> {
    this.logger.log('synchronizeClients');
    const registeredClients = await this.backend.getClients();
    const filteredClients = registeredClients.filter(client => client.id !== this.apiClient.context!.clientId);
    return this.database.createClientList(this.apiClient.context!.userId, filteredClients);
  }

  // TODO: Split functionality into "create" and "register" client
  public async register(
    loginData: LoginData,
    clientInfo: ClientInfo = {
      classification: ClientClassification.DESKTOP,
      cookieLabel: 'default',
      model: `${pkg.name} v${pkg.version}`,
    }
  ): Promise<RegisteredClient> {
    this.logger.log('register');
    if (!this.apiClient.context) {
      throw new Error('Context is not set.');
    }
    if (loginData.clientType === ClientType.NONE) {
      throw new Error(`Can't register client of type "${ClientType.NONE}"`);
    }

    const serializedPreKeys: PreKey[] = await this.cryptographyService.createCryptobox();

    let newClient: NewClient;
    if (this.cryptographyService.cryptobox.lastResortPreKey) {
      newClient = {
        class: clientInfo.classification,
        cookie: clientInfo.cookieLabel,
        label: clientInfo.label,
        lastkey: this.cryptographyService.cryptobox.serialize_prekey(
          this.cryptographyService.cryptobox.lastResortPreKey
        ),
        location: clientInfo.location,
        model: clientInfo.model,
        password: loginData.password ? String(loginData.password) : undefined,
        prekeys: serializedPreKeys,
        sigkeys: {
          enckey: 'Wuec0oJi9/q9VsgOil9Ds4uhhYwBT+CAUrvi/S9vcz0=',
          mackey: 'Wuec0oJi9/q9VsgOil9Ds4uhhYwBT+CAUrvi/S9vcz0=',
        },
        type: loginData.clientType,
      };
    } else {
      throw new Error('Cryptobox got initialized without a last resort PreKey.');
    }

    const client = await this.backend.postClient(newClient);
    await this.createLocalClient(client);
    await this.cryptographyService.initCryptobox();

    return client;
  }
}
