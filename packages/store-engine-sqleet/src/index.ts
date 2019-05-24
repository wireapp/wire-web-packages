/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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
import {SQLiteDatabaseDefinition, SQLiteTableDefinition, SQLiteType, createTableIfNotExists} from './SchemaConverter';

const initSqlJs = require('sql.js');

declare global {
  interface Window {
    WebAssembly: any;
  }
}

export class SQLeetEngine implements CRUDEngine {
  private db: any;
  private readonly dbConfig: any;
  public storeName = '';
  private schema: SQLiteDatabaseDefinition;

  constructor(wasmLocation?: Uint8Array | string) {
    this.dbConfig =
      typeof wasmLocation === 'string'
        ? {
            locateFile: () => wasmLocation,
          }
        : {
            wasmBinary: wasmLocation,
          };
    this.schema = {
      objects: {
        key: SQLiteType.TEXT,
        value: SQLiteType.TEXT,
      },
    };
  }

  append(tableName: string, primaryKey: string, additions: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async init(
    storeName: string,
    schema: SQLiteDatabaseDefinition,
    existingDatabase?: Uint8Array,
    encryptionKey?: string
  ): Promise<any> {
    this.storeName = storeName;
    this.schema = schema;

    const SQL = await initSqlJs(this.dbConfig);
    this.db = new SQL.Database(existingDatabase);

    // Setup encryption scheme
    if (encryptionKey) {
      this.db.key(`raw:${encryptionKey}`);
    }

    // Create tables
    let statement: string = '';
    for (const tableName in this.schema) {
      const columns: SQLiteTableDefinition = this.schema[tableName];
      statement += createTableIfNotExists(tableName, columns);
    }
    this.db.run(statement);

    return this.db;
  }

  async purge(): Promise<void> {
    // From api.coffee: "Databases **must** be closed, when you're finished with them, or the
    // memory consumption will grow forever
    this.db.close();
    this.db = null;
  }

  async create<T>(tableName: string, primaryKey: string, entity: Record<string, any>): Promise<string> {
    const columns = Object.keys(entity).filter(column => {
      // Ensure the column name exist, to avoid any SQL injection
      return typeof this.schema[tableName][column] !== 'undefined';
    });
    if (!columns) {
      throw new Error('Entity is empty');
    }
    const values: {[key: string]: any} = {};
    for (const columnIndex in columns) {
      const column = columns[columnIndex];
      values[`@${column}`] = entity[column];
    }
    const statement = `INSERT INTO ${tableName} (key,${columns.join(',')}) VALUES (@primaryKey,${Object.keys(
      values
    ).join(',')});`;
    this.db.run(statement, {
      ...values,
      '@primaryKey': primaryKey,
    });
    return primaryKey;
  }

  async delete(tableName: string, primaryKey: string): Promise<string> {
    const statement = `DELETE FROM ${tableName} WHERE key=@primaryKey;`;
    this.db.run(statement, {
      '@primaryKey': primaryKey,
    });
    return primaryKey;
  }

  async deleteAll(tableName: string): Promise<boolean> {
    const statement = `DELETE FROM ${tableName}`;
    this.db.run(statement);
    return true;
  }

  async read<T>(tableName: string, primaryKey: string): Promise<T> {
    const columns = Object.keys(this.schema[tableName]).join(',');
    const selectRecordStatement = `SELECT key, ${columns} FROM ${tableName} WHERE key = @primaryKey;`;

    const statement = this.db.prepare(selectRecordStatement);
    const record = statement.getAsObject({
      '@primaryKey': primaryKey,
    });

    return record;
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

  updateOrCreate(tableName: string, primaryKey: string, changes: Object): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async isSupported(): Promise<void> {
    const webAssembly = window.WebAssembly;
    if (typeof webAssembly === 'object' && typeof webAssembly.instantiate === 'function') {
      const module = new webAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
      if (module instanceof webAssembly.Module) {
        if (new webAssembly.Instance(module) instanceof webAssembly.Instance) {
          return;
        }
      }
    }
    throw new Error('Webassembly is not supported');
  }
}
