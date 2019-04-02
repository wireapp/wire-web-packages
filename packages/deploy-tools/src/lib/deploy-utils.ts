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
import {promisify} from 'util';

import commander from 'commander';
import path from 'path';
const findDown = require('find-down');

interface FindOptions {
  cwd?: string;
  safeGuard?: boolean;
}

interface FindResult {
  fileName: string;
  filePath: string;
}

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

async function find(fileName: string, options: {cwd?: string; safeGuard: false}): Promise<FindResult | null>;
async function find(fileName: string, options: {cwd?: string; safeGuard?: boolean}): Promise<FindResult>;
async function find(fileName: string, options?: FindOptions): Promise<FindResult | null> {
  const fullOptions: Required<FindOptions> = {
    cwd: '.',
    safeGuard: true,
    ...options,
  };
  const file: string | null = await findDown(fileName, {cwd: fullOptions.cwd});

  if (file) {
    return {fileName: path.basename(file), filePath: file};
  }

  if (fullOptions.safeGuard) {
    throw new Error(`Could not find "${fileName}".`);
  }

  return null;
}

export {checkCommanderOptions, execAsync, find, FindOptions, FindResult};
