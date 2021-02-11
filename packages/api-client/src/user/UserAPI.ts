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

import Axios, {AxiosRequestConfig} from 'axios';
import {ArrayUtil} from '@wireapp/commons';

import {HttpClient, RequestCancelable, SyntheticErrorLabel} from '../http/';
import type {
  Activate,
  ActivationResponse,
  CheckHandles,
  CompletePasswordReset,
  HandleInfo,
  NewPasswordReset,
  QualifiedHandle,
  QualifiedHandleInfo,
  QualifiedId,
  QualifiedUser,
  SearchResult,
  SendActivationCode,
  User,
  UserPreKeyBundleMap,
  VerifyDelete,
} from '../user/';
import {RequestCancellationError} from './UserError';
import type {ClientPreKey, PreKeyBundle, QualifiedPreKeyBundle} from '../auth/';
import type {PublicClient} from '../client/';
import type {RichInfo} from './RichInfo';
import type {UserClients} from '../conversation/UserClients';

export class UserAPI {
  public static readonly DEFAULT_USERS_CHUNK_SIZE = 50;
  public static readonly DEFAULT_USERS_PREKEY_BUNDLE_CHUNK_SIZE = 128;
  public static readonly URL = {
    ACTIVATE: '/activate',
    CALLS: '/calls',
    CLIENTS: 'clients',
    CONTACTS: 'contacts',
    DELETE: '/delete',
    HANDLES: 'handles',
    LIST_CLIENTS: '/list-clients',
    LIST_USERS: '/list-users',
    PASSWORDRESET: '/password-reset',
    PRE_KEYS: 'prekeys',
    PROPERTIES: '/properties',
    RICH_INFO: 'rich-info',
    SEARCH: '/search',
    SEND: 'send',
    USERS: '/users',
  };

  constructor(private readonly client: HttpClient) {}

  /**
   * Clear all properties.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/clearProperties
   */
  public async deleteProperties(): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: UserAPI.URL.PROPERTIES,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Delete a property.
   * @param propertyKey The property key to delete
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/deleteProperty
   */
  public async deleteProperty(propertyKey: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: `${UserAPI.URL.PROPERTIES}/${propertyKey}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Activate (i.e. confirm) an email address or phone number.
   * @param activationCode Activation code
   * @param activationKey Activation key
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/activate
   */
  public async getActivation(activationCode: string, activationKey: string): Promise<ActivationResponse> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        code: activationCode,
        key: activationKey,
      },
      url: UserAPI.URL.ACTIVATE,
    };

    const response = await this.client.sendJSON<ActivationResponse>(config);
    return response.data;
  }

  /**
   * Retrieve TURN server addresses and credentials.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getCallsConfig
   */
  public async getCallsConfiguration(): Promise<RTCConfiguration> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.CALLS}/config`,
    };

