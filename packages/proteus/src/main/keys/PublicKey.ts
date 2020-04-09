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
import * as ed2curve from 'ed2curve';
import * as sodium from 'libsodium-wrappers-sumo';

import {InputError} from '../errors/InputError';
import {DecodeError} from '../errors';

export class PublicKey {
  pub_edward: Uint8Array;
  pub_curve: Uint8Array;
  private static readonly propertiesLength = 1;

  constructor(pubEdward: Uint8Array, pubCurve: Uint8Array) {
    this.pub_edward = pubEdward;
    this.pub_curve = pubCurve;
  }

  /**
   * This function can be used to verify a message signature.
   *
   * @param signature The signature to verify
   * @param message The message from which the signature was computed.
   * @returns `true` if the signature is valid, `false` otherwise.
   */
  verify(signature: Uint8Array, message: Uint8Array | string): boolean {
    return sodium.crypto_sign_verify_detached(signature, message, this.pub_edward);
  }

  fingerprint(): string {
    return sodium.to_hex(this.pub_edward);
  }

  encode(encoder: CBOR.Encoder): CBOR.Encoder {
    encoder.object(PublicKey.propertiesLength);
    encoder.u8(0);
    return encoder.bytes(this.pub_edward);
  }

  static decode(decoder: CBOR.Decoder): PublicKey {
    const propertiesLength = decoder.object();
    if (propertiesLength === PublicKey.propertiesLength) {
      decoder.u8();
      const pubEdward = new Uint8Array(decoder.bytes());
      const pubCurve = ed2curve.convertPublicKey(pubEdward);
      if (pubCurve) {
        return new PublicKey(pubEdward, pubCurve);
      }

      throw new InputError.ConversionError('Could not convert private key with ed2curve.', 409);
    }

    throw new DecodeError(`Unexpected number of properties: "${propertiesLength}"`);
  }
}
