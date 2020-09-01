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

const UNKNOWN_PROPERTY = 'unknown';

export enum OperatingSystem {
  ANDROID = 'OperatingSystem.ANDROID',
  IOS = 'OperatingSystem.IOS',
  LINUX = 'OperatingSystem.LINUX',
  MAC = 'OperatingSystem.MAC',
  WINDOWS = 'OperatingSystem.WINDOWS',
}

export interface OS {
  architecture: string | number;
  family: string;
  version: string;
}

export class Runtime {
  public static getPlatform(): Platform {
    const unsetPlatform: Platform = ({} as unknown) as Platform;
    return platform || unsetPlatform;
  }

  public static getOSFamily(): OperatingSystem {
    const OS = {
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
    const family = Runtime.getOS().family?.toLowerCase();
    if (OS.DESKTOP.WINDOWS.includes(family)) {
      return OperatingSystem.WINDOWS;
    }
    if (OS.MOBILE.ANDROID.includes(family)) {
      return OperatingSystem.ANDROID;
    }
    if (OS.MOBILE.IOS.includes(family)) {
      return OperatingSystem.IOS;
    }
    if (OS.DESKTOP.MAC.includes(family)) {
      return OperatingSystem.MAC;
    }
    return OperatingSystem.LINUX;
  }

  public static getBrowserName(): string {
    return (Runtime.getPlatform().name || UNKNOWN_PROPERTY).toLowerCase();
  }

  public static getBrowserVersion(): {major: number; minor: number} {
    const [majorVersion, minorVersion] = (Runtime.getPlatform().version || UNKNOWN_PROPERTY).split('.');
    return {major: parseInt(majorVersion, 10), minor: parseInt(minorVersion, 10)};
  }

  public static getUserAgent(): string {
    return (Runtime.getPlatform().ua || UNKNOWN_PROPERTY).toLowerCase();
  }

  public static isWebappSupportedBrowser(): boolean {
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

  public static getOS(): OS {
    return {
      architecture: UNKNOWN_PROPERTY,
      family: UNKNOWN_PROPERTY,
      version: UNKNOWN_PROPERTY,
      ...platform.os,
    };
  }

  public static isSupportingWebSockets = (): boolean => {
    try {
      return 'WebSocket' in window;
    } catch (error) {
      return false;
    }
  };

  public static isSupportingClipboard = (): boolean => !!navigator.clipboard;
  public static isSupportingIndexedDb = (): boolean => {
    try {
      return !!window.indexedDB;
    } catch (error) {
      return false;
    }
  };

  public static isSupportingLegacyCalling = (): boolean => {
    if (
      !Runtime.isSupportingRTCPeerConnection() ||
      !Runtime.isSupportingRTCDataChannel() ||
      !Runtime.isSupportingUserMedia() ||
      !Runtime.isSupportingWebSockets()
    ) {
      return false;
    }
    return true;
  };

  public static isSupportingConferenceCalling = (): boolean => {
    if (!Runtime.isSupportingLegacyCalling() || !Runtime.isSupportingRTCInjectableStreams()) {
      return false;
    }
    return true;
  };

  public static isSupportingRTCPeerConnection = (): boolean => 'RTCPeerConnection' in window;
  public static isSupportingRTCDataChannel = (): boolean => {
    if (!Runtime.isSupportingRTCPeerConnection()) {
      return false;
    }

    const peerConnection = new RTCPeerConnection(undefined);
    return 'createDataChannel' in peerConnection;
  };
  public static isSupportingRTCInjectableStreams = (): boolean => {
    const isSupportingEncodedStreams = RTCRtpSender.prototype.hasOwnProperty('createEncodedStreams');
    const isSupportingEncodedVideoStreams = RTCRtpSender.prototype.hasOwnProperty('createEncodedVideoStreams');
    return isSupportingEncodedStreams || isSupportingEncodedVideoStreams;
  };
  public static isSupportingUserMedia = (): boolean =>
    'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  public static isSupportingDisplayMedia = (): boolean =>
    'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices;

  public static isSupportingScreensharing = (): boolean => {
    const hasScreenCaptureAPI =
      !!((window as unknown) as any).desktopCapturer ||
      (Runtime.isSupportingUserMedia() && Runtime.isSupportingDisplayMedia());
    return hasScreenCaptureAPI || Runtime.isFirefox();
  };

  public static isSupportingPermissions = (): boolean => !!navigator.permissions;

  public static isSupportingNotifications = (): boolean => {
    const notificationNotSupported = window.Notification === undefined;
    if (notificationNotSupported) {
      return false;
    }

    const requestPermissionNotSupported = window.Notification.requestPermission === undefined;
    return requestPermissionNotSupported ? false : document.visibilityState !== undefined;
  };

  public static isChrome(): boolean {
    return Runtime.getBrowserName() === BROWSER.CHROME;
  }

  public static isEdge(): boolean {
    return Runtime.getBrowserName() === BROWSER.MS_EDGE;
  }

  public static isFirefox(): boolean {
    return Runtime.getBrowserName() === BROWSER.FIREFOX;
  }

  public static isInternetExplorer(): boolean {
    return Runtime.getBrowserName() === BROWSER.IE;
  }

  public static isOpera(): boolean {
    return Runtime.getBrowserName() === BROWSER.OPERA;
  }

  public static isSafari(): boolean {
    return Runtime.getBrowserName() === BROWSER.SAFARI;
  }

  public static isDesktopOS(): boolean {
    return Runtime.isMacOS() || Runtime.isWindows() || Runtime.isLinux();
  }

  public static isElectron(): boolean {
    return Runtime.getBrowserName() === BROWSER.ELECTRON;
  }

  public static isNode(): boolean {
    return typeof process === 'object';
  }

  public static isDesktopApp(): boolean {
    return Runtime.isElectron() && Runtime.getUserAgent().includes('wire');
  }

  public static isFranz(): boolean {
    return Runtime.isElectron() && Runtime.getUserAgent().includes('franz');
  }

  public static isMacOS(): boolean {
    return Runtime.getOSFamily() === OperatingSystem.MAC;
  }

  public static isWindows(): boolean {
    return Runtime.getOSFamily() === OperatingSystem.WINDOWS;
  }

  public static isLinux(): boolean {
    return Runtime.getOSFamily() === OperatingSystem.LINUX;
  }

  public static isMobileOS(): boolean {
    return Runtime.isAndroid() || Runtime.isIOS();
  }

  public static isAndroid(): boolean {
    return Runtime.getOSFamily() === OperatingSystem.ANDROID;
  }

  public static isIOS(): boolean {
    return Runtime.getOSFamily() === OperatingSystem.IOS;
  }
}
