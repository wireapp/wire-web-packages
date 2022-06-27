/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import {DBSchema, IDBPDatabase, openDB} from 'idb';

export interface IEncryptedStore {
  saveSecretValue(primaryKey: string, value: Uint8Array): Promise<void>;

  getsecretValue(primaryKey: string): Promise<Uint8Array | undefined>;
}

interface EncryptedDB extends DBSchema {
  key: {
    key: string;
    value: CryptoKey;
  };
  secrets: {
    key: string;
    value: {
      iv: Uint8Array;
      encrypted: Uint8Array;
    };
  };
}

class EncryptedStore implements IEncryptedStore {
  readonly #key: CryptoKey;
  constructor(key: CryptoKey, private readonly db: IDBPDatabase<EncryptedDB>) {
    this.#key = key;
  }

  async saveSecretValue(primaryKey: string, value: Uint8Array) {
    const iv = await window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await this.#encrypt(value, iv, this.#key);
    await this.db.put('secrets', {iv, encrypted}, primaryKey);
  }

  async getsecretValue(primaryKey: string) {
    const result = await this.db.get('secrets', primaryKey);
    if (!result) {
      return undefined;
    }
    const {iv, encrypted} = result;
    return this.#decrypt(encrypted, iv, this.#key);
  }

  async #decrypt(data: Uint8Array, iv: Uint8Array, key: CryptoKey) {
    const decrypted = await window.crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, data);
    return new Uint8Array(decrypted);
  }

  async #encrypt(data: Uint8Array, iv: Uint8Array, key: CryptoKey) {
    return window.crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, data);
  }
}

async function generateKey() {
  return window.crypto.subtle.generateKey(
    {name: 'AES-GCM', length: 256},
    false, //whether the key is extractable (i.e. can be used in exportKey)
    ['encrypt', 'decrypt'],
  );
}

export async function createEncryptedStore(dbName: string) {
  const db = await openDB<EncryptedDB>(dbName, 1, {
    upgrade: async (database, oldVersion, newVersion, transaction) => {
      database.createObjectStore('key');
      database.createObjectStore('secrets');
    },
  });

  const keyPrimaryKey = 'dbKey';
  let key = await db.get('key', keyPrimaryKey);
  if (!key) {
    key = await generateKey();
    await db.put('key', key, keyPrimaryKey);
  }
  return new EncryptedStore(key, db);
}
