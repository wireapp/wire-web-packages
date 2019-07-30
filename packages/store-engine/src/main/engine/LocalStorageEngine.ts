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

  public async append<PrimaryKey = string>(
    tableName: string,
    primaryKey: PrimaryKey,
    additions: string,
  ): Promise<PrimaryKey> {
    let record = await this.read(tableName, primaryKey);
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

  public async create<EntityType, PrimaryKey = string>(
    tableName: string,
    primaryKey: PrimaryKey,
    entity: EntityType,
  ): Promise<PrimaryKey> {
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

  public async delete<PrimaryKey = string>(tableName: string, primaryKey: PrimaryKey): Promise<PrimaryKey> {
    const key = this.createKey(tableName, primaryKey);
    window.localStorage.removeItem(key);
    return primaryKey;
  }

  public async deleteAll(tableName: string): Promise<boolean> {
    for (const key of Object.keys(localStorage)) {
      const prefix = this.createPrefix(tableName);
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
    return true;
  }

  public async init(storeName: string): Promise<Storage> {
    await this.isSupported();
    this.storeName = storeName;
    return window.localStorage;
  }

  public async isSupported(): Promise<void> {
    if (!isBrowser() || !window.localStorage) {
      const message = `LocalStorage is not available on your platform.`;
      throw new UnsupportedError(message);
    }
  }

  public async purge(): Promise<void> {
    window.localStorage.clear();
  }

  public read<EntityType = Object, PrimaryKey = string>(
    tableName: string,
    primaryKey: PrimaryKey,
  ): Promise<EntityType> {
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
    const promises = Object.keys(localStorage).reduce<Promise<T>[]>((result, key) => {
      const prefix = this.createPrefix(tableName);
      if (key.startsWith(prefix)) {
        const primaryKey = key.replace(prefix, '');
        result.push(this.read<T>(tableName, primaryKey));
      }
      return result;
    }, []);

    return Promise.all(promises);
  }

  public async readAllPrimaryKeys(tableName: string): Promise<string[]> {
    return Object.keys(localStorage).reduce<string[]>((result, primaryKey) => {
      const prefix = this.createPrefix(tableName);
      if (primaryKey.startsWith(prefix)) {
        result.push(primaryKey.replace(prefix, ''));
      }
      return result;
    }, []);
  }

  public async update<PrimaryKey = string, ChangesType = Object>(
    tableName: string,
    primaryKey: PrimaryKey,
    changes: ChangesType,
  ): Promise<PrimaryKey> {
    const entity = await this.read(tableName, primaryKey);
    const updatedEntity = {...entity, ...changes};
    try {
      const newKey = await this.create(tableName, primaryKey, updatedEntity);
      return newKey;
    } catch (error) {
      if (error instanceof RecordAlreadyExistsError) {
        await this.delete(tableName, primaryKey);
        return this.create(tableName, primaryKey, updatedEntity);
      } else {
        throw error;
      }
    }
  }

  public async updateOrCreate<PrimaryKey = string, ChangesType = Object>(
    tableName: string,
    primaryKey: PrimaryKey,
    changes: ChangesType,
  ): Promise<PrimaryKey> {
    try {
      await this.update(tableName, primaryKey, changes);
    } catch (error) {
      if (error instanceof RecordNotFoundError) {
        await this.create(tableName, primaryKey, changes);
      }
      throw error;
    }
    return primaryKey;
  }

  private createKey<PrimaryKey = string>(tableName: string, primaryKey: PrimaryKey): string {
    return `${this.createPrefix(tableName)}${primaryKey}`;
  }

  private createPrefix(tableName: string): string {
    return `${this.storeName}@${tableName}@`;
  }
}
