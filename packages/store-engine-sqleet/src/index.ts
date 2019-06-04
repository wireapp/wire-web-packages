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

declare global {
  interface Window {
    WebAssembly: typeof WebAssembly;
  }
}

import {CRUDEngine} from '@wireapp/store-engine';
import {SQLiteDatabaseDefinition, SQLiteType, createTableIfNotExists, escape, escapeTableName} from './SchemaConverter';

const initSqlJs = require('sql.js');

export class SQLeetEngine implements CRUDEngine {
  private db: any;
  private schema: SQLiteDatabaseDefinition<Record<string, any>>;
  private readonly dbConfig: any;
  private rawDatabase: string | undefined;
  public storeName = '';

  constructor(wasmLocation: Uint8Array | string, rawDatabase?: string) {
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
    if (rawDatabase) {
      this.rawDatabase = rawDatabase;
    }
  }

  append(tableName: string, primaryKey: string, additions: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async init<T>(storeName: string, schema: SQLiteDatabaseDefinition<T>, encryptionKey: string): Promise<any> {
    this.storeName = storeName;
    this.schema = schema;

    let existingDatabase: Uint8Array | undefined = undefined;
    if (this.rawDatabase) {
      existingDatabase = await this.load(this.rawDatabase);
      this.rawDatabase = undefined;
    }

    const SQL = await initSqlJs(this.dbConfig);
    this.db = new SQL.Database(existingDatabase);

    // Settings
    this.db.run('PRAGMA encoding="UTF-8";');
    this.db.run(`PRAGMA key=${escape(encryptionKey)};`);
    // Remove traces of encryption key
    encryptionKey = '';

    // Create tables
    let statement: string = '';
    for (const tableName in this.schema) {
      const columns = this.schema[tableName];
      statement += createTableIfNotExists(tableName, columns);
    }
    this.db.run(statement);

    return this.db;
  }

  public async export<T>(): Promise<string> {
    if (!this.db) {
      throw new Error('SQLite need to be available');
    }
    const database: Uint8Array = new Uint8Array(this.db.export());
    const strings = [];
    const chunkSize = 0xffff;
    // There is a maximum stack size. We cannot call `String.fromCharCode` with as many arguments as we want
    for (let i = 0; i * chunkSize < database.length; i++) {
      strings[i] = String.fromCharCode.apply(null, <any>database.subarray(i * chunkSize, (i + 1) * chunkSize));
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
    // Databases must be closed, when you're finished with them, or the memory consumption will grow forever.
    if (this.db) {
      this.db.close();
    }
    this.db = null;
    this.rawDatabase = undefined;
  }

  private buildValues(
    tableName: string,
    entity: Record<string, any>
  ): {columns: string[]; values: Record<string, any>} {
    const columns = Object.keys(entity).filter(column => {
      // Ensure the column name exists to avoid SQL injection
      return this.schema[tableName] && typeof this.schema[tableName][column] !== 'undefined';
    });
    if (columns.length === 0) {
      throw new Error(
        `Entity is empty for table "${tableName}". Are you sure you set the right scheme / column names?`
      );
    }
    const values: Record<string, any> = {};
    for (const columnIndex in columns) {
      const column = columns[columnIndex];
      let value: any = entity[column];
      // Stringify objects for the database
      if (this.schema[tableName][column] === SQLiteType.TEXT && typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      values[`@${column}`] = value;
    }
    return {columns, values};
  }

  async create<T>(tableName: string, primaryKey: string, entity: Record<string, any>): Promise<string> {
    if (!entity) {
      const message = `Record "${primaryKey}" cannot be saved in "${tableName}" because it's "undefined" or "null".`;
      throw new RecordTypeError(message);
    }
    const {columns, values} = this.buildValues(tableName, entity);
    const statement = `INSERT INTO ${escapeTableName(tableName)} (key,${columns.join(
      ','
    )}) VALUES (@primaryKey,${Object.keys(values).join(',')});`;
    try {
      this.db.run(statement, {
        ...values,
        '@primaryKey': primaryKey,
      });
    } catch (error) {
      if (error.message.startsWith(`UNIQUE constraint failed: `)) {
        const message = `Record "${primaryKey}" already exists in "${tableName}". You need to delete the record first if you want to overwrite it.`;
        throw new RecordAlreadyExistsError(message);
      } else {
        throw error;
      }
    }
    return primaryKey;
  }

  async delete(tableName: string, primaryKey: string): Promise<string> {
    const statement = `DELETE FROM ${escapeTableName(tableName)} WHERE key=@primaryKey;`;
    this.db.run(statement, {
      '@primaryKey': primaryKey,
    });
    return primaryKey;
  }

  async deleteAll(tableName: string): Promise<boolean> {
    const statement = `DELETE FROM ${escapeTableName(tableName)}`;
    this.db.run(statement);
    return true;
  }

  async read<T>(tableName: string, primaryKey: string): Promise<T> {
    const columns = Object.keys(this.schema[tableName]).join(',');
    const selectRecordStatement = `SELECT ${columns} FROM ${escapeTableName(tableName)} WHERE key = @primaryKey;`;

    const statement = this.db.prepare(selectRecordStatement);
    const record = statement.getAsObject({
      '@primaryKey': primaryKey,
    });
    statement.free();

    if (Object.keys(record).length === 0) {
      const message = `Record "${primaryKey}" in "${tableName}" could not be found.`;
      throw new RecordNotFoundError(message);
    }

    for (const value in record) {
      if (typeof value === 'string') {
        try {
          record[value] = JSON.parse(record[value]);
        } catch (error) {}
      }
    }

    return record;
  }

  readAll<T>(tableName: string): Promise<T[]> {
    const columns = Object.keys(this.schema[tableName]).join(',');
    const selectRecordStatement = `SELECT key, ${columns} FROM ${escapeTableName(tableName)};`;
    const records = this.db.exec(selectRecordStatement);
    return records[0].values;
  }

  async readAllPrimaryKeys(tableName: string): Promise<string[]> {
    const statement = `SELECT key FROM ${escapeTableName(tableName)};`;
    const record = this.db.exec(statement);
    if (record[0] && record[0].values) {
      return record[0].values.map((value: string[]) => value[0]);
    }
    return [];
  }

  async update(tableName: string, primaryKey: string, changes: Record<string, any>): Promise<string> {
    await this.read(tableName, primaryKey);
    const {columns, values} = this.buildValues(tableName, changes);
    const newValues = columns.map(column => `${column}=@${column}`);
    const statement = `UPDATE ${escapeTableName(tableName)} SET ${newValues.join(',')} WHERE key=@primaryKey;`;
    this.db.run(statement, {
      ...values,
      '@primaryKey': primaryKey,
    });

    return primaryKey;
  }

  async updateOrCreate<T>(tableName: string, primaryKey: string, changes: Record<string, any>): Promise<string> {
    try {
      await this.update(tableName, primaryKey, changes);
    } catch (error) {
      if (error instanceof RecordNotFoundError) {
        await this.create(tableName, primaryKey, changes);
      } else {
        throw error;
      }
    }
    return primaryKey;
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
    throw new UnsupportedError('WebAssembly is not supported');
  }
}
