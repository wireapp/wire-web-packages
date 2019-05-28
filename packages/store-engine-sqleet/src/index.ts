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
import {SQLiteDatabaseDefinition, SQLiteType, createTableIfNotExists} from './SchemaConverter';

const initSqlJs = require('sql.js');

export class SQLeetEngine implements CRUDEngine {
  private db: any;
  private hasEncryptionEnabled: boolean = false;
  private schema: SQLiteDatabaseDefinition<Record<string, any>>;
  private readonly dbConfig: any;
  public storeName = '';

  constructor(wasmLocation?: Uint8Array | string) {
    this.dbConfig = {};

    if (typeof wasmLocation === 'string') {
      this.dbConfig.locateFile = () => wasmLocation;
    } else if (wasmLocation instanceof Uint8Array) {
      this.dbConfig.wasmBinary = wasmLocation;
    }
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

  async init<T>(
    storeName: string,
    schema: SQLiteDatabaseDefinition<T>,
    encryptionKey?: string,
    existingEncodedDatabase?: string
  ): Promise<any> {
    this.storeName = storeName;
    this.schema = schema;

    let existingDatabase: Uint8Array | undefined = undefined;
    if (existingEncodedDatabase) {
      existingDatabase = await this.load(existingEncodedDatabase);
    }

    const SQL = await initSqlJs(this.dbConfig);
    this.db = new SQL.Database(existingDatabase);

    // Settings
    this.db.run('PRAGMA encoding="UTF-8";');
    if (encryptionKey) {
      this.db.run(`PRAGMA key="${encryptionKey}";`);
      this.hasEncryptionEnabled = true;
      encryptionKey = null;
    }

    // Create tables
    let statement: string = '';
    for (const tableName in this.schema) {
      const columns = this.schema[tableName];
      statement += createTableIfNotExists(tableName, columns);
    }
    this.db.run(statement);

    return this.db;
  }

  public async export(): Promise<string> {
    if (!this.db) {
      throw new Error('SQLite need to be available');
    }
    if (!this.hasEncryptionEnabled) {
      throw new Error('You cannot export an unencrypted database');
    }
    const database: Uint8Array = new Uint8Array(this.db.export());
    const strings = [];
    const chunksize = 0xffff;
    // There is a maximum stack size. We cannot call String.fromCharCode with as many arguments as we want
    for (let i = 0; i * chunksize < database.length; i++) {
      strings[i] = String.fromCharCode.apply(null, <any>database.subarray(i * chunksize, (i + 1) * chunksize));
    }
    return strings.join('');
  }

  private async load(database: string): Promise<Uint8Array | undefined> {
    const databaseBinary = new Uint8Array(database.length);
    for (let i = 0; i < database.length; i++) {
      databaseBinary[i] = database.charCodeAt(i);
    }
    return databaseBinary;
  }

  async purge(): Promise<void> {
    // From api.coffee: "Databases **must** be closed, when you're finished with them, or the
    // memory consumption will grow forever
    this.db.close();
    this.db = null;
  }

  private buildValues(
    tableName: string,
    entity: Record<string, any>
  ): {columns: string[]; values: Record<string, any>} {
    const columns = Object.keys(entity).filter(column => {
      // Ensure the column name exists to avoid SQL injection
      return typeof this.schema[tableName][column] !== 'undefined';
    });
    if (!columns) {
      throw new Error('Entity is empty');
    }
    const values: Record<string, any> = {};
    for (const columnIndex in columns) {
      const column = columns[columnIndex];
      values[`@${column}`] = entity[column];
    }
    return {columns, values};
  }

  async create<T>(tableName: string, primaryKey: string, entity: Record<string, any>): Promise<string> {
    const {columns, values} = this.buildValues(tableName, entity);
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
    statement.free();

    return record;
  }

  readAll<T>(tableName: string): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  readAllPrimaryKeys(tableName: string): Promise<string[]> {
    const statement = this.db.prepare(`SELECT key FROM ${tableName};`);
    const record = statement.getAsObject();
    console.log(record);
    statement.free();
    return record;
  }

  async update(tableName: string, primaryKey: string, changes: Record<string, any>): Promise<string> {
    const {columns, values} = this.buildValues(tableName, changes);
    const newValues = columns.map(column => `${column}=@${column}`);
    const statement = `UPDATE ${tableName} SET ${newValues.join(',')} WHERE key=@primaryKey;`;
    this.db.run(statement, {
      ...values,
      '@primaryKey': primaryKey,
    });
    return primaryKey;
  }

  async updateOrCreate<T>(tableName: string, primaryKey: string, changes: Record<string, any>): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async isSupported(): Promise<void> {
    const webAssembly = (window as any).WebAssembly;
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
