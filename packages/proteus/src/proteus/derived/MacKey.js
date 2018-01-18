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

/* eslint no-unused-vars: "off" */ // only until TypeUtil can be used again

const CBOR = require('wire-webapp-cbor');
const _sodium = require('libsodium-wrappers-sumo');

const ClassUtil = require('../util/ClassUtil');
const DontCallConstructor = require('../errors/DontCallConstructor');
const TypeUtil = require('../util/TypeUtil');

/** @module derived */

/**
 * @class MacKey
 * @throws {DontCallConstructor}
 */
class MacKey {
  constructor() {
    throw new DontCallConstructor(this);
  }

  /**
   * @param {!Uint8Array} key - Mac Key in byte array format generated by derived secrets
   * @returns {MacKey} - `this`
   */
  static new(key) {
    //TypeUtil.assert_is_instance(Uint8Array, key);

    const mk = ClassUtil.new_instance(MacKey);
    /** @type {Uint8Array} */
    mk.key = key;
    return mk;
  }

  /**
   * Hash-based message authentication code
   * @param {!(string|Uint8Array)} msg
   * @returns {Uint8Array}
   */
  async sign(msg) {
    await _sodium.ready;
    const sodium = _sodium;

    return sodium.crypto_auth_hmacsha256(msg, this.key);
  }

  /**
   * Verifies the signature of a given message by resigning it.
   * @param {!Uint8Array} signature Mac signature (HMAC) which needs to get verified
   * @param {!Uint8Array} message Unsigned message
   * @returns {boolean}
   */
  async verify(signature, message) {
    await _sodium.ready;
    const sodium = _sodium;

    return sodium.crypto_auth_hmacsha256_verify(signature, message, this.key);
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
   * @param {!CBOR.Decoder} decoder
   * @returns {MacKey}
   */
  static decode(decoder) {
    //TypeUtil.assert_is_instance(CBOR.Decoder, decoder);

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

module.exports = MacKey;
