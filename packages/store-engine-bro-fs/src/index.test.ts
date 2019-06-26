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
import {createSpec} from '@wireapp/store-engine/dist/commonjs/test/createSpec';
import * as fs from 'bro-fs';
import {FileSystemEngine} from './index';

describe('FileSystemEngine', () => {
  const STORE_NAME = 'store-name';

  let engine: CRUDEngine;

  async function initEngine(shouldCreateNewEngine = true): Promise<FileSystemEngine | CRUDEngine> {
    const storeEngine = shouldCreateNewEngine ? new FileSystemEngine() : engine;
    await storeEngine.init(STORE_NAME);
    return storeEngine;
  }

  beforeEach(async () => {
    engine = await initEngine();
  });

  afterEach(() => fs.rmdir(STORE_NAME));

  describe('init', () => {
    it('resolves with a browser-specific URL to the filesystem.', async () => {
      const fileSystem = await engine.init('test-store');
      expect(fileSystem.root.toURL().startsWith('filesystem:')).toBe(true);
    });
  });

  describe('append', () => {
    Object.entries(appendSpec).map(([description, testFunction]) => {
      it(description, () => testFunction(engine));
    });
  });

  describe('create', () => {
    Object.entries(createSpec).map(([description, testFunction]) => {
      it(description, () => testFunction(engine));
    });
  });
});
