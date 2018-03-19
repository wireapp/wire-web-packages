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

export default class FileSystemEngine implements CRUDEngine {
  public storeName: string = '';

  private filesystem: FileSystem | undefined;

  constructor() {}

  init(storeName: string = '', options: {type: number; size: number}): Promise<string> {
    const config = Object.assign(
      {},
      {
        type: window.TEMPORARY,
        size: 1024 * 1024 * 10,
      },
      options
    );

    return new Promise((resolve, reject) => {
      window.requestFileSystem(
        config.type,
        config.size,
        filesystem => {
          this.filesystem = filesystem;
          resolve(this.filesystem.root.toURL());
        },
        reject
      );
    });
  }

  create<T>(tableName: string, primaryKey: string, entity: T): Promise<string> {
    throw new Error('Method not implemented.');
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
}
