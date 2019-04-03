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

import dotenv from 'dotenv';
import gitRev from 'git-rev-sync';
import path from 'path';

import {CommonConfig} from './Config';

export interface CommonConfigOptions {
  electronPackageJson: string;
  envFile: string;
  wireJson: string;
}

const getCommonConfig = (options: CommonConfigOptions) => {
  const {version}: {version: string} = require(options.wireJson);
  const defaultConfig: CommonConfig = require(options.electronPackageJson);

  dotenv.config({path: path.resolve(options.envFile)});

  let commitId = 'unknown';

  try {
    commitId = gitRev.short();
  } catch (error) {}

  const IS_PRODUCTION = process.env.APP_ENV !== 'internal';

  const commonConfig: CommonConfig = {
    ...defaultConfig,
    adminUrl: process.env.URL_ADMIN || defaultConfig.adminUrl,
    appBase: process.env.APP_BASE || defaultConfig.appBase,
    buildNumber: process.env.BUILD_NUMBER || defaultConfig.buildNumber,
    copyright: process.env.APP_COPYRIGHT || defaultConfig.copyright,
    customProtocolName: process.env.APP_CUSTOM_PROTOCOL_NAME || defaultConfig.customProtocolName,
    description: process.env.APP_DESCRIPTION || defaultConfig.description,
    environment: IS_PRODUCTION ? 'production' : defaultConfig.environment,
    legalUrl: process.env.URL_LEGAL || defaultConfig.legalUrl,
    licensesUrl: process.env.URL_LICENSES || defaultConfig.licensesUrl,
    maximumAccounts: process.env.APP_MAXIMUM_ACCOUNTS || defaultConfig.maximumAccounts,
    name: process.env.APP_NAME || defaultConfig.name,
    nameShort: process.env.APP_NAME_SHORT || defaultConfig.nameShort,
    privacyUrl: process.env.URL_PRIVACY || defaultConfig.privacyUrl,
    raygunApiKey: process.env.RAYGUN_API_KEY || defaultConfig.raygunApiKey,
    supportUrl: process.env.URL_SUPPORT || defaultConfig.supportUrl,
    version: `${version.replace(/\.0$/, '')}.${process.env.BUILD_NUMBER || `0-${commitId}`}${
      IS_PRODUCTION ? '' : '-internal'
    }`,
    websiteUrl: process.env.URL_WEBSITE || defaultConfig.websiteUrl,
  };

  return {commonConfig, defaultConfig};
};

const logEntries = <T extends {}>(config: T, name: string): void => {
  return Object.entries(config).forEach(([key, value]) => {
    console.info(`${name}.${key} set to "${value}". `);
  });
};

export {getCommonConfig, logEntries};
