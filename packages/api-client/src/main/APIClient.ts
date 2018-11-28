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

import {MemoryEngine} from '@wireapp/store-engine/dist/commonjs/engine/';
import * as logdown from 'logdown';

import {AssetAPI} from './asset/';
import {AccessTokenStore, AuthAPI, Context, LoginData, RegisterData} from './auth/';
import {BroadcastAPI} from './broadcast/';
import {ClientAPI, ClientType} from './client/';
import {Config} from './Config';
import {ConnectionAPI} from './connection/';
import {ConversationAPI} from './conversation/';
import {Backend} from './env/';
import {GiphyAPI} from './giphy/';
import {HttpClient} from './http/';
import {NotificationAPI} from './notification/';
import {ObfuscationUtil} from './obfuscation/';
import {SelfAPI} from './self/';
import {retrieveCookie} from './shims/node/cookie';
import {WebSocketClient} from './tcp/';
import {MemberAPI, PaymentAPI, ServiceAPI, TeamAPI, TeamInvitationAPI} from './team/';
import {UserAPI} from './user/';

const {version}: {version: string} = require('../../package.json');

const defaultConfig: Config = {
  store: new MemoryEngine(),
  urls: Backend.PRODUCTION,
};

class APIClient {
  private readonly logger: logdown.Logger;

  private readonly STORE_NAME_PREFIX = 'wire';
  // APIs
  public asset: {api: AssetAPI};
  public auth: {api: AuthAPI};
  public broadcast: {api: BroadcastAPI};
  public client: {api: ClientAPI};
  public connection: {api: ConnectionAPI};
  public conversation: {api: ConversationAPI};
  public giphy: {api: GiphyAPI};
  public notification: {api: NotificationAPI};
  public self: {api: SelfAPI};
  public teams: {
    invitation: {api: TeamInvitationAPI};
    member: {api: MemberAPI};
    payment: {api: PaymentAPI};
    service: {api: ServiceAPI};
    team: {api: TeamAPI};
  };
  public user: {api: UserAPI};

  // Configuration
  private readonly accessTokenStore: AccessTokenStore;
  public context?: Context;
  public transport: {http: HttpClient; ws: WebSocketClient};
  public config: Config;

  public static BACKEND = Backend;
  public static VERSION = version;

  constructor(config?: Config) {
    this.config = {...defaultConfig, ...config};
    this.accessTokenStore = new AccessTokenStore();
    this.logger = logdown('@wireapp/api-client/Client', {
      logger: console,
      markdown: false,
    });

    const httpClient = new HttpClient(this.config.urls.rest, this.accessTokenStore, this.config.store);

    this.transport = {
      http: httpClient,
      ws: new WebSocketClient(this.config.urls.ws, httpClient),
    };

    this.asset = {
      api: new AssetAPI(this.transport.http),
    };
    this.auth = {
      api: new AuthAPI(this.transport.http, this.config.store),
    };
    this.broadcast = {
      api: new BroadcastAPI(this.transport.http),
    };
    this.client = {
      api: new ClientAPI(this.transport.http),
    };
    this.connection = {
      api: new ConnectionAPI(this.transport.http),
    };
    this.conversation = {
      api: new ConversationAPI(this.transport.http),
    };
    this.giphy = {
      api: new GiphyAPI(this.transport.http),
    };
    this.notification = {
      api: new NotificationAPI(this.transport.http),
    };
    this.self = {
      api: new SelfAPI(this.transport.http),
    };

    this.teams = {
      invitation: {
        api: new TeamInvitationAPI(this.transport.http),
      },
      member: {
        api: new MemberAPI(this.transport.http),
      },
      payment: {
        api: new PaymentAPI(this.transport.http),
      },
      service: {
        api: new ServiceAPI(this.transport.http),
      },
      team: {
        api: new TeamAPI(this.transport.http),
      },
    };

    this.user = {
      api: new UserAPI(this.transport.http),
    };
  }

  public async init(clientType: ClientType = ClientType.NONE): Promise<Context> {
    const initialAccessToken = await this.transport.http.refreshAccessToken();
    const context = this.createContext(initialAccessToken.user, clientType);

    await this.initEngine(context);
    await this.accessTokenStore.updateToken(initialAccessToken);

    return context;
  }

  public async login(loginData: LoginData): Promise<Context> {
    if (this.context) {
      await this.logout({ignoreError: true});
    }

    const cookieResponse = await this.auth.api.postLogin(loginData);
    const accessToken = cookieResponse.data;

    this.logger.info(
      `Saved initial access token. It will expire in "${accessToken.expires_in}" seconds.`,
      ObfuscationUtil.obfuscateAccessToken(accessToken)
    );

    const context = this.createContext(accessToken.user, loginData.clientType);

    await this.initEngine(context);
    await retrieveCookie(cookieResponse, this.config.store);
    await this.accessTokenStore.updateToken(accessToken);

    return context;
  }

  public async register(userAccount: RegisterData, clientType: ClientType = ClientType.PERMANENT): Promise<Context> {
    if (this.context) {
      await this.logout({ignoreError: true});
    }

    const user = await this.auth.api.postRegister(userAccount);

    /**
     * Note:
     * It's necessary to initialize the context (Client.createContext()) and the store (Client.initEngine())
     * for saving the retrieved cookie from POST /access (Client.init()) in a Node environment.
     */
    const context = await this.createContext(user.id, clientType);

    await this.initEngine(context);
    return this.init(clientType);
  }

  public async logout(options = {ignoreError: false}): Promise<void> {
    try {
      await this.auth.api.postLogout();
    } catch (error) {
      if (options.ignoreError) {
        this.logger.error(error);
      } else {
        throw error;
      }
    }

    this.disconnect('Closed by client logout');
    await this.accessTokenStore.delete();
    delete this.context;
  }

  public connect(): Promise<WebSocketClient> {
    if (this.context && this.context.clientId) {
      return this.transport.ws.connect(this.context.clientId);
    } else {
      return this.transport.ws.connect();
    }
  }

  private createContext(userId: string, clientType: ClientType, clientId?: string): Context {
    this.context = this.context ? {...this.context, clientId, clientType} : new Context(userId, clientType, clientId);
    return this.context;
  }

  public disconnect(reason?: string): void {
    this.transport.ws.disconnect(reason);
  }

  private async initEngine(context: Context) {
    const clientType = context.clientType === ClientType.NONE ? '' : `@${context.clientType}`;
    const dbName = `${this.STORE_NAME_PREFIX}@${this.config.urls.name}@${context.userId}${clientType}`;
    this.logger.log(`Initialising store with name "${dbName}"`);
    try {
      const db = await this.config.store.init(dbName);
      const isDexieStore = db && db.constructor.name === 'Dexie';
      if (isDexieStore) {
        if (this.config.schemaCallback) {
          this.config.schemaCallback(db);
        } else {
          const message = `Could not initialize store "${dbName}". Missing schema definition.`;
          throw new Error(message);
        }
        // In case the database got purged, db.close() is called automatically and we have to reopen it.
        await db.open();
      }
    } catch (error) {
      this.logger.error(`Could not initialize store "${dbName}": ${error.message}`);
      throw error;
    }
    return this.config.store;
  }
}

export {APIClient};
