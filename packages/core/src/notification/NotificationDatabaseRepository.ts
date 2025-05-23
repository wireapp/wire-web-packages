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

import {CRUDEngine} from '@wireapp/store-engine';

export enum DatabaseKeys {
  PRIMARY_KEY_LAST_EVENT = 'z.storage.StorageKey.EVENT.LAST_DATE',
}

const STORES = {
  AMPLIFY: 'amplify',
};

export class NotificationDatabaseRepository {
  constructor(private readonly storeEngine: CRUDEngine) {}

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
}
