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

import {HelmetCspDirectiveValue, IHelmetContentSecurityPolicyDirectives as HelmetCSP} from 'helmet';
import path from 'path';
import {readBooleanEnvVar, readFile, readStringEnvVar} from './util/ConfigUtil';

const ROBOTS_DIR = path.join(__dirname, 'robots');
const ROBOTS_ALLOW_FILE = path.join(ROBOTS_DIR, 'robots.txt');
const ROBOTS_DISALLOW_FILE = path.join(ROBOTS_DIR, 'robots-disallow.txt');

const defaultCSP: HelmetCSP = {
  connectSrc: ["'self'", 'data:', 'https://*.wire.com', 'https://*.zinfra.io'],
  defaultSrc: ["'self'"],
  fontSrc: ["'self'"],
  frameSrc: ["'self'"],
  imgSrc: ["'self'", 'data:'],
  manifestSrc: ["'self'"],
  mediaSrc: ["'self'"],
  objectSrc: ["'self'"],
  prefetchSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  workerSrc: ["'self'"],
};

function parseCommaSeparatedList(list: string = ''): string[] {
  const cleanedList = list.replace(/\s/g, '');
  if (!cleanedList) {
    return [];
  }
  return cleanedList.split(',');
}

function mergedCSP(): HelmetCSP {
  const csp: HelmetCSP = {
    connectSrc: [
      ...(defaultCSP.connectSrc || []),
      process.env.BACKEND_REST as HelmetCspDirectiveValue,
      process.env.BACKEND_WS as HelmetCspDirectiveValue,
      ...parseCommaSeparatedList(process.env.CSP_EXTRA_CONNECT_SRC),
    ],
    defaultSrc: [...(defaultCSP.defaultSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_DEFAULT_SRC)],
    fontSrc: [...(defaultCSP.fontSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_FONT_SRC)],
    frameSrc: [...(defaultCSP.frameSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_FRAME_SRC)],
    imgSrc: [...(defaultCSP.imgSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_IMG_SRC)],
    manifestSrc: [...(defaultCSP.manifestSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_MANIFEST_SRC)],
    mediaSrc: [...(defaultCSP.mediaSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_MEDIA_SRC)],
    objectSrc: [...(defaultCSP.objectSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_OBJECT_SRC)],
    prefetchSrc: [...(defaultCSP.prefetchSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_PREFETCH_SRC)],
    scriptSrc: [...(defaultCSP.scriptSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_SCRIPT_SRC)],
    styleSrc: [...(defaultCSP.styleSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_STYLE_SRC)],
    workerSrc: [...(defaultCSP.workerSrc || []), ...parseCommaSeparatedList(process.env.CSP_EXTRA_WORKER_SRC)],
  };
  return Object.entries<{[directive: string]: string[]}>(csp as any)
    .filter(([key, value]) => !!value.length)
    .reduce((accumulator, [key, value]) => ({...accumulator, [key]: value}), {});
}

export interface ConfigServer {
  APP_BASE: string;
  BASIC_AUTH: {
    ENABLE: boolean;
    PASSWORD: string;
    USERNAME: string;
  };
  CACHE_DURATION_SECONDS: number;
  CSP: HelmetCSP;
  ENFORCE_HTTPS: boolean;
  ENVIRONMENT: string;
  PORT_HTTP: number;
  ROBOTS: {
    ALLOWED_HOSTS: string[];
    ALLOW: string;
    DISALLOW: string;
  };
}

export const configServer: ConfigServer = {
  APP_BASE: readStringEnvVar(process.env.APP_BASE, 'APP_BASE'),
  BASIC_AUTH: {
    ENABLE: readBooleanEnvVar(process.env.BASIC_AUTH_ENABLE, 'BASIC_AUTH_ENABLE', false),
    PASSWORD: readStringEnvVar(process.env.BASIC_AUTH_PASSWORD, 'BASIC_AUTH_PASSWORD', ''),
    USERNAME: readStringEnvVar(process.env.BASIC_AUTH_USERNAME, 'BASIC_AUTH_USERNAME', ''),
  },
  CACHE_DURATION_SECONDS: 300,
  CSP: mergedCSP(),
  ENFORCE_HTTPS: readBooleanEnvVar(process.env.ENFORCE_HTTPS, 'ENFORCE_HTTPS', true),
  ENVIRONMENT: readStringEnvVar(process.env.NODE_ENV, 'NODE_ENV', 'production'),
  PORT_HTTP: Number(process.env.PORT) || 21080,
  ROBOTS: {
    ALLOW: readFile(ROBOTS_ALLOW_FILE, 'User-agent: *\r\nDisallow: /'),
    ALLOWED_HOSTS: [],
    DISALLOW: readFile(ROBOTS_DISALLOW_FILE, 'User-agent: *\r\nDisallow: /'),
  },
};
