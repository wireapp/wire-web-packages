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
import {
  RecordAlreadyExistsError,
  RecordNotFoundError,
  RecordTypeError,
  UnsupportedError,
} from '@wireapp/store-engine/dist/commonjs/engine/error/';
import {
  SQLeetEnginePrimaryKeyName,
  SQLiteDatabaseDefinition,
  SQLiteType,
  createTableIfNotExists,
  escape,
  getFormattedColumnsFromTableName,
} from './SchemaConverter';

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
    await this.isSupported();

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
    this.db.run('PRAGMA `encoding`="UTF-8";');
    this.db.run(`PRAGMA \`key\`=${escape(encryptionKey)};`);
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
    columns: Record<string, SQLiteType>
  ): {columns: Record<string, SQLiteType>; values: Record<string, any>} {
    const table = this.schema[tableName];
    if (!table) {
      throw new Error(`Table "${tableName}" does not exist.`);
    }
    const values: Record<string, any> = {};
    for (const column in columns) {
      // Ensure the column name exists to avoid SQL injection
      if (typeof table[column] !== 'string') {
        delete columns[column];
        continue;
      }
      let value: any = columns[column];
      // Stringify objects for the database
      if (table[column] === SQLiteType.JSON) {
        value = JSON.stringify(value);
      }
      values[`@${column}`] = value;
    }
    if (Object.keys(columns).length === 0) {
      throw new Error(
        `Entity is empty for table "${tableName}". Are you sure you set the right scheme / column names?`
      );
    }
    return {columns, values};
  }

  async create<T>(tableName: string, primaryKey: string, entity: Record<string, any>): Promise<string> {
    if (!entity) {
      const message = `Record "${primaryKey}" cannot be saved in "${tableName}" because it's "undefined" or "null".`;
      throw new RecordTypeError(message);
    }
    const {columns, values} = this.buildValues(tableName, entity);
    const newValues = Object.keys(values).join(',');
    const escapedTableName = escape(tableName);
    const statement = `INSERT INTO ${escapedTableName} (${getFormattedColumnsFromTableName(
      columns,
      true
    )}) VALUES (@primaryKey,${newValues});`;
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
    const escapedTableName = escape(tableName);
    const statement = `DELETE FROM ${escapedTableName} WHERE ${SQLeetEnginePrimaryKeyName}=@primaryKey;`;
    this.db.run(statement, {
      '@primaryKey': primaryKey,
    });
    return primaryKey;
  }

  async deleteAll(tableName: string): Promise<boolean> {
    const escapedTableName = escape(tableName);
    const statement = `DELETE FROM ${escapedTableName}`;
    this.db.run(statement);
    return true;
  }

  async read<T>(tableName: string, primaryKey: string): Promise<T> {
    const table = this.schema[tableName];
    if (!table) {
      throw new Error('Table does not exist');
    }
    const columns = getFormattedColumnsFromTableName(table);
    const escapedTableName = escape(tableName);
    const selectRecordStatement = `SELECT ${columns} FROM ${escapedTableName} WHERE ${SQLeetEnginePrimaryKeyName}=@primaryKey;`;
    const statement = this.db.prepare(selectRecordStatement);
    const record = statement.getAsObject({
      '@primaryKey': primaryKey,
    });
    statement.free();

    if (Object.keys(record).length === 0) {
      const message = `Record "${primaryKey}" in "${tableName}" could not be found.`;
      throw new RecordNotFoundError(message);
    }

    for (const column in record) {
      if (this.schema[tableName][column] === SQLiteType.JSON) {
        record[column] = JSON.parse(record[column]);
      }
    }

    return record;
  }

  readAll<T>(tableName: string): Promise<T[]> {
    const columns = getFormattedColumnsFromTableName(this.schema[tableName], true);
    const escapedTableName = escape(tableName);
    const selectRecordStatement = `SELECT ${columns} FROM ${escapedTableName};`;
    const records = this.db.exec(selectRecordStatement);
    return records[0].values;
  }

  async readAllPrimaryKeys(tableName: string): Promise<string[]> {
    const escapedTableName = escape(tableName);
    const statement = `SELECT ${SQLeetEnginePrimaryKeyName} FROM ${escapedTableName};`;
    const record = this.db.exec(statement);
    if (record[0] && record[0].values) {
      return record[0].values.map((value: string[]) => value[0]);
    }
    return [];
  }

  async update(tableName: string, primaryKey: string, changes: Record<string, any>): Promise<string> {
    await this.read(tableName, primaryKey);
    const {columns, values} = this.buildValues(tableName, changes);
    const newValues = Object.keys(columns)
      .map(column => `${escape(column)}=@${column}`)
      .join(',');
    const statement = `UPDATE ${escape(tableName)} SET ${newValues} WHERE ${SQLeetEnginePrimaryKeyName}=@primaryKey;`;
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
      const isRecordNotFound = error instanceof RecordNotFoundError;
      if (isRecordNotFound) {
        await this.create(tableName, primaryKey, changes);
      } else {
        throw error;
      }
    }
    return primaryKey;
  }

  async isSupported(checkAgainst = window): Promise<void> {
    const webAssembly = checkAgainst.WebAssembly;
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
