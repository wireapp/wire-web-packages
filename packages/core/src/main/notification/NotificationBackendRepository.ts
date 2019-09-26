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

import {APIClient} from '@wireapp/api-client';
import {NOTIFICATION_SIZE_MAXIMUM, Notification} from '@wireapp/api-client/dist/commonjs/notification/';

export class NotificationBackendRepository {
  constructor(private readonly apiClient: APIClient) {}

  public async getAllNotifications(clientId?: string, lastNotificationId?: string): Promise<Notification[]> {
    const notifications: Notification[] = [];

    const collectNotifications = async (lastNotificationId?: string): Promise<Notification[]> => {
      const notificationList = await this.apiClient.notification.api.getNotifications(
        clientId,
        NOTIFICATION_SIZE_MAXIMUM,
        lastNotificationId,
      );
      const newNotifications = notificationList.notifications;
      if (newNotifications.length > 0) {
        lastNotificationId = newNotifications[newNotifications.length - 1].id;
        notifications.push(...newNotifications);
      }
      return notificationList.has_more ? collectNotifications(lastNotificationId) : notifications;
    };

    return this.apiClient.getAllNotifications(clientId, lastNotificationId);
  }

  public getLastNotification(clientId: string): Promise<Notification> {
    return this.apiClient.notification.api.getLastNotification(clientId);
  }
}
