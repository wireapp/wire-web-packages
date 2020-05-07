/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
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
import {HttpClient} from '../../http';
import {PropertyData} from './PropertyData';

export class PropertyAPI {
  constructor(private readonly client: HttpClient) {}

  public static readonly URL = {
    PROPERTIES: 'properties',
    SIGNATURES: '/signatures',
  };

  public async getPropertyData(teamId: string): Promise<PropertyData> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${PropertyAPI.URL.SIGNATURES}/${teamId}/${PropertyAPI.URL.PROPERTIES}`,
    };

    const response = await this.client.sendJSON<PropertyData>(config);
    return response.data;
  }
}
