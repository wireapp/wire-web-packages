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

const fs = require('fs-extra');
const path = require('path');
const {error: StoreEngineError, FileEngine} = require('@wireapp/store-engine');

describe('FileEngine', () => {
  const STORE_NAME = 'store-name';
  const TABLE_NAME = 'the-simpsons';

  const TEST_DIRECTORY = path.join(process.cwd(), '.tmp', STORE_NAME);
  let engine = undefined;

  async function initEngine(shouldCreateNewEngine = true) {
    const storeEngine = shouldCreateNewEngine ? new FileEngine() : engine;
    await storeEngine.init(TEST_DIRECTORY);
    return storeEngine;
  }

  beforeEach(async done => {
    engine = await initEngine();
    done();
  });

  afterEach(done =>
    fs
      .remove(TEST_DIRECTORY)
      .then(done)
      .catch(done.fail));

  describe('"checkPathTraversal"', () => {
    it('allows dots inside of primary keys.', () => {
      const tableName = 'amplify';
      const primaryKey = 'z.storage.StorageKey.EVENT.LAST_DATE';
      const actual = FileEngine.checkPathTraversal(tableName, primaryKey);
      expect(actual).toBeUndefined();
    });

    it('allows empty strings.', () => {
      const tableName = 'amplify';
      const primaryKey = '';
      const actual = FileEngine.checkPathTraversal(tableName, primaryKey);
      expect(actual).toBeUndefined();
    });

    it('throws errors on path traversals.', () => {
      const checkPathTraversal = (...testPaths) => () => FileEngine.checkPathTraversal(...testPaths);
      const error = StoreEngineError.PathValidationError;
      expect(checkPathTraversal('../etc', 'a')).toThrowError(error);
      expect(checkPathTraversal('..\\etc', 'a')).toThrowError(error);
      expect(checkPathTraversal('a', '../etc')).toThrowError(error);
      expect(checkPathTraversal('a', '..\\etc')).toThrowError(error);
      expect(checkPathTraversal('../etc', 'a')).toThrowError(error);
      expect(checkPathTraversal('\\\\server', 'a')).toThrowError(error);
      expect(checkPathTraversal('users/../', 'tigris')).toThrowError(error);
      expect(checkPathTraversal('users/..', 'tigris')).toThrowError(error);
    });
  });

  describe('"append"', () => {
    Object.entries(require('../../test/shared/append')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"create"', () => {
    Object.entries(require('../../test/shared/create')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });

    it('accepts custom file extensions.', async done => {
      const options = {
        fileExtension: '.json',
      };
      engine = new FileEngine();
      await engine.init(STORE_NAME, options);

      expect(engine.options.fileExtension).toBe(options.fileExtension);
      done();
    });

    it('does not work when non-printable characters are being used in the store name.', async done => {
      await engine.init(path.join(process.cwd(), '.tmp', 'wrong\t'));

      const PRIMARY_KEY = 'primary-key';

      const entity = {
        some: 'value',
      };

      engine
        .create(TABLE_NAME, PRIMARY_KEY, entity)
        .then(() => done.fail(new Error('Method is supposed to throw an error.')))
        .catch(error => {
          expect(error instanceof StoreEngineError.PathValidationError).toBe(true);
          done();
        });
    });
  });

  describe('"delete"', () => {
    Object.entries(require('../../test/shared/delete')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"deleteAll"', () => {
    Object.entries(require('../../test/shared/deleteAll')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"purge"', () => {
    Object.entries(require('../../test/shared/purge')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine, initEngine));
    });
  });

  describe('"read"', () => {
    Object.entries(require('../../test/shared/read')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"readAll"', () => {
    Object.entries(require('../../test/shared/readAll')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"readAllPrimaryKeys"', () => {
    Object.entries(require('../../test/shared/readAllPrimaryKeys')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"update"', () => {
    Object.entries(require('../../test/shared/update')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });

  describe('"updateOrCreate"', () => {
    Object.entries(require('../../test/shared/updateOrCreate')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });
});
