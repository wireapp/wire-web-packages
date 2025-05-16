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

import logdown from 'logdown';
import {ErrorEvent} from 'reconnecting-websocket';

import {EventEmitter} from 'events';

import {LogFactory} from '@wireapp/commons';

import {AcknowledgeType} from './AcknowledgeEvent.types';
import {
  ConsumableEvent,
  ConsumableNotification as ConsumableNotificationResponse,
} from './ConsumableNotification.types';
import {ReconnectingWebsocket, WEBSOCKET_STATE} from './ReconnectingWebsocket';

import {InvalidTokenError, MissingCookieAndTokenError, MissingCookieError} from '../auth/';
import {HttpClient, NetworkError} from '../http/';

export enum TOPIC {
  ON_ERROR = 'ConsumableNotification.TOPIC.ON_ERROR',
  ON_INVALID_TOKEN = 'ConsumableNotification.TOPIC.ON_INVALID_TOKEN',
  ON_MESSAGE = 'ConsumableNotification.TOPIC.ON_MESSAGE',
  ON_STATE_CHANGE = 'ConsumableNotification.TOPIC.ON_STATE_CHANGE',
}

export interface ConsumableNotification {
  on(event: TOPIC.ON_ERROR, listener: (error: Error | ErrorEvent) => void): this;
  on(event: TOPIC.ON_INVALID_TOKEN, listener: (error: InvalidTokenError | MissingCookieError) => void): this;
  on(event: TOPIC.ON_MESSAGE, listener: (notification: ConsumableNotificationResponse) => void): this;
  on(event: TOPIC.ON_STATE_CHANGE, listener: (state: WEBSOCKET_STATE) => void): this;
}

export type OnConnect = (abortHandler: AbortController) => Promise<void>;

export class ConsumableNotification extends EventEmitter {
  private clientId?: string;
  private isRefreshingAccessToken: boolean;
  private readonly baseUrl: string;
  private readonly logger: logdown.Logger;
  private readonly socket: ReconnectingWebsocket;
  private websocketState: WEBSOCKET_STATE;
  public client: HttpClient;
  private isSocketLocked: boolean;
  private bufferedMessages: string[];
  private abortHandler?: AbortController;

  public static readonly TOPIC = TOPIC;

  constructor(baseUrl: string, client: HttpClient) {
    super();

    this.bufferedMessages = [];
    this.isSocketLocked = false;
    this.baseUrl = baseUrl;
    this.client = client;
    this.isRefreshingAccessToken = false;
    this.socket = new ReconnectingWebsocket(this.onReconnect);
    this.websocketState = this.socket.getState();

    this.logger = LogFactory.getLogger('@wireapp/api-client/tcp/ConsumableNotification');
  }

  private onStateChange(newState: WEBSOCKET_STATE): void {
    if (newState !== this.websocketState) {
      this.websocketState = newState;
      this.emit(ConsumableNotification.TOPIC.ON_STATE_CHANGE, this.websocketState);
    }
  }

  public mapFromJSON(json: string): ConsumableNotificationResponse {
    const data = JSON.parse(json);

    return {
      type: data.type,
      ...(data?.data && {
        deliveryTag: data.data.delivery_tag,
        id: data.data.event.id,
        payload: data.data.event.payload,
      }),
    };
  }

  private readonly onMessage = (data: string) => {
    if (this.isLocked()) {
      this.bufferedMessages.push(data);
    } else {
      const notification = this.mapFromJSON(data);
      this.emit(ConsumableNotification.TOPIC.ON_MESSAGE, notification);
    }
  };

  acknowledgeEvents(notification: ConsumableNotificationResponse) {
    if (notification.type === ConsumableEvent.MISSED) {
      const jsonEvent = JSON.stringify({
        type: AcknowledgeType.ACK_FULL_SYNC,
      });

      this.socket.send(jsonEvent);
    }

    if (notification.type === ConsumableEvent.EVENT) {
      if (!notification.deliveryTag) {
        this.logger.warn(`Cannot acknowledge notification. DeliveryTag is missing`);
      }

      const jsonEvent = JSON.stringify({
        type: AcknowledgeType.ACK,
        data: {
          delivery_tag: notification.deliveryTag,
          // Note: we can extend this when we want to implement multiple ack at once.
          multiple: false,
        },
      });

      this.socket.send(jsonEvent);
    }
  }

