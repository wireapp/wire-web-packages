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
import {BROWSER, WEBAPP_SUPPORTED_BROWSERS} from '../config/CommonConfig';

class Runtime {
  public static ELECTRON_APP = {
    FRANZ: 'franz',
    WIRE: 'wire',
  };

  public static OS = {
    DESKTOP: {
      LINUX: ['linux', 'ubuntu', 'fedora', 'gentoo', 'debian', 'suse', 'centos', 'red hat', 'freebsd', 'openbsd'],
      MAC: ['os x', 'mac os'],
      WINDOWS: ['windows', 'windows server 2008 r2 / 7', 'windows server 2008 / vista', 'windows xp'],
    },
    MOBILE: {
      ANDROID: ['android'],
      IOS: ['ios'],
    },
  };

  public static getPlatform() {
    return platform;
  }

  public static getOsFamily() {
    return Runtime.getOs().family.toLowerCase();
  }

  public static getBrowserName() {
    return (Runtime.getPlatform().name || 'unknown').toLowerCase();
  }

  public static getBrowserVersion() {
    const [majorVersion, minorVersion] = (Runtime.getPlatform().version || 'unknown').split('.');
    return {major: parseInt(majorVersion, 10), minor: parseInt(minorVersion, 10)};
  }

  public static getUserAgent() {
    return (Runtime.getPlatform().ua || 'unknown').toLowerCase();
  }

  public static isWebappSupportedBrowser() {
    if (Runtime.isFranz()) {
      return false;
    }

    return Object.entries(WEBAPP_SUPPORTED_BROWSERS).some(([browser, supportedVersion]) => {
      const isBrowserSupported = Runtime.getBrowserName() === browser;
      const currentVersion = Runtime.getBrowserVersion();
      const isSupportedMajorVersion = currentVersion.major >= supportedVersion.major;
      const isHigherMajorVersion = currentVersion.major > supportedVersion.major;
      const isSupportedMinorVersion = isHigherMajorVersion || currentVersion.minor >= supportedVersion.minor;
      return isBrowserSupported && isSupportedMajorVersion && isSupportedMinorVersion;
    });
  }

  public static getOs() {
    return {
      architecture: 'unknown',
      family: 'unknown',
      version: 'unknown',
      ...platform.os,
    };
  }

  public static isChrome() {
    return Runtime.getBrowserName() === BROWSER.CHROME;
  }

  public static isEdge() {
    return Runtime.getBrowserName() === BROWSER.EDGE;
  }

  public static isFirefox() {
    return Runtime.getBrowserName() === BROWSER.FIREFOX;
  }

  public static isInternetExplorer() {
    return Runtime.getBrowserName() === BROWSER.IE;
  }

  public static isOpera() {
    return Runtime.getBrowserName() === BROWSER.OPERA;
  }

  public static isSafari() {
    return Runtime.getBrowserName() === BROWSER.SAFARI;
  }

  public static isDesktopOs() {
    return Runtime.isMacOS() || Runtime.isWindows() || Runtime.isLinux();
  }

  public static isElectron() {
    return Runtime.getBrowserName() === BROWSER.ELECTRON;
  }

  public static isDesktopApp() {
    return Runtime.isElectron() && Runtime.getUserAgent().includes(Runtime.ELECTRON_APP.WIRE);
  }

  public static isFranz() {
    return Runtime.isElectron() && Runtime.getUserAgent().includes(Runtime.ELECTRON_APP.FRANZ);
  }

  public static isMacOS() {
    return Runtime.OS.DESKTOP.MAC.includes(Runtime.getOsFamily());
  }

  public static isWindows() {
    return Runtime.OS.DESKTOP.WINDOWS.includes(Runtime.getOsFamily());
  }

  public static isLinux() {
    return Runtime.OS.DESKTOP.LINUX.includes(Runtime.getOsFamily());
  }

  public static isMobileOs() {
    return Runtime.isAndroid() || Runtime.isIOS();
  }

  public static isAndroid() {
    return Runtime.OS.MOBILE.ANDROID.includes(Runtime.getOsFamily());
  }

  public static isIOS() {
    return Runtime.OS.MOBILE.IOS.includes(Runtime.getOsFamily());
  }
}

export {Runtime};
