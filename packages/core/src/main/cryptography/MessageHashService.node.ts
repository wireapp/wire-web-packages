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
import * as Long from 'long';

import {PayloadBundleIncoming} from '../conversation/';
import {AssetContent, ContentType, ConversationContent, LocationContent, TextContent} from '../conversation/content/';

class MessageHashService {
  constructor(private readonly message: PayloadBundleIncoming) {}

  private createSha256Hash(buffer: Buffer, encoding = 'hex'): string {
    return crypto
      .createHash('sha256')
      .update(buffer)
      .digest()
      .toString(encoding);
  }

  private convertToUtf16BE(str: string): Buffer {
    const BOMChar = '\uFEFF';

    str = `${BOMChar}${str}`;

    const buffer = Buffer.from(str, 'ucs2');

    for (let index = 0; index < buffer.length; index += 2) {
      const tempValue = buffer[index];
      buffer[index] = buffer[index + 1];
      buffer[index + 1] = tempValue;
    }

    return buffer;
  }

  private getAssetBuffer(content: AssetContent): Buffer {
    if (content.uploaded) {
      const assetId = content.uploaded.assetId;
      const withoutDashes = assetId.replace(/-/g, '');
      return Buffer.from(withoutDashes, 'hex');
    } else {
      return Buffer.from([]);
    }
  }

  private getTimestampBuffer(timestamp: number): Buffer {
    const timestampBytes = Long.fromInt(timestamp).toBytesBE();
    return Buffer.from(timestampBytes);
  }

  private getLocationBuffer(content: LocationContent): Buffer {
    const latitudeApproximate = Math.round(content.latitude * 1000);
    const longitudeApproximate = Math.round(content.longitude * 1000);

    const latitudeLong = Long.fromInt(latitudeApproximate).toBytesBE();
    const longitudeLong = Long.fromInt(longitudeApproximate).toBytesBE();

    const latitudeBuffer = Buffer.from(latitudeLong);
    const longitudeBuffer = Buffer.from(longitudeLong);

    return Buffer.concat([latitudeBuffer, longitudeBuffer]);
  }

  private getTextBuffer(content: TextContent): Buffer {
    return this.convertToUtf16BE(content.text);
  }

  private getBuffer(content: ConversationContent): Buffer {
    let buffer: Buffer;

    if (ContentType.isLocationContent(content)) {
      buffer = this.getLocationBuffer(content);
    } else if (ContentType.isTextContent(content)) {
      buffer = this.getTextBuffer(content);
    } else if (ContentType.isAssetContent(content)) {
      buffer = this.getAssetBuffer(content);
    } else {
      throw new Error(`Unknown message type (message id "${this.message.id}").`);
    }

    const timestampBuffer = this.getTimestampBuffer(this.message.timestamp);
    return Buffer.concat([buffer, timestampBuffer]);
  }

  getHash(): string {
    const messageContent = this.message.content;

    if (messageContent) {
      const buffer = this.getBuffer(messageContent);
      return this.createSha256Hash(buffer);
    } else {
      throw new Error(`Message with ID "${this.message.id}" has no content.`);
    }
  }
}

export {MessageHashService};
