/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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
import RWS, {CloseEvent, ErrorEvent, Event, Options} from 'reconnecting-websocket';

import {LogFactory, TimeUtil} from '@wireapp/commons';

import * as buffer from '../shims/node/buffer';
import {WebSocketNode} from '../shims/node/websocket';
import {onBackFromSleep} from '../utils/BackFromSleepHandler';

export enum CloseEventCode {
  NORMAL_CLOSURE = 1000,
  GOING_AWAY = 1001,
  PROTOCOL_ERROR = 1002,
  UNSUPPORTED_DATA = 1003,
}

export enum WEBSOCKET_STATE {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export enum PingMessage {
  PING = 'ping',
  PONG = 'pong',
}

export class ReconnectingWebsocket {
  private static readonly RECONNECTING_OPTIONS: Options = {
    WebSocket: WebSocketNode,
    connectionTimeout: TimeUtil.TimeInMillis.SECOND * 4,
    debug: false,
    maxReconnectionDelay: TimeUtil.TimeInMillis.SECOND * 10,
    maxRetries: Infinity,
    minReconnectionDelay: TimeUtil.TimeInMillis.SECOND * 4,
    reconnectionDelayGrowFactor: 1.3,
  };

  private readonly logger: logdown.Logger;
  private socket?: RWS;
  private pingerId?: NodeJS.Timeout;
  private readonly PING_INTERVAL = TimeUtil.TimeInMillis.SECOND * 20;
  private hasUnansweredPing: boolean;

  private onOpen?: (event: Event) => void;
  private onMessage?: (data: string) => void;
  private onError?: (error: ErrorEvent) => void;
  private onClose?: (event: CloseEvent) => void;

  constructor(
    private readonly onReconnect: () => Promise<string>,
    options: {
      pingInterval?: number;
    } = {},
  ) {
    this.logger = LogFactory.getLogger('@wireapp/api-client/tcp/ReconnectingWebsocket');

    if (options.pingInterval) {
      this.PING_INTERVAL = options.pingInterval;
    }

    this.hasUnansweredPing = false;

    /**
     * According to https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine, navigator.onLine attribute and 'online' and 'offline' events are not reliable enough (especially when it's truthy).
     * We won't receive the 'offline' event when the system goes to sleep (e.g. closing the lid of a laptop).
     * In this case navigator.onLine will still return true, but the WebSocket connection could be closed.
     * To handle this, we need a custom approach to detect when the system goes to sleep and when it wakes up.
     * **/
    onBackFromSleep({
      callback: () => {
        if (this.socket) {
          this.logger.debug('Back from sleep, reconnecting WebSocket');
          this.socket?.reconnect();
        }
      },
      isDisconnected: () => this.getState() === WEBSOCKET_STATE.CLOSED,
    });
  }

  private readonly internalOnError = (error: ErrorEvent) => {
    this.logger.warn('WebSocket connection error', error);
    if (this.onError) {
      this.onError(error);
    }
  };

  private readonly internalOnMessage = (event: MessageEvent) => {
    this.logger.debug('Incoming message');

    const data = buffer.bufferToString(event.data);
    if (data === PingMessage.PONG) {
      this.logger.debug('Received pong from WebSocket');
      this.hasUnansweredPing = false;
    } else if (this.onMessage) {
      this.onMessage(data);
    }
  };

  private readonly internalOnOpen = (event: Event) => {
    this.logger.debug('WebSocket opened');
    if (this.socket) {
      this.socket.binaryType = 'arraybuffer';
    }
    if (this.onOpen) {
      this.onOpen(event);
    }
  };

  private readonly internalOnReconnect = async (): Promise<string> => {
    this.logger.debug('Connecting to WebSocket');
    // The ping is needed to keep the connection alive as long as possible.
    // Otherwise the connection would be closed after 1 min of inactivity and re-established.
    this.startPinging();
    return this.onReconnect();
  };

  private readonly internalOnClose = (event: CloseEvent) => {
    this.logger.debug('WebSocket closed');
    this.stopPinging();
    if (this.onClose) {
      this.onClose(event);
    }
  };

  public connect(): void {
    this.socket = this.getReconnectingWebsocket();

    this.socket.onmessage = this.internalOnMessage;
    this.socket.onerror = this.internalOnError;
    this.socket.onopen = this.internalOnOpen;
    this.socket.onclose = this.internalOnClose;
  }

  public send(message: any): void {
    if (this.socket) {
      this.socket.send(message);
    }
  }

  private startPinging(): void {
    this.stopPinging();
    this.hasUnansweredPing = false;
    this.pingerId = setInterval(this.sendPing, this.PING_INTERVAL);
  }

  private stopPinging(): void {
    if (this.pingerId) {
      clearInterval(this.pingerId);
    }
  }

  private readonly sendPing = (): void => {
    if (this.socket) {
      if (this.hasUnansweredPing) {
        this.logger.warn('Ping interval check failed');
        this.stopPinging();
        this.socket.reconnect();
        return;
      }
      this.hasUnansweredPing = true;
      this.send(PingMessage.PING);
    }
  };

  public getState(): WEBSOCKET_STATE {
    return this.socket ? this.socket.readyState : WEBSOCKET_STATE.CLOSED;
  }

  public disconnect(reason = 'Closed by client'): void {
    if (this.socket) {
      this.logger.info(`Disconnecting from WebSocket (reason: "${reason}")`);
      this.socket.close(CloseEventCode.NORMAL_CLOSURE, reason);
    }
  }

  private getReconnectingWebsocket(): RWS {
    return new RWS(this.internalOnReconnect, undefined, ReconnectingWebsocket.RECONNECTING_OPTIONS);
  }

  public setOnOpen(onOpen: (event: Event) => void): void {
    this.onOpen = onOpen;
  }

  public setOnMessage(onMessage: (data: string) => void): void {
    this.onMessage = onMessage;
  }

  public setOnError(onError: (error: ErrorEvent) => void): void {
    this.onError = onError;
  }

  public setOnClose(onClose: (event: CloseEvent) => void): void {
    this.onClose = onClose;
  }
}
