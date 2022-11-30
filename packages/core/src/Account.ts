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

import {
  RegisterData,
  AUTH_COOKIE_KEY,
  AUTH_TABLE_NAME,
  Context,
  Cookie,
  CookieStore,
  LoginData,
} from '@wireapp/api-client/lib/auth';
import {ClientClassification, ClientType, RegisteredClient} from '@wireapp/api-client/lib/client/';
import * as Events from '@wireapp/api-client/lib/event';
import {CONVERSATION_EVENT} from '@wireapp/api-client/lib/event';
import {Notification} from '@wireapp/api-client/lib/notification/';
import {AbortHandler, WebSocketClient} from '@wireapp/api-client/lib/tcp/';
import {WEBSOCKET_STATE} from '@wireapp/api-client/lib/tcp/ReconnectingWebsocket';
import axios from 'axios';
import {Encoder} from 'bazinga64';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import logdown from 'logdown';

import {EventEmitter} from 'events';

import {APIClient, BackendFeatures} from '@wireapp/api-client';
import {CoreCrypto} from '@wireapp/core-crypto';
import * as cryptobox from '@wireapp/cryptobox';
import {CRUDEngine, error as StoreEngineError, MemoryEngine} from '@wireapp/store-engine';

import {AccountService} from './account/';
import {LoginSanitizer} from './auth/';
import {BroadcastService} from './broadcast/';
import {ClientInfo, ClientService} from './client/';
import {ConnectionService} from './connection/';
import {AssetService, ConversationService} from './conversation/';
import {getQueueLength, resumeMessageSending} from './conversation/message/messageSender';
import {CoreError} from './CoreError';
import {CryptographyService, SessionId} from './cryptography/';
import {GiphyService} from './giphy/';
import {LinkPreviewService} from './linkPreview';
import {MLSService} from './messagingProtocols/mls';
import {MLSCallbacks, CryptoProtocolConfig} from './messagingProtocols/mls/types';
import {ProteusService} from './messagingProtocols/proteus';
import {HandledEventPayload, NotificationService, NotificationSource} from './notification/';
import {SelfService} from './self/';
import {CoreDatabase, deleteDB, openDB} from './storage/CoreDB';
import {TeamService} from './team/';
import {UserService} from './user/';
import {createCustomEncryptedStore, createEncryptedStore, deleteEncryptedStore} from './util/encryptedStore';

export type ProcessedEventPayload = HandledEventPayload;

enum TOPIC {
  ERROR = 'Account.TOPIC.ERROR',
}

export enum ConnectionState {
  /** The websocket is closed and notifications stream is not being processed */
  CLOSED = 'closed',
  /** The websocket is being opened */
  CONNECTING = 'connecting',
  /** The websocket is open but locked and notifications stream is being processed */
  PROCESSING_NOTIFICATIONS = 'processing_notifications',
  /** The websocket is open and message will go through and notifications stream is fully processed */
  LIVE = 'live',
}

export interface Account {
  on(event: TOPIC.ERROR, listener: (payload: CoreError) => void): this;
}

export type CreateStoreFn = (storeName: string, context: Context) => undefined | Promise<CRUDEngine | undefined>;

interface AccountOptions<T> {
  /** Used to store info in the database (will create a inMemory engine if returns undefined) */
  createStore?: CreateStoreFn;

  /** Number of prekeys to generate when creating a new device (defaults to 2)
   * Prekeys are Diffie-Hellmann public keys which allow offline initiation of a secure Proteus session between two devices.
   * Having a high value will:
   *    - make creating a new device consuming more CPU resources
   *    - make it less likely that all prekeys get consumed while the device is offline and the last resort prekey will not be used to create new session
   * Having a low value will:
   *    - make creating a new device fast
   *    - make it likely that all prekeys get consumed while the device is offline and the last resort prekey will be used to create new session
   */
  nbPrekeys?: number;

  /**
   * Config for MLS and proteus devices. Will fallback to the old proteus logic if not provided
   */
  cryptoProtocolConfig?: CryptoProtocolConfig<T>;
}