    const response = await this.client.sendJSON<RTCConfiguration>(config);
    return response.data;
  }

  /**
   * Get a specific client of a user.
   * @param userId The user ID
   * @param clientId The client ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getUserClient
   */
  public async getClient(userId: string, clientId: string): Promise<PublicClient> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${userId}/${UserAPI.URL.CLIENTS}/${clientId}`,
    };

    const response = await this.client.sendJSON<PublicClient>(config);
    return response.data;
  }

  /**
   * Get a prekey for a specific client of a user.
   * @param userId The user ID
   * @param clientId The client ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getPrekey
   */
  public async getClientPreKey(userId: string, clientId: string): Promise<ClientPreKey> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${userId}/${UserAPI.URL.PRE_KEYS}/${clientId}`,
    };

    const response = await this.client.sendJSON<ClientPreKey>(config);
    return response.data;
  }

  /**
   * Get all of a user's clients.
   * @param userId The user ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getUserClients
   */
  public async getClients(userId: string): Promise<PublicClient[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${userId}/${UserAPI.URL.CLIENTS}`,
    };

    const response = await this.client.sendJSON<PublicClient[]>(config);
    return response.data;
  }

  /**
   * Get information on a user handle.
   * @param handle The user's handle
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getUserHandleInfo
   */
  public async getHandle(handle: string): Promise<HandleInfo | QualifiedHandleInfo>;
  public async getHandle(handle: QualifiedHandle): Promise<QualifiedHandleInfo>;
  public async getHandle(handle: string | QualifiedHandle): Promise<HandleInfo | QualifiedHandleInfo> {
    const url =
      typeof handle === 'string'
        ? `${UserAPI.URL.HANDLES}/${handle}`
        : `${UserAPI.URL.USERS}/${handle.domain}/${handle.handle}`;

    const config: AxiosRequestConfig = {
      method: 'get',
      url,
    };

    const response = await this.client.sendJSON<HandleInfo | QualifiedHandleInfo>(config);
    return response.data;
  }

  /**
   * List all property keys.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/listPropertyKeys
   */
  public async getProperties(): Promise<string[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: UserAPI.URL.PROPERTIES,
    };

    const response = await this.client.sendJSON<string[]>(config);
    return response.data;
  }

  /**
   * Get a property value.
   * @param propertyKey The property key to get
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getProperty
   */
  public async getProperty<T>(propertyKey: string): Promise<T> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.PROPERTIES}/${propertyKey}`,
    };

    const response = await this.client.sendJSON<T>(config);
    return response.data;
  }

  /**
   * Search for users.
   * @param query The search query
   * @param limit Number of results to return
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/search
   */
  public async getSearchContacts(query: string, limit?: number): Promise<RequestCancelable<SearchResult>> {
    const cancelSource = Axios.CancelToken.source();
    const config: AxiosRequestConfig = {
      cancelToken: cancelSource.token,
      method: 'get',
      params: {
        q: query,
      },
      url: `${UserAPI.URL.SEARCH}/${UserAPI.URL.CONTACTS}`,
    };

    if (limit) {
      config.params.size = limit;
    }

    const handleRequest = async () => {
      try {
        const response = await this.client.sendJSON<SearchResult>(config);
        return response.data;
      } catch (error) {
        if (error.message === SyntheticErrorLabel.REQUEST_CANCELLED) {
          throw new RequestCancellationError('Search request got cancelled');
        }
        throw error;
      }
    };

    return {
      cancel: () => cancelSource.cancel(SyntheticErrorLabel.REQUEST_CANCELLED),
      response: handleRequest(),
    };
  }

  /**
   * Get a user by ID.
   * @note If you want to get all properties (`sso_id`, `managed_by`, etc.) for your own user, use "/self".
   *       Otherwise you will get a user payload with a limited set of properties (what's publicly available).
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/user
   */
  public async getUser(userId: string): Promise<User | QualifiedUser>;
  public async getUser(userId: QualifiedId): Promise<QualifiedUser>;
  public async getUser(userId: string | QualifiedId): Promise<User | QualifiedUser> {
    const url =
      typeof userId === 'string'
        ? `${UserAPI.URL.USERS}/${userId}`
        : `${UserAPI.URL.USERS}/${userId.domain}/${userId.id}`;

    const config: AxiosRequestConfig = {
      method: 'get',
      url,
    };

    const response = await this.client.sendJSON<User | QualifiedUser>(config);
    return response.data;
  }

  public async getUserPreKeys(userId: string): Promise<PreKeyBundle | QualifiedPreKeyBundle>;
  public async getUserPreKeys(userId: QualifiedId): Promise<QualifiedPreKeyBundle>;
  public async getUserPreKeys(userId: QualifiedId | string): Promise<PreKeyBundle | QualifiedPreKeyBundle> {
    const url =
      typeof userId === 'string'
        ? `${UserAPI.URL.USERS}/${userId}/${UserAPI.URL.PRE_KEYS}`
        : `${UserAPI.URL.USERS}/${userId.domain}/${userId.id}/${UserAPI.URL.PRE_KEYS}`;

    const config: AxiosRequestConfig = {
      method: 'get',
      url,
    };

    const response = await this.client.sendJSON<PreKeyBundle | QualifiedPreKeyBundle>(config, true);
    return response.data;
  }

  /**
   * List users.
   * Note: The 'ids' and 'handles' parameters are mutually exclusive.
   * @param parameters Multiple user's handles or IDs
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/users
   */
  public async getUsers(
    parameters: {ids: string[]} | {handles: string[]},
    limit: number = UserAPI.DEFAULT_USERS_CHUNK_SIZE,
  ): Promise<User[] | QualifiedUser[]> {
    const fetchUsers = async (params: {ids: string[]} | {handles: string[]}): Promise<User[] | QualifiedUser[]> => {
      const config: AxiosRequestConfig = {
        method: 'get',
        params: {},
        url: UserAPI.URL.USERS,
      };

      if ('handles' in params) {
        config.params.handles = params.handles.join(',');
      } else if ('ids' in params) {
        config.params.ids = params.ids.join(',');
      }

      const response = await this.client.sendJSON<User[] | QualifiedUser[]>(config);
      return response.data;
    };

    if ('handles' in parameters && parameters.handles.length) {
      const uniqueHandles = ArrayUtil.removeDuplicates(parameters.handles);
      const handleChunks = ArrayUtil.chunk(uniqueHandles, limit);
      const resolvedTasks = await Promise.all(handleChunks.map(handleChunk => fetchUsers({handles: handleChunk})));
      return ArrayUtil.flatten(resolvedTasks);
    }

    if ('ids' in parameters && parameters.ids.length) {
      const uniqueIds = ArrayUtil.removeDuplicates(parameters.ids);
      const idChunks = ArrayUtil.chunk(uniqueIds, limit);
      const resolvedTasks = await Promise.all(idChunks.map(idChunk => fetchUsers({ids: idChunk})));
      return ArrayUtil.flatten(resolvedTasks);
    }

    return [];
  }

  /**
   * List users.
   * @param userIds Multiple user's IDs
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/users
   */
  public async getUsersByIds(userIds: string[]): Promise<User[] | QualifiedUser[]> {
    const maxChunkSize = 100;
    return this.getUsers({ids: userIds}, maxChunkSize);
  }

  /**
   * Check if a user ID exists.
   */
  public async headUsers(userId: string | QualifiedId): Promise<void> {
    const url =
      typeof userId === 'string'
        ? `${UserAPI.URL.USERS}/${userId}`
        : `${UserAPI.URL.USERS}/${userId.domain}/${userId.id}`;

    const config: AxiosRequestConfig = {
      method: 'head',
      url,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Activate (i.e. confirm) an email address or phone number.
   * Note: Activation only succeeds once and the number of failed attempts for a valid key is limited.
   * @param activationData Data to activate an account
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/activate_0
   */
  public async postActivation(activationData: Activate): Promise<ActivationResponse> {
    const config: AxiosRequestConfig = {
      data: activationData,
      method: 'post',
      url: UserAPI.URL.ACTIVATE,
    };

    const response = await this.client.sendJSON<ActivationResponse>(config);
    return response.data;
  }

  /**
   * Send (or resend) an email or phone activation code.
   * @param activationCodeData Data to send an activation code
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/sendActivationCode
   */
  public async postActivationCode(activationCodeData: SendActivationCode): Promise<void> {
    const config: AxiosRequestConfig = {
      data: activationCodeData,
      method: 'post',
      url: `${UserAPI.URL.ACTIVATE}/${UserAPI.URL.SEND}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Verify account deletion with a code.
   * @param verificationData Data to verify the account deletion
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/verifyDeleteUser
   */
  public async postDelete(verificationData: VerifyDelete): Promise<void> {
    const config: AxiosRequestConfig = {
      data: verificationData,
      method: 'post',
      url: UserAPI.URL.DELETE,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Check availability of user handles.
   * @param handles The handles to check
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/checkUserHandles
   */
  public async postHandles(handles: CheckHandles): Promise<string[]> {
    const config: AxiosRequestConfig = {
      data: handles,
      method: 'post',
      url: `${UserAPI.URL.USERS}/${UserAPI.URL.HANDLES}`,
    };

    const response = await this.client.sendJSON<string[]>(config);
    return response.data;
  }

  /**
   * Check availability of a single user handle.
   * @param handle The handle to check
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/checkUserHandle
   */
  public async headHandle(handle: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'head',
      url: `${UserAPI.URL.USERS}/${UserAPI.URL.HANDLES}/${handle}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Get a user by handle.
   * @param handle The handle of a user to search for
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getUserByHandle
   */
  public async getUserByHandle(handle: string): Promise<HandleInfo | QualifiedHandleInfo> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${UserAPI.URL.HANDLES}/${handle}`,
    };

    const response = await this.client.sendJSON<HandleInfo | QualifiedHandleInfo>(config);
    return response.data;
  }

  private async _postMultiPreKeyBundlesChunk(userClientMap: UserClients): Promise<UserPreKeyBundleMap> {
    const config: AxiosRequestConfig = {
      data: userClientMap,
      method: 'post',
      url: `${UserAPI.URL.USERS}/${UserAPI.URL.PRE_KEYS}`,
    };

    const response = await this.client.sendJSON<UserPreKeyBundleMap>(config, true);
    return response.data;
  }

  /**
   * List users.
   * Note: The 'qualified_ids' and 'qualified_handles' parameters are mutually exclusive.
   * @param handles The user ids to check.
   */
  public async postListUsers(
    users: {qualified_ids: QualifiedId[]} | {qualified_handles: QualifiedHandle[]},
  ): Promise<QualifiedUser[]> {
    const config: AxiosRequestConfig = {
      data: users,
      method: 'post',
      url: UserAPI.URL.LIST_USERS,
    };

    const response = await this.client.sendJSON<QualifiedUser[]>(config);
    return response.data;
  }

  /**
   * List users.
   * @param handles The user ids to check.
   */
  public async postListClients(userIds: QualifiedId[]): Promise<QualifiedUser[]> {
    const config: AxiosRequestConfig = {
      data: userIds,
      method: 'post',
      url: `${UserAPI.URL.USERS}/${UserAPI.URL.LIST_CLIENTS}`,
    };

    const response = await this.client.sendJSON<QualifiedUser[]>(config);
    return response.data;
  }

  /**
   * Given a map of user IDs to client IDs return a prekey for each one.
   * @param userClientMap A map of the user's clients
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getMultiPrekeyBundles
   */
  public async postMultiPreKeyBundles(
    userClientMap: UserClients,
    limit: number = UserAPI.DEFAULT_USERS_PREKEY_BUNDLE_CHUNK_SIZE,
  ): Promise<UserPreKeyBundleMap> {
    const userIdChunks = ArrayUtil.chunk(Object.keys(userClientMap), limit);
    const chunksPromises = userIdChunks.map(userIdChunk =>
      this._postMultiPreKeyBundlesChunk(
        userIdChunk.reduce<UserClients>((chunkedUserClientMap, userId) => {
          chunkedUserClientMap[userId] = userClientMap[userId];
          return chunkedUserClientMap;
        }, {}),
      ),
    );
    const userPreKeyBundleMapChunks = await Promise.all(chunksPromises);
    return userPreKeyBundleMapChunks.reduce((userPreKeyBundleMap, userPreKeyBundleMapChunk) => {
      return {
        ...userPreKeyBundleMap,
        ...userPreKeyBundleMapChunk,
      };
    }, {});
  }

  /**
   * Initiate or complete a password reset.
   * @param resetData The data needed to initiate or complete the reset
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/beginPasswordReset
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/completePasswordReset
   */
  public async postPasswordReset(resetData: NewPasswordReset | CompletePasswordReset): Promise<void> {
    const config: AxiosRequestConfig = {
      data: resetData,
      method: 'post',
      url: UserAPI.URL.PASSWORDRESET,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Set a user property.
   * @param propertyKey The property key to set
   * @param propertyData The property data to set
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/setProperty
   */
  public async putProperty<T>(propertyKey: string, propertyData: T): Promise<void> {
    const config: AxiosRequestConfig = {
      data: propertyData,
      method: 'put',
      url: `${UserAPI.URL.PROPERTIES}/${propertyKey}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Get rich info of a user
   * @param userId The user ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getRichInfo
   */
  public async getRichInfo(userId: string): Promise<RichInfo> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${userId}/${UserAPI.URL.RICH_INFO}`,
    };

    const response = await this.client.sendJSON<RichInfo>(config);
    return response.data;
  }
}
