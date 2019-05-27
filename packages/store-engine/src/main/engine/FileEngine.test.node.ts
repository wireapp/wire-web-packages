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

import * as fs from 'fs-extra';
import * as path from 'path';

import {FileEngine} from '../engine';
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

describe('init', () => {
  it('resolves with the directory to which the records will be saved.', async () => {
    const options = {
      fileExtension: '.json',
    };
    engine = new FileEngine(BASE_DIRECTORY);
    const directory = await engine.init(STORE_NAME, options);
    const fileStatus = fs.statSync(directory);
    expect(fileStatus.isDirectory()).toBe(true);
  });
});

describe('append', () => {
  Object.entries(appendSpec).map(([description, testFunction]) => {
    it(description, done => testFunction(done, engine));
  });
});

describe('create', () => {
  describe('create', () => {
    Object.entries(createSpec).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
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
