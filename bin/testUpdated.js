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
try {
  output = execSync(`npx lerna updated`);
} catch (error) {}

if (output === undefined) {
  console.info(`No project updates - skipping tests`);
  return 0;
}

const updatedProjects = output
  .toString()
  .replace(/- /g, '')
  .match(/[^\r\n]+/g);

updatedProjects.forEach(project => {
  console.info(`Running tests for project "${project}"`);
  execSync(`npx lerna run --scope ${project} test`, {stdio: [0, 1]});
});
