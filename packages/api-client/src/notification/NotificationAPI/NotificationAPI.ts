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

import {NotificationList} from '..';
import {HttpClient} from '../../http';

export const NOTIFICATION_SIZE_MAXIMUM = 10000;

export class NotificationAPI {
  constructor(private readonly client: HttpClient) {}

  /**
   * Fetch paged notifications.
   * @param clientId Only return notifications targeted at the given client.
   * @param size Maximum number of notifications to return.
   * @param since Only return notifications more recent than this.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/push/fetchNotifications
   */
  public async getNotifications(
    clientId?: string,
    size: number = NOTIFICATION_SIZE_MAXIMUM,
    since?: string,
    abortController?: AbortController,
  ): Promise<NotificationList> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        client: clientId,
        since,
        size,
      },
      url: '/notifications',
    };

    const response = await this.client.sendJSON<NotificationList>(config, false, abortController);
    return response.data;
  }
}
