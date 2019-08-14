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

import * as fs from 'fs-extra';

export const readFile = (path: string, fallback: string): string => {
  try {
    return fs.readFileSync(path, {encoding: 'utf8', flag: 'r'});
  } catch (error) {
    console.warn(`Cannot access "${path}": ${error.message}`);
    return fallback;
  }
};

export const readStringEnvVar = (envVar: string | undefined, name: string, fallback?: string): string => {
  if (!envVar) {
    if (!fallback) {
      throw new Error(`Unable to read required string env var "${name}"`);
    } else {
      return fallback;
    }
  }
  return envVar;
};

export const readBooleanEnvVar = (envVar: string | undefined, name: string, fallback?: boolean): boolean => {
  const stringValue = readStringEnvVar(envVar, name, fallback ? fallback.toString() : undefined);
  switch (stringValue) {
    case 'true':
      return true;
    case 'false':
      return false;
    default: {
      if (!fallback) {
        throw new Error(`Unable to read required boolean env var "${name}"`);
      }
      return fallback;
    }
  }
};
