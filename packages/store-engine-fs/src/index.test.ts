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

import {PathValidationError} from '@wireapp/store-engine/dist/commonjs/engine/error';
import * as fs from 'fs-extra';
import * as path from 'path';
import {FileEngine} from './index';

const BASE_DIRECTORY = path.join(process.cwd(), '.tmp');
const STORE_NAME = 'the-simpsons';
const TEST_DIRECTORY = path.join(BASE_DIRECTORY, STORE_NAME);

let engine: FileEngine;

async function initEngine(shouldCreateNewEngine = true): Promise<FileEngine> {
  const storeEngine = shouldCreateNewEngine ? new FileEngine(BASE_DIRECTORY) : engine;
  await storeEngine.init(STORE_NAME);
  return storeEngine;
}

beforeEach(async done => {
  FileEngine.path = path;
  engine = await initEngine();
  done();
});

afterEach(done =>
  fs
    .remove(TEST_DIRECTORY)
    .then(done)
    .catch(done.fail)
);

describe('enforcePathRestrictions', () => {
  const enforcePathRestrictions = (givenTrustedRoot: string, givenPath: string) => () =>
    FileEngine.enforcePathRestrictions(givenTrustedRoot, givenPath);
  const expectedError = PathValidationError;
  const unixFolder = '/home/marge/test/';
  const windowsFolder = 'C:\\Users\\bart\\Documents\\Database\\';

  it('allows dots inside of primary keys.', () => {
    const tableName = 'amplify';
    const primaryKey = 'z.storage.StorageKey.EVENT.LAST_DATE';

    FileEngine.path = path.posix;
    const actual = FileEngine.enforcePathRestrictions(FileEngine.path.join(unixFolder, tableName), primaryKey);
    expect(actual).toBeDefined();
  });

  it('allows slashes inside of primary keys as long as they do not navigate outside of the base folder.', () => {
    FileEngine.path = path.posix;
    expect(FileEngine.enforcePathRestrictions(unixFolder, 'users/..')).toBeDefined();
    expect(FileEngine.enforcePathRestrictions(unixFolder, 'users/../')).toBeDefined();
    expect(FileEngine.enforcePathRestrictions(unixFolder, 'users/../sandbox')).toBeDefined();
    expect(FileEngine.enforcePathRestrictions(unixFolder, 'users/me')).toBeDefined();
    expect(FileEngine.enforcePathRestrictions(unixFolder, 'a/b/c/d/e/f/g/../../../../ok')).toBeDefined();
    expect(FileEngine.enforcePathRestrictions(unixFolder, 'a/b/c/../../../')).toBeDefined();
    expect(enforcePathRestrictions(unixFolder, 'a/b/c/../../../../')).toThrowError(expectedError);
  });

  it('allows empty strings.', () => {
    const tableName = 'amplify';
    const primaryKey = '';

    FileEngine.path = path.posix;
    const actual = FileEngine.enforcePathRestrictions(FileEngine.path.join(unixFolder, tableName), primaryKey);
    expect(actual).toBeDefined();
  });

  it('throws errors on path traversals.', () => {
    FileEngine.path = path.win32;
    expect(enforcePathRestrictions(windowsFolder, 'malicious\\..\\..\\test\\..\\..')).toThrowError(expectedError);
    expect(enforcePathRestrictions(windowsFolder, '\\malicious\\..\\\\..entry\\..\\..')).toThrowError(expectedError);
    expect(enforcePathRestrictions(windowsFolder, 'malicious\\..\\entry\\..\\..')).toThrowError(expectedError);
    expect(enforcePathRestrictions(windowsFolder, '\\\\server\\..\\..\\..')).toThrowError(expectedError);
    expect(enforcePathRestrictions(windowsFolder, 'malicious\\..\\..\\entry\\..\\')).toThrowError(expectedError);
    expect(enforcePathRestrictions(windowsFolder, '..\\etc')).toThrowError(expectedError);

    FileEngine.path = path.posix;
    expect(enforcePathRestrictions(unixFolder, '../etc')).toThrowError(expectedError);
    expect(enforcePathRestrictions(unixFolder, '/malicious/../../../entry/../test')).toThrowError(expectedError);
    expect(enforcePathRestrictions(unixFolder, 'malicious/../../../entry/..')).toThrowError(expectedError);
    expect(enforcePathRestrictions(unixFolder, 'documents/../../../../../etc/hosts')).toThrowError(expectedError);
    expect(enforcePathRestrictions(unixFolder, 'malicious/../../../entry/../')).toThrowError(expectedError);
    expect(enforcePathRestrictions(unixFolder, '../etc')).toThrowError(expectedError);
    expect(enforcePathRestrictions(unixFolder, 'users/../../tigris')).toThrowError(expectedError);
    expect(enforcePathRestrictions(unixFolder, 'users/../tigris/../../')).toThrowError(expectedError);
  });

  it('throws errors when attempting to use the root folder as a trusted root.', () => {
    FileEngine.path = path.posix;
    expect(enforcePathRestrictions('/', 'etc/hosts')).toThrowError(expectedError);

    FileEngine.path = path.win32;
    expect(enforcePathRestrictions('C:/', '\\Windows\\System32\\drivers\\etc\\hosts')).toThrowError(expectedError);
  });

  it('is applied to all store operations.', async done => {
    const functionNames = [
      'append',
      'create',
      'delete',
      'deleteAll',
      'read',
      'readAll',
      'readAllPrimaryKeys',
      'update',
      'updateOrCreate',
    ];

    for (const operation of functionNames) {
      try {
        await engine[operation]('../etc', 'primary-key', {});
        done.fail();
      } catch (error) {
        expect(error instanceof expectedError).toBe(true);
      }
    }
    done();
  });
});