type InitOptions = {
  /** cookie used to identify the current user. Will use the browser cookie if not defined */
  cookie?: Cookie;

  /** fully initiate the client and register periodic checks */
  initClient?: boolean;

  /**
   * callback triggered when a message from an unknown client is received.
   * An unknown client is a client we don't yet have a session with
   */
  onNewClient?: (sessionId: SessionId) => void;
};

const coreDefaultClient: ClientInfo = {
  classification: ClientClassification.DESKTOP,
  cookieLabel: 'default',
  model: '@wireapp/core',
};

export class Account<T = any> extends EventEmitter {
  private readonly apiClient: APIClient;
  private readonly logger: logdown.Logger;
  private readonly createStore: CreateStoreFn;
  private storeEngine?: CRUDEngine;
  private db?: CoreDatabase;
  private readonly nbPrekeys: number;
  private readonly cryptoProtocolConfig?: CryptoProtocolConfig<T>;
  private coreCryptoClient?: CoreCrypto;

  public static readonly TOPIC = TOPIC;
  public service?: {
    mls: MLSService;
    proteus: ProteusService;
    account: AccountService;
    asset: AssetService;
    broadcast: BroadcastService;
    client: ClientService;
    connection: ConnectionService;
    conversation: ConversationService;
    cryptography: CryptographyService;
    giphy: GiphyService;
    linkPreview: LinkPreviewService;
    notification: NotificationService;
    self: SelfService;
    team: TeamService;
    user: UserService;
  };
  public backendFeatures: BackendFeatures;

  /**
   * @param apiClient The apiClient instance to use in the core (will create a new new one if undefined)
   * @param accountOptions
   */
  constructor(
    apiClient: APIClient = new APIClient(),
    {createStore = () => undefined, nbPrekeys = 2, cryptoProtocolConfig}: AccountOptions<T> = {},
  ) {
    super();
    this.apiClient = apiClient;
    this.backendFeatures = this.apiClient.backendFeatures;
    this.cryptoProtocolConfig = cryptoProtocolConfig;
    this.nbPrekeys = nbPrekeys;
    this.createStore = createStore;

    apiClient.on(APIClient.TOPIC.COOKIE_REFRESH, async (cookie?: Cookie) => {
      if (cookie && this.storeEngine) {
        try {
          await this.persistCookie(this.storeEngine, cookie);
        } catch (error) {
          this.logger.error(`Failed to save cookie: ${(error as Error).message}`, error);
        }
      }
    });

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
    this.backendFeatures = features;
    return features;
  }

  private persistCookie(storeEngine: CRUDEngine, cookie: Cookie): Promise<string> {
    const entity = {expiration: cookie.expiration, zuid: cookie.zuid};
    return storeEngine.updateOrCreate(AUTH_TABLE_NAME, AUTH_COOKIE_KEY, entity);
  }

  get clientId(): string {
    return this.apiClient.validatedClientId;
  }

  get userId(): string {
    return this.apiClient.validatedUserId;
  }

  /**
   * Will register a new user to the backend
   *
   * @param registration The user's data
   * @param clientType Type of client to create (temporary or permanent)
   */
  public async register(registration: RegisterData, clientType: ClientType): Promise<Context> {
    const context = await this.apiClient.register(registration, clientType);
    await this.initServices(context);
    return context;
  }

