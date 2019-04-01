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

import axios, {AxiosResponse} from 'axios';
import * as fs from 'fs-extra';

interface DraftOptions {
  changelog: string;
  commitish: string;
  draftUrl: string;
  githubToken: string;
  tagName: string;
  title: string;
}

interface UploadOptions {
  fileName: string;
  filePath: string;
  fullDraftUrl: string;
  githubToken: string;
  uploadUrl: string;
}

interface GitHubDraftData {
  upload_url: string;
  url: string;
}

async function createDraft(options: DraftOptions): Promise<AxiosResponse<GitHubDraftData>> {
  const {changelog, commitish, draftUrl, githubToken, tagName, title} = options;

  const draftData = {
    body: changelog,
    draft: true,
    name: title,
    prerelease: false,
    tag_name: tagName,
    target_commitish: commitish,
  };

  const AuthorizationHeaders = {
    Authorization: `token ${githubToken}`,
  };

  console.log('Creating a draft ...');
  console.log(draftData);

  try {
    const draftResponse = await axios.post<GitHubDraftData>(draftUrl, draftData, {headers: AuthorizationHeaders});
    console.log('Draft created.');
    return draftResponse;
  } catch (error) {
    console.error('Error response from GitHub:', error.response.data);
    throw new Error(
      `Draft creation failed with status code "${error.response.status}": "${error.response.statusText}"`
    );
  }
}

async function uploadAsset(options: UploadOptions): Promise<void> {
  const {fileName, filePath, fullDraftUrl, githubToken, uploadUrl} = options;

  console.log(`Uploading asset "${fileName}" ...`);

  const AuthorizationHeaders = {
    Authorization: `token ${githubToken}`,
  };

  const headers = {
    ...AuthorizationHeaders,
    'Content-type': 'application/binary',
  };
  const file = await fs.readFile(filePath);

  try {
    await axios.post(`${uploadUrl}?name=${fileName}`, file, {headers, maxContentLength: 104857600});
  } catch (uploadError) {
    console.error(
      `Upload failed with status code "${uploadError.response.status}": ${uploadError.response.statusText}"`
    );
    console.log('Deleting draft because upload failed');

    try {
      await axios.delete(fullDraftUrl, {headers: AuthorizationHeaders});
      console.log('Draft deleted');
    } catch (deleteError) {
      console.error('Error response from GitHub:', deleteError.response.data);
      throw new Error(
        `Deletion failed with status code "${deleteError.response.status}: ${deleteError.response.statusText}"`
      );
    } finally {
      throw new Error('Uploading asset failed');
    }
  }
  console.log(`Asset "${fileName}" uploaded.`);
}

export {createDraft, uploadAsset};
