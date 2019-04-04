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
 */

import {exec} from 'child_process';
import path from 'path';
import {promisify} from 'util';

import commander from 'commander';
import fs from 'fs-extra';
import globby from 'globby';
import JSZip from 'jszip';
import logdown from 'logdown';

interface FindOptions {
  cwd?: string;
  safeGuard?: boolean;
}

interface FindResult {
  fileName: string;
  filePath: string;
}

enum FileExtension {
  APPIMAGE = '.AppImage',
  ASC = '.asc',
  DEB = '.deb',
  EXE = '.exe',
  PKG = '.pkg',
  SIG = '.sig',
}

const TWO_HUNDRED_MB_IN_BYTES = 209715200;

function checkCommanderOptions(commanderInstance: typeof commander, options: string[]) {
  options.forEach(option => {
    if (!commanderInstance.hasOwnProperty(option)) {
      commanderInstance.outputHelp();
      process.exit(1);
    }
  });
}

async function execAsync(command: string) {
  const {stderr, stdout} = await promisify(exec)(command);
  if (stderr) {
    throw new Error(stderr.trim());
  }
  return stdout.trim();
}

async function find(fileGlob: string, options: {cwd?: string; safeGuard: false}): Promise<FindResult | null>;
async function find(fileGlob: string, options: {cwd?: string; safeGuard?: boolean}): Promise<FindResult>;
async function find(fileGlob: string, options?: FindOptions): Promise<FindResult | null> {
  const fullOptions: Required<FindOptions> = {
    cwd: '.',
    safeGuard: true,
    ...options,
  };
  const matches = await globby(`${fullOptions.cwd}/**/${fileGlob}`, {onlyFiles: true});

  if (matches.length > 0) {
    const file = path.resolve(matches[0]);
    return {fileName: path.basename(file), filePath: file};
  }

  if (fullOptions.safeGuard) {
    throw new Error(`Could not find "${fileGlob}".`);
  }

  return null;
}

function logDry<T>(functionName: string, options: T): void {
  const logger = logdown('@wireapp/deploy-tools/DryLogger', {
    logger: console,
    markdown: false,
  });
  logger.info(`[${functionName}]: Would run with the following options:`, options);
}

function zip(originalFile: string, zipFile: string): Promise<string> {
  const resolvedOriginal = path.resolve(originalFile);
  const resolvedZip = path.resolve(zipFile);

  const jszipOptions = {
    compressionOptions: {level: 9},
    streamFiles: true,
  };

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(resolvedOriginal).on('error', reject);
    const writeStream = fs
      .createWriteStream(resolvedZip)
      .on('error', reject)
      .on('finish', () => resolve(resolvedZip));
    const jszip = new JSZip().file(path.basename(resolvedOriginal), readStream);

    jszip
      .generateNodeStream(jszipOptions)
      .pipe(writeStream)
      .on('error', reject);
  });
}

export {
  TWO_HUNDRED_MB_IN_BYTES,
  checkCommanderOptions,
  execAsync,
  find,
  FindOptions,
  FindResult,
  FileExtension,
  logDry,
  zip,
};
