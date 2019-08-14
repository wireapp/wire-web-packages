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

import * as path from 'path';
import {readBooleanEnvVar, readFile, readStringEnvVar} from './util/ConfigUtil';

const COMMIT_FILE = path.join(__dirname, 'commit');

export interface ConfigClient {
  APP_NAME: string;
  BACKEND_REST: string;
  BACKEND_WS: string;
  ENVIRONMENT: string;
  COMMIT: string;
  FEATURE: {
    ENABLE_DEBUG: boolean;
  };
}

export const configClient: ConfigClient = {
  APP_NAME: readStringEnvVar(process.env.APP_NAME, 'APP_NAME'),
  BACKEND_REST: readStringEnvVar(process.env.BACKEND_REST, 'BACKEND_REST'),
  BACKEND_WS: readStringEnvVar(process.env.BACKEND_WS, 'BACKEND_WS'),
  COMMIT: readFile(COMMIT_FILE, ''),
  ENVIRONMENT: readStringEnvVar(process.env.NODE_ENV, 'NODE_ENV', 'production'),
  FEATURE: {
    ENABLE_DEBUG: readBooleanEnvVar(process.env.FEATURE_ENABLE_DEBUG, 'FEATURE_ENABLE_DEBUG', false),
  },
};
