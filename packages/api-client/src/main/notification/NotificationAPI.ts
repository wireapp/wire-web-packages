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

import {AxiosRequestConfig} from 'axios';
import {HttpClient} from '../http/';
import {Notification, NotificationList} from './';

export const NOTIFICATION_SIZE_MAXIMUM = 10_000;

export class NotificationAPI {
  constructor(private readonly client: HttpClient) {}

  static URL = {
    LAST: 'last',
    NOTIFICATION: '/notifications',
  };

  /**
   * Fetch the last notification.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/push/getLastNotification
   */
  public async getLastNotification(clientId?: string): Promise<Notification> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        client: clientId,
      },
      url: `${NotificationAPI.URL.NOTIFICATION}/${NotificationAPI.URL.LAST}`,
    };

    const response = await this.client.sendJSON<Notification>(config);
    return response.data;
  }

  /**
   * Fetch paged notifications.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/push/fetchNotifications
   */
  public async getNotifications(
    clientId?: string,
    size: number = NOTIFICATION_SIZE_MAXIMUM,
    since?: string,
  ): Promise<NotificationList> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        client: clientId,
        since,
        size,
      },
      url: NotificationAPI.URL.NOTIFICATION,
    };

    const response = await this.client.sendJSON<NotificationList>(config);
    return response.data;
  }

  /**
   * Fetch all notifications.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/push/fetchNotifications
   */
  public async getAllNotifications(clientId?: string, lastNotificationId?: string): Promise<Notification[]> {
    const notifications: Notification[] = [];

    const collectNotifications = async (lastNotificationId?: string): Promise<Notification[]> => {
      const notificationList = await this.getNotifications(clientId, NOTIFICATION_SIZE_MAXIMUM, lastNotificationId);
      const newNotifications = notificationList.notifications;
      if (newNotifications.length > 0) {
        lastNotificationId = newNotifications[newNotifications.length - 1].id;
        notifications.push(...newNotifications);
      }
      return notificationList.has_more ? collectNotifications(lastNotificationId) : notifications;
    };

    return collectNotifications(lastNotificationId);
  }

  /**
   * Fetch a notification by ID.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/push/getNotification
   */
  public async getNotification(notificationId: string, clientId?: string): Promise<Notification> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        client: clientId,
      },
      url: `${NotificationAPI.URL.NOTIFICATION}/${notificationId}`,
    };

    const response = await this.client.sendJSON<Notification>(config);
    return response.data;
  }
}
