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

import {Decoder} from 'bazinga64';
import {SQLeetEngine} from './index';
import {SQLiteDatabaseDefinition, SQLiteType} from './SchemaConverter';
import {SQLeetWebAssembly} from './SQLeet';

interface DBRecord {
  age?: number;
  name: string;
}

const webAssembly = Decoder.fromBase64(SQLeetWebAssembly).asBytes;

describe('"create"', () => {
  it('saves a record to the database', async () => {
    const schema: SQLiteDatabaseDefinition<DBRecord> = {
      users: {
        name: SQLiteType.TEXT,
      },
    };

    const engine = new SQLeetEngine(webAssembly);
    await engine.init('', schema);
    await engine.create<DBRecord>('users', '1', {name: 'Otto'});
    const result = await engine.read<DBRecord>('users', '1');
    expect(result.name).toBe('Otto');
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
    await engine.init('', schema);
    await engine.create<DBRecord>('users', '1', {name: 'Otto', age: 1});
    const result = await engine.read<DBRecord>('users', '1');
    expect(result.name).toBe('Otto');
    await engine.update('users', '1', {name: 'Hans', age: 2});
    const changedResult = await engine.read<DBRecord>('users', '1');
    expect(changedResult.age).toBe(2);
    expect(changedResult.name).toBe('Hans');
  });
});

describe('"save"', () => {
  it('save and load a database', async () => {
    const schema: SQLiteDatabaseDefinition<DBRecord> = {
      users: {
        age: SQLiteType.INTEGER,
        name: SQLiteType.TEXT,
      },
    };

    const storeName = 'wire@production@52c607b1-4362-4b7b-bcb4-5bff6154f8e2@permanent';
    const encryptionKey = 'wire';

    const engine = new SQLeetEngine(webAssembly);
    await engine.init(storeName, schema, encryptionKey, true);
    await engine.create<DBRecord>('users', '1', {name: 'Otto', age: 1});
    await engine.save();
    await engine.purge();
    await engine.init(storeName, schema, encryptionKey, true);
    const result = await engine.read<DBRecord>('users', '1');
    expect(result.age).toBe(1);
    expect(result.name).toBe('Otto');
  });
});
