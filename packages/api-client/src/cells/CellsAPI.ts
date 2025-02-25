/*
 * Wire
 * Copyright (C) 2025 Wire Swiss GmbH
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

import {NodeServiceApi, RestNode, RestNodeCollection} from 'cells-sdk-ts';
import {v4 as uuidv4} from 'uuid';

import {CellsStorageService} from './CellStorageService/CellStorageService';
import {S3Service} from './CellStorageService/S3Service';

import {HttpClient} from '../http';

export class CellsAPI {
  private readonly storageService: CellsStorageService;
  private readonly client: NodeServiceApi;

  constructor(httpClient: HttpClient, storageService?: CellsStorageService) {
    this.storageService = storageService || new S3Service(httpClient.config.cells!.s3);

    this.client = new NodeServiceApi(undefined, undefined, httpClient.client);
  }

  async uploadFile({
    filePath,
    file,
    autoRename = true,
  }: {
    filePath: string;
    file: File;
    autoRename?: boolean;
  }): Promise<void> {
    let path = `/${filePath}`.normalize('NFC');

    const result = await this.client.createCheck({
      Inputs: [{Type: 'LEAF', Locator: {Path: path}}],
      FindAvailablePath: true,
    });

    if (autoRename && result.data.Results?.length && result.data.Results[0].Exists) {
      path = result.data.Results[0].NextPath || path;
    }

    const metadata = {
      'Draft-Mode': 'true',
      'Create-Resource-Uuid': uuidv4(),
      'Create-Version-Id': uuidv4(),
    };

    await this.storageService.putObject({filePath: path, file, metadata});
  }

  async getFile(id: string): Promise<RestNode> {
    const result = await this.client.getByUuid(id);

    return result.data;
  }

  async getAllFiles(): Promise<RestNodeCollection> {
    const result = await this.client.lookup({
      Locators: {Many: [{Path: `/*`}]},
      Flags: ['WithVersionsAll'],
    });

    return result.data;
  }

  async deleteFile(path: string): Promise<void> {
    await this.client.performAction('delete', {Nodes: [{Path: path}]});
  }
}