  private readonly onError = async (error: ErrorEvent) => {
    this.onStateChange(this.socket.getState());
    this.emit(ConsumableNotification.TOPIC.ON_ERROR, error);
    await this.refreshAccessToken();
  };

  private readonly onReconnect = async () => {
    if (!this.client.hasValidAccessToken()) {
      // before we try any connection, we first refresh the access token to make sure we will avoid concurrent accessToken refreshes
      await this.refreshAccessToken();
    }
    return this.consumeLiveEvents();
  };

  private readonly onOpen = () => {
    this.onStateChange(this.socket.getState());
  };

  private readonly onClose = () => {
    this.abortHandler?.abort();
    this.bufferedMessages = [];
    this.onStateChange(this.socket.getState());
  };

  /**
   * Attaches all listeners to the websocket and establishes the connection.
   *
   * @param clientId
   * When provided the websocket will get messages specific to the client.
   * If omitted the websocket will receive global messages for the account.
   *
   * @param onConnect
   * Handler that is executed before the websocket is fully connected.
   * Essentially the websocket will lock before execution of this function and
   * unlocks after the execution of the handler and pushes all buffered messages.
   */
  public connect(clientId?: string, onConnect?: OnConnect): ConsumableNotification {
    this.clientId = clientId;

    this.onStateChange(WEBSOCKET_STATE.CONNECTING);
    this.socket.setOnMessage(this.onMessage);
    this.socket.setOnError(this.onError);
    this.socket.setOnOpen(() => {
      this.onOpen();
      if (onConnect) {
        this.abortHandler = new AbortController();
        void onConnect(this.abortHandler);
      }
    });
    this.socket.setOnClose(this.onClose);

    this.socket.connect();
    return this;
  }

  private async refreshAccessToken(): Promise<void> {
    if (this.isRefreshingAccessToken) {
      return;
    }
    this.isRefreshingAccessToken = true;

    try {
      await this.client.refreshAccessToken();
    } catch (error) {
      if (error instanceof NetworkError) {
        this.logger.warn(error);
      } else if (
        error instanceof InvalidTokenError ||
        error instanceof MissingCookieError ||
        error instanceof MissingCookieAndTokenError
      ) {
        // On invalid cookie the application is supposed to logout.
        this.logger.warn(
          `[WebSocket] Cannot renew access token because cookie/token is invalid: ${error.message}`,
          error,
        );
        this.emit(ConsumableNotification.TOPIC.ON_INVALID_TOKEN, error);
      } else {
        this.emit(ConsumableNotification.TOPIC.ON_ERROR, error);
      }
    } finally {
      this.isRefreshingAccessToken = false;
    }
  }

  public disconnect(reason?: string): void {
    if (this.socket) {
      this.socket.disconnect(reason);
    }
  }

  /**
   * Unlocks the websocket.
   * When unlocking the websocket all buffered messages between
   * connecting the websocket and the unlocking the websocket will be emitted.
   */
  public readonly unlock = () => {
    this.logger.info(`Unlocking WebSocket - Emitting "${this.bufferedMessages.length}" unprocessed messages`);
    this.isSocketLocked = false;
    for (const bufferedMessage of this.bufferedMessages) {
      this.onMessage(bufferedMessage);
    }
    this.bufferedMessages = [];
  };

  /**
   * Locks the websocket so messages are buffered instead of being emitted.
   * Once the websocket gets unlocked buffered messages get emitted.
   * This behaviour is needed in order to not miss any messages
   * during fetching notifications from the notification stream.
   */
  public readonly lock = () => {
    this.logger.info('Locking WebSocket');
    this.isSocketLocked = true;
  };

  public isLocked(): boolean {
    return this.isSocketLocked;
  }

  private consumeLiveEvents(): string {
    const store = this.client.accessTokenStore.accessToken;
    const token = store?.access_token ?? '';
    if (!token) {
      this.logger.warn('Reconnecting WebSocket with unset token');
    }

    let url = `${this.baseUrl}/v8/events?access_token=${token}`;

    if (this.clientId) {
      url += `&client=${this.clientId}`;
    }

    return url;
  }
}
