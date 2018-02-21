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

const {StoreEngine} = require('@wireapp/store-engine');

describe('StoreEngine.MemoryEngine', () => {
  const STORE_NAME = 'store-name';
  let engine = undefined;

  beforeEach(async done => {
    engine = new StoreEngine.MemoryEngine();
    await engine.init(STORE_NAME);
    done();
  });

  describe('"create"', () => {
    Object.entries(require('./../../../shared/create')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"delete"', () => {
    Object.entries(require('./../../../shared/delete')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"deleteAll"', () => {
    Object.entries(require('./../../../shared/deleteAll')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"read"', () => {
    Object.entries(require('./../../../shared/read')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"readAll"', () => {
    Object.entries(require('./../../../shared/readAll')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"readAllPrimaryKeys"', () => {
    Object.entries(require('./../../../shared/readAllPrimaryKeys')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"update"', () => {
    Object.entries(require('./../../../shared/update')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });
});
