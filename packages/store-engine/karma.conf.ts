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

import {Config, ConfigOptions} from 'karma';

module.exports = function(config: Config) {
  const options: ConfigOptions = {
    autoWatch: false,
    basePath: 'src/main',
    browserNoActivityTimeout: 90000,
    browsers: ['ChromeNoSandbox'],
    client: {
      useIframe: false,
    },
    colors: true,
    concurrency: Infinity,
    customLaunchers: {
      ChromeNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--allow-file-access-from-files', '--no-sandbox', '--unlimited-quota-for-files'],
      },
    },
    files: [
      'engine/error/**/*.ts',
      'engine/EnvironmentUtil.ts',
      'engine/MemoryEngine.ts',
      'engine/MemoryEngine.test.ts',
      'engine/FileSystemEngine.ts',
      'engine/FileSystemEngine.test.browser.ts',
      'engine/LocalStorageEngine.ts',
      'engine/LocalStorageEngine.test.browser.ts',
      'engine/IndexedDBEngine.ts',
      'engine/IndexedDBEngine.test.browser.ts',
      'store/**/*.ts',
      'test/**/*.ts',
    ],
    frameworks: ['jasmine', 'karma-typescript'],
    logLevel: config.LOG_INFO,
    port: 9876,
    preprocessors: {
      '**/*.ts': ['karma-typescript'],
    },
    reporters: ['progress', 'karma-typescript'],
    singleRun: true,
  };

  config.set(options);
};
