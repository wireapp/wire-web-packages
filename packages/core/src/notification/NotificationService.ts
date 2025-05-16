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

import {BackendEvent} from '@wireapp/api-client/lib/event';
import {ConsumableNotification} from '@wireapp/api-client/lib/tcp/ConsumableNotification.types';

import {LogFactory, TypedEventEmitter} from '@wireapp/commons';
import {GenericMessage} from '@wireapp/protocol-messaging';
import {CRUDEngine, error as StoreEngineError} from '@wireapp/store-engine';

import {NotificationDatabaseRepository} from './NotificationDatabaseRepository';
import {NotificationSource} from './Notifications.types';

import {ConversationService} from '../conversation';
import {CoreError, NotificationError} from '../CoreError';
import {DecryptionError} from '../errors/DecryptionError';

export type HandledEventPayload = {
  /** the raw event received from backend */
  event: BackendEvent;
  /** the decrypted data in case the event was an encrypted event */
  decryptedData?: GenericMessage;
  /** in case decryption went wrong, this will contain information about the decryption error */
  decryptionError?: DecryptionError;
};

/**
 * The result of handling an event
 * - unhandled: The event was not handled by the particular service
 * - ignored: The event was handled, but it got marked as ignored for whatever reason, it will not be emitted
 * - handled: The event was handled and its payload will be emitted
 */
export type HandledEventResult =
  | {status: 'unhandled'}
  | {status: 'ignored'}
  | {status: 'handled'; payload: HandledEventPayload | null};

enum TOPIC {
  NOTIFICATION_ERROR = 'NotificationService.TOPIC.NOTIFICATION_ERROR',
}

type Events = {
  [TOPIC.NOTIFICATION_ERROR]: NotificationError;
};

export class NotificationService extends TypedEventEmitter<Events> {
  private readonly database: NotificationDatabaseRepository;
  private readonly logger = LogFactory.getLogger('@wireapp/core/NotificationService');
  public static readonly TOPIC = TOPIC;

  constructor(
    storeEngine: CRUDEngine,
    private readonly conversationService: ConversationService,
  ) {
    super();
    this.database = new NotificationDatabaseRepository(storeEngine);
  }

  /** Should only be called with a completely new client. */
  public async initializeNotificationStream() {
    await this.setLastEventDate(new Date(0));
  }

  public async setLastEventDate(eventDate: Date): Promise<Date> {
    let databaseLastEventDate: Date | undefined;

    try {
      databaseLastEventDate = await this.database.getLastEventDate();
    } catch (error) {
      if (
        error instanceof StoreEngineError.RecordNotFoundError ||
        (error as Error).constructor.name === StoreEngineError.RecordNotFoundError.name
      ) {
        return this.database.createLastEventDate(eventDate);
      }
      throw error;
    }

    if (databaseLastEventDate && eventDate > databaseLastEventDate) {
      return this.database.updateLastEventDate(eventDate);
    }

    return databaseLastEventDate;
  }

  /**
   * Checks if an event should be ignored.
   * An event that has a date prior to that last event that we have parsed should be ignored
   *
   * @param event
   * @param source
   * @param lastEventDate?
   */
  private isOutdatedEvent(event: {time: string}, source: NotificationSource, lastEventDate?: Date) {
    const isFromNotificationStream = source === NotificationSource.NOTIFICATION_STREAM;
    const shouldCheckEventDate = !!event.time && isFromNotificationStream && lastEventDate;

    if (shouldCheckEventDate) {
      /** This check prevents duplicated "You joined" system messages. */
      return lastEventDate.getTime() >= new Date(event.time).getTime();
    }

    return false;
  }

  public async *handleNotification(
    notification: ConsumableNotification,
    source: NotificationSource,
    dryRun: boolean = false,
  ): AsyncGenerator<HandledEventPayload> {
    for (const event of notification.payload || []) {
      this.logger.debug(`Handling event of type "${event.type}"`, event);

      let lastEventDate: Date | undefined = undefined;
      try {
        lastEventDate = await this.database.getLastEventDate();
      } catch {}

      if ('time' in event && this.isOutdatedEvent(event, source, lastEventDate)) {
        this.logger.info(`Ignored outdated event type: '${event.type}'`);
        continue;
      }

      try {
        const handledEventResult = await this.handleEvent(event, dryRun);
        if (handledEventResult.status === 'handled' && handledEventResult.payload) {
          yield handledEventResult.payload;
        }
      } catch (error) {
        this.logger.error(
          `There was an error with notification ID "${notification.id}": ${(error as Error).message}`,
          error,
        );
        const notificationError: NotificationError = {
          error: error as Error,
          notification,
          type: CoreError.NOTIFICATION_ERROR,
        };
        this.emit(NotificationService.TOPIC.NOTIFICATION_ERROR, notificationError);
      }
    }
    // if (!dryRun && !notification.transient) {
    //   // keep track of the last handled notification for next time we fetch the notification stream
    //   await this.setLastNotificationId(notification);
    // }
  }

  /**
   * Will process one event
   * @param event The backend event to process
   * @param dryRun Will not try to decrypt if true
   * @return event handling status and if event was handled, the payload
   */
  private async handleEvent(event: BackendEvent, dryRun: boolean = false): Promise<HandledEventResult> {
    if (dryRun) {
      // In case of a dry run, we do not want to decrypt messages
      // We just return the raw event to the caller
      return {status: 'handled', payload: {event}};
    }

    const conversationEventResult = await this.conversationService.handleEvent(event);
    if (conversationEventResult.status !== 'unhandled') {
      return conversationEventResult;
    }

    return {status: 'handled', payload: {event}};
  }
}