  /**
   * Will init the core with an already existing client (both on backend and local)
   * Will fail if local client cannot be found
   *
   * @param clientType The type of client the user is using (temporary or permanent)
   */
  public async init(
    clientType: ClientType,
    {cookie, initClient = true, onNewClient}: InitOptions = {},
  ): Promise<Context> {
    const context = await this.apiClient.init(clientType, cookie);
    await this.initServices(context);

    /** @fixme
     * When we will start migrating to CoreCrypto encryption/decryption, those hooks won't be available anymore
     * We will need to implement
     *   - the mechanism to handle messages from an unknown sender
     *   - the mechanism to generate new prekeys when we reach a certain threshold of prekeys
     */
    this.service!.cryptography.setCryptoboxHooks({
      onNewPrekeys: async prekeys => {
        this.logger.debug(`Received '${prekeys.length}' new PreKeys.`);

        await this.apiClient.api.client.putClient(context.clientId!, {prekeys});
        this.logger.debug(`Successfully uploaded '${prekeys.length}' PreKeys.`);
      },

      onNewSession: onNewClient,
    });

    // Assumption: client gets only initialized once
    if (initClient) {
      const {localClient} = await this.initClient({clientType});

      //call /access endpoint with client_id after client initialisation
      await this.apiClient.transport.http.associateClientWithSession(localClient.id);

      if (this.cryptoProtocolConfig?.mls && this.backendFeatures.supportsMLS) {
        // initialize schedulers for pending mls proposals once client is initialized
        await this.service?.mls.checkExistingPendingProposals();

        // initialize schedulers for renewing key materials
        this.service?.mls.checkForKeyMaterialsUpdate();

        // initialize scheduler for syncing key packages with backend
        this.service?.mls.checkForKeyPackagesBackendSync();
      }
    }
    return context;
  }

  /**
   * Will log the user in with the given credential.
   * Will also create the local client and store it in DB
   *
   * @param loginData The credentials of the user
   * @param initClient Should the call also create the local client
   * @param clientInfo Info about the client to create (name, type...)
   */
  public async login(
    loginData: LoginData,
    initClient: boolean = true,
    clientInfo: ClientInfo = coreDefaultClient,
  ): Promise<Context> {
    this.resetContext();
    LoginSanitizer.removeNonPrintableCharacters(loginData);

    const context = await this.apiClient.login(loginData);
    await this.initServices(context);

    if (initClient) {
      await this.initClient(loginData, clientInfo);
    }

    return context;
  }

  /**
   * Will try to get the load the local client from local DB.
   * If clientInfo are provided, will also create the client on backend and DB
   * If clientInfo are not provided, the method will fail if local client cannot be found
   *
   * @param loginData User's credentials
   * @param clientInfo Will allow creating the client if the local client cannot be found (else will fail if local client is not found)
   * @param entropyData Additional entropy data
   * @returns The local existing client or newly created client
   */
  public async initClient(
    loginData: LoginData,
    clientInfo?: ClientInfo,
    entropyData?: Uint8Array,
  ): Promise<{isNewClient: boolean; localClient: RegisteredClient}> {
    if (!this.service || !this.apiClient.context || !this.coreCryptoClient) {
      throw new Error('Services are not set.');
    }

    try {
      const localClient = await this.loadAndValidateLocalClient();
      await this.service.proteus.init();

      if (this.backendFeatures.supportsMLS) {
        await this.coreCryptoClient.mlsInit(localClient.id);
      }

      return {isNewClient: false, localClient};
    } catch (error) {
      if (!clientInfo) {
        // If no client info provided, the client should not be created
        throw error;
      }
      // There was no client so we need to "create" and "register" a client
      const notFoundInDatabase =
        error instanceof cryptobox.error.CryptoboxError ||
        (error as Error).constructor.name === 'CryptoboxError' ||
        error instanceof StoreEngineError.RecordNotFoundError ||
        (error as Error).constructor.name === StoreEngineError.RecordNotFoundError.name;
      const notFoundOnBackend = axios.isAxiosError(error) ? error.response?.status === HTTP_STATUS.NOT_FOUND : false;

      if (notFoundInDatabase) {
        this.logger.log(`Could not find valid client in database "${this.storeEngine?.storeName}".`);
        return this.registerClient(loginData, clientInfo, entropyData);
      }

      if (notFoundOnBackend) {
        this.logger.log('Could not find valid client on backend');
        const client = await this.service!.client.getLocalClient();
        const shouldDeleteWholeDatabase = client.type === ClientType.TEMPORARY;
        if (shouldDeleteWholeDatabase) {
          this.logger.log('Last client was temporary - Deleting database');

          if (this.storeEngine) {
            await this.storeEngine.clearTables();
          }
          const context = await this.apiClient.init(loginData.clientType);
          await this.initEngine(context);

          return this.registerClient(loginData, clientInfo, entropyData);
        }

        this.logger.log('Last client was permanent - Deleting cryptography stores');
        await this.service!.cryptography.deleteCryptographyStores();
        return this.registerClient(loginData, clientInfo, entropyData);
      }

      throw error;
    }
  }

