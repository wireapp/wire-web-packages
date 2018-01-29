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

import TypeUtil from '../util/TypeUtil';
import DecodeError from '../errors/DecodeError';

/**
 * @class Message
 */
export default class Message {
  constructor() {}

  /** @returns {ArrayBuffer} */
  serialise() {
    const encoder = new CBOR.Encoder();
    if (this instanceof CipherMessage) {
      encoder.u8(1);
    } else if (this instanceof PreKeyMessage) {
      encoder.u8(2);
    } else {
      throw new TypeError('Unexpected message type');
    }

    this.encode(encoder);
    return encoder.get_buffer();
  }

  /**
   * @param {!ArrayBuffer} buf
   * @returns {message.CipherMessage|message.PreKeyMessage}
   */
  static deserialise(buf) {
    TypeUtil.assert_is_instance(ArrayBuffer, buf);

    const decoder = new CBOR.Decoder(buf);

    switch (decoder.u8()) {
      case 1:
        return CipherMessage.decode(decoder);
      case 2:
        return PreKeyMessage.decode(decoder);
      default:
        throw new (<any>DecodeError).InvalidType('Unrecognised message type', DecodeError.CODE.CASE_302);
    }
  }
}

// these require lines have to come after the Message definition because otherwise
// it creates a circular dependency with the message subtypes
import CipherMessage from './CipherMessage';
import PreKeyMessage from './PreKeyMessage';
