/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
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

import {Crypto} from './interfaces';

const cryptoLib = window.crypto;

export const crypto: Crypto = {
  async digest(cipherText: Buffer | Uint8Array): Promise<Buffer> {
    const checksum = await cryptoLib.subtle.digest('SHA-256', cipherText);
    return Buffer.from(checksum);
  },

  async decrypt(cipherText: Buffer | Uint8Array, keyBytes: Buffer): Promise<Buffer> {
    const key = await cryptoLib.subtle.importKey('raw', keyBytes, 'AES-CBC', false, ['decrypt']);

    const initializationVector = cipherText.slice(0, 16);
    const assetCipherText = cipherText.slice(16);
    const decipher = await cryptoLib.subtle.decrypt({iv: initializationVector, name: 'AES-CBC'}, key, assetCipherText);

    return Buffer.from(decipher);
  },

  getRandomValues(size: number): Buffer {
    return Buffer.from(cryptoLib.getRandomValues(new Uint8Array(size)));
  },

  async encrypt(
    plainText: Buffer | Uint8Array,
    keyBytes: Buffer,
    initializationVector: Buffer,
  ): Promise<{key: Buffer; cipher: Buffer}> {
    const key = await cryptoLib.subtle.importKey('raw', keyBytes, 'AES-CBC', true, ['encrypt']);
    return {
      key: Buffer.from(await cryptoLib.subtle.exportKey('raw', key)),
      cipher: await cryptoLib.subtle.encrypt({iv: initializationVector, name: 'AES-CBC'}, key, plainText),
    };
  },
};
