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
import * as ed2curve from 'ed2curve';
import * as sodium from 'libsodium-wrappers-sumo';

import ClassUtil from '../util/ClassUtil';

import PublicKey from './PublicKey';
import ArrayUtil from '../util/ArrayUtil';
import TypeUtil from '../util/TypeUtil';

export default class SecretKey {
  sec_edward: Uint8Array;
  sec_curve: Uint8Array;

  constructor() {}

  /**
   * @param {!Uint8Array} sec_edward
   * @param {!Uint8Array} sec_curve
   * @returns {SecretKey}
   */
  static new(sec_edward, sec_curve) {
    TypeUtil.assert_is_instance(Uint8Array, sec_edward);
    TypeUtil.assert_is_instance(Uint8Array, sec_curve);

    const sk = ClassUtil.new_instance(SecretKey);

    sk.sec_edward = sec_edward;
    sk.sec_curve = sec_curve;
    return sk;
  }

  /**
   * This function can be used to compute a message signature.
   * @param {!string} message - Message to be signed
   * @returns A message signature
   */
  sign(message): Uint8Array {
    return sodium.crypto_sign_detached(message, this.sec_edward);
  }

  /**
   * This function can be used to compute a shared secret given a user's secret key and another
   * user's public key.
   * @param {!keys.PublicKey} public_key - Another user's public key
   * @returns Array buffer view of the computed shared secret
   */
  shared_secret(public_key): Uint8Array {
    TypeUtil.assert_is_instance(PublicKey, public_key);

    const shared_secret = sodium.crypto_scalarmult(this.sec_curve, public_key.pub_curve);

    ArrayUtil.assert_is_not_zeros(shared_secret);

    return shared_secret;
  }

  encode(encoder: CBOR.Encoder): CBOR.Encoder {
    encoder.object(1);
    encoder.u8(0);
    return encoder.bytes(this.sec_edward);
  }

  /**
   * @returns {SecretKey}
   */
  static decode(decoder: CBOR.Decoder) {
    TypeUtil.assert_is_instance(CBOR.Decoder, decoder);

    const self = ClassUtil.new_instance(SecretKey);

    const nprops = decoder.object();
    for (let index = 0; index <= nprops - 1; index++) {
      switch (decoder.u8()) {
        case 0:
          self.sec_edward = new Uint8Array(decoder.bytes());
          break;
        default:
          decoder.skip();
      }
    }

    TypeUtil.assert_is_instance(Uint8Array, self.sec_edward);

    self.sec_curve = ed2curve.convertSecretKey(self.sec_edward);
    return self;
  }
}
