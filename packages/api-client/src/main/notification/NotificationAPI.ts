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

import {AxiosRequestConfig, AxiosResponse} from 'axios';
import {Notification, NotificationList} from './index';
import {HttpClient} from '../http';

class NotificationAPI {
  constructor(private client: HttpClient) {}

  static get URL() {
    return {
      NOTIFICATION: '/notifications',
      LAST: 'last',
    };
  }

  /**
   * Fetch the last notification.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/push/getLastNotification
   */
  public getLastNotification(clientId?: string): Promise<Notification> {
    const config: AxiosRequestConfig = {
      params: {
        client: clientId,
      },
      method: 'get',
      url: `${NotificationAPI.URL.NOTIFICATION}/${NotificationAPI.URL.LAST}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Fetch notifications
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/push/fetchNotifications
   */
  public getNotifications(
    clientId?: string,
    size: number = 1000,
    since?: Date,
    cancelFallbackNotifications?: boolean
  ): Promise<NotificationList> {
    const config: AxiosRequestConfig = {
      params: {
        cancel_fallback: cancelFallbackNotifications,
        client: clientId,
        size,
        since,
      },
      method: 'get',
      url: NotificationAPI.URL.NOTIFICATION,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Fetch a notification by ID.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/push/getNotification
   */
  public getNotification(
    notificationId: string,
    clientId?: string,
    cancelFallbackNotifications?: boolean
  ): Promise<Notification> {
    const config: AxiosRequestConfig = {
      params: {
        cancel_fallback: cancelFallbackNotifications,
        client: clientId,
      },
      method: 'get',
      url: `${NotificationAPI.URL.NOTIFICATION}/${notificationId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }
}

export {NotificationAPI};
