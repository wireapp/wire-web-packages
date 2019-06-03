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

import {DexieInstance, IndexedDBEngine} from '@wireapp/store-engine/dist/commonjs/engine/IndexedDBEngine';
import {Decoder} from 'bazinga64';
import {SQLeetEngine} from './index';
import {SQLiteDatabaseDefinition, SQLiteType} from './SchemaConverter';
import {SQLeetWebAssembly} from './SQLeet';

interface DBRecord {
  age?: number;
  name: string;
}

const webAssembly = Decoder.fromBase64(SQLeetWebAssembly).asBytes;
const GENERIC_ENCRYPTION_KEY = 'test';

describe('"create"', () => {
  it('saves a record to the database', async () => {
    const schema: SQLiteDatabaseDefinition<DBRecord> = {
      users: {
        name: SQLiteType.TEXT,
      },
    };

    const engine = new SQLeetEngine(webAssembly);
    await engine.init('', schema, GENERIC_ENCRYPTION_KEY);
    await engine.create<DBRecord>('users', '1', {name: 'Otto'});
    const result = await engine.read<DBRecord>('users', '1');
    expect(result.name).toBe('Otto');
  });
});

describe('"readAll"', () => {
  it('can read a set of records in the database', async () => {
    const schema: SQLiteDatabaseDefinition<DBRecord> = {
      users: {
        name: SQLiteType.TEXT,
      },
    };

    const engine = new SQLeetEngine(webAssembly);
    await engine.init('', schema, GENERIC_ENCRYPTION_KEY);

    const RECORDS_COUNT = 100;
    for (let i = 0; i < RECORDS_COUNT; i++) {
      await engine.create<DBRecord>('users', i.toString(), {name: 'Lion'});
    }
    const results = await engine.readAll<DBRecord>('users');
    expect(results.length).toBe(RECORDS_COUNT);
  });
});

describe('"updateOrCreate"', () => {
  it('create then update a record to the database', async () => {
    const schema: SQLiteDatabaseDefinition<DBRecord> = {
      users: {
        name: SQLiteType.TEXT,
      },
    };

    const engine = new SQLeetEngine(webAssembly);
    await engine.init('', schema, GENERIC_ENCRYPTION_KEY);
    await engine.updateOrCreate<DBRecord>('users', '1', {name: 'Otto'});
    await engine.updateOrCreate<DBRecord>('users', '1', {name: 'Lion'});
    const result = await engine.read<DBRecord>('users', '1');
    expect(result.name).toBe('Lion');
  });
});

describe('"update"', () => {
  it('updates a record in the database', async () => {
    const schema: SQLiteDatabaseDefinition<DBRecord> = {
      users: {
        age: SQLiteType.INTEGER,
        name: SQLiteType.TEXT,
      },
    };

    const engine = new SQLeetEngine(webAssembly);
    await engine.init('', schema, GENERIC_ENCRYPTION_KEY);
    await engine.create<DBRecord>('users', '1', {name: 'Otto', age: 1});
    const result = await engine.read<DBRecord>('users', '1');
    expect(result.name).toBe('Otto');
    await engine.update('users', '1', {name: 'Hans', age: 2});
    const changedResult = await engine.read<DBRecord>('users', '1');
    expect(changedResult.age).toBe(2);
    expect(changedResult.name).toBe('Hans');
  });
});

describe('"export"', () => {
  it('export and load a database', async () => {
    const schema: SQLiteDatabaseDefinition<DBRecord> = {
      users: {
        age: SQLiteType.INTEGER,
        name: SQLiteType.TEXT,
      },
    };

    const storeName = 'wire@production@52c607b1-4362-4b7b-bcb4-5bff6154f8e2@permanent';
    const encryptionKey = 'wire';
    const primaryKeyName = 'database';

    const indexedDB = new IndexedDBEngine();
    const indexedDBInstance = await indexedDB.init(this.storeName);
    indexedDBInstance.version(1).stores({[this.storeName]: ''});
    await indexedDBInstance.open();

    const engine = new SQLeetEngine(webAssembly);

    // Write and save
    await engine.init(storeName, schema, encryptionKey);
    await engine.create<DBRecord>('users', '1', {name: 'Otto', age: 1});
    await indexedDB.updateOrCreate(this.storeName, primaryKeyName, await engine.export());

    // Import and read
    const savedDatabase = await indexedDB.read<string>(this.storeName, primaryKeyName);
    const engineNew = new SQLeetEngine(webAssembly, savedDatabase);
    await engineNew.init(storeName, schema, encryptionKey);
    const result = await engineNew.read<DBRecord>('users', '1');

    expect(result.age).toBe(1);
    expect(result.name).toBe('Otto');
  });
});
