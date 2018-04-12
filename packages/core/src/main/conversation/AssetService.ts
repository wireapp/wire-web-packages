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

const UUID = require('pure-uuid');
import APIClient = require('@wireapp/api-client');
import {CryptographyService, EncryptedAsset} from '../cryptography/root';
import {ImageProcessingService} from '../processing/root';
import {encryptAsset} from '../cryptography/AssetCryptography.node';
import {AssetRetentionPolicy} from '@wireapp/api-client/dist/commonjs/asset/AssetRetentionPolicy';

export default class AssetService {
  private imageProcessingService: ImageProcessingService;
  constructor(
    private apiClient: APIClient,
    private protocolBuffers: any = {},
    private cryptographyService: CryptographyService
  ) {
    this.imageProcessingService = new ImageProcessingService();
  }

  public async uploadAsset(buffer: Buffer, options: {public: boolean; retention: AssetRetentionPolicy}): Promise<any> {
    const {key, keyBytes, sha256, token} = await this._uploadAsset(buffer, options);
    const asset = this.protocolBuffers.Asset.create();
    const remoteData = this.protocolBuffers.Asset.RemoteData.create({keyBytes, sha256, key, token});
    asset.set('uploaded', remoteData);
    return asset;
  }

  private async _uploadAsset(
    buffer: Buffer,
    options: {public: boolean; retention: AssetRetentionPolicy}
  ): Promise<any> {
    const {cipherText, keyBytes, sha256} = await encryptAsset(buffer);
    const {key, token} = await this.apiClient.asset.api.postAsset(new Uint8Array(cipherText), options);
    return {
      key,
      keyBytes,
      sha256,
      token,
    };
  }

  public async uploadImageAsset(
    image: Buffer | string,
    options: {public: boolean; retention: AssetRetentionPolicy}
  ): Promise<any> {
    const {compressedBytes, compressedImage} = await this.imageProcessingService.compress(image);
    const {key, keyBytes, sha256, token} = await this._uploadAsset(compressedBytes, options);
    const imageMetadata = this.protocolBuffers.Asset.ImageMetaData.create(
      compressedImage.width,
      compressedImage.height
    );

    const asset = this.protocolBuffers.Asset.create();
    asset.set(
      'original',
      this.protocolBuffers.Asset.Original.create(image.type, compressedBytes.length, null, imageMetadata)
    );
    asset.set('uploaded', this.protocolBuffers.Asset.RemoteData.create({keyBytes, sha256, key, token}));
    return asset;
  }

  public async getAssetUrl(assetKey: string, assetToken?: string): Promise<any> {
    return this.apiClient.asset.api.getAsset(assetKey, assetToken);
  }
}
