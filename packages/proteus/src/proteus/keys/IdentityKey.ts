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
import PublicKey from './PublicKey';

/**
 * Construct a long-term identity key pair.
 * @classdesc Every client has a long-term identity key pair.
 * Long-term identity keys are used to initialise "sessions" with other clients (triple DH).
 */
export default class IdentityKey {
  public_key: PublicKey;

  constructor() {}

  static new(public_key: PublicKey): IdentityKey {
    TypeUtil.assert_is_instance(PublicKey, public_key);

    const key = ClassUtil.new_instance<IdentityKey>(IdentityKey);
    key.public_key = public_key;
    return key;
  }

  fingerprint(): string {
    return this.public_key.fingerprint();
  }

  toString(): string {
    return sodium.to_hex(this.public_key);
  }

  encode(encoder: CBOR.Encoder): CBOR.Encoder {
    encoder.object(1);
    encoder.u8(0);
    return this.public_key.encode(encoder);
  }

  static decode(decoder: CBOR.Decoder): IdentityKey {
    TypeUtil.assert_is_instance(CBOR.Decoder, decoder);

    let public_key = null;

    const nprops = decoder.object();
    for (let index = 0; index <= nprops - 1; index++) {
      switch (decoder.u8()) {
        case 0:
          public_key = PublicKey.decode(decoder);
          break;
        default:
          decoder.skip();
      }
    }

    return IdentityKey.new(public_key);
  }
}
