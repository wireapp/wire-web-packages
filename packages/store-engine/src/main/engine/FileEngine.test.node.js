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
  const BASE_DIRECTORY = path.join(process.cwd(), '.tmp');
  const STORE_NAME = 'the-simpsons';
  const TEST_DIRECTORY = path.join(BASE_DIRECTORY, STORE_NAME);
  let engine = undefined;

  async function initEngine(shouldCreateNewEngine = true) {
    const storeEngine = shouldCreateNewEngine ? new FileEngine(BASE_DIRECTORY) : engine;
    await storeEngine.init(STORE_NAME);
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

  describe('"enforcePathRestrictions"', () => {
    const windowsFolder = 'C:\\Users\\bart\\Documents\\Database\\';
    const unixFolder = '/home/marge/test/';

    it('allows dots inside of primary keys.', () => {
      const tableName = 'amplify';
      const primaryKey = 'z.storage.StorageKey.EVENT.LAST_DATE';
      const actual = FileEngine.enforcePathRestrictions(path.join(unixFolder, tableName), primaryKey);
      expect(actual).toBeString();
    });

    it('allows slashes inside of primary keys.', () => {
      expect(FileEngine.enforcePathRestrictions(unixFolder, 'users/..')).toBeString();
      expect(FileEngine.enforcePathRestrictions(unixFolder, 'users/../')).toBeString();
      expect(FileEngine.enforcePathRestrictions(unixFolder, 'users/../sandbox')).toBeString();
      expect(FileEngine.enforcePathRestrictions(unixFolder, 'users/me')).toBeString();
      expect(FileEngine.enforcePathRestrictions(unixFolder, 'a/b/c/d/e/f/g/../../../../ok')).toBeString();
    });

    it('allows empty strings.', () => {
      const tableName = 'amplify';
      const primaryKey = '';
      const actual = FileEngine.enforcePathRestrictions(path.join(unixFolder, tableName), primaryKey);
      expect(actual).toBeDefined();
    });

    const enforcePathRestrictions = (...opts) => () => FileEngine.enforcePathRestrictions(...opts);
    const error = StoreEngineError.PathValidationError;

    it('throws errors on path traversals.', () => {
      expect(enforcePathRestrictions(windowsFolder, 'malicious\\..\\..\\test\\..\\..', true)).toThrowError(error);
      expect(enforcePathRestrictions(windowsFolder, '\\malicious\\..\\\\..entry\\..\\..', true)).toThrowError(error);
      expect(enforcePathRestrictions(windowsFolder, 'malicious\\..\\entry\\..\\..', true)).toThrowError(error);
      expect(enforcePathRestrictions(windowsFolder, '\\\\server\\..\\..\\..', true)).toThrowError(error);
      expect(enforcePathRestrictions(windowsFolder, 'malicious\\..\\..\\entry\\..\\', true)).toThrowError(error);
      expect(enforcePathRestrictions(windowsFolder, '..\\etc', true)).toThrowError(error);

      expect(enforcePathRestrictions(unixFolder, '../etc')).toThrowError(error);
      expect(enforcePathRestrictions(unixFolder, '/malicious/../../../entry/../test')).toThrowError(error);
      expect(enforcePathRestrictions(unixFolder, 'malicious/../../../entry/..')).toThrowError(error);
      expect(enforcePathRestrictions(unixFolder, 'documents/../../../../../etc/hosts')).toThrowError(error);
      expect(enforcePathRestrictions(unixFolder, 'malicious/../../../entry/../')).toThrowError(error);
      expect(enforcePathRestrictions(unixFolder, '../etc')).toThrowError(error);
      expect(enforcePathRestrictions(unixFolder, 'users/../../tigris')).toThrowError(error);
      expect(enforcePathRestrictions(unixFolder, 'users/../tigris/../../')).toThrowError(error);
    });

    it('throws errors when attempting to use the root folder as a trusted root.', () => {
      expect(enforcePathRestrictions('/', 'etc/hosts')).toThrowError(error);
      expect(enforcePathRestrictions('C:/', '\\Windows\\System32\\drivers\\etc\\hosts', true)).toThrowError(error);
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
      engine = new FileEngine(BASE_DIRECTORY);
      await engine.init(STORE_NAME, options);

      expect(engine.options.fileExtension).toBe(options.fileExtension);
      done();
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
