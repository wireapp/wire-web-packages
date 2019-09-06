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
import logdown from 'logdown';
import NodeWebSocket = require('ws');

import RWS, {Options} from 'reconnecting-websocket';
import {CloseEvent, ErrorEvent, Event} from 'reconnecting-websocket/dist/events';
import * as buffer from '../shims/node/buffer';

export enum CloseEventCode {
  GOING_AWAY = 1001,
  NORMAL_CLOSURE = 1000,
  PROTOCOL_ERROR = 1002,
  UNSUPPORTED_DATA = 1003,
}

export enum PingMessage {
  PING = 'ping',
  PONG = 'pong',
}

export class ReconnectingWebsocket {
  private static readonly CONFIG = {
    PING_INTERVAL: TimeUtil.TimeInMillis.SECOND * 5,
  };

  private static readonly RECONNECTING_OPTIONS: Options = {
    WebSocket: typeof window !== 'undefined' ? WebSocket : NodeWebSocket,
    connectionTimeout: TimeUtil.TimeInMillis.SECOND * 4,
    debug: false,
    maxReconnectionDelay: TimeUtil.TimeInMillis.SECOND * 10,
    maxRetries: Infinity,
    minReconnectionDelay: TimeUtil.TimeInMillis.SECOND * 4,
    reconnectionDelayGrowFactor: 1.3,
  };

  private readonly logger: logdown.Logger;
  private pingInterval?: NodeJS.Timeout;
  private socket?: RWS;
  private hasUnansweredPing: boolean;

  private onOpen?: (event: Event) => void;
  private onMessage?: (data: string) => void;
  private onError?: (error: ErrorEvent) => void;
  private onClose?: () => void;

  constructor(private readonly onReconnect: () => string) {
    this.hasUnansweredPing = false;
    this.logger = logdown('@wireapp/api-client/tcp/ReconnectingWebsocket', {
      logger: console,
      markdown: false,
    });
  }

  private readonly internalOnError = (error: ErrorEvent) => {
    this.logger.warn('WebSocket connection error: ', error);
    if (this.onError) {
      this.onError(error);
    }
  };

  private readonly internalOnMessage = (event: MessageEvent) => {
    this.logger.info('Incoming message', event);

    const data = buffer.bufferToString(event.data);
    if (data === PingMessage.PONG) {
      this.logger.debug('Received pong from WebSocket');
      if (this.hasUnansweredPing) {
        this.hasUnansweredPing = false;
      }
    } else {
      if (this.onMessage) {
        this.onMessage(data);
      }
    }
  };

  private readonly internalOnOpen = (event: Event) => {
    this.logger.info('Connecting to WebSocket', event);
    if (this.socket) {
      this.socket.binaryType = 'arraybuffer';
    }
    if (this.onOpen) {
      this.onOpen(event);
    }
  };

  private readonly internalOnReconnect = () => {
    this.logger.info('Reconnecting to WebSocket');
    this.startPinging();
    return this.onReconnect();
  };

  private readonly internalOnClose = (error: CloseEvent) => {
    this.logger.info(`WebSocket disconnect: "${error}"`);
    this.stopPinging();
    if (this.onClose) {
      this.onClose();
    }
  };

  public async connect(): Promise<ReconnectingWebsocket> {
    this.socket = new RWS(this.internalOnReconnect, undefined, ReconnectingWebsocket.RECONNECTING_OPTIONS);

    this.socket.onmessage = this.internalOnMessage;
    this.socket.onerror = this.internalOnError;
    this.socket.onopen = this.internalOnOpen;
    this.socket.onclose = this.internalOnClose;

    return this;
  }

  public disconnect(reason = 'Unknown reason', keepClosed = true): void {
    if (this.socket) {
      this.logger.info(`Disconnecting from WebSocket (reason: "${reason}")`);
      // TODO: 'any' can be removed once this issue is resolved:
      // https://github.com/pladaria/reconnecting-websocket/issues/44
      (this.socket as any).close(CloseEventCode.NORMAL_CLOSURE, reason, {
        delay: 0,
        fastClose: true,
        keepClosed,
      });
    }
  }

  private startPinging(): void {
    this.hasUnansweredPing = false;
    this.pingInterval = setInterval(this.sendPing, ReconnectingWebsocket.CONFIG.PING_INTERVAL);
  }

  private stopPinging(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }

  private readonly sendPing = (): void => {
    if (this.socket) {
      if (this.hasUnansweredPing) {
        this.logger.warn('Ping interval check failed');
        this.stopPinging();
      }
      this.hasUnansweredPing = true;
      this.socket.send(PingMessage.PING);
    }
  };

  public setOnOpen(onOpen: (event: Event) => void): void {
    this.onOpen = onOpen;
  }
  public setOnMessage(onMessage: (data: string) => void): void {
    this.onMessage = onMessage;
  }
  public setOnError(onError: (error: ErrorEvent) => void): void {
    this.onError = onError;
  }
  public setOnClose(onClose: () => void): void {
    this.onClose = onClose;
  }
}
