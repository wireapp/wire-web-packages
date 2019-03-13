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

import axios from 'axios';
import {exec} from 'child_process';
import path from 'path';
import {promisify} from 'util';

import copy from 'copy';
import fs from 'fs-extra';
import JSZip from 'jszip';
import rimraf from 'rimraf';
import File from 'vinyl';

async function copyAsync(source: string, destination: string): Promise<File[]> {
  if (isFile(destination)) {
    await fs.ensureDir(path.dirname(destination));
  } else {
    await fs.ensureDir(destination);
  }

  return new Promise((resolve, reject) =>
    copy(source, destination, (error, files = []) => (error ? reject(error) : resolve(files)))
  );
}

async function downloadFileAsync(url: string, baseDir: string): Promise<void> {
  const zipFile = path.join(baseDir, 'archive.zip');
  await fs.ensureDir(baseDir);

  await new Promise((resolve, reject) => {
    const writer = fs
      .createWriteStream(zipFile)
      .on('error', reject)
      .on('finish', resolve);

    return axios
      .request({
        method: 'get',
        responseType: 'stream',
        url,
      })
      .then(response => {
        response.data.pipe(writer);
      });
  });

  await extractAsync(zipFile, baseDir);
  await fs.remove(zipFile);
}

async function extractAsync(zipFile: string, destination: string): Promise<void> {
  const jszip = new JSZip();
  await fs.ensureDir(destination);

  const data = await fs.readFile(zipFile);
  const entries: [string, JSZip.JSZipObject][] = [];

  await jszip.loadAsync(data, {createFolders: true});
  jszip.forEach((filePath, entry) => entries.push([filePath, entry]));
  const stripEntry = entries[0][0];

  await Promise.all(
    entries.map(async ([filePath, entry]) => {
      const resolvedFilePath = path.join(destination, filePath.replace(stripEntry, ''));
      if (entry.dir) {
        await fs.ensureDir(resolvedFilePath);
      } else {
        const content = await entry.async('nodebuffer');
        await fs.writeFile(resolvedFilePath, content);
      }
    })
  );
}

const isFile = (path: string) => /[^.\/\\]+\..+$/.test(path);
const rimrafAsync = promisify(rimraf);
const execAsync = promisify(exec);

export {isFile, copyAsync, downloadFileAsync, execAsync, extractAsync, rimrafAsync};
