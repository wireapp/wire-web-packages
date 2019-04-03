#!/usr/bin/env node

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

import commander from 'commander';
import electronBuilder from 'electron-builder';
import path from 'path';

import {checkCommanderOptions, writeJson} from '../lib/build-utils';
import {getCommonConfig, logEntries} from '../lib/commonConfig';
import {LinuxConfig} from '../lib/Config';

commander
  .name('wire-build-linux')
  .description('Build the Wire wrapper for Linux')
  .option('-w, --wire-json <path>', 'Specify the wire.json path')
  .option('-p, --electron-package-json <path>', 'Specify the electron package.json path')
  .parse(process.argv);

checkCommanderOptions(commander, ['wireJson', 'electronPackageJson']);
const {electronPackageJson, wireJson} = commander;

const wireJsonResolved = path.resolve(wireJson);
const electronPackageJsonResolved = path.resolve(electronPackageJson);
const originalElectronJson = require(electronPackageJson);
const {commonConfig, defaultConfig} = getCommonConfig({electronPackageJson, envFile: '.env.defaults', wireJson});

const linuxDefaultConfig: LinuxConfig = {
  /* tslint:disable:no-invalid-template-strings */
  artifactName: '${productName}-${version}_${arch}.${ext}',
  categories: 'Network;InstantMessaging;Chat;VideoConference',
  keywords: 'chat;encrypt;e2e;messenger;videocall',
  nameShort: commonConfig.name,
  targets: ['AppImage', 'deb', 'rpm'],
};

const linuxConfig: LinuxConfig = {
  ...linuxDefaultConfig,
  categories: process.env.LINUX_CATEGORIES || linuxDefaultConfig.categories,
  keywords: process.env.LINUX_KEYWORDS || linuxDefaultConfig.keywords,
  nameShort: process.env.LINUX_NAME_SHORT || linuxDefaultConfig.nameShort,
  targets: process.env.LINUX_TARGET ? [process.env.LINUX_TARGET] : linuxDefaultConfig.targets,
};

const linuxDesktopConfig = {
  Categories: linuxConfig.categories,
  GenericName: commonConfig.description,
  Keywords: linuxConfig.keywords,
  MimeType: `x-scheme-handler/${commonConfig.customProtocolName}`,
  Name: commonConfig.nameShort,
  StartupWMClass: commonConfig.nameShort,
  Version: '1.1',
};

const platformSpecificConfig = {
  afterInstall: 'bin/deb/after-install.tpl',
  afterRemove: 'bin/deb/after-remove.tpl',
  category: 'Network',
  desktop: linuxDesktopConfig,
  fpm: ['--name', linuxConfig.nameShort],
};

const rpmDepends = ['alsa-lib', 'GConf2', 'libappindicator', 'libnotify', 'libXScrnSaver', 'libXtst', 'nss'];
const debDepends = ['libappindicator1', 'libasound2', 'libgconf-2-4', 'libnotify-bin', 'libnss3', 'libxss1'];

const builderConfig: electronBuilder.Configuration = {
  asar: false,
  deb: {
    ...platformSpecificConfig,
    depends: debDepends,
  },
  directories: {
    app: 'electron',
    buildResources: 'resources',
    output: 'wrap/dist',
  },
  extraMetadata: {
    homepage: commonConfig.websiteUrl,
  },
  linux: {
    artifactName: linuxConfig.artifactName,
    category: platformSpecificConfig.category,
    depends: debDepends,
    executableName: linuxConfig.nameShort,
    target: linuxConfig.targets,
  },
  productName: commonConfig.name,
  publish: null,
  rpm: {
    ...platformSpecificConfig,
    depends: rpmDepends,
  },
};

const newElectronMetadata = {
  ...originalElectronJson,
  version: commonConfig.version,
};

logEntries(commonConfig, 'commonConfig');

const targets = electronBuilder.Platform.LINUX.createTarget(linuxConfig.targets, electronBuilder.archFromString('x64'));

console.info(`Building ${commonConfig.name} for Linux v${commonConfig.version} ...`);

writeJson(electronPackageJsonResolved, newElectronMetadata)
  .then(() => writeJson(wireJsonResolved, commonConfig))
  .then(() => electronBuilder.build({config: builderConfig, targets}))
  .then(buildFiles => buildFiles.forEach(buildFile => console.log(`Built package "${buildFile}".`)))
  .finally(() =>
    Promise.all([
      writeJson(wireJsonResolved, defaultConfig),
      writeJson(electronPackageJsonResolved, originalElectronJson),
    ])
  )
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
