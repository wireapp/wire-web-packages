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

import {IdentityKey} from './IdentityKey';
import {KeyPair} from './KeyPair';
import {SecretKey} from './SecretKey';
import {DecodeError} from '../errors';
import {PublicKey} from './PublicKey';

export class IdentityKeyPair {
  public_key: IdentityKey;
  secret_key: SecretKey;
  version: number;
  private static readonly propertiesLength = 3;

  constructor() {
    this.public_key = new IdentityKey(new PublicKey(new Uint8Array([]), new Uint8Array([])));
    this.secret_key = new SecretKey(new Uint8Array([]), new Uint8Array([]));
    this.version = -1;
  }

  static async new(): Promise<IdentityKeyPair> {
    const key_pair = await KeyPair.new();

    const ikp = new IdentityKeyPair();
    ikp.version = 1;
    ikp.secret_key = key_pair.secret_key;
    ikp.public_key = new IdentityKey(key_pair.public_key);

    return ikp;
  }

  serialise(): ArrayBuffer {
    const encoder = new CBOR.Encoder();
    this.encode(encoder);
    return encoder.get_buffer();
  }

  static deserialise(buf: ArrayBuffer): IdentityKeyPair {
    const decoder = new CBOR.Decoder(buf);
    return IdentityKeyPair.decode(decoder);
  }

  encode(encoder: CBOR.Encoder): CBOR.Encoder {
    encoder.object(IdentityKeyPair.propertiesLength);
    encoder.u8(0);
    encoder.u8(this.version);
    encoder.u8(1);
    this.secret_key.encode(encoder);
    encoder.u8(2);
    return this.public_key.encode(encoder);
  }

  static decode(decoder: CBOR.Decoder): IdentityKeyPair {
    const self = new IdentityKeyPair();

    const propertiesLength = decoder.object();
    if (propertiesLength === IdentityKeyPair.propertiesLength) {
      decoder.u8();
      self.version = decoder.u8();

      decoder.u8();
      self.secret_key = SecretKey.decode(decoder);

      decoder.u8();
      self.public_key = IdentityKey.decode(decoder);

      return self;
    }

    throw new DecodeError(`Unexpected number of properties: "${propertiesLength}"`);
  }
}
