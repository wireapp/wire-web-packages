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

import type {BackendEvent} from '@wireapp/api-client/src/event';
import type {Notification} from '@wireapp/api-client/src/notification/';
import type {CRUDEngine} from '@wireapp/store-engine';

import {CryptographyDatabaseRepository} from '../cryptography/CryptographyDatabaseRepository';
import {CommonMLS, StorePendingProposalsParams} from './types';

export enum DatabaseStores {
  EVENTS = 'events',
}

export enum DatabaseKeys {
  PRIMARY_KEY_LAST_EVENT = 'z.storage.StorageKey.EVENT.LAST_DATE',
  PRIMARY_KEY_LAST_NOTIFICATION = 'z.storage.StorageKey.NOTIFICATION.LAST_ID',
}

const STORES = {
  ...CryptographyDatabaseRepository.STORES,
};

export class NotificationDatabaseRepository {
  constructor(private readonly storeEngine: CRUDEngine) {}

  public getNotificationEventList() {
    return this.storeEngine.readAll<BackendEvent>(DatabaseStores.EVENTS);
  }

  public async getLastEventDate() {
    const {value} = await this.storeEngine.read<{
      value: string;
    }>(STORES.AMPLIFY, DatabaseKeys.PRIMARY_KEY_LAST_EVENT);
    return new Date(value);
  }

  public async updateLastEventDate(eventDate: Date) {
    await this.storeEngine.update(STORES.AMPLIFY, DatabaseKeys.PRIMARY_KEY_LAST_EVENT, {
      value: eventDate.toISOString(),
    });
    return eventDate;
  }

  public async createLastEventDate(eventDate: Date) {
    await this.storeEngine.create(STORES.AMPLIFY, DatabaseKeys.PRIMARY_KEY_LAST_EVENT, {
      value: eventDate.toISOString(),
    });
    return eventDate;
  }

  public async getLastNotificationId() {
    const {value} = await this.storeEngine.read<{
      value: string;
    }>(STORES.AMPLIFY, DatabaseKeys.PRIMARY_KEY_LAST_NOTIFICATION);
    return value;
  }

  public async updateLastNotificationId(lastNotification: Notification) {
    await this.storeEngine.updateOrCreate(STORES.AMPLIFY, DatabaseKeys.PRIMARY_KEY_LAST_NOTIFICATION, {
      value: lastNotification.id,
    });
    return lastNotification.id;
  }

  /**
   * ## MLS only ##
   * Store groupIds with pending proposals and a delay in the DB until the proposals get committed.
   *
   * @param groupId groupId of the mls conversation
   * @param firingDate date when the pending proposals should be committed
   */
  public async storePendingProposal(params: StorePendingProposalsParams) {
    await this.storeEngine.updateOrCreate(STORES.PENDING_PROPOSALS, `${params.groupId}`, params);
    return true;
  }

  /**
   * ## MLS only ##
   * Delete stored entries for pending proposals that have been committed.
   *
   * @param groupId groupId of the mls conversation
   */
  public async deletePendingProposal({groupId}: CommonMLS) {
    await this.storeEngine.delete(STORES.PENDING_PROPOSALS, `${groupId}`);
    return true;
  }

  /**
   * ## MLS only ##
   * Get all stored entries for pending proposals.
   *
   */
  public async getStoredPendingProposals() {
    return this.storeEngine.readAll<StorePendingProposalsParams>(STORES.PENDING_PROPOSALS);
  }
}
