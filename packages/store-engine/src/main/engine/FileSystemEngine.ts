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

import CRUDEngine from './CRUDEngine';
import {RecordTypeError} from './error/';

const Filer = require('filer.js');

export type FileSystemEngineOptions = {
  fileExtension: string;
  isPersistent: boolean;
  size: number;
};

const TEN_MEGABYTES = 1024 * 1024 * 10;

export default class FileSystemEngine implements CRUDEngine {
  public storeName: string = '';

  private config: FileSystemEngineOptions = {
    fileExtension: '.dat',
    isPersistent: false,
    size: TEN_MEGABYTES,
  };
  private filer: any;

  constructor() {
    this.filer = new Filer();
  }

  init(storeName: string = '', options?: FileSystemEngineOptions): Promise<string> {
    Object.assign(this.config, options);
    this.storeName = storeName;

    return new Promise((resolve, reject) => {
      this.filer.init(
        {persistent: this.config.isPersistent, size: this.config.size},
        (filesystem: FileSystem) => {
          resolve(this.filer.fs.root.toURL());
        },
        reject
      );
    });
  }

  append(tableName: string, primaryKey: string, additions: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  private createDirectory(tableName: string): Promise<string> {
    const path = `${this.storeName}/${tableName}`;
    return new Promise((resolve, reject) => {
      this.filer.mkdir(path, false, () => resolve(path), reject);
    });
  }

  create<T>(tableName: string, primaryKey: string, entity: T): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const onError = () => {
        const message: string = `Record "${primaryKey}" cannot be saved in "${tableName}" because it's "undefined" or "null".`;
        reject(new RecordTypeError(message));
      };

      const directory = await this.createDirectory(tableName);
      const path = `${directory}/${primaryKey}.${this.config.fileExtension}`;

      this.filer.create(path, false, () => resolve(primaryKey), onError);
    });
  }

  delete(tableName: string, primaryKey: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  deleteAll(tableName: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  read<T>(tableName: string, primaryKey: string): Promise<T> {
    throw new Error('Method not implemented.');
  }

  readAll<T>(tableName: string): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  readAllPrimaryKeys(tableName: string): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  update(tableName: string, primaryKey: string, changes: Object): Promise<string> {
    throw new Error('Method not implemented.');
  }

  purge(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  updateOrCreate(tableName: string, primaryKey: string, changes: Object): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
