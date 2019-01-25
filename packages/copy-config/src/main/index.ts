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

import {exec} from 'child_process';
import * as os from 'os';
import * as path from 'path';
import {promisify} from 'util';

import copy = require('copy');
import * as fs from 'fs-extra';
import * as rimraf from 'rimraf';

const rimrafAsync = promisify(rimraf);
const execAsync = promisify(exec);
const copyAsync = (source: string, destination: string): Promise<string[]> =>
  new Promise((resolve, reject) =>
    copy(source, destination, (error, files = []) => (error ? reject(error) : resolve(files.map(file => file.path))))
  );

export interface CopyConfigOptions {
  configDirName?: string;
  files: {
    [source: string]: string | string[];
  };
  forceDelete?: boolean;
  gitAdditionalOptions?: string;
  gitConfigurationUrl?: string;
  gitConfigurationVersion?: string;
  ignoreFiles?: string[];
  noClone?: boolean;
}

const defaultOptions: Required<CopyConfigOptions> = {
  configDirName: 'config',
  files: {},
  forceDelete: false,
  gitAdditionalOptions: '--depth 1',
  gitConfigurationUrl: 'https://github.com/wireapp/wire-web-config-default',
  gitConfigurationVersion: 'v0.7.1',
  ignoreFiles: ['.DS_Store'],
  noClone: false,
};

export class CopyConfig {
  private readonly config: Required<CopyConfigOptions>;

  constructor(filesOrOptions: CopyConfigOptions) {
    this.config = {...defaultOptions, ...filesOrOptions};
    this.readEnvVars();
    this.config.configDirName = path.resolve(this.config.configDirName);
  }

  private readEnvVars(): void {
    const setBoolean = (variable: string | undefined, configKey: keyof CopyConfigOptions) =>
      typeof variable !== 'undefined' && (this.config[configKey] = Boolean(variable));

    const setString = (variable: string | undefined, configKey: keyof CopyConfigOptions) =>
      typeof variable !== 'undefined' && (this.config[configKey] = String(variable));

    const setArray = (variable: string | undefined, configKey: keyof CopyConfigOptions) =>
      typeof variable !== 'undefined' && (this.config[configKey] = variable.split(','));

    setArray(process.env.WIRE_CONFIGURATION_IGNORE_FILES, 'ignoreFiles');
    setBoolean(process.env.WIRE_CONFIGURATION_FORCE_DELETE, 'forceDelete');
    setBoolean(process.env.WIRE_CONFIGURATION_NO_CLONE, 'noClone');
    setString(process.env.WIRE_CONFIGURATION_EXTERNAL_DIR, 'configDirName');
    setString(process.env.WIRE_CONFIGURATION_GIT_OPTIONS, 'gitAdditionalOptions');
    setString(process.env.WIRE_CONFIGURATION_REPOSITORY_VERSION, 'gitConfigurationVersion');
    setString(process.env.WIRE_CONFIGURATION_REPOSITORY, 'gitConfigurationUrl');
  }

  private resolveFiles(): void {
    const filesArray = Object.keys(this.config.files);
    if (!filesArray.length) {
      throw new Error('No source files or directories specified.');
    }

    filesArray.forEach(source => {
      const destination = this.config.files[source];

      const joinedSource = path.join(this.config.configDirName, source);
      const resolvedDestination =
        destination instanceof Array ? destination.map(dest => path.resolve(dest)) : path.resolve(destination);

      delete this.config.files[source];

      this.config.files[joinedSource] = resolvedDestination;
    });
  }

  public async copyDirOrFile(source: string, destination: string): Promise<string[]> {
    const isDir = (dir: string) => /(\\|\/|\*)$/.test(dir);

    console.log(`Copying "${source}" -> "${destination}"`);

    if (!isDir(destination)) {
      if (isDir(source)) {
        throw new Error('Cannot copy a directory into a file.');
      }

      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'copyconfig-'));
      const result = await copyAsync(source, tempDir);
      await fs.rename(result[0], destination);
      return [destination];
    }

    return copyAsync(source, destination);
  }

  private async clone(): Promise<void> {
    const {gitAdditionalOptions, gitConfigurationVersion, gitConfigurationUrl, configDirName} = this.config;

    const {stderr: stderrVersion} = await execAsync('git --version');

    if (stderrVersion) {
      throw new Error(stderrVersion);
    }

    if (this.config.forceDelete) {
      await rimrafAsync(configDirName);
    }

    console.log(`Cloning "${gitConfigurationUrl}" ...`);
    const command = `git clone ${gitAdditionalOptions} -b ${gitConfigurationVersion} ${gitConfigurationUrl} ${configDirName}`;

    const {stderr: stderrClone} = await execAsync(command);

    if (stderrClone.includes('fatal')) {
      throw new Error(stderrClone);
    }
  }

  public async copy(): Promise<string[]> {
    let copiedFiles: string[] = [];

    if (!this.config.noClone) {
      await this.clone();
    }

    this.resolveFiles();

    for (const file in this.config.files) {
      const destination = this.config.files[file];
      if (destination instanceof Array) {
        const results = await Promise.all(destination.map(dest => this.copyDirOrFile(file, dest)));
        results.forEach(result => (copiedFiles = copiedFiles.concat(result)));
      } else {
        const result = await this.copyDirOrFile(file, destination);
        copiedFiles = copiedFiles.concat(result);
      }
    }

    copiedFiles = copiedFiles.sort();

    return copiedFiles;
  }
}
