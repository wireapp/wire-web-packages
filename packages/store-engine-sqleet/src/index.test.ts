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

interface Record {
  name: string;
}

const webAssembly: Uint8Array = Decoder.fromBase64(SQLeetWebAssembly).asBytes;

describe('create', () => {
  it('saves a record to the database', async () => {
    const schema: SQLiteDatabaseDefinition = {
      users: {
        name: SQLiteType.TEXT,
      },
    };

    const engine = new SQLeetEngine(webAssembly);
    await engine.init('', schema);
    await engine.create<Record>('users', '1', {name: 'Otto'});
    const result = await engine.read<Record>('users', '1');
    expect(result.name).toBe('Otto');
  });
});
