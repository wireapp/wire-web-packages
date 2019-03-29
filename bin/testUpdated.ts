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

import {LogFactory} from '@wireapp/commons';
import {execSync} from 'child_process';

const logger = LogFactory.getLogger(__filename);
logger.state.isEnabled = true;

interface ChangedPackage {
  location: string;
  name: string;
  private: boolean;
  version: string;
}

let output: Buffer | undefined = undefined;
logger.info('Checking for changed packages...');

try {
  output = execSync(`npx lerna changed --all --json`);
} catch (error) {
  logger.info(`No local packages have changed since the last tagged releases.`);
  process.exit(0);
}

if (output) {
  const changedPackages: ChangedPackage[] = JSON.parse(output.toString());
  const packageNames = changedPackages.map(project => project.name);

  logger.info('Building all packages...');
  execSync(`yarn dist`, {stdio: [0, 1]});

  packageNames.forEach(packageName => {
    logger.info(`Running tests for package "${packageName}"...`);
    execSync(`npx lerna run --scope ${packageName} test`, {stdio: [0, 1]});
  });
}
