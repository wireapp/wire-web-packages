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

import {TimeUtil} from '@wireapp/commons';
import EventEmitter from 'events';
import Html5WebSocket from 'html5-websocket';
import logdown from 'logdown';

import {InvalidTokenError} from '../auth';
import {IncomingNotification} from '../conversation/';
import {BackendErrorMapper, HttpClient, NetworkError} from '../http/';
import * as buffer from '../shims/node/buffer';

const ReconnectingWebsocket = require('reconnecting-websocket');

export enum TOPIC {
  ON_DISCONNECT = 'WebSocketClient.TOPIC.ON_DISCONNECT',
  ON_ERROR = 'WebSocketClient.TOPIC.ON_ERROR',
  ON_MESSAGE = 'WebSocketClient.TOPIC.ON_MESSAGE',
}

export enum CLOSE_EVENT_CODE {
  GOING_AWAY = 1001,
  NORMAL_CLOSURE = 1000,
  PROTOCOL_ERROR = 1002,
  UNSUPPORTED_DATA = 1003,
}

export class WebSocketClient extends EventEmitter {
  private readonly baseUrl: string;
  private readonly logger: logdown.Logger;
  private clientId?: string;
  private hasAlreadySentUnansweredPing: boolean;
  private pingInterval?: NodeJS.Timeout;
  private socket?: WebSocket;

  public static CONFIG = {
    PING_INTERVAL: TimeUtil.TimeInMillis.SECOND * 5,
  };

  public static RECONNECTING_OPTIONS = {
    connectionTimeout: 4000,
    constructor: typeof window !== 'undefined' ? WebSocket : Html5WebSocket,
    debug: false,
    maxReconnectionDelay: 10000,
    maxRetries: Infinity,
    minReconnectionDelay: 4000,
    reconnectionDelayGrowFactor: 1.3,
  };

  public static CLOSE_EVENT_CODE = CLOSE_EVENT_CODE;
  public static TOPIC = TOPIC;

  constructor(baseUrl: string, public client: HttpClient) {
    super();

    this.baseUrl = baseUrl;
    this.hasAlreadySentUnansweredPing = false;

    this.logger = logdown('@wireapp/api-client/tcp/WebSocketClient', {
      logger: console,
      markdown: false,
    });
  }

  private buildWebSocketUrl(accessToken = this.client.accessTokenStore.accessToken!.access_token): string {
    let url = `${this.baseUrl}/await?access_token=${accessToken}`;
    if (this.clientId) {
      // Note: If no client ID is given, then the WebSocket connection will receive all notifications for all clients
      // of the connected user
      url += `&client=${this.clientId}`;
    }
    return url;
  }

  public connect(clientId?: string): Promise<WebSocketClient> {
    return new Promise(resolve => {
      this.clientId = clientId;

      this.socket = new ReconnectingWebsocket(
        () => this.buildWebSocketUrl(),
        undefined,
        WebSocketClient.RECONNECTING_OPTIONS
      ) as WebSocket;

      this.socket.onmessage = (event: MessageEvent) => {
        const data = buffer.bufferToString(event.data);
        if (data === 'pong') {
          this.logger.info('Received pong from WebSocket');
          this.hasAlreadySentUnansweredPing = false;
        } else {
          const notification: IncomingNotification = JSON.parse(data);
          this.emit(TOPIC.ON_MESSAGE, notification);
        }
      };

      this.socket.onerror = event => {
        this.logger.warn(`WebSocket connection error: "${(event as any).message}"`);
        this.client.refreshAccessToken().catch(error => {
          if (error instanceof NetworkError) {
            this.logger.warn(error);
          } else {
            const mappedError = BackendErrorMapper.map(error);
            if (error instanceof InvalidTokenError) {
              this.emit(WebSocketClient.TOPIC.ON_DISCONNECT, mappedError);
            } else {
              this.emit(WebSocketClient.TOPIC.ON_ERROR, mappedError);
            }
          }
        });
      };

      this.socket.onopen = () => {
        if (this.socket) {
          this.socket.binaryType = 'arraybuffer';
        }
        this.logger.info(`Connected WebSocket to "${this.baseUrl}"`);
        this.pingInterval = setInterval(this.sendPing, WebSocketClient.CONFIG.PING_INTERVAL);
        resolve(this);
      };
    });
  }

  public disconnect(reason = 'Unknown reason', keepClosed = true): void {
    if (this.socket) {
      this.logger.info(`Disconnecting from WebSocket`);
      // TODO: 'any' can be removed once this issue is resolved:
      // https://github.com/pladaria/reconnecting-websocket/issues/44
      (this.socket as any).close(WebSocketClient.CLOSE_EVENT_CODE.NORMAL_CLOSURE, reason, {
        delay: 0,
        fastClose: true,
        keepClosed,
      });

      if (this.pingInterval) {
        clearInterval(this.pingInterval);
      }
    }
  }

  private readonly sendPing = () => {
    if (this.socket) {
      const isReadyStateOpen = this.socket.readyState === 1;
      if (isReadyStateOpen) {
        if (this.hasAlreadySentUnansweredPing) {
          this.logger.warn('Ping interval check failed');
          this.disconnect('Failed ping check', false);
        }
        this.logger.info('Sending ping to WebSocket');
        this.hasAlreadySentUnansweredPing = true;
        return this.socket.send('ping');
      }

      this.logger.warn(`WebSocket connection is closed. Current ready state: "${this.socket.readyState}"`);
    }
  };
}
