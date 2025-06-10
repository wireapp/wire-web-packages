/*
 * Wire
 * Copyright (C) 2025 Wire Swiss GmbH
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

import {BackendEvent} from '../event';

/**
 * Enum of all possible consumable notification types received via WebSocket.
 * Now fully aligned with backend naming conventions.
 */
export enum ConsumableEvent {
  EVENT = 'event',
  MISSED = 'notifications_missed',
  MESSAGE_COUNT = 'message_count',
}

/**
 * Notification type received when the client has missed messages due to being offline too long.
 * Requires a full re-sync before consuming more notifications.
 */
export interface ConsumableNotificationMissed {
  type: ConsumableEvent.MISSED;
}

/**
 * Notification type for actual backend events, contains one or more event payloads.
 * Includes a delivery tag for acknowledgment.
 */
export interface ConsumableNotificationEvent {
  type: ConsumableEvent.EVENT;
  data: {
    delivery_tag: number;
    event: {
      id: string;
      payload: BackendEvent[];
    };
  };
}

/**
 * Notification sent after connecting to indicate current number of messages queued.
 */
export interface ConsumableNotificationMessageCount {
  type: ConsumableEvent.MESSAGE_COUNT;
  data: {
    count: number;
  };
}

/**
 * Union of all valid notification types supported by the WebSocket backend.
 */
export type ConsumableNotification =
  | ConsumableNotificationMissed
  | ConsumableNotificationEvent
  | ConsumableNotificationMessageCount;
