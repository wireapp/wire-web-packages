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
/* eslint no-unused-vars: "off" */ // only until TypeUtil can be used again

const CBOR = require('wire-webapp-cbor');

const ClassUtil = require('../util/ClassUtil');
const DontCallConstructor = require('../errors/DontCallConstructor');
const TypeUtil = require('../util/TypeUtil');

const MacKey = require('../derived/MacKey');
const Message = require('./Message');

/** @module message */

/**
 * @class Envelope
 * @throws {DontCallConstructor}
 */
class Envelope {
  constructor() {
    throw new DontCallConstructor(this);
  }

  /**
   * @param {!derived.MacKey} mac_key MacKey generated by derived secrets
   * @param {!message.Message} message
   * @returns {Envelope}
   */
  static async new(mac_key, message) {
    //TypeUtil.assert_is_instance(MacKey, mac_key);
    //TypeUtil.assert_is_instance(Message, message);

    const serialized_message = new Uint8Array(message.serialise());

    const env = ClassUtil.new_instance(Envelope);

    env.version = 1;
    env.mac = await mac_key.sign(serialized_message);
    env.message = message;
    env._message_enc = serialized_message;

    Object.freeze(env);
    return env;
  }

  /**
   * @param {!derived.MacKey} mac_key The remote party's MacKey
   * @returns {boolean}
   */
  async verify(mac_key) {
    //TypeUtil.assert_is_instance(MacKey, mac_key);
    return await mac_key.verify(this.mac, this._message_enc);
  }

  /** @returns {ArrayBuffer} - The serialized message envelope */
  serialise() {
    const encoder = new CBOR.Encoder();
    this.encode(encoder);
    return encoder.get_buffer();
  }

  /**
   * @param {!ArrayBuffer} buf
   * @returns {Envelope}
   */
  static deserialise(buf) {
    //TypeUtil.assert_is_instance(ArrayBuffer, buf);

    const decoder = new CBOR.Decoder(buf);
    return Envelope.decode(decoder);
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
    encoder.object(1);
    encoder.u8(0);
    encoder.bytes(this.mac);

    encoder.u8(2);
    return encoder.bytes(this._message_enc);
  }

  /**
   * @param {!CBOR.Decoder} decoder
   * @returns {Envelope}
   */
  static decode(decoder) {
    //TypeUtil.assert_is_instance(CBOR.Decoder, decoder);

    const envelope = ClassUtil.new_instance(Envelope);

    const nprops = decoder.object();
    for (let index = 0; index <= nprops - 1; index++) {
      switch (decoder.u8()) {
        case 0: {
          envelope.version = decoder.u8();
          break;
        }
        case 1: {
          const nprops_mac = decoder.object();
          for (let subindex = 0; subindex <= nprops_mac - 1; subindex++) {
            switch (decoder.u8()) {
              case 0:
                envelope.mac = new Uint8Array(decoder.bytes());
                break;
              default:
                decoder.skip();
            }
          }
          break;
        }
        case 2: {
          envelope._message_enc = new Uint8Array(decoder.bytes());
          break;
        }
        default: {
          decoder.skip();
        }
      }
    }

    //TypeUtil.assert_is_integer(env.version);
    //TypeUtil.assert_is_instance(Uint8Array, env.mac);

    envelope.message = Message.deserialise(envelope._message_enc.buffer);

    Object.freeze(envelope);
    return envelope;
  }
}

module.exports = Envelope;
