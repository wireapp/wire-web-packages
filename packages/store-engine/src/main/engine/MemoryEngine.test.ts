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

import {appendSpec} from '../test/appendSpec';
import {createSpec} from '../test/createSpec';
import {deleteAllSpec} from '../test/deleteAllSpec';
import {deleteSpec} from '../test/deleteSpec';
import {purgeSpec} from '../test/purgeSpec';
import {readAllPrimaryKeysSpec} from '../test/readAllPrimaryKeysSpec';
import {readAllSpec} from '../test/readAllSpec';
import {readSpec} from '../test/readSpec';
import {updateOrCreateSpec} from '../test/updateOrCreateSpec';
import {updateSpec} from '../test/updateSpec';
import {CRUDEngine} from './CRUDEngine';
import {MemoryEngine} from './MemoryEngine';

const STORE_NAME = 'store-name';

let engine: CRUDEngine;

async function initEngine(shouldCreateNewEngine = true): Promise<MemoryEngine | CRUDEngine> {
  const storeEngine = shouldCreateNewEngine ? new MemoryEngine() : engine;
  await storeEngine.init(STORE_NAME);
  return storeEngine;
}

describe('MemoryEngine', () => {
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
    Object.entries(appendSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('create', () => {
    Object.entries(createSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('delete', () => {
    Object.entries(deleteSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('deleteAll', () => {
    Object.entries(deleteAllSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('purge', () => {
    Object.entries(purgeSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine, initEngine));
    });
  });

  describe('readAllPrimaryKeys', () => {
    Object.entries(readAllPrimaryKeysSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('readAll', () => {
    Object.entries(readAllSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('read', () => {
    Object.entries(readSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('updateOrCreate', () => {
    Object.entries(updateOrCreateSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('update', () => {
    Object.entries(updateSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });
});
