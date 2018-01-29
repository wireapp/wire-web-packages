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

import * as sodium from 'libsodium-wrappers-sumo';

import ArrayUtil from '../util/ArrayUtil';
import MemoryUtil from '../util/MemoryUtil';
import TypeUtil from '../util/TypeUtil';

const KeyDerivationUtil = {
  /**
   * HMAC-based Key Derivation Function
   *
   * @param input Initial Keying Material (IKM)
   * @param info Key Derivation Data (Info)
   * @param length Length of the derived key in bytes (L)
   */
  hkdf(
    salt: Uint8Array | string,
    input: Uint8Array | string | Array<number> | Array<ArrayBuffer>,
    info: Uint8Array | string,
    length: number
  ): Uint8Array {
    const convert_type = value => {
      if (typeof value === 'string') {
        return sodium.from_string(value);
      }
      TypeUtil.assert_is_instance(Uint8Array, value);
      return value;
    };

    salt = convert_type(salt);
    input = convert_type(input);
    info = convert_type(info);

    TypeUtil.assert_is_integer(length);

    const HASH_LEN = 32;

    const salt_to_key = (received_salt): Uint8Array => {
      const keybytes = sodium.crypto_auth_hmacsha256_KEYBYTES;
      if (received_salt.length > keybytes) {
        return <Uint8Array>sodium.crypto_hash_sha256(received_salt);
      }

      const key = new Uint8Array(keybytes);
      key.set(received_salt);
      return key;
    };

    const extract = (received_salt, received_input): Uint8Array => {
      return <Uint8Array>sodium.crypto_auth_hmacsha256(received_input, salt_to_key(received_salt));
    };

    const expand = (tag, received_info, received_length: number): Uint8Array => {
      const num_blocks = Math.ceil(received_length / HASH_LEN);
      let hmac = new Uint8Array(0);
      let result: any = new Uint8Array(0);

      for (let index = 0; index <= num_blocks - 1; index++) {
        const buf = ArrayUtil.concatenate_array_buffers([hmac, received_info, new Uint8Array([index + 1])]);
        hmac = <Uint8Array>sodium.crypto_auth_hmacsha256(buf, tag);
        result = ArrayUtil.concatenate_array_buffers(<any>[result, hmac]);
      }

      return new Uint8Array(result.buffer.slice(0, received_length));
    };

    const key = extract(salt, input);

    MemoryUtil.zeroize(input);
    MemoryUtil.zeroize(salt);

    return expand(key, info, length);
  },
};

export default KeyDerivationUtil;
