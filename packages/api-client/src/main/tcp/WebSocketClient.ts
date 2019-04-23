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

import EventEmitter from 'events';
import logdown from 'logdown';
import ReconnectingWebSocket, {Options} from 'reconnecting-websocket';
import NodeWebSocket = require('ws');
import {AccessTokenData} from '../auth';
import {IncomingNotification} from '../conversation/';
import {HttpClient, NetworkError} from '../http/';
import * as buffer from '../shims/node/buffer';

class WebSocketClient extends EventEmitter {
  private clientId: string | undefined;

  private readonly logger: logdown.Logger;

  private socket: ReconnectingWebSocket | undefined;

  public static CLOSE_EVENT_CODE = {
    GOING_AWAY: 1001,
    NORMAL_CLOSURE: 1000,
    PROTOCOL_ERROR: 1002,
    UNSUPPORTED_DATA: 1003,
  };

  public static RECONNECTING_OPTIONS: Options = {
    WebSocket: typeof window !== 'undefined' ? WebSocket : NodeWebSocket,
    connectionTimeout: 4000,
    debug: false,
    maxReconnectionDelay: 10000,
    maxRetries: Infinity,
    minReconnectionDelay: 4000,
    reconnectionDelayGrowFactor: 1.3,
  };

  public static TOPIC = {
    ON_MESSAGE: 'WebSocketClient.TOPIC.ON_MESSAGE',
  };

  constructor(private readonly baseURL: string, public client: HttpClient) {
    super();

    this.logger = logdown('@wireapp/api-client/tcp/WebSocketClient', {
      logger: console,
      markdown: false,
    });
  }

  private buildWebSocketURL(accessToken: string = this.client.accessTokenStore.accessToken!.access_token): string {
    let url = `${this.baseURL}/await?access_token=${accessToken}`;
    if (this.clientId) {
      // Note: If no client ID is given, then the WebSocket connection will receive all notifications for all clients
      // of the connected user
      url += `&client=${this.clientId}`;
    }
    return url;
  }

  public connect(clientId?: string): Promise<WebSocketClient> {
    this.clientId = clientId;

    this.socket = new ReconnectingWebSocket(this.buildWebSocketURL, [], WebSocketClient.RECONNECTING_OPTIONS);

    if (this.socket) {
      // TODO: Consider switching to "addEventListener('message', ...)"
      this.socket.onmessage = (event: MessageEvent): void => {
        const notification: IncomingNotification = JSON.parse(buffer.bufferToString(event.data));
        this.emit(WebSocketClient.TOPIC.ON_MESSAGE, notification);
      };

      this.socket.onerror = (): Promise<void | AccessTokenData> =>
        this.client.refreshAccessToken().catch(error => {
          if (error instanceof NetworkError) {
            this.logger.warn(error);
          } else {
            throw error;
          }
        });

      this.socket.onopen = (): void => {
        if (this.socket) {
          this.socket.binaryType = 'arraybuffer';
        }
      };
    }

    return Promise.resolve(this);
  }

  public disconnect(reason = 'Unknown reason'): void {
    if (this.socket) {
      // TODO: 'any' can be removed once this issue is resolved:
      // https://github.com/pladaria/reconnecting-websocket/issues/44
      const socket: any = this.socket;
      socket.close(WebSocketClient.CLOSE_EVENT_CODE.NORMAL_CLOSURE, reason, {
        delay: 0,
        fastClose: true,
        keepClosed: true,
      });
    }
  }
}

export {WebSocketClient};
