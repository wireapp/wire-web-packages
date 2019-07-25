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

import {APIClient} from '@wireapp/api-client';
import {AssetRetentionPolicy} from '@wireapp/api-client/dist/asset/AssetRetentionPolicy';
import {FileContent, ImageContent} from '../conversation/content/';
import {EncryptedAssetUploaded} from '../cryptography/';
import * as AssetCryptography from '../cryptography/AssetCryptography.node';

export interface AssetOptions {
  public: boolean;
  retention: AssetRetentionPolicy;
}

export class AssetService {
  constructor(private readonly apiClient: APIClient) {}

  private async postAsset(buffer: Buffer, options?: AssetOptions): Promise<EncryptedAssetUploaded> {
    const {cipherText, keyBytes, sha256} = await AssetCryptography.encryptAsset(buffer);
    const {key, token} = await this.apiClient.asset.api.postAsset(new Uint8Array(cipherText), options);

    return {
      cipherText,
      key,
      keyBytes,
      sha256,
      token,
    };
  }

  public uploadImageAsset(image: ImageContent, options?: AssetOptions): Promise<EncryptedAssetUploaded> {
    return this.postAsset(image.data, options);
  }

  public uploadFileAsset(file: FileContent, options?: AssetOptions): Promise<EncryptedAssetUploaded> {
    return this.postAsset(file.data, options);
  }
}
