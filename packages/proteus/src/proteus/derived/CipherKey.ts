/*
 * Wire
 * Copyright (C) 2016 Wire Swiss GmbH
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

const CBOR = require('@wireapp/cbor');
const sodium = require('libsodium-wrappers-sumo');

import ClassUtil from '../util/ClassUtil';
import DontCallConstructor from '../errors/DontCallConstructor';
import TypeUtil from '../util/TypeUtil';

/**
 * @class CipherKey
 * @throws {DontCallConstructor}
 */
export default class CipherKey {
  key: Uint8Array;

  constructor() {
    throw new DontCallConstructor(this);
  }

  /**
   * @param {!Uint8Array} key
   * @returns {CipherKey} - `this`
   */
  static new(key) {
    TypeUtil.assert_is_instance(Uint8Array, key);

    const ck = ClassUtil.new_instance(CipherKey);
    ck.key = key;
    return ck;
  }

  /**
   * @param {!(ArrayBuffer|String|Uint8Array)} plaintext - The text to encrypt
   * @param {!Uint8Array} nonce - Counter as nonce
   * @returns {Uint8Array} - Encrypted payload
   */
  encrypt(plaintext, nonce) {
    // @todo Re-validate if the ArrayBuffer check is needed (Prerequisite: Integration tests)
    if (plaintext instanceof ArrayBuffer && plaintext.byteLength !== undefined) {
      plaintext = new Uint8Array(plaintext);
    }

    return sodium.crypto_stream_chacha20_xor(plaintext, nonce, this.key, 'uint8array');
  }

  /**
   * @param {!Uint8Array} ciphertext
   * @param {!Uint8Array} nonce
   * @returns {Uint8Array}
   */
  decrypt(ciphertext, nonce) {
    return this.encrypt(ciphertext, nonce);
  }

  /**
   * @param {!CBOR.Encoder} encoder
   * @returns {CBOR.Encoder}
   */
  encode(encoder) {
    encoder.object(1);
    encoder.u8(0);
    return encoder.bytes(this.key);
  }

  /**
   * @param {!CBOR.Encoder} decoder
   * @returns {CipherKey}
   */
  static decode(decoder) {
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
    return CipherKey.new(key_bytes);
  }
}
