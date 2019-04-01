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

import {checkCommanderOptions, execAsync} from './deploy-utils';
import {createDraft, uploadAsset} from './github-draft';

commander
  .name('github-draft.js')
  .description('Create a release draft on GitHub')
  .option('-t, --github-token <token>', 'Specify the GitHub access token')
  .option('-w, --wrapper-build <build>', 'Specify the wrapper build (e.g. "Linux#3.7.1234")')
  .option('-p, --path <path>', 'Specify the local path to look for files (e.g. "../../wrap")')
  .parse(process.argv);

checkCommanderOptions(commander, ['githubToken', 'wrapperBuild']);

if (!commander.wrapperBuild.includes('#')) {
  commander.outputHelp();
  process.exit(1);
}

const repoSlug = 'wireapp/wire-desktop';

const endsWithAny = (suffixes: string[], str: string) => suffixes.some(suffix => str.endsWith(suffix));

(async () => {
  let PLATFORM;

  const [platform, version] = commander.wrapperBuild.toLowerCase().split('#');
  const basePath = commander.path || path.resolve('.');

  if (platform === 'linux') {
    PLATFORM = 'Linux';
  } else if (platform === 'windows') {
    PLATFORM = 'Windows';
  } else if (platform === 'macos') {
    PLATFORM = 'macOS';
  } else {
    throw new Error('Invalid platform');
  }

  const commitish = await execAsync('git rev-parse HEAD');
  const changelog = '...';
  const githubToken = commander.githubToken;

  const {id: draftId} = await createDraft({
    changelog,
    commitish,
    githubToken,
    repoSlug,
    tagName: `${platform}/${version}`,
    title: `${version} - ${PLATFORM}`,
  });

  const files = await fs.readdir(basePath);
  const uploadFiles = files.filter(fileName =>
    endsWithAny(['.asc', '.sig', '.AppImage', '.deb', '.exe', '.pkg'], fileName)
  );

  for (const fileName in uploadFiles) {
    const resolvedPath = path.join(basePath, fileName);
    await uploadAsset({draftId, fileName, filePath: resolvedPath, githubToken, repoSlug});
  }

  console.log('Done creating draft.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
