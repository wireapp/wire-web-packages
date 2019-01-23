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

//@ts-check

const path = require('path');
const fs = require('fs');

const {CopyConfig} = require('../../');
const TEMP_DIR = path.resolve(__dirname, '..', '..', '.temp');
const ERROR_NOTFOUND = -2;

describe('CopyConfig', () => {
  it('copies a single file', async () => {
    const copyConfig = new CopyConfig({
      configDirName: '',
      files: {
        './spec/helpers/test1.txt': TEMP_DIR,
      },
      forceDelete: true,
      noClone: true,
    });

    const copiedResult = await copyConfig.copy();

    expect(copiedResult.length).toBe(1);

    const copiedFiles = fs.readdirSync(TEMP_DIR);
    expect(copiedFiles.includes('spec')).toBe(true);
  });

  it('copies all files', async () => {
    const copyConfig = new CopyConfig({
      configDirName: '',
      files: {
        './spec/helpers/**': TEMP_DIR,
      },
      forceDelete: true,
      noClone: true,
    });

    const copiedResult = await copyConfig.copy();

    expect(copiedResult.length).toBe(1 + 1);

    const copiedFiles = fs.readdirSync(TEMP_DIR);

    expect(copiedFiles.includes('test1.txt')).toBe(true);
    expect(copiedFiles.includes('test2.txt')).toBe(true);
  });

  it('reports errors', async () => {
    const copyConfig = new CopyConfig({
      configDirName: '',
      files: {
        'non-existant': TEMP_DIR,
      },
      forceDelete: true,
      noClone: true,
    });

    try {
      await copyConfig.copy();
      fail('Should throw');
    } catch (error) {
      expect(error.errno).toBe(ERROR_NOTFOUND);
    }
  });

  it('reads environment variables', async () => {
    process.env.WIRE_CONFIGURATION_NO_CLONE = 'true';
    process.env.WIRE_CONFIGURATION_IGNORE_FILES = '.DS_Store,ignored_file';

    const copyConfig = new CopyConfig({
      configDirName: '',
      files: {
        './spec/helpers/**': TEMP_DIR,
      },
    });

    expect(copyConfig.config.noClone).toBe(true);
    expect(copyConfig.config.ignoreFiles).toEqual(['.DS_Store', 'ignored_file']);

    delete process.env.WIRE_CONFIGURATION_NO_CLONE;
  });
});
