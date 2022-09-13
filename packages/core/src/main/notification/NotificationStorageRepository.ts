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

import {LastKeyPackageQueryParams} from './types';
import {WebStorageEngine} from '@wireapp/store-engine-web-storage';

export enum StorageStores {
  KEY_MATERIAL_DATES = 'key_material_dates',
}

export enum StorageKeys {
  LAST_KEY_PACKAGE_QUERY_DATE = 'last_key_package_query_date',
}

export class NotificationStorageRepository {
  private readonly storeEngine: WebStorageEngine;
  constructor() {
    this.storeEngine = new WebStorageEngine();
  }

  /**
   * ## MLS only ##
   * Store date of last key package query
   *
   * @param {lastQueryDate} params.previousUpdateDate - date of the last key packages query
   */
  public async storeLastKeyPackageQueryDate(params: LastKeyPackageQueryParams) {
    await this.storeEngine.updateOrCreate(
      StorageStores.KEY_MATERIAL_DATES,
      StorageKeys.LAST_KEY_PACKAGE_QUERY_DATE,
      params,
    );
    return true;
  }

  /**
   * ## MLS only ##
   * Get last key packages query date.
   *
   */
  public async getStoredLastKeyPackagesQueryDate() {
    const {lastQueryDate} = await this.storeEngine.read<LastKeyPackageQueryParams>(
      StorageStores.KEY_MATERIAL_DATES,
      StorageKeys.LAST_KEY_PACKAGE_QUERY_DATE,
    );
    return lastQueryDate;
  }
}
