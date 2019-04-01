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

import * as commander from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';

import {FindResult, checkCommanderOptions, findDown} from './deploy-utils';
import {createVersion, uploadVersion, zip} from './hockey';

commander
  .name('hockey.js')
  .description('Upload files to Hockey')
  .option('-i, --hockey-id <id>', 'Specify the Hockey app ID')
  .option('-t, --hockey-token <token>', 'Specify the Hockey API token')
  .option('-w, --wrapper-build <build>', 'Specify the wrapper build (e.g. "Linux#3.7.1234")')
  .option('-p, --path <path>', 'Specify the local path to search for files (e.g. "../../wrap")')
  .parse(process.argv);

checkCommanderOptions(commander, ['hockeyToken', 'hockeyId', 'wrapperBuild']);

if (!commander.wrapperBuild.includes('#')) {
  commander.outputHelp();
  process.exit(1);
}

async function getUploadFile(platform: string, basePath: string): Promise<FindResult> {
  if (platform === 'linux') {
    const debImage = await findDown('.deb', {cwd: basePath});
    return debImage;
  } else if (platform === 'windows') {
    const setupExe = await findDown('-Setup.exe', {cwd: basePath});
    return setupExe;
  } else if (platform === 'macos') {
    const setupPkg = await findDown('.pkg', {cwd: basePath});
    return setupPkg;
  } else {
    throw new Error('Invalid platform');
  }
}

(async () => {
  const {hockeyId, hockeyToken, wrapperBuild} = commander;
  const [platform, version] = wrapperBuild.toLowerCase().split('#');
  const searchBasePath = commander.path || path.resolve('.');

  const {filePath} = await getUploadFile(platform, searchBasePath);

  const zipFile = await zip(filePath, filePath.replace('.exe', '.zip'));

  const {id: hockeyVersionId} = await createVersion({
    hockeyAppId: hockeyId,
    hockeyToken: hockeyToken,
    version: version,
  });

  await uploadVersion({
    filePath: zipFile,
    hockeyAppId: hockeyId,
    hockeyToken: hockeyToken,
    hockeyVersionId,
    version: version,
  });

  await fs.remove(zipFile);
  console.log('Done.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
