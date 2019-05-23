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

import {SQLiteType, createTableIfNotExists, mapPropertiesToColumns} from './SchemaConverter';

describe('SchemaConverter', () => {
  describe('mapPropertiesToColumns', () => {
    it('can be used to create a schema from a payload', () => {
      const user = {
        age: 170,
        favoriteShows: ['Futurama', 'Gigantor', 'Mr. Robot'],
        hometown: 'localhost',
        isRobot: true,
        lastSeen: new Date(),
        name: 'Otto',
      };

      const userColumns = mapPropertiesToColumns(user);
      expect(userColumns.age).toBe('real');

      const statement = createTableIfNotExists('user', userColumns);
      const expected =
        'CREATE TABLE IF NOT EXISTS user (key text,age real,favoriteShows text,hometown text,isRobot boolean,lastSeen datetime,name text);';
      expect(statement).toBe(expected);
    });
  });

  describe('createTableIfNotExists', () => {
    it('constructs a string to create a table', () => {
      const statement = createTableIfNotExists('prekeys', {
        created: SQLiteType.REAL,
        id: SQLiteType.TEXT,
        serialised: SQLiteType.TEXT,
        version: SQLiteType.TEXT,
      });

      const expected =
        'CREATE TABLE IF NOT EXISTS prekeys (key text,created real,id text,serialised text,version text);';
      expect(statement).toBe(expected);
    });
  });
});
