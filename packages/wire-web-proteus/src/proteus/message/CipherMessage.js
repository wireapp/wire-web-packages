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

const PublicKey = require('../keys/PublicKey');

const Message = require('./Message');
const SessionTag = require('./SessionTag');

/** @module message */

/**
 * @extends Message
 * @throws {DontCallConstructor}
 */
class CipherMessage extends Message {
  constructor() {
    super();
    throw new DontCallConstructor(this);
  }

  /**
   * @param {!message.SessionTag} session_tag
   * @param {!number} counter
   * @param {!number} prev_counter
   * @param {!keys.PublicKey} ratchet_key
   * @param {!Uint8Array} cipher_text
   * @returns {CipherMessage} - `this`
   */
  static new(session_tag, counter, prev_counter, ratchet_key, cipher_text) {
    TypeUtil.assert_is_instance(SessionTag, session_tag);
    TypeUtil.assert_is_integer(counter);
    TypeUtil.assert_is_integer(prev_counter);
    TypeUtil.assert_is_instance(PublicKey, ratchet_key);
    TypeUtil.assert_is_instance(Uint8Array, cipher_text);

    const cm = ClassUtil.new_instance(CipherMessage);

    cm.session_tag = session_tag;
    cm.counter = counter;
    cm.prev_counter = prev_counter;
    cm.ratchet_key = ratchet_key;
    cm.cipher_text = cipher_text;

    Object.freeze(cm);
    return cm;
  }

  /**
   * @param {!CBOR.Encoder} e
   * @returns {CBOR.Encoder}
   */
  encode(e) {
    e.object(5);
    e.u8(0);
    this.session_tag.encode(e);
    e.u8(1);
    e.u32(this.counter);
    e.u8(2);
    e.u32(this.prev_counter);
    e.u8(3);
    this.ratchet_key.encode(e);
    e.u8(4);
    return e.bytes(this.cipher_text);
  }

  /**
   * @param {!CBOR.Decoder} d
   * @returns {CipherMessage}
   */
  static decode(d) {
    TypeUtil.assert_is_instance(CBOR.Decoder, d);

    let session_tag = null;
    let counter = null;
    let prev_counter = null;
    let ratchet_key = null;
    let cipher_text = null;

    const nprops = d.object();
    for (let i = 0; i <= nprops - 1; i++) {
      switch (d.u8()) {
        case 0:
          session_tag = SessionTag.decode(d);
          break;
        case 1:
          counter = d.u32();
          break;
        case 2:
          prev_counter = d.u32();
          break;
        case 3:
          ratchet_key = PublicKey.decode(d);
          break;
        case 4:
          cipher_text = new Uint8Array(d.bytes());
          break;
        default:
          d.skip();
      }
    }

    return CipherMessage.new(session_tag, counter, prev_counter, ratchet_key, cipher_text);
  }
}

module.exports = CipherMessage;
