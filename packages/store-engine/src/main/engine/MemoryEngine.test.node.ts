/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
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

import append from '../../test/append';
import CRUDEngine from './CRUDEngine';
import MemoryEngine from './MemoryEngine';

describe('MemoryEngine', () => {
  const STORE_NAME = 'store-name';

  let engine: CRUDEngine;

  async function initEngine(shouldCreateNewEngine = true) {
    const storeEngine = shouldCreateNewEngine ? new MemoryEngine() : engine;
    await storeEngine.init(STORE_NAME);
    return storeEngine;
  }

  beforeEach(async done => {
    engine = await initEngine();
    done();
  });

  describe('init', () => {
    it('resolves with direct access to the complete in-memory store.', async () => {
      engine = new MemoryEngine();
      const inMemory = await engine.init(STORE_NAME);
      expect(inMemory[STORE_NAME]).toBeDefined();
    });
  });

  describe('append', () => {
    Object.entries(append).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });
});
