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

import * as jimp from 'jimp';
import {promisify} from 'util';

export default class ImageProcessingService {
  private static readonly MAX_SIZE = 1448;
  private static readonly MAX_FILE_SIZE = 310 * 1024;
  private static readonly COMPRESSION = 80;

  constructor() {}

  public async compress(data: Buffer | string): Promise<any> {
    const image = await jimp.read(data);

    if (image.bitmap.width > ImageProcessingService.MAX_SIZE || image.bitmap.height > ImageProcessingService.MAX_SIZE) {
      image.scaleToFit(ImageProcessingService.MAX_SIZE, ImageProcessingService.MAX_SIZE);
    }

    if (image.bitmap.data.length > ImageProcessingService.MAX_FILE_SIZE) {
      image.quality(ImageProcessingService.COMPRESSION);
    }

    return promisify(image.getBuffer)(jimp.AUTO.toString());
  }
}
