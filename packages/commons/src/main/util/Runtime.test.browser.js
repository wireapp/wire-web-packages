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

import * as platform from 'platform';
import {Runtime} from '@wireapp/commons';

describe('Runtime', () => {
  describe('"isAndroid"', () => {
    it('knows if running on Android', () => {
      spyOn(Runtime, 'getOS').and.returnValue({family: 'Android'});
      expect(Runtime.isAndroid()).toEqual(true);
      expect(Runtime.isIOS()).toEqual(false);
      expect(Runtime.isMobileOS()).toEqual(true);
    });
  });

  describe('"isChrome"', () => {
    it('knows if running in Chrome', () => {
      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
      spyOn(Runtime, 'getPlatform').and.returnValue(platform.parse(userAgent));
      expect(Runtime.isChrome()).toEqual(true);
      expect(Runtime.isEdge()).toEqual(false);
      expect(Runtime.isFirefox()).toEqual(false);
      expect(Runtime.isInternetExplorer()).toEqual(false);
      expect(Runtime.isOpera()).toEqual(false);
      expect(Runtime.isSafari()).toEqual(false);
    });
  });

  describe('"isElectron"', () => {
    it('knows if running in Electron', () => {
      const userAgent =
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Electron/0.37.5 Safari/537.36';
      spyOn(Runtime, 'getPlatform').and.returnValue(platform.parse(userAgent));
      expect(Runtime.isElectron()).toEqual(true);
    });
  });

  describe('"isIOS"', () => {
    it('knows if running on iOS', () => {
      spyOn(Runtime, 'getOS').and.returnValue({family: 'iOS'});
      expect(Runtime.isAndroid()).toEqual(false);
      expect(Runtime.isIOS()).toEqual(true);
      expect(Runtime.isMobileOS()).toEqual(true);
    });
  });

  describe('"isLinux"', () => {
    it('detects pure Linux', () => {
      spyOn(Runtime, 'getOS').and.returnValue({family: 'Linux'});
      expect(Runtime.isLinux()).toEqual(true);
      expect(Runtime.isMacOS()).toEqual(false);
      expect(Runtime.isWindows()).toEqual(false);
    });

    it('detects Debian', () => {
      spyOn(Runtime, 'getOS').and.returnValue({family: 'Debian'});
      expect(Runtime.isLinux()).toEqual(true);
    });

    it('detects Fedora', () => {
      spyOn(Runtime, 'getOS').and.returnValue({family: 'Fedora'});
      expect(Runtime.isLinux()).toEqual(true);
    });

    it('detects Ubuntu', () => {
      spyOn(Runtime, 'getOS').and.returnValue({family: 'Ubuntu'});
      expect(Runtime.isLinux()).toEqual(true);
    });
  });

  describe('"isMacOS"', () => {
    it('detects OS X', () => {
      spyOn(Runtime, 'getOS').and.returnValue({family: 'OS X'});
      expect(Runtime.isLinux()).toEqual(false);
      expect(Runtime.isMacOS()).toEqual(true);
      expect(Runtime.isWindows()).toEqual(false);
    });

    it('detects Mac OS', () => {
      spyOn(Runtime, 'getOS').and.returnValue({family: 'Mac OS'});
      expect(Runtime.isMacOS()).toEqual(true);
    });
  });

  describe('"isWindows"', () => {
    it('detects Windows', () => {
      spyOn(Runtime, 'getOS').and.returnValue({family: 'Windows'});
      expect(Runtime.isLinux()).toEqual(false);
      expect(Runtime.isMacOS()).toEqual(false);
      expect(Runtime.isWindows()).toEqual(true);
    });

    it('detects Windows 7', () => {
      spyOn(Runtime, 'getOS').and.returnValue({family: 'windows server 2008 r2 / 7'});
      expect(Runtime.isWindows()).toEqual(true);
    });
  });
});
