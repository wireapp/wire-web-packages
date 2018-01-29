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

import * as CBOR from '@wireapp/cbor';
import * as sodium from 'libsodium-wrappers-sumo';

import ClassUtil from '../util/ClassUtil';
import TypeUtil from '../util/TypeUtil';

export default class MacKey {
  key: Uint8Array;

  constructor() {}

  /**
   * @param key Mac Key in byte array format generated by derived secrets
   */
  static new(key: Uint8Array): MacKey {
    TypeUtil.assert_is_instance(Uint8Array, key);

    const mk = ClassUtil.new_instance<MacKey>(MacKey);
    mk.key = key;
    return mk;
  }

  /** Hash-based message authentication code */
  sign(msg: string | Uint8Array): Uint8Array {
    return sodium.crypto_auth_hmacsha256(msg, this.key);
  }

  /**
   * Verifies the signature of a given message by resigning it.
   * @param signature Mac signature (HMAC) which needs to get verified
   * @param msg Unsigned message
   */
  verify(signature: Uint8Array, msg: Uint8Array): boolean {
    return sodium.crypto_auth_hmacsha256_verify(signature, msg, this.key);
  }

  encode(encoder: CBOR.Encoder): CBOR.Encoder {
    encoder.object(1);
    encoder.u8(0);
    return encoder.bytes(this.key);
  }

  static decode(decoder: CBOR.Decoder): MacKey {
    TypeUtil.assert_is_instance(CBOR.Decoder, decoder);

    let key_bytes = null;

    const nprops = decoder.object();
    for (let index = 0; index <= nprops - 1; index++) {
      switch (decoder.u8()) {
        case 0:
          key_bytes = new Uint8Array(decoder.bytes());
          break;
        default:
          decoder.skip();
      }
    }

    return MacKey.new(key_bytes);
  }
}
