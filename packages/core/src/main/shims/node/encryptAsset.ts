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
import * as crypto from 'crypto';

const equalHashes = (bufferA: Buffer, bufferB: Buffer): boolean => {
  const arrayA = new Uint32Array(bufferA);
  const arrayB = new Uint32Array(bufferB);
  return arrayA.length === arrayB.length && arrayA.every((value, index) => value === arrayB[index]);
};

export const encryptAsset = (plainText: Buffer): EncryptedAsset => {
  const initializationVector = crypto.randomBytes(16);
  const keyBytes = crypto.randomBytes(32);

  const cipher = crypto.createCipheriv('aes-256-cbc', keyBytes, initializationVector);
  const cipherUpdated = cipher.update(plainText);
  const cipherFinal = cipher.final();

  const cipherText = Buffer.concat([cipherUpdated, cipherFinal]);

  const ivCipherText = new Uint8Array(initializationVector.byteLength + cipherText.byteLength);
  ivCipherText.set(initializationVector, 0);
  ivCipherText.set(cipherText, initializationVector.byteLength);

  const computedSha256 = crypto
    .createHash('SHA256')
    .update(new Buffer(ivCipherText.buffer))
    .digest();

  return {
    cipherText: new Buffer(ivCipherText.buffer),
    keyBytes,
    computedSha256,
  };
};

export const decryptAsset = ({cipherText, keyBytes, computedSha256}: EncryptedAsset): Buffer => {
  const referenceSha256 = crypto
    .createHash('SHA256')
    .update(cipherText)
    .digest();

  if (!equalHashes(referenceSha256, computedSha256)) {
    throw new Error('Encrypted asset does not match its SHA-256 hash');
  }

  const initializationVector = cipherText.slice(0, 16);
  const assetCipherText = cipherText.slice(16);

  const decipher = crypto.createDecipheriv('aes-256-cbc', keyBytes, initializationVector);
  const decipherUpdated = decipher.update(assetCipherText);
  const decipherFinal = decipher.final();

  return Buffer.concat([decipherUpdated, decipherFinal]);
};
