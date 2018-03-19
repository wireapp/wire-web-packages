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

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

import {FileSystemEngine} from '@wireapp/store-engine';

describe('FileSystemEngine', () => {
  describe('"constructor"', () => {
    it('has access to "window.requestFileSystem"', done => {
      if (window.requestFileSystem) {
        done();
      } else {
        done.fail(
          new Error(
            '"FileSystem API" in Chrome is not enabled. Read more: http://blog.teamtreehouse.com/building-an-html5-text-editor-with-the-filesystem-apis'
          )
        );
      }
    });
  });

  describe('"init"', () => {
    it('resolves with a browser-specific URL to the filesystem.', async done => {
      const engine = new FileSystemEngine();
      const url = await engine.init();
      expect(url.startsWith('filesystem:')).toBe(true);
      done();
    });
  });
});