  private async initCoreCrypto(context: Context) {
    const coreCryptoKeyId = 'corecrypto-key';
    const dbName = this.generateSecretsDbName(context);

    const systemCrypto = this.cryptoProtocolConfig?.systemCrypto;
    const secretStore = systemCrypto
      ? await createCustomEncryptedStore(dbName, systemCrypto)
      : await createEncryptedStore(dbName);

    let key = await secretStore.getsecretValue(coreCryptoKeyId);
    if (!key) {
      key = crypto.getRandomValues(new Uint8Array(16));
      await secretStore.saveSecretValue(coreCryptoKeyId, key);
    }

    return CoreCrypto.deferredInit(
      `corecrypto-${this.generateDbName(context)}`,
      Encoder.toBase64(key).asString,
      undefined, // We pass a placeholder entropy data. It will be set later on by calling `reseedRng`
      this.cryptoProtocolConfig?.coreCrypoWasmFilePath,
    );
  }

  /**
   * In order to be able to send MLS messages, the core needs a few information from the consumer.
   * Namely:
   * - is the current user allowed to administrate a specific conversation
   * - what is the groupId of a conversation
   * @param mlsCallbacks
   */
  configureMLSCallbacks(mlsCallbacks: MLSCallbacks) {
    this.service?.mls.configureMLSCallbacks(mlsCallbacks);
  }

  public async initServices(context: Context): Promise<void> {
    this.coreCryptoClient = await this.initCoreCrypto(context);
    this.storeEngine = await this.initEngine(context);
    this.db = await openDB(this.generateCoreDbName(context));
    const accountService = new AccountService(this.apiClient);
    const assetService = new AssetService(this.apiClient);
    const cryptographyService = new CryptographyService(this.apiClient, this.storeEngine, {
      // We want to encrypt with fully qualified session ids, only if the backend is federated with other backends
      useQualifiedIds: this.backendFeatures.isFederated,
      nbPrekeys: this.nbPrekeys,
    });

    const mlsService = new MLSService(this.apiClient, this.coreCryptoClient, {
      ...this.cryptoProtocolConfig?.mls,
      nbKeyPackages: this.nbPrekeys,
    });
    const proteusService = new ProteusService(this.apiClient, this.coreCryptoClient, this.db, {
      // We can use qualified ids to send messages as long as the backend supports federated endpoints
      useQualifiedIds: this.backendFeatures.federationEndpoints,
    });

    const clientService = new ClientService(this.apiClient, proteusService, this.storeEngine);
    const connectionService = new ConnectionService(this.apiClient);
    const giphyService = new GiphyService(this.apiClient);
    const linkPreviewService = new LinkPreviewService(assetService);
    const notificationService = new NotificationService(this.apiClient, mlsService, proteusService, this.storeEngine);
    const conversationService = new ConversationService(
      this.apiClient,
      {
        // We can use qualified ids to send messages as long as the backend supports federated endpoints
        useQualifiedIds: this.backendFeatures.federationEndpoints,
      },
      mlsService,
      proteusService,
    );

    const selfService = new SelfService(this.apiClient);
    const teamService = new TeamService(this.apiClient);

    const broadcastService = new BroadcastService(this.apiClient, proteusService);
    const userService = new UserService(this.apiClient, broadcastService, connectionService);

    this.service = {
      mls: mlsService,
      proteus: proteusService,
      account: accountService,
      asset: assetService,
      broadcast: broadcastService,
      client: clientService,
      connection: connectionService,
      conversation: conversationService,
      cryptography: cryptographyService,
      giphy: giphyService,
      linkPreview: linkPreviewService,
      notification: notificationService,
      self: selfService,
      team: teamService,
      user: userService,
    };
  }

