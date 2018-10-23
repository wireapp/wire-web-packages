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

import * as crypto from 'crypto';
import * as iconv from 'iconv-lite';
import * as Long from 'long';
import {PayloadBundleIncoming} from '../conversation/';
import {AssetContent, ContentType, LocationContent, TextContent} from '../conversation/content/';

class MessageHashService {
  constructor(private readonly message: PayloadBundleIncoming) {}

  private createSha256Hash(buffer: Buffer, encoding = 'hex'): string {
    return crypto
      .createHash('sha256')
      .update(buffer)
      .digest()
      .toString(encoding);
  }

  private getAssetBuffer(content: AssetContent): Buffer {
    if (content.uploaded) {
      const assetId = content.uploaded.assetId;
      const textBuffer = Buffer.from(assetId);
      const timestampBuffer = this.getTimestampBuffer();

      return Buffer.concat([textBuffer, timestampBuffer]);
    } else {
      return Buffer.from([]);
    }
  }

  private getTimestampBuffer(): Buffer {
    const timestampBytes = new Long(this.message.timestamp).toBytesBE();
    return Buffer.from(timestampBytes);
  }

  private getLocationBuffer(content: LocationContent): Buffer {
    const latitudeApproximate = Math.round(content.latitude * 1000);
    const longitudeApproximate = Math.round(content.longitude * 1000);

    const latitudeBytes = new Long(latitudeApproximate).toBytesBE();
    const longitudeBytes = new Long(longitudeApproximate).toBytesBE();

    const latitudeBuffer = Buffer.from(latitudeBytes);
    const longitudeBuffer = Buffer.from(longitudeBytes);
    const timestampBuffer = this.getTimestampBuffer();

    return Buffer.concat([latitudeBuffer, longitudeBuffer, timestampBuffer]);
  }

  private getTextBuffer(content: TextContent): Buffer {
    const textBuffer = iconv.encode(content.text, 'utf16be', {addBOM: true});
    const timestampBuffer = this.getTimestampBuffer();

    return Buffer.concat([textBuffer, timestampBuffer]);
  }

  getHash(): string {
    const messageContent = this.message.content;

    if (messageContent) {
      let buffer: Buffer;

      if (ContentType.isLocationContent(messageContent)) {
        buffer = this.getLocationBuffer(messageContent);
      } else if (ContentType.isTextContent(messageContent)) {
        buffer = this.getTextBuffer(messageContent);
      } else if (ContentType.isAssetContent(messageContent)) {
        buffer = this.getAssetBuffer(messageContent);
      } else {
        throw new Error(`Unknown message type (message id "${this.message.id}").`);
      }
      return this.createSha256Hash(buffer);
    } else {
      throw new Error(`Message with ID "${this.message.id}" has no content.`);
    }
  }
}

export {MessageHashService};
