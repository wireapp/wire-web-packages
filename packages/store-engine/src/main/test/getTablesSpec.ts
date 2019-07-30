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

import {CRUDEngine} from '../engine';

const TABLE_SIMPSONS = 'the-simpsons';
const TABLE_MICKEY = 'mickey-mouse';
const TABLE_SPONGEBOB = 'spongebob';

export const getTablesSpec = {
  'gets all tables.': async (engine: CRUDEngine) => {
    const homer = {
      entity: {
        firstName: 'Homer',
        lastName: 'Simpson',
      },
      primaryKey: 'homer-simpson',
    };

    const lisa = {
      entity: {
        firstName: 'Lisa',
        lastName: 'Simpson',
      },
      primaryKey: 'lisa-simpson',
    };

    const marge = {
      entity: {
        firstName: 'Marge',
        lastName: 'Simpson',
      },
      primaryKey: 'marge-simpson',
    };

    await engine.create(TABLE_SIMPSONS, homer.primaryKey, homer.entity);
    await engine.create(TABLE_MICKEY, lisa.primaryKey, lisa.entity);
    await engine.create(TABLE_SPONGEBOB, marge.primaryKey, marge.entity);
    const tables = await engine.getTables([TABLE_SIMPSONS, TABLE_MICKEY, TABLE_SPONGEBOB]);
    expect(tables.length).toBe(3);
    expect(tables).toEqual(jasmine.arrayContaining([homer.entity, lisa.entity, marge.entity]));
  },
};
