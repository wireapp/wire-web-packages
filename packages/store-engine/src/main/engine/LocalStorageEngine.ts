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

import {CRUDEngine} from './CRUDEngine';
import {isBrowser} from './EnvironmentUtil';
import {RecordAlreadyExistsError, RecordNotFoundError, RecordTypeError, UnsupportedError} from './error/';

export class LocalStorageEngine implements CRUDEngine {
  public storeName = '';

  public async isSupported(): Promise<void> {
    if (!isBrowser() || !window.localStorage) {
      const message = `LocalStorage is not available on your platform.`;
      throw new UnsupportedError(message);
    }
  }

  public async init(storeName: string): Promise<Storage> {
    await this.isSupported();
    this.storeName = storeName;
    return window.localStorage;
  }

  public async purge(): Promise<void> {
    window.localStorage.clear();
  }

  private createKey(tableName: string, primaryKey: string): string {
    return `${this.createPrefix(tableName)}${primaryKey}`;
  }

  private createPrefix(tableName: string): string {
    return `${this.storeName}@${tableName}@`;
  }

  public async create<T>(tableName: string, primaryKey: string, entity: T): Promise<string> {
    if (entity) {
      let record;
      const key = this.createKey(tableName, primaryKey);

      try {
        record = await this.read(tableName, primaryKey);
      } catch (error) {
        if (!(error instanceof RecordNotFoundError)) {
          throw error;
        }
      }

      if (record) {
        const message = `Record "${primaryKey}" already exists in "${tableName}". You need to delete the record first if you want to overwrite it.`;
        throw new RecordAlreadyExistsError(message);
      } else {
        if (typeof record === 'string') {
          window.localStorage.setItem(key, String(entity));
        } else {
          window.localStorage.setItem(key, JSON.stringify(entity));
        }
        return primaryKey;
      }
    }

    const message = `Record "${primaryKey}" cannot be saved in "${tableName}" because it's "undefined" or "null".`;
    throw new RecordTypeError(message);
  }

  public async delete(tableName: string, primaryKey: string): Promise<string> {
    const key = this.createKey(tableName, primaryKey);
    window.localStorage.removeItem(key);
    return primaryKey;
  }

  public async deleteAll(tableName: string): Promise<boolean> {
    Object.keys(localStorage).forEach(key => {
      const prefix = this.createPrefix(tableName);
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  }

  public async read<T>(tableName: string, primaryKey: string): Promise<T> {
    const key = `${this.storeName}@${tableName}@${primaryKey}`;
    const record = window.localStorage.getItem(key);
    if (record) {
      try {
        return JSON.parse(record);
      } catch (error) {
        return record as any;
      }
    }
    const message = `Record "${primaryKey}" in "${tableName}" could not be found.`;
    throw new RecordNotFoundError(message);
  }

  public readAll<T>(tableName: string): Promise<T[]> {
    const promises: Promise<T>[] = [];

    Object.keys(localStorage).forEach(key => {
      const prefix = this.createPrefix(tableName);
      if (key.startsWith(prefix)) {
        const primaryKey = key.replace(prefix, '');
        promises.push(this.read(tableName, primaryKey));
      }
    });

    return Promise.all(promises);
  }

  public readAllPrimaryKeys(tableName: string): Promise<string[]> {
    const primaryKeys: string[] = [];

    Object.keys(localStorage).forEach((primaryKey: string) => {
      const prefix = this.createPrefix(tableName);
      if (primaryKey.startsWith(prefix)) {
        primaryKeys.push(primaryKey.replace(prefix, ''));
      }
    });

    return Promise.resolve(primaryKeys);
  }

  public async update<T>(tableName: string, primaryKey: string, changes: T): Promise<string> {
    const entity = await this.read<T>(tableName, primaryKey);
    const updatedEntity = {...entity, ...changes};
    try {
      return this.create<T>(tableName, primaryKey, updatedEntity);
    } catch (error) {
      if (error instanceof RecordAlreadyExistsError) {
        await this.delete(tableName, primaryKey);
        return this.create(tableName, primaryKey, updatedEntity);
      } else {
        throw error;
      }
    }
  }

  public async updateOrCreate<T>(tableName: string, primaryKey: string, changes: T): Promise<string> {
    try {
      await this.update<T>(tableName, primaryKey, changes);
    } catch (error) {
      if (error instanceof RecordNotFoundError) {
        return this.create<T>(tableName, primaryKey, changes);
      }
      throw error;
    }
    return primaryKey;
  }

  async append(tableName: string, primaryKey: string, additions: string): Promise<string> {
    let record = await this.read<string>(tableName, primaryKey);
    if (typeof record === 'string') {
      record += additions;
    } else {
      const message = `Cannot append text to record "${primaryKey}" because it's not a string.`;
      throw new RecordTypeError(message);
    }
    const key = this.createKey(tableName, primaryKey);
    window.localStorage.setItem(key, record);
    return primaryKey;
  }
}