  public async loadAndValidateLocalClient(): Promise<RegisteredClient> {
    const loadedClient = await this.service!.client.getLocalClient();
    await this.apiClient.api.client.getClient(loadedClient.id);
    this.apiClient.context!.clientId = loadedClient.id;
    return loadedClient;
  }

  private async registerClient(
    loginData: LoginData,
    clientInfo: ClientInfo = coreDefaultClient,
    entropyData?: Uint8Array,
  ): Promise<{isNewClient: boolean; localClient: RegisteredClient}> {
    if (!this.service || !this.apiClient.context || !this.coreCryptoClient) {
      throw new Error('Services are not set or context not initialized.');
    }
    const createMlsClient = !!this.cryptoProtocolConfig?.mls;
    this.logger.info(`Creating new client {mls: ${createMlsClient}}`);
    if (entropyData) {
      await this.coreCryptoClient.reseedRng(entropyData);
    }
    await this.service.proteus.init();
    const initialPreKeys = await this.service.proteus.createClient(this.nbPrekeys);

    const registeredClient = await this.service.client.register(loginData, clientInfo, initialPreKeys);

    if (createMlsClient && this.backendFeatures.supportsMLS) {
      await this.coreCryptoClient.mlsInit(registeredClient.id);
    }
    this.apiClient.context.clientId = registeredClient.id;
    this.logger.info('Client is created');

    await this.service.notification.initializeNotificationStream();
    await this.service.client.synchronizeClients();

    return {isNewClient: true, localClient: registeredClient};
  }

  private resetContext(): void {
    delete this.apiClient.context;
    delete this.service;
  }

  /**
   * Will logout the current user
   * @param clearData if set to `true` will completely wipe any database that was created by the Account
   */
  public async logout(clearData: boolean = false): Promise<void> {
    this.db?.close();
    if (clearData && this.coreCryptoClient) {
      await this.coreCryptoClient.wipe();
      await deleteEncryptedStore(this.generateSecretsDbName(this.apiClient.context!));
      if (this.db) {
        await deleteDB(this.db);
      }
    }
    await this.apiClient.logout();
    this.resetContext();
  }

