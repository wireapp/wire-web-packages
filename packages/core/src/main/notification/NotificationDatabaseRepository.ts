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

import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine/index';
import {Notification} from '@wireapp/api-client/dist/commonjs/notification/index';

export default class NotificationDatabaseRepository {
  public static STORES = {
    AMPLIFY: 'amplify',
  };

  public static KEYS = {
    PRIMARY_KEY_LAST_EVENT: 'z.storage.StorageKey.EVENT.LAST_DATE',
    PRIMARY_KEY_LAST_NOTIFICATION: 'z.storage.StorageKey.NOTIFICATION.LAST_ID',
  };

  constructor(private storeEngine: CRUDEngine) {}

  public getLastEventDate(): Promise<Date> {
    return this.storeEngine
      .read<{value: string}>(
        NotificationDatabaseRepository.STORES.AMPLIFY,
        NotificationDatabaseRepository.KEYS.PRIMARY_KEY_LAST_EVENT
      )
      .then(({value}) => new Date(value));
  }

  public updateLastEventDate(eventDate: Date): Promise<Date> {
    return this.storeEngine
      .update(
        NotificationDatabaseRepository.STORES.AMPLIFY,
        NotificationDatabaseRepository.KEYS.PRIMARY_KEY_LAST_EVENT,
        {value: eventDate.toISOString()}
      )
      .then(() => eventDate);
  }

  public createLastEventDate(eventDate: Date): Promise<Date> {
    return this.storeEngine
      .create(
        NotificationDatabaseRepository.STORES.AMPLIFY,
        NotificationDatabaseRepository.KEYS.PRIMARY_KEY_LAST_EVENT,
        {value: eventDate.toISOString()}
      )
      .then(() => eventDate);
  }

  public getLastNotificationId(): Promise<string> {
    return this.storeEngine
      .read<{value: string}>(
        NotificationDatabaseRepository.STORES.AMPLIFY,
        NotificationDatabaseRepository.KEYS.PRIMARY_KEY_LAST_NOTIFICATION
      )
      .then(({value}) => value);
  }

  public updateLastNotificationId(lastNotification: Notification): Promise<string> {
    return this.storeEngine
      .update(
        NotificationDatabaseRepository.STORES.AMPLIFY,
        NotificationDatabaseRepository.KEYS.PRIMARY_KEY_LAST_NOTIFICATION,
        {value: lastNotification.id}
      )
      .then(() => lastNotification.id);
  }

  public createLastNotificationId(lastNotification: Notification): Promise<string> {
    return this.storeEngine
      .create(
        NotificationDatabaseRepository.STORES.AMPLIFY,
        NotificationDatabaseRepository.KEYS.PRIMARY_KEY_LAST_NOTIFICATION,
        {value: lastNotification.id}
      )
      .then(() => lastNotification.id);
  }
}
