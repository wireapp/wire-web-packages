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

/* eslint no-magic-numbers: "off" */

import * as CBOR from '@wireapp/cbor';

import ClassUtil from '../util/ClassUtil';
import TypeUtil from '../util/TypeUtil';

import MacKey from '../derived/MacKey';
import Message from './Message';

export default class Envelope {
  _message_enc: Uint8Array;
  mac: Uint8Array;
  message: Message;
  version: number;

  constructor() {}

  static new(mac_key: MacKey, message: Message): Envelope {
    TypeUtil.assert_is_instance(MacKey, mac_key);
    TypeUtil.assert_is_instance(Message, message);

    const serialized_message = new Uint8Array(message.serialise());

    const env = ClassUtil.new_instance<Envelope>(Envelope);

    env.version = 1;
    env.mac = mac_key.sign(serialized_message);
    env.message = message;
    env._message_enc = serialized_message;

    Object.freeze(env);
    return env;
  }

  /** @param mac_key The remote party's MacKey */
  verify(mac_key: MacKey): boolean {
    TypeUtil.assert_is_instance(MacKey, mac_key);
    return mac_key.verify(this.mac, this._message_enc);
  }

  /** @returns The serialized message envelope */
  serialise(): ArrayBuffer {
    const encoder = new CBOR.Encoder();
    this.encode(encoder);
    return encoder.get_buffer();
  }

  static deserialise(buf: ArrayBuffer): Envelope {
    TypeUtil.assert_is_instance(ArrayBuffer, buf);

    const decoder = new CBOR.Decoder(buf);
    return Envelope.decode(decoder);
  }

  encode(encoder: CBOR.Encoder): CBOR.Encoder {
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

  static decode(decoder: CBOR.Decoder): Envelope {
    TypeUtil.assert_is_instance(CBOR.Decoder, decoder);

    const env = ClassUtil.new_instance<Envelope>(Envelope);

    const nprops = decoder.object();
    for (let index = 0; index <= nprops - 1; index++) {
      switch (decoder.u8()) {
        case 0: {
          env.version = decoder.u8();
          break;
        }
        case 1: {
          const nprops_mac = decoder.object();
          for (let subindex = 0; subindex <= nprops_mac - 1; subindex++) {
            switch (decoder.u8()) {
              case 0:
                env.mac = new Uint8Array(decoder.bytes());
                break;
              default:
                decoder.skip();
            }
          }
          break;
        }
        case 2: {
          env._message_enc = new Uint8Array(decoder.bytes());
          break;
        }
        default: {
          decoder.skip();
        }
      }
    }

    TypeUtil.assert_is_integer(env.version);
    TypeUtil.assert_is_instance(Uint8Array, env.mac);

    env.message = Message.deserialise(env._message_enc.buffer);

    Object.freeze(env);
    return env;
  }
}
