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

import {EventEmitter} from 'events';
import {CRUDEngine} from '../engine/';
import {RecordAlreadyExistsError, RecordNotFoundError} from '../engine/error/';
import {ExpiredBundle} from './ExpiredBundle';
import {TransientBundle} from './TransientBundle';

export class TransientStore extends EventEmitter {
  private readonly bundles: Record<string, TransientBundle> = {};
  private tableName = '';

  public static TOPIC = {
    EXPIRED: 'expired',
  };

  constructor(private readonly engine: CRUDEngine) {
    super();
  }

  public async init(tableName: string): Promise<TransientBundle[]> {
    this.tableName = tableName;

    const cacheKeys: string[] = [];

    const primaryKeys = await this.engine.readAllPrimaryKeys(this.tableName);
    const readBundles: Promise<TransientBundle>[] = [];

    primaryKeys.forEach(primaryKey => {
      const cacheKey = this.constructCacheKey(primaryKey);
      cacheKeys.push(cacheKey);
      readBundles.push(this.engine.read(this.tableName, primaryKey));
    });

    const bundles = await Promise.all(readBundles);

    for (const index in bundles) {
      const bundle = bundles[index];
      const cacheKey = cacheKeys[index];

      await this.startTimer(cacheKey);
      this.bundles[cacheKey] = bundle;
    }

    return bundles;
  }

  /**
   * Returns a fully qualified name (FQN) which can be used to cache a transient bundle.
   * @param {string} primaryKey - Primary key from which the FQN is created
   * @returns {string} A fully qualified name
   */
  private constructCacheKey(primaryKey: string): string {
    return `${this.engine.storeName}@${this.tableName}@${primaryKey}`;
  }

  private constructPrimaryKey(cacheKey: string): string {
    return cacheKey.replace(`${this.engine.storeName}@${this.tableName}@`, '');
  }

  private createTransientBundle<T>(record: T, ttl: number): TransientBundle {
    return {
      expires: Date.now() + ttl,
      payload: record,
    };
  }

  public async get(primaryKey: string): Promise<TransientBundle | undefined> {
    try {
      const cachedBundle = await this.getFromCache(primaryKey);
      return cachedBundle !== undefined ? cachedBundle : this.getFromStore(primaryKey);
    } catch (error) {
      if (error instanceof RecordNotFoundError) {
        return undefined;
      }
      throw error;
    }
  }

  private getFromCache(primaryKey: string): TransientBundle {
    return this.bundles[this.constructCacheKey(primaryKey)];
  }

  private getFromStore(primaryKey: string): Promise<TransientBundle> {
    return this.engine.read(this.tableName, primaryKey);
  }

  /**
   * Saves a transient record to the store and starts a timer to remove this record when the time to live (TTL) ended.
   * @param {string} primaryKey - Primary key from which the FQN is created
   * @param {string} record - A payload which should be kept in the TransientStore
   * @param {number} ttl - The time to live (TTL) in milliseconds (ex. 1000 is 1s)
   * @returns {Promise<TransientBundle>} A transient bundle, wrapping the initial record
   */
  public async set<T>(primaryKey: string, record: T, ttl: number): Promise<TransientBundle> {
    const bundle = this.createTransientBundle(record, ttl);
    const cachedBundle = this.getFromCache(primaryKey);
    if (cachedBundle) {
      const message = `Record with primary key "${primaryKey}" already exists in table "${this.tableName}" of database "${this.engine.storeName}".`;
      throw new RecordAlreadyExistsError(message);
    } else {
      const cacheKey = await this.save(primaryKey, bundle);
      await this.startTimer(cacheKey);

      // Note: Save bundle with timeoutID in cache (not in persistent storage)
      return this.saveInCache(cacheKey, bundle);
    }
  }

  private async save<TransientBundle>(primaryKey: string, bundle: TransientBundle): Promise<string> {
    const cacheKey = this.constructCacheKey(primaryKey);
    await Promise.all([this.saveInStore(primaryKey, bundle), this.saveInCache(cacheKey, bundle)]);
    return cacheKey;
  }

  private saveInStore<TransientBundle>(primaryKey: string, bundle: TransientBundle): Promise<string> {
    return this.engine.create(this.tableName, primaryKey, bundle);
  }

  private saveInCache<TransientBundle>(cacheKey: string, bundle: TransientBundle): TransientBundle {
    return (this.bundles[cacheKey] = <any>bundle);
  }

  public async delete(primaryKey: string): Promise<string> {
    const cacheKey = this.constructCacheKey(primaryKey);
    await Promise.all([this.deleteFromStore(primaryKey), this.deleteFromCache(cacheKey)]);
    return cacheKey;
  }

  private deleteFromStore(primaryKey: string): Promise<string> {
    return this.engine.delete(this.tableName, primaryKey);
  }

  public deleteFromCache(cacheKey: string): string {
    if (this.bundles[cacheKey] && this.bundles[cacheKey].timeoutID) {
      clearTimeout(this.bundles[cacheKey].timeoutID as number);
    }
    delete this.bundles[cacheKey];
    return cacheKey;
  }

  private async expireBundle(cacheKey: string): Promise<ExpiredBundle> {
    const expiredBundle: ExpiredBundle = {
      cacheKey: cacheKey,
      payload: this.bundles[cacheKey].payload,
      primaryKey: this.constructPrimaryKey(cacheKey),
    };

    await this.delete(expiredBundle.primaryKey);
    return expiredBundle;
  }

  private async startTimer(cacheKey: string): Promise<TransientBundle> {
    const primaryKey = this.constructPrimaryKey(cacheKey);
    let bundle = await this.get(primaryKey);
    if (!bundle) {
      bundle = {
        expires: 0,
        payload: undefined,
      };
    }
    const {expires, timeoutID} = bundle;
    const timespan: number = expires - Date.now();
    if (expires <= 0) {
      await this.expireBundle(cacheKey);
    } else if (!timeoutID) {
      bundle.timeoutID = setTimeout(async () => {
        const expiredBundle: ExpiredBundle = await this.expireBundle(cacheKey);
        this.emit(TransientStore.TOPIC.EXPIRED, expiredBundle);
      }, timespan);
    }
    return bundle;
  }
}
