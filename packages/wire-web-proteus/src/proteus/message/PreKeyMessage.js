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

'use strict';

const CBOR = require('wire-webapp-cbor');

const ClassUtil = require('../util/ClassUtil');
const DontCallConstructor = require('../errors/DontCallConstructor');
const TypeUtil = require('../util/TypeUtil');

const IdentityKey = require('../keys/IdentityKey');
const PublicKey = require('../keys/PublicKey');

const CipherMessage = require('./CipherMessage');
const Message = require('./Message');

/** @module message */

/**
 * @extends Message
 * @throws {DontCallConstructor}
 */
class PreKeyMessage extends Message {
  constructor() {
    super();
    throw new DontCallConstructor(this);
  }

  /**
   * @param {!number} prekey_id
   * @param {!keys.PublicKey} base_key
   * @param {!keys.IdentityKey} identity_key
   * @param {!message.CipherMessage} message
   * @returns {PreKeyMessage}
   */
  static new(prekey_id, base_key, identity_key, message) {
    TypeUtil.assert_is_integer(prekey_id);
    TypeUtil.assert_is_instance(PublicKey, base_key);
    TypeUtil.assert_is_instance(IdentityKey, identity_key);
    TypeUtil.assert_is_instance(CipherMessage, message);

    const pkm = ClassUtil.new_instance(PreKeyMessage);

    pkm.prekey_id = prekey_id;
    pkm.base_key = base_key;
    pkm.identity_key = identity_key;
    pkm.message = message;

    Object.freeze(pkm);
    return pkm;
  }

  /**
   * @param {!CBOR.Encoder} e
   * @returns {CBOR.Encoder}
   */
  encode(e) {
    e.object(4);
    e.u8(0);
    e.u16(this.prekey_id);
    e.u8(1);
    this.base_key.encode(e);
    e.u8(2);
    this.identity_key.encode(e);
    e.u8(3);
    return this.message.encode(e);
  }

  /**
   * @param {!CBOR.Decoder} d
   * @returns {PreKeyMessage}
   */
  static decode(d) {
    TypeUtil.assert_is_instance(CBOR.Decoder, d);

    let prekey_id = null;
    let base_key = null;
    let identity_key = null;
    let message = null;

    const nprops = d.object();
    for (let i = 0; i <= nprops - 1; i++) {
      switch (d.u8()) {
        case 0:
          prekey_id = d.u16();
          break;
        case 1:
          base_key = PublicKey.decode(d);
          break;
        case 2:
          identity_key = IdentityKey.decode(d);
          break;
        case 3:
          message = CipherMessage.decode(d);
          break;
        default:
          d.skip();
      }
    }

    // checks for missing variables happens in constructor
    return PreKeyMessage.new(prekey_id, base_key, identity_key, message);
  }
}

module.exports = PreKeyMessage;
