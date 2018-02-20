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

import ClassUtil from '../util/ClassUtil';
import PublicKey from './PublicKey';

/**
 * Construct a long-term identity key pair.
 * @classdesc Every client has a long-term identity key pair.
 * Long-term identity keys are used to initialise "sessions" with other clients (triple DH).
 */
class IdentityKey {
  public_key: PublicKey;

  constructor() {
    this.public_key = new PublicKey();
  }

  static new(public_key: PublicKey): IdentityKey {
    const key = ClassUtil.new_instance<IdentityKey>(IdentityKey);
    key.public_key = public_key;
    return key;
  }

  fingerprint(): string {
    return this.public_key.fingerprint();
  }

  encode(encoder: CBOR.Encoder): CBOR.Encoder {
    encoder.object(1);
    encoder.u8(0);
    return this.public_key.encode(encoder);
  }

  static decode(decoder: CBOR.Decoder): IdentityKey {
    let public_key = ClassUtil.new_instance<PublicKey>(PublicKey);

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

export default IdentityKey;
