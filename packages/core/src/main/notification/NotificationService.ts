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

import type {APIClient} from '@wireapp/api-client';
import * as Events from '@wireapp/api-client/src/event';
import type {Notification} from '@wireapp/api-client/src/notification/';
import {CRUDEngine, error as StoreEngineError} from '@wireapp/store-engine';
import {EventEmitter} from 'events';
import logdown from 'logdown';
import {PayloadBundle, PayloadBundleSource, PayloadBundleType} from '../conversation';
import type {AssetContent} from '../conversation/content';
import {ConversationMapper} from '../conversation/ConversationMapper';
import {CoreError, NotificationError} from '../CoreError';
import type {CryptographyService, DecryptionError} from '../cryptography';
import {UserMapper} from '../user/UserMapper';
import {NotificationBackendRepository} from './NotificationBackendRepository';
import {NotificationDatabaseRepository} from './NotificationDatabaseRepository';
import {GenericMessage} from '@wireapp/protocol-messaging';
import {AbortHandler} from '@wireapp/api-client/src/tcp';

export type HandledEventPayload = {
  event: Events.BackendEvent;
  mappedEvent?: PayloadBundle;
  decryptedData?: GenericMessage;
  decryptionError?: {code: number; message: string};
};

enum TOPIC {
  NOTIFICATION_ERROR = 'NotificationService.TOPIC.NOTIFICATION_ERROR',
}

export type NotificationHandler = (
  notification: Notification,
  source: PayloadBundleSource,
  progress: {done: number; total: number},
) => Promise<void>;

export interface NotificationService {
  on(event: TOPIC.NOTIFICATION_ERROR, listener: (payload: NotificationError) => void): this;
}

export class NotificationService extends EventEmitter {
  private readonly apiClient: APIClient;
  private readonly backend: NotificationBackendRepository;
  private readonly cryptographyService: CryptographyService;
  private readonly database: NotificationDatabaseRepository;
  private readonly logger = logdown('@wireapp/core/notification/NotificationService', {
    logger: console,
    markdown: false,
  });
  public static readonly TOPIC = TOPIC;

  constructor(apiClient: APIClient, cryptographyService: CryptographyService, storeEngine: CRUDEngine) {
    super();
    this.apiClient = apiClient;
    this.cryptographyService = cryptographyService;
    this.backend = new NotificationBackendRepository(this.apiClient);
    this.database = new NotificationDatabaseRepository(storeEngine);
  }

  private async getAllNotifications() {
    const clientId = this.apiClient.clientId;
    const lastNotificationId = await this.database.getLastNotificationId();
    return this.backend.getAllNotifications(clientId, lastNotificationId);
  }

  /** Should only be called with a completely new client. */
  public async initializeNotificationStream(): Promise<string> {
    const clientId = this.apiClient.clientId;
    await this.setLastEventDate(new Date(0));
    const latestNotification = await this.backend.getLastNotification(clientId);
    return this.setLastNotificationId(latestNotification);
  }

  public async hasHistory(): Promise<boolean> {
    const notificationEvents = await this.getNotificationEventList();
    return !!notificationEvents.length;
  }

