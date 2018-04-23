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
import {RecordAlreadyExistsError} from './error';

const Filer = require('filer.js');
const fs = require('bro-fs');

export type FileSystemEngineOptions = {
  fileExtension: string;
  type: number;
  size: number;
};

const TEN_MEGABYTES = 1024 * 1024 * 10;

export default class FileSystemEngine implements CRUDEngine {
  public storeName: string = '';

  private config: FileSystemEngineOptions = {
    fileExtension: '.dat',
    type: window.TEMPORARY,
    size: TEN_MEGABYTES,
  };

  private filer: any;

  constructor() {
    this.filer = new Filer();
  }

  async init(storeName: string = '', options?: FileSystemEngineOptions): Promise<any> {
    Object.assign(this.config, options);
    this.storeName = storeName;

    await fs.init({type: this.config.type, bytes: this.config.size});

    return new Promise((resolve, reject) => {
      this.filer.init(
        {persistent: Boolean(this.config.type), size: this.config.size},
        (filesystem: FileSystem) => resolve(filesystem),
        reject
      );
    });
  }

  private createDirectoryPath(tableName: string): string {
    return `${this.storeName}/${tableName}`;
  }

  private createFilePath(tableName: string, primaryKey: string): string {
    const directory = this.createDirectoryPath(tableName);
    return `${directory}/${primaryKey}${this.config.fileExtension}`;
  }

  async append(tableName: string, primaryKey: string, additions: string): Promise<string> {
    const filePath = this.createFilePath(tableName, primaryKey);
    await fs.appendFile(filePath, additions);
    return primaryKey;
  }

  private async createDirectory(tableName: string): Promise<string> {
    const directoryPath = this.createDirectoryPath(tableName);
    await fs.mkdir(directoryPath);
    return directoryPath;
  }

  create<T>(tableName: string, primaryKey: string, entity: T): Promise<string> {
    if (!entity) {
      const message: string = `Record "${primaryKey}" cannot be saved in "${tableName}" because it's "undefined" or "null".`;
      return Promise.reject(new RecordTypeError(message));
    }

    return new Promise(async (resolve, reject) => {
      const filePath = this.createFilePath(tableName, primaryKey);
      const onSuccess = () => resolve(primaryKey);
      const onError = () => {
        const message: string = `Record "${primaryKey}" already exists in "${tableName}". You need to delete the record first if you want to overwrite it.`;
        reject(new RecordAlreadyExistsError(message));
      };

      this.filer.create(filePath, true, onSuccess, onError);
    });
  }

  delete(tableName: string, primaryKey: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  deleteAll(tableName: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  read<T>(tableName: string, primaryKey: string): Promise<T> {
    const filePath = this.createFilePath(tableName, primaryKey);
    return fs.readFile(filePath);
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
