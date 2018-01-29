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

/* eslint no-magic-numbers: "off" */

const CBOR = require('@wireapp/cbor');

import ClassUtil from '../util/ClassUtil';
import DontCallConstructor from '../errors/DontCallConstructor';
import TypeUtil from '../util/TypeUtil';

import IdentityKey from './IdentityKey';
import KeyPair from './KeyPair';
import SecretKey from './SecretKey';

/**
 * @class IdentityKeyPair
 * @throws {DontCallConstructor}
 */
export default class IdentityKeyPair {
  public_key: IdentityKey;
  secret_key: SecretKey;
  version: number;

  constructor() {
    throw new DontCallConstructor(this);
  }

  /** @returns {keys.IdentityKeyPair} - `this` */
  static new() {
    const key_pair = KeyPair.new();

    /** @type {keys.IdentityKeyPair} */
    const ikp = ClassUtil.new_instance(IdentityKeyPair);
    ikp.version = 1;
    ikp.secret_key = key_pair.secret_key;
    ikp.public_key = IdentityKey.new(key_pair.public_key);

    return ikp;
  }

  /** @returns {ArrayBuffer} */
  serialise() {
    const encoder = new CBOR.Encoder();
    this.encode(encoder);
    return encoder.get_buffer();
  }

  /**
   * @param {!ArrayBuffer} buf
   * @returns {keys.IdentityKeyPair}
   */
  static deserialise(buf) {
    TypeUtil.assert_is_instance(ArrayBuffer, buf);

    const decoder = new CBOR.Decoder(buf);
    return IdentityKeyPair.decode(decoder);
  }

  /**
   * @param {!CBOR.Encoder} encoder
   * @returns {CBOR.Encoder}
   */
  encode(encoder) {
    encoder.object(3);
    encoder.u8(0);
    encoder.u8(this.version);
    encoder.u8(1);
    this.secret_key.encode(encoder);
    encoder.u8(2);
    return this.public_key.encode(encoder);
  }

  /**
   * @param {!CBOR.Decoder} decoder
   * @returns {keys.IdentityKeyPair}
   */
  static decode(decoder) {
    TypeUtil.assert_is_instance(CBOR.Decoder, decoder);

    const self = ClassUtil.new_instance(IdentityKeyPair);

    const nprops = decoder.object();
    for (let index = 0; index <= nprops - 1; index++) {
      switch (decoder.u8()) {
        case 0:
          self.version = decoder.u8();
          break;
        case 1:
          self.secret_key = SecretKey.decode(decoder);
          break;
        case 2:
          self.public_key = IdentityKey.decode(decoder);
          break;
        default:
          decoder.skip();
      }
    }

    TypeUtil.assert_is_integer(self.version);
    TypeUtil.assert_is_instance(SecretKey, self.secret_key);
    TypeUtil.assert_is_instance(IdentityKey, self.public_key);

    return self;
  }
}
