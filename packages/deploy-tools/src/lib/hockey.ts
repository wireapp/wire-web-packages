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

import path from 'path';

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs-extra';
import JSZip from 'jszip';

const HOCKEY_API_URL = 'https://rink.hockeyapp.net/api/2/apps';

interface HockeyOptions {
  hockeyAppId: string;
  hockeyToken: string;
  version: string;
}

interface HockeyVersionData {
  config_url: string;
  id: string;
  public_url: string;
  shortversion: string;
  status: 1 | 2;
  timestamp: number;
  title: string;
  version: string;
}

interface HockeyUploadOptions extends HockeyOptions {
  filePath: string;
  hockeyVersionId: number | string;
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

async function createVersion(options: HockeyOptions): Promise<HockeyVersionData> {
  const {hockeyAppId, hockeyToken, version} = options;
  const [majorVersion, minorVersion, patchVersion] = version.split('.');

  const hockeyUrl = `${HOCKEY_API_URL}/${hockeyAppId}/app_versions/new`;

  const headers = {
    'X-HockeyAppToken': hockeyToken,
  };

  const postData = {
    bundle_short_version: `${majorVersion}.${minorVersion}`,
    bundle_version: patchVersion,
    notes: 'Jenkins Build',
    notify: 0,
    status: 2,
  };

  try {
    const response = await axios.post<HockeyVersionData>(hockeyUrl, postData, {headers});
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(
      `Hockey version creation failed with status code "${error.response.status}": "${error.response.statusText}"`
    );
  }
}

async function uploadVersion(options: HockeyUploadOptions): Promise<void> {
  const {filePath, hockeyAppId, hockeyToken, hockeyVersionId, version} = options;
  const semverVersion = version.split('.');
  const resolvedFile = path.resolve(filePath);

  const hockeyUrl = `${HOCKEY_API_URL}/${hockeyAppId}/app_versions/${hockeyVersionId}`;

  const postData = {
    bundle_short_version: `${semverVersion[0]}.${semverVersion[1]}`,
    bundle_version: semverVersion[2],
    notes: 'Jenkins Build',
    notify: 0,
    status: 2,
  };

  const readStream = fs.createReadStream(resolvedFile).on('error', error => {
    throw error;
  });
  const formData = new FormData();

  Object.entries(postData).forEach(([key, value]) => formData.append(key, value));
  formData.append('files', readStream);

  const headers = {
    ...formData.getHeaders(),
    'X-HockeyAppToken': hockeyToken,
  };

  try {
    await axios.put<void>(hockeyUrl, formData, {headers, maxContentLength: 524288000});
  } catch (error) {
    console.error(error);
    throw new Error(
      `Hockey version upload failed with status code "${error.response.status}": "${error.response.statusText}"`
    );
  }
}

export {createVersion, HockeyOptions, HockeyVersionData, HockeyUploadOptions, uploadVersion, zip};
