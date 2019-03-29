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

const {execSync} = require('child_process');

let output;
console.info('Checking for changed packages...');

try {
  output = execSync(`npx lerna changed --all --json`);
} catch (error) {
  console.info(`No local packages have changed since the last tagged releases.`);
  process.exit(0);
}

const changedPackages = JSON.parse(output.toString());
const packageNames = changedPackages.map(project => project.name);

console.info('Building all packages');
execSync(`yarn dist`, {stdio: [0, 1]});

packageNames.forEach(packageName => {
  console.info(`Running tests for package "${packageName}"...`);
  execSync(`npx lerna run --scope ${packageName} test`, {stdio: [0, 1]});
});
