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

import {EncryptedAsset} from '../../crypto/root';

const equalHashes = (bufferA: Buffer, bufferB: Buffer): boolean => {
  const arrayA = new Uint32Array(bufferA);
  const arrayB = new Uint32Array(bufferB);
  return arrayA.length === arrayB.length && arrayA.every((value, index) => value === arrayB[index]);
};

export const decryptAsset = async ({
  cipherText,
  keyBytes,
  sha256: referenceSHA256,
}: EncryptedAsset): Promise<Buffer> => {
  const computedSHA256 = await window.crypto.subtle.digest('SHA-256', cipherText);

  if (!equalHashes(new Buffer(computedSHA256), referenceSHA256)) {
    throw new Error('Encrypted asset does not match its SHA-256 hash');
  }

  const key = await window.crypto.subtle.importKey('raw', keyBytes, 'AES-CBC', false, ['decrypt']);

  const initializationVector = cipherText.slice(0, 16);
  const assetCipherText = cipherText.slice(16);
  const decipher = await window.crypto.subtle.decrypt(
    {iv: initializationVector, name: 'AES-CBC'},
    key,
    assetCipherText
  );

  return new Buffer(decipher);
};

export const encryptAsset = async (plaintext: ArrayBuffer): Promise<EncryptedAsset> => {
  const initializationVector = window.crypto.getRandomValues(new Uint8Array(16));
  const rawKeyBytes = window.crypto.getRandomValues(new Uint8Array(32));

  const key = await window.crypto.subtle.importKey('raw', rawKeyBytes.buffer, 'AES-CBC', true, ['encrypt']);
  const cipherText = await window.crypto.subtle.encrypt(
    {iv: initializationVector.buffer, name: 'AES-CBC'},
    key,
    plaintext
  );

  const ivCipherText = new Uint8Array(cipherText.byteLength + initializationVector.byteLength);
  ivCipherText.set(initializationVector, 0);
  ivCipherText.set(new Uint8Array(cipherText), initializationVector.byteLength);

  const computedSHA256 = await window.crypto.subtle.digest('SHA-256', ivCipherText);
  const keyBytes = await window.crypto.subtle.exportKey('raw', key);

  return {
    cipherText: new Buffer(ivCipherText),
    keyBytes: new Buffer(keyBytes),
    sha256: new Buffer(computedSHA256),
  };
};
