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

require('fake-indexeddb/auto');
import nodeCrypto from 'crypto';
import {createEncryptedStore} from './encryptedStore';

// @ts-ignore
global.window = {
  // @ts-ignore
  crypto: nodeCrypto.webcrypto,
};

describe('encryptedStore', () => {
  describe('Store and restore secret values', () => {
    it('Stores secret values', async () => {
      const store = await createEncryptedStore('test');
      const value = Uint8Array.from([1, 2, 3]);
      await store.saveSecretValue('test', value);
      const result = await store.getsecretValue('test');
      expect(result).toEqual(value);
    });
  });
});
