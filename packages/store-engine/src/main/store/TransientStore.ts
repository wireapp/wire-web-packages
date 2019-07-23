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

  public init(tableName: string): Promise<TransientBundle[]> {
    this.tableName = tableName;

    const cacheKeys: string[] = [];

    return this.engine
      .readAllPrimaryKeys(this.tableName)
      .then((primaryKeys: string[]) => {
        const readBundles: Promise<TransientBundle>[] = [];

        primaryKeys.forEach((primaryKey: string) => {
          const cacheKey: string = this.constructCacheKey(primaryKey);
          cacheKeys.push(cacheKey);
          readBundles.push(this.engine.read(this.tableName, primaryKey));
        });

        return Promise.all(readBundles);
      })
      .then(async (bundles: TransientBundle[]) => {
        for (const index in bundles) {
          const bundle = bundles[index];
          const cacheKey = cacheKeys[index];

          await this.startTimer(cacheKey);
          this.bundles[cacheKey] = bundle;
        }

        return bundles;
      });
  }

  /**
   * Returns a fully qualified name (FQN) which can be used to cache a transient bundle.
   * @param primaryKey - Primary key from which the FQN is created
   * @returns A fully qualified name
   */
  private constructCacheKey(primaryKey: string): string {
    return `${this.engine.storeName}@${this.tableName}@${primaryKey}`;
  }

  private constructPrimaryKey(cacheKey: string): string {
    return cacheKey.replace(`${this.engine.storeName}@${this.tableName}@`, '');
  }

  private createTransientBundle<T>(record: T, ttl: number): {expires: number; payload: T} {
    return {
      expires: Date.now() + ttl,
      payload: record,
    };
  }

  public get(primaryKey: string): Promise<TransientBundle | undefined> {
    return this.getFromCache(primaryKey)
      .then(cachedBundle => {
        return cachedBundle !== undefined ? cachedBundle : this.getFromStore(primaryKey);
      })
      .catch(error => {
        if (error instanceof RecordNotFoundError) {
          return undefined;
        }
        throw error;
      });
  }

  private getFromCache(primaryKey: string): Promise<TransientBundle> {
    const cacheBundle = this.bundles[this.constructCacheKey(primaryKey)];
    return Promise.resolve(cacheBundle);
  }

  private getFromStore(primaryKey: string): Promise<TransientBundle> {
    return this.engine.read(this.tableName, primaryKey);
  }

  /**
   * Saves a transient record to the store and starts a timer to remove this record when the time to live (TTL) ended.
   * @param primaryKey - Primary key from which the FQN is created
   * @param A payload which should be kept in the TransientStore
   * @param The time to live (TTL) in milliseconds (ex. 1000 is 1s)
   * @returns ransientBundle>} A transient bundle, wrapping the initial record
   */
  public set<T>(primaryKey: string, record: T, ttl: number): Promise<TransientBundle> {
    const bundle: TransientBundle = this.createTransientBundle(record, ttl);

    return new Promise((resolve, reject) =>
      this.getFromCache(primaryKey).then((cachedBundle: TransientBundle) => {
        if (cachedBundle) {
          const message = `Record with primary key "${primaryKey}" already exists in table "${this.tableName}" of database "${this.engine.storeName}".`;
          return reject(new RecordAlreadyExistsError(message));
        } else {
          return this.save(primaryKey, bundle)
            .then((cacheKey: string) => Promise.all([cacheKey, this.startTimer(cacheKey)]))
            .then(([cacheKey, bundle]: [string, TransientBundle]) => {
              // Note: Save bundle with timeoutID in cache (not in persistent storage)
              resolve(this.saveInCache(cacheKey, bundle));
            });
        }
      }),
    );
  }

  private save<TransientBundle>(primaryKey: string, bundle: TransientBundle): Promise<string> {
    const cacheKey: string = this.constructCacheKey(primaryKey);

    return Promise.all([this.saveInStore(primaryKey, bundle), this.saveInCache(cacheKey, bundle)]).then(() => cacheKey);
  }

  private saveInStore<TransientBundle>(primaryKey: string, bundle: TransientBundle): Promise<string> {
    return this.engine.create(this.tableName, bundle, primaryKey);
  }

  private saveInCache<TransientBundle>(cacheKey: string, bundle: TransientBundle): TransientBundle {
    return (this.bundles[cacheKey] = <any>bundle);
  }

  public delete(primaryKey: string): Promise<string> {
    const cacheKey = this.constructCacheKey(primaryKey);

    return Promise.all([this.deleteFromStore(primaryKey), this.deleteFromCache(cacheKey)]).then(() => cacheKey);
  }

  private deleteFromStore(primaryKey: string): Promise<string> {
    return this.engine.delete(this.tableName, primaryKey);
  }

  public deleteFromCache(cacheKey: string): string {
    const timeoutID = this.bundles[cacheKey] && this.bundles[cacheKey].timeoutID;
    if (timeoutID) {
      clearTimeout(<number>timeoutID);
    }
    delete this.bundles[cacheKey];
    return cacheKey;
  }

  private expireBundle(cacheKey: string): Promise<ExpiredBundle> {
    const expiredBundle: ExpiredBundle = {
      cacheKey: cacheKey,
      payload: this.bundles[cacheKey].payload,
      primaryKey: this.constructPrimaryKey(cacheKey),
    };

    return this.delete(expiredBundle.primaryKey).then(() => expiredBundle);
  }

  private startTimer(cacheKey: string): Promise<TransientBundle> {
    const primaryKey = this.constructPrimaryKey(cacheKey);
    return this.get(primaryKey).then(async (bundle: TransientBundle | undefined) => {
      if (!bundle) {
        bundle = new TransientBundle();
        bundle.expires = 0;
        bundle.payload = undefined;
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
    });
  }
}
