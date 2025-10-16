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

import {AxiosRequestConfig} from 'axios';

import {UserGroup} from './UserGroup';
import {UserGroupCreateRequest} from './UserGroupCreateRequest';
import {UserGroupSearchOptions} from './UserGroupSearchOptions';
import {UserGroupSearchResult} from './UserGroupSearchResult';
import {UserGroupUpdateRequest} from './UserGroupUpdateRequest';

import {BackendError, HttpClient, RequestCancelable, SyntheticErrorLabel} from '../http';
import {RequestCancellationError} from '../user/UserError';

export class UserGroupAPI {
  constructor(private readonly client: HttpClient) {}

  private static readonly ENDPOINTS = {
    base: '/user-groups',
    byId: (gid: string) => `/user-groups/${gid}`,
    users: (gid: string) => `/user-groups/${gid}/users`,
    channels: (gid: string) => `/user-groups/${gid}/channels`,
  };

  /**
   * Search for user groups (cancelable).
   */
  public async searchUserGroups({query, ...options}: UserGroupSearchOptions = {}): Promise<
    RequestCancelable<UserGroupSearchResult>
  > {
    const controller = new AbortController();

    const config: AxiosRequestConfig = {
      url: UserGroupAPI.ENDPOINTS.base,
      method: 'get',
      params: {q: query, ...options},
      signal: controller.signal,
    };

    const response = (async () => {
      try {
        const {data} = await this.client.sendJSON<UserGroupSearchResult>(config);
        return data;
      } catch (err: unknown) {
        if (
          (err as BackendError)?.message === SyntheticErrorLabel.REQUEST_CANCELLED ||
          (err as Error)?.name === 'CanceledError'
        ) {
          throw new RequestCancellationError('Search request was cancelled.');
        }
        throw err;
      }
    })();

    return {
      cancel: () => controller.abort(SyntheticErrorLabel.REQUEST_CANCELLED),
      response,
    };
  }

  /**
   * Create a new user group.
   */
  public async createUserGroup(body: UserGroupCreateRequest): Promise<UserGroup> {
    const config: AxiosRequestConfig = {
      url: UserGroupAPI.ENDPOINTS.base,
      method: 'post',
      data: body,
    };

    const {data} = await this.client.sendJSON<UserGroup>(config);
    return data;
  }

  /**
   * Get a user group by ID.
   */
  public async getUserGroup(gid: string): Promise<UserGroup> {
    const config: AxiosRequestConfig = {
      url: UserGroupAPI.ENDPOINTS.byId(gid),
      method: 'get',
    };

    const {data} = await this.client.sendJSON<UserGroup>(config);
    return data;
  }

  /**
   * Update a user group by ID.
   */
  public async updateUserGroup(gid: string, name: string): Promise<void> {
    const config: AxiosRequestConfig = {
      url: UserGroupAPI.ENDPOINTS.byId(gid),
      method: 'put',
      data: {name},
    };

    await this.client.sendJSON<UserGroup>(config);
  }

  /**
   * Delete a user group by ID.
   */
  public async deleteUserGroup(gid: string): Promise<void> {
    const config: AxiosRequestConfig = {
      url: UserGroupAPI.ENDPOINTS.byId(gid),
      method: 'delete',
    };

    await this.client.sendJSON<void>(config);
  }

  /**
   * Update multiple users in a group.
   */
  public async updateUsersInGroup(gid: string, body: {members: string[]}): Promise<void> {
    const config: AxiosRequestConfig = {
      url: UserGroupAPI.ENDPOINTS.users(gid),
      method: 'post',
      data: body,
    };

    await this.client.sendJSON<void>(config);
  }

  /**
   * Update multiple channels in a group.
   */
  public async updateChannelsInGroup(gid: string, body: {channels: string[]}): Promise<void> {
    const config: AxiosRequestConfig = {
      url: UserGroupAPI.ENDPOINTS.channels(gid),
      method: 'post',
      data: body,
    };

    await this.client.sendJSON<void>(config);
  }
}
