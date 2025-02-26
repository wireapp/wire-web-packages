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

import {
  NodeServiceApi,
  RestDeleteVersionResponse,
  RestNode,
  RestNodeCollection,
  RestPerformActionResponse,
  RestPromoteVersionResponse,
  RestPublicLinkDeleteSuccess,
  RestShareLink,
} from 'cells-sdk-ts';
import {v4 as uuidv4} from 'uuid';

import {CellsStorage} from './CellsStorage/CellsStorage';
import {S3Service} from './CellsStorage/S3Service';

import {Config} from '../Config';
import {HttpClient} from '../http';

export class CellsAPI {
  private readonly storageService: CellsStorage;
  private readonly client: NodeServiceApi;

  constructor({
    httpClient,
    storageService,
    config,
  }: {
    httpClient: HttpClient;
    storageService?: CellsStorage;
    config: NonNullable<Config['cells']>;
  }) {
    this.storageService = storageService || new S3Service(config.s3);

    this.client = new NodeServiceApi(undefined, undefined, httpClient.client);
  }

  async uploadFileDraft({
    filePath,
    file,
    autoRename = true,
  }: {
    filePath: string;
    file: File;
    autoRename?: boolean;
  }): Promise<{uuid: string; versionId: string}> {
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

    const node = result.data?.Results?.[0].Node;
    const uuid = node?.Uuid;
    const versionId = node?.Versions?.[0]?.VersionId;

    if (!uuid || !versionId) {
      throw new Error('Failed to upload file draft');
    }

    return {
      uuid,
      versionId,
    };
  }

  async promoteFileDraft({uuid, versionId}: {uuid: string; versionId: string}): Promise<RestPromoteVersionResponse> {
    const result = await this.client.promoteVersion(uuid, versionId, {Publish: true});

    return result.data;
  }

  async deleteFileDraft({uuid, versionId}: {uuid: string; versionId: string}): Promise<RestDeleteVersionResponse> {
    const result = await this.client.deleteVersion(uuid, versionId);

    return result.data;
  }

  async deleteFile(path: string): Promise<RestPerformActionResponse> {
    const result = await this.client.performAction('delete', {Nodes: [{Path: path}]});

    return result.data;
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

  async deleteFilePublicLink({uuid}: {uuid: string}): Promise<RestPublicLinkDeleteSuccess> {
    const result = await this.client.deletePublicLink(uuid);

    return result.data;
  }

  async getFilePublicLink({
    uuid,
    label,
    alreadyShared,
  }: {
    uuid: string;
    label: string;
    alreadyShared: boolean;
  }): Promise<RestShareLink> {
    if (alreadyShared) {
      await this.deleteFilePublicLink({uuid});
    }

    const result = await this.client.createPublicLink(uuid, {
      Link: {
        Label: label,
        Permissions: ['Preview', 'Download'],
      },
    });

    return result.data;
  }
}
