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

const ELECTRON_APP = {
  FRANZ: 'franz',
  WIRE: 'wire',
};

export const OS = {
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

const getOs = () => {
  return {
    architecture: 'unknown',
    family: 'unknown',
    version: 'unknown',
    ...platform.os,
  };
};

const getPlatform = (): Platform => platform;
const getUserAgent = () => (getPlatform().ua || 'unknown').toLowerCase();

const getOsFamily = () => getOs().family.toLowerCase();
const getBrowserName = () => (getPlatform().name || 'unknown').toLowerCase();
const getBrowserVersion = () => {
  const [majorVersion, minorVersion] = (getPlatform().version || 'unknown').split('.');
  return {major: parseInt(majorVersion, 10), minor: parseInt(minorVersion, 10)};
};

const isWebappSupportedBrowser = () => {
  if (isFranz()) {
    return false;
  }

  return Object.entries(WEBAPP_SUPPORTED_BROWSERS).some(([browser, supportedVersion]) => {
    const isBrowserSupported = getBrowserName() === browser;
    const currentVersion = getBrowserVersion();
    const isSupportedMajorVersion = currentVersion.major >= supportedVersion.major;
    const isHigherMajorVersion = currentVersion.major > supportedVersion.major;
    const isSupportedMinorVersion = isHigherMajorVersion || currentVersion.minor >= supportedVersion.minor;
    return isBrowserSupported && isSupportedMajorVersion && isSupportedMinorVersion;
  });
};

const isChrome = () => getBrowserName() === BROWSER.CHROME;
const isEdge = () => getBrowserName() === BROWSER.EDGE;
const isFirefox = () => getBrowserName() === BROWSER.FIREFOX;
const isInternetExplorer = () => getBrowserName() === BROWSER.IE;
const isOpera = () => getBrowserName() === BROWSER.OPERA;
const isSafari = () => getBrowserName() === BROWSER.SAFARI;

const isDesktopOs = () => isMacOS() || isWindows() || isLinux();
const isElectron = () => getBrowserName() === BROWSER.ELECTRON;
const isDesktopApp = () => isElectron() && getUserAgent().includes(ELECTRON_APP.WIRE);
const isFranz = () => isElectron() && getUserAgent().includes(ELECTRON_APP.FRANZ);

const isMacOS = () => OS.DESKTOP.MAC.includes(getOsFamily());
const isWindows = () => OS.DESKTOP.WINDOWS.includes(getOsFamily());
const isLinux = () => OS.DESKTOP.LINUX.includes(getOsFamily());

const isMobileOs = () => isAndroid() || isIOS();
const isAndroid = () => OS.MOBILE.ANDROID.includes(getOsFamily());
const isIOS = () => OS.MOBILE.IOS.includes(getOsFamily());

export {
  getBrowserName,
  getOs,
  getOsFamily,
  getPlatform,
  isAndroid,
  isChrome,
  isDesktopApp,
  isDesktopOs,
  isEdge,
  isElectron,
  isFirefox,
  isFranz,
  isInternetExplorer,
  isIOS,
  isLinux,
  isMacOS,
  isMobileOs,
  isOpera,
  isSafari,
  isWebappSupportedBrowser,
  isWindows,
};
