/*
 * Wire
 * Copyright (C) 2023 Wire Swiss GmbH
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

import {Decoder, Encoder} from 'bazinga64';

import {generateSecretKey} from './secretKeyGenerator';

const systemCryptos = {
  v0: {
    encrypt: async (value: Uint8Array) => {
      return value;
    },
    decrypt: async (value: Uint8Array) => {
      return value;
    },
    version: undefined,
  },

  v01: {
    encrypt: async (value: Uint8Array) => {
      return Encoder.toBase64(value).asBytes;
    },
    decrypt: async (value: Uint8Array) => {
      const str = new TextDecoder().decode(value);
      return Decoder.fromBase64(str).asBytes;
    },
    version: undefined,
  },

  v1: {
    encrypt: async (value: string) => {
      const encoder = new TextEncoder();
      return encoder.encode(value);
    },
    decrypt: async (value: Uint8Array) => {
      const decoder = new TextDecoder();
      return decoder.decode(value);
    },
    version: 1,
  },
} as const;

describe('SecretKeyGenerator', () => {
  beforeEach(async () => {
    return new Promise(resolve => {
      Object.values(systemCryptos).forEach(version => {
        jest.spyOn(version, 'encrypt');
        jest.spyOn(version, 'decrypt');
      });
      const deleteReq = indexedDB.deleteDatabase('test');
      deleteReq.onsuccess = resolve;
      deleteReq.onerror = resolve;
      deleteReq.onblocked = resolve;
    });
  });

  it('generates and store a secret key stored in indexeddb', async () => {
    const secretKey = await generateSecretKey({dbName: 'test'});
    expect(secretKey).toBeDefined();

    const secretKey2 = await generateSecretKey({dbName: 'test'});
    expect(secretKey).toEqual(secretKey2);
  });

  it.each(Object.entries(systemCryptos))(
    'generates and store a secret key encrypted using system crypto (%s)',
    async (_name, systemCrypto) => {
      const secretKey = await generateSecretKey({
        dbName: 'test',
        systemCrypto,
      });

      expect(secretKey).toBeDefined();
      expect(systemCrypto.encrypt).toHaveBeenCalled();
      expect(systemCrypto.decrypt).not.toHaveBeenCalled();

      // fetch stored key
      const secretKey2 = await generateSecretKey({dbName: 'test', systemCrypto: systemCrypto});

      expect(secretKey2).toEqual(secretKey);
      expect(systemCrypto.encrypt).toHaveBeenCalledTimes(1);
      expect(systemCrypto.decrypt).toHaveBeenCalledTimes(1);
    },
  );

  it.each([['v0 > v01', systemCryptos.v0, systemCryptos.v01]])(
    'throws an error if previous systemCrypto is not compatible with the current one (%s)',
    async (_name, crypto1, crypto2) => {
      const secretKey = await generateSecretKey({
        dbName: 'test',
        systemCrypto: crypto1,
      });

      expect(secretKey).toBeDefined();

      let error;
      try {
        await generateSecretKey({dbName: 'test', systemCrypto: crypto2});
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
    },
  );

  it.each([['v01 > v1', systemCryptos.v01, systemCryptos.v1]])(
    'is able to read a key that was generated with a previous system crypto (%s)',
    async (_name, crypto1, crypto2) => {
      const secretKey = await generateSecretKey({
        dbName: 'test',
        systemCrypto: crypto1,
      });

      expect(secretKey).toBeDefined();

      const secretKey2 = await generateSecretKey({dbName: 'test', systemCrypto: crypto2});

      expect(secretKey2).toEqual(secretKey);
    },
  );
});