  /**
   * Will download and handle the notification stream since last stored notification id.
   * Once the notification stream has been handled from backend, will then connect to the websocket and start listening to incoming events
   *
   * @param callbacks callbacks that will be called to handle different events
   * @returns close a function that will disconnect from the websocket
   */
  public listen({
    onEvent = () => {},
    onConnectionStateChanged = () => {},
    onNotificationStreamProgress = () => {},
    onMissedNotifications = () => {},
    dryRun = false,
  }: {
    /**
     * Called when a new event arrives from backend
     * @param payload the payload of the event. Contains the raw event received and the decrypted data (if event was encrypted)
     * @param source where the message comes from (either websocket or notification stream)
     */
    onEvent?: (payload: HandledEventPayload, source: NotificationSource) => void;

    /**
     * During the notification stream processing, this function will be called whenever a new notification has been processed
     */
    onNotificationStreamProgress?: ({done, total}: {done: number; total: number}) => void;

    /**
     * called when the connection state with the backend has changed
     */
    onConnectionStateChanged?: (state: ConnectionState) => void;

    /**
     * called when we detect lost notification from backend.
     * When a client doesn't log in for a while (28 days, as of now) notifications that are older than 28 days will be deleted from backend.
     * If the client query the backend for the notifications since a particular notification ID and this ID doesn't exist anymore on the backend, we deduce that some messages were not sync before they were removed from backend.
     * We can then detect that something was wrong and warn the consumer that there might be some missing old messages
     * @param  {string} notificationId
     */
    onMissedNotifications?: (notificationId: string) => void;

    /**
     * When set will not decrypt and not store the last notification ID. This is useful if you only want to subscribe to unencrypted backend events
     */
    dryRun?: boolean;
  } = {}): () => void {
    if (!this.apiClient.context) {
      throw new Error('Context is not set - please login first');
    }

    const handleEvent = async (payload: HandledEventPayload, source: NotificationSource) => {
      const {event} = payload;
      switch (event?.type) {
        case CONVERSATION_EVENT.MESSAGE_TIMER_UPDATE: {
          const {
            data: {message_timer},
            conversation,
          } = event as Events.ConversationMessageTimerUpdateEvent;
          const expireAfterMillis = Number(message_timer);
          this.service!.conversation.messageTimer.setConversationLevelTimer(conversation, expireAfterMillis);
          break;
        }
      }
      onEvent(payload, source);
    };

    const handleNotification = async (notification: Notification, source: NotificationSource): Promise<void> => {
      try {
        const messages = this.service!.notification.handleNotification(notification, source, dryRun);
        for await (const message of messages) {
          await handleEvent(message, source);
        }
      } catch (error) {
        this.logger.error(`Failed to handle notification ID "${notification.id}": ${(error as any).message}`, error);
      }
    };

    this.apiClient.transport.ws.removeAllListeners(WebSocketClient.TOPIC.ON_MESSAGE);
    this.apiClient.transport.ws.on(WebSocketClient.TOPIC.ON_MESSAGE, notification =>
      handleNotification(notification, NotificationSource.WEBSOCKET),
    );
    this.apiClient.transport.ws.on(WebSocketClient.TOPIC.ON_STATE_CHANGE, wsState => {
      const mapping: Partial<Record<WEBSOCKET_STATE, ConnectionState>> = {
        [WEBSOCKET_STATE.CLOSED]: ConnectionState.CLOSED,
        [WEBSOCKET_STATE.CONNECTING]: ConnectionState.CONNECTING,
      };
      const connectionState = mapping[wsState];
      if (connectionState) {
        onConnectionStateChanged(connectionState);
      }
    });

    const processNotificationStream = async (abortHandler: AbortHandler) => {
      // Lock websocket in order to buffer any message that arrives while we handle the notification stream
      this.apiClient.transport.ws.lock();
      onConnectionStateChanged(ConnectionState.PROCESSING_NOTIFICATIONS);
      const results = await this.service!.notification.processNotificationStream(
        async (notification, source, progress) => {
          await handleNotification(notification, source);
          onNotificationStreamProgress(progress);
        },
        onMissedNotifications,
        abortHandler,
      );
      this.logger.log(`Finished processing notifications ${JSON.stringify(results)}`, results);
      if (abortHandler.isAborted()) {
        this.logger.warn('Ending connection process as websocket was closed');
        return;
      }
      onConnectionStateChanged(ConnectionState.LIVE);
      // We can now unlock the websocket and let the new messages being handled and decrypted
      this.apiClient.transport.ws.unlock();
      // We need to wait for the notification stream to be fully handled before releasing the message sending queue.
      // This is due to the nature of how message are encrypted, any change in mls epoch needs to happen before we start encrypting any kind of messages
      this.logger.info(`Resuming message sending. ${getQueueLength()} messages to be sent`);
      resumeMessageSending();
    };
    this.apiClient.connect(processNotificationStream);

    return () => {
      this.apiClient.disconnect();
      onConnectionStateChanged(ConnectionState.CLOSED);
      this.apiClient.transport.ws.removeAllListeners();
    };
  }

  public proteusCryptoboxMigrate(storeName: string) {
    return this.service!.proteus.proteusCryptoboxMigrate(storeName);
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
      const initializedDb = await this.createStore(dbName, context);
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
    const cookie = CookieStore.getCookie();
    if (cookie) {
      await this.persistCookie(storeEngine, cookie);
    }
    return storeEngine;
  }
}
