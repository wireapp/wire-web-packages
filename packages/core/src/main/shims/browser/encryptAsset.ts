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

'use strict';

const equalHashes = (bufferA: ArrayBuffer, bufferB: ArrayBuffer) => {
  const arrayA = new Uint32Array(bufferA);
  const arrayB = new Uint32Array(bufferB);
  return arrayA.length === arrayB.length && arrayA.every((value, index) => value === arrayB[index]);
};

const generateRandomBytes = (length: number) => {
  const getRandomValue = () => {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    return buffer[0] >>> 0;
  };

  const randomValues = new Uint32Array(length / 4).map(getRandomValue);
  const randomBytes = new Uint8Array(randomValues.buffer);
  if (randomBytes.length && !randomBytes.every(byte => byte === 0)) {
    return randomBytes;
  }
  throw Error('Failed to initialize iv with random values');
};

export const decryptAesAsset = async (cipherText: ArrayBuffer, keyBytes: ArrayBuffer, referenceSha256: ArrayBuffer) => {
  const computedSha256 = await window.crypto.subtle.digest('SHA-256', cipherText);

  if (!equalHashes(referenceSha256, computedSha256)) {
    throw new Error('Encrypted asset does not match its SHA-256 hash');
  }

  const key = await window.crypto.subtle.importKey('raw', keyBytes, 'AES-CBC', false, ['decrypt']);

  const iv = cipherText.slice(0, 16);
  const assetCipherText = cipherText.slice(16);
  return window.crypto.subtle.decrypt({iv: iv, name: 'AES-CBC'}, key, assetCipherText);
};

export const encryptAesAsset = async (plaintext: ArrayBuffer) => {
  const iv = generateRandomBytes(16);
  const rawKeyBytes = generateRandomBytes(32);

  const key = await window.crypto.subtle.importKey('raw', rawKeyBytes.buffer, 'AES-CBC', true, ['encrypt']);
  const cipherText = await window.crypto.subtle.encrypt({iv: iv.buffer, name: 'AES-CBC'}, key, plaintext);

  const ivCipherText = new Uint8Array(cipherText.byteLength + iv.byteLength);
  ivCipherText.set(iv, 0);
  ivCipherText.set(new Uint8Array(cipherText), iv.byteLength);

  const computedSha256 = await window.crypto.subtle.digest('SHA-256', ivCipherText);
  const keyBytes = await window.crypto.subtle.exportKey('raw', key);
  return {cipherText: ivCipherText.buffer, keyBytes: keyBytes, sha256: computedSha256};
};
