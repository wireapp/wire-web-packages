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
const fs = require('fs-extra');

const {CopyConfig} = require('../../dist');
const TEMP_DIR = path.resolve(__dirname, '..', '..', '.temp/');

const TWENTY_SECONDS = 20000;

describe('CopyConfig', () => {
  afterEach(() => fs.remove(TEMP_DIR));

  describe('constructor', () => {
    it('can be configured using environment variables', async () => {
      process.env.WIRE_CONFIGURATION_EXTERNAL_DIR = 'externalDir';
      process.env.WIRE_CONFIGURATION_FILES = `./spec/helpers/**:${TEMP_DIR};./spec/helpers/test1.txt:[${TEMP_DIR}/test1.txt,${TEMP_DIR}/test2.txt]`;

      const copyConfig = new CopyConfig({
        files: {},
      });

      expect(copyConfig.options.externalDir.endsWith('externalDir')).toBe(true);
      expect(copyConfig.options.files).toEqual({
        './spec/helpers/**': TEMP_DIR,
        './spec/helpers/test1.txt': [`${TEMP_DIR}/test1.txt`, `${TEMP_DIR}/test2.txt`],
      });

      delete process.env.WIRE_CONFIGURATION_EXTERNAL_DIR;
      delete process.env.WIRE_CONFIGURATION_FILES;
    });
  });

  describe('copy', () => {
    it('copies a single file', async () => {
      const copyConfig = new CopyConfig({
        externalDir: '.',
        files: {
          './spec/helpers/test1.txt': TEMP_DIR,
        },
      });

      const copiedResult = await copyConfig.copy();

      expect(copiedResult.length).toBe(1);

      const copiedFiles = fs.readdirSync(TEMP_DIR);
      expect(copiedFiles.includes('test1.txt')).toBe(true);
    });

    it('copies dot files', async () => {
      const copyConfig = new CopyConfig({
        externalDir: '.',
        files: {
          './spec/helpers/.env.test': `${TEMP_DIR}/.env`,
        },
      });

      const copiedResult = await copyConfig.copy();

      expect(copiedResult.length).toBe(1);
    });

    it('copies all files', async () => {
      const copyConfig = new CopyConfig({
        externalDir: '.',
        files: {
          './spec/helpers/**': TEMP_DIR,
        },
      });

      const copiedResult = await copyConfig.copy();

      expect(copiedResult.length).toBe(1 + 1);

      const copiedFiles = fs.readdirSync(TEMP_DIR);

      expect(copiedFiles.includes('test1.txt')).toBe(true);
      expect(copiedFiles.includes('test2.txt')).toBe(true);
    });

    it('reports errors', async () => {
      const copyConfig = new CopyConfig({
        externalDir: '.',
        files: {
          'non-existant': TEMP_DIR,
        },
      });

      try {
        await copyConfig.copy();
        fail('Should throw');
      } catch (error) {
        expect(error.code).toBe('ENOENT');
      }
    });

    it('overwrites destination files', async () => {
      await fs.ensureDir(TEMP_DIR);
      await fs.writeFile(path.join(TEMP_DIR, 'test1.txt'), '');

      const copyConfig = new CopyConfig({
        externalDir: '.',
        files: {
          './spec/helpers/test1.txt': TEMP_DIR,
        },
      });

      const copiedResult = await copyConfig.copy();

      expect(copiedResult.length).toBe(1);
    });

    it(
      'downloads zip archives',
      async () => {
        await fs.ensureDir(TEMP_DIR);
        await fs.writeFile(path.join(TEMP_DIR, 'test1.txt'), '');

        const copyConfig = new CopyConfig({
          files: {
            './package.json': TEMP_DIR,
          },
          repositoryUrl: 'https://github.com/wireapp/wire-web-config-default#master',
        });

        await copyConfig.copy();

        const files = await fs.readdir(copyConfig.baseDir);
        expect(files).toContain('wire-webapp');
      },
      TWENTY_SECONDS
    );
  });

  describe('getFilesFromString', () => {
    it('is compatible with Windows paths', () => {
      const copyString = 'C:\\source:D:\\target';

      const copyConfig = new CopyConfig({
        files: {},
      });

      const resolvedPaths = copyConfig.getFilesFromString(copyString);
      expect(Object.keys(resolvedPaths)[0]).toBe('C:\\source');
      expect(Object.values(resolvedPaths)[0]).toBe('D:\\target');
    });
  });
});