  public getNotificationEventList(): Promise<Events.BackendEvent[]> {
    return this.database.getNotificationEventList();
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

  public async setLastNotificationId(lastNotification: Notification): Promise<string> {
    return this.database.updateLastNotificationId(lastNotification);
  }

  public async handleNotificationStream(
    notificationHandler: NotificationHandler,
    onMissedNotifications: (notificationId: string) => void,
    abortHandler: AbortHandler,
  ): Promise<void> {
    const {notifications, missedNotification} = await this.getAllNotifications();
    if (missedNotification) {
      onMissedNotifications(missedNotification);
    }

    for (const [index, notification] of notifications.entries()) {
      if (abortHandler.isAborted()) {
        /* Stop handling notifications if the websocket has been disconnected.
         * Upon reconnecting we are going to restart handling the notification stream for where we left of
         */
        return;
      }
      await notificationHandler(notification, PayloadBundleSource.NOTIFICATION_STREAM, {
        done: index + 1,
        total: notifications.length,
      }).catch(error => this.logger.error(error));
    }
  }

  /**
   * Checks if an event should be ignored.
   * An event that has a date prior to that last event that we have parsed should be ignored
   *
   * @param event
   * @param source
   * @param lastEventDate?
   */
  private isOutdatedEvent(event: {time: string}, source: PayloadBundleSource, lastEventDate?: Date) {
    const isFromNotificationStream = source === PayloadBundleSource.NOTIFICATION_STREAM;
    const shouldCheckEventDate = !!event.time && isFromNotificationStream && lastEventDate;

    if (shouldCheckEventDate) {
      /** This check prevents duplicated "You joined" system messages. */
      const isOutdated = lastEventDate.getTime() >= new Date(event.time).getTime();
      return isOutdated;
    }
    return false;
  }

  public async *handleNotification(
    notification: Notification,
    source: PayloadBundleSource,
    dryRun: boolean = false,
  ): AsyncGenerator<HandledEventPayload> {
    for (const event of notification.payload) {
      this.logger.log(`Handling event of type "${event.type}" for notification with ID "${notification.id}"`, event);
      let lastEventDate: Date | undefined = undefined;
      try {
        lastEventDate = await this.database.getLastEventDate();
      } catch {}
      if ('time' in event && this.isOutdatedEvent(event, source, lastEventDate)) {
        this.logger.info(`Ignored outdated event type: '${event.type}'`);
        continue;
      }
      try {
        const data = await this.handleEvent(event, source, dryRun);
        yield {
          ...data,
          mappedEvent: data.mappedEvent ? this.cleanupPayloadBundle(data.mappedEvent) : undefined,
        };
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
    if (!dryRun && !notification.transient) {
      // keep track of the last handled notification for next time we fetch the notification stream
      await this.setLastNotificationId(notification);
    }
  }

  private cleanupPayloadBundle(payload: PayloadBundle): PayloadBundle {
    switch (payload.type) {
      case PayloadBundleType.ASSET: {
        const assetContent = payload.content as AssetContent;
        const isMetaData = !!assetContent?.original && !assetContent?.uploaded;
        const isAbort = !!assetContent.abortReason || (!assetContent.original && !assetContent.uploaded);

        if (isMetaData) {
          payload.type = PayloadBundleType.ASSET_META;
        } else if (isAbort) {
          payload.type = PayloadBundleType.ASSET_ABORT;
        }
        return payload;
      }
      default:
        return payload;
    }
  }

  private async handleEvent(
    event: Events.BackendEvent,
    source: PayloadBundleSource,
    dryRun: boolean = false,
  ): Promise<HandledEventPayload> {
    switch (event.type) {
      // Encrypted events
      case Events.CONVERSATION_EVENT.OTR_MESSAGE_ADD: {
        if (dryRun) {
          // In case of a dry run, we do not want to decrypt messages
          // We just return the raw event to the caller
          return {event};
        }
        try {
          const decryptedData = await this.cryptographyService.decryptMessage(event);
          return {
            mappedEvent: this.cryptographyService.mapGenericMessage(event, decryptedData, source),
            event,
            decryptedData,
          };
        } catch (error) {
          return {event, decryptionError: error as DecryptionError};
        }
      }
      // Meta events
      case Events.CONVERSATION_EVENT.MEMBER_JOIN:
      case Events.CONVERSATION_EVENT.MESSAGE_TIMER_UPDATE:
      case Events.CONVERSATION_EVENT.RENAME:
      case Events.CONVERSATION_EVENT.TYPING: {
        const {conversation, from} = event;
        const metaEvent = {...event, conversation, from};
        return {mappedEvent: ConversationMapper.mapConversationEvent(metaEvent, source), event};
      }
      // User events
      case Events.USER_EVENT.CONNECTION:
      case Events.USER_EVENT.CLIENT_ADD:
      case Events.USER_EVENT.UPDATE:
      case Events.USER_EVENT.CLIENT_REMOVE: {
        return {mappedEvent: UserMapper.mapUserEvent(event, this.apiClient.context!.userId, source), event};
      }
    }
    return {event};
  }
}
