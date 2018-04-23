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

import {FileSystemEngine} from '@wireapp/store-engine';

describe('FileSystemEngine', () => {
  const STORE_NAME = 'store-name';

  let engine = undefined;

  async function initEngine() {
    const storeEngine = new FileSystemEngine();
    await storeEngine.init(STORE_NAME);
    return storeEngine;
  }

  beforeEach(async done => {
    engine = await initEngine();
    done();
  });

  describe('"init"', () => {
    it('resolves with a browser-specific URL to the filesystem.', async done => {
      const fileSystem = await engine.init();
      expect(fileSystem.root.toURL().startsWith('filesystem:')).toBe(true);
      done();
    });
  });

  describe('"create"', () => {
    Object.entries(require('../../test/shared/create')).map(([description, testFunction]) => {
      it(description, done => testFunction(done, engine));
    });
  });
});
