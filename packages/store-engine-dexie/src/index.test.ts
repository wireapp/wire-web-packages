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
import {appendSpec} from '@wireapp/store-engine/dist/commonjs/test/appendSpec';
import Dexie from 'dexie';
import {IndexedDBEngine} from './index';

describe('IndexedDBEngine', () => {
  const STORE_NAME = 'store-name';

  let engine: CRUDEngine;

  async function initEngine(shouldCreateNewEngine = true): Promise<IndexedDBEngine | CRUDEngine> {
    const storeEngine = shouldCreateNewEngine ? new IndexedDBEngine() : engine;
    const db = await storeEngine.init(STORE_NAME);
    db.version(1).stores({
      'the-simpsons': ',firstName,lastName',
    });
    await db.open();
    return storeEngine;
  }

  beforeEach(async () => {
    engine = await initEngine();
  });

  afterEach(done => {
    if (engine && engine.db) {
      engine.db.close();
      const deleteRequest = window.indexedDB.deleteDatabase(STORE_NAME);
      deleteRequest.onsuccess = () => done();
    }
  });

  describe('init', () => {
    it('resolves with the database instance to which the records will be saved.', async () => {
      engine = new IndexedDBEngine();
      const instance = await engine.init(STORE_NAME);
      expect(instance instanceof Dexie).toBe(true);
    });
  });

  describe('append', () => {
    Object.entries(appendSpec).map(([description, testFunction]) => {
      it(description, () => testFunction(engine));
    });
  });
});
