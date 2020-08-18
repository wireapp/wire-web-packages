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

import {HttpClient, ProgressCallback, RequestCancelable} from '../http/';
import {Client, Self, UserPreKeyList, UserPreKeyDataList, UserSeenByBot, ClientSeenByBot, BotMessage} from './Bot';
import {PreKey} from '../auth/';
import {AssetOptions, AssetAPI, AssetUploadData, AssetResponse} from '../asset/';

export class BotsAPI {
  constructor(private readonly client: HttpClient) {}

  public static readonly URL = {
    ASSETS: 'assets',
    BOT: '/bot',
    CLIENT: 'client',
    CLIENTS: 'clients',
    CONVERSATION: 'conversation',
    MESSAGES: 'messages',
    PREKEYS: 'prekeys',
    SELF: 'self',
    USERS: 'users',
  };

  /**
   * Delete the bot, thereby removing it from the conversation it is in.
   *
   * The bot will receive a final `conversation.member-leave` message.
   */
  public async deleteSelf(): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.SELF}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Fetch the bot's own client information
   */
  public async getClient(): Promise<Client> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.CLIENT}`,
    };

    const response = await this.client.sendJSON<Client>(config);
    return response.data;
  }

  /**
   * List the bot's remaining prekey IDs.
   */
  public async getClientPreKeys(): Promise<number[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.CLIENT}/${BotsAPI.URL.PREKEYS}`,
    };

    const response = await this.client.sendJSON<number[]>(config);
    return response.data;
  }

  /**
   * Fetch a user's list of clients.
   */
  public async getClientsByUserId(userId: string): Promise<ClientSeenByBot[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.USERS}/${userId}${BotsAPI.URL.CLIENTS}`,
    };

    const response = await this.client.sendJSON<ClientSeenByBot[]>(config);
    return response.data;
  }

  /**
   * Fetch a user's list of clients.
   */
  public async getConversation(userId: string): Promise<ClientSeenByBot[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.USERS}/${userId}${BotsAPI.URL.CLIENTS}`,
    };

    const response = await this.client.sendJSON<ClientSeenByBot[]>(config);
    return response.data;
  }

  /**
   * Fetch the bot's own user profile information.
   */
  public async getSelf(): Promise<Self> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.SELF}`,
    };

    const response = await this.client.sendJSON<Self>(config);
    return response.data;
  }

  /**
   * Claim prekeys from one or more clients of one or more users.
   *
   * The result is a nested JSON object structure where the first-level keys
   * are user IDs and the second-level keys client IDs. The values paired with
   * the client IDs are the base64-encoded prekeys.
   */
  public async postUserPreKeysList(userPreKeyList: UserPreKeyList): Promise<UserPreKeyDataList> {
    const config: AxiosRequestConfig = {
      data: userPreKeyList,
      method: 'post',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.CLIENT}/${BotsAPI.URL.PREKEYS}`,
    };

    const response = await this.client.sendJSON<UserPreKeyDataList>(config);
    return response.data;
  }

  /**
   * Fetch other user's profiles.
   */
  public async getUsers(ids: string[]): Promise<UserSeenByBot[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.USERS}`,
    };

    const response = await this.client.sendJSON<UserSeenByBot[]>(config);
    return response.data;
  }

  /**
   * List the bot's remaining prekey IDs.
   */
  public async postClientPreKeys(preKeys: PreKey[]): Promise<void> {
    const config: AxiosRequestConfig = {
      data: {prekeys: preKeys},
      method: 'post',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.CLIENT}/${BotsAPI.URL.PREKEYS}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Upload an asset.
   * Note that resumable uploads are not currently supported for bots.
   */
  public postAsset(
    asset: Uint8Array,
    options?: AssetOptions,
    progressCallback?: ProgressCallback,
  ): Promise<RequestCancelable<AssetUploadData>> {
    const customUrl = `${BotsAPI.URL.BOT}/${BotsAPI.URL.ASSETS}`;
    return new AssetAPI(this.client).postAsset(asset, options, progressCallback, customUrl);
  }

  /**
   * Download an asset.
   */
  public getAsset(
    assetId: string,
    token?: string | null,
    forceCaching: boolean = false,
    progressCallback?: ProgressCallback,
  ): Promise<RequestCancelable<AssetResponse>> {
    const customUrl = `${BotsAPI.URL.BOT}/${BotsAPI.URL.ASSETS}/${assetId}`;
    return new AssetAPI(this.client).getAssetV3(assetId, token, forceCaching, progressCallback, customUrl);
  }

  /**
   * Delete an asset.
   */
  public async deleteAsset(assetId: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.ASSETS}/${assetId}`,
    };

    await this.client.sendJSON(config);
  }

  /**
   * Post an end-to-end encrypted generic message to the conversation the bot is in.
   */
  public async postMessage(messageData: BotMessage): Promise<void> {
    const config: AxiosRequestConfig = {
      data: messageData,
      method: 'post',
      url: `${BotsAPI.URL.BOT}/${BotsAPI.URL.MESSAGES}`,
    };

    await this.client.sendJSON<BotMessage>(config);
  }
}
