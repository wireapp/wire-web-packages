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

import {DerivedSecrets} from '../derived/DerivedSecrets';
import {MacKey} from '../derived/MacKey';
import {MessageKeys} from './MessageKeys';
import {DecodeError} from '../errors';

export class ChainKey {
  idx: number;
  key: MacKey;
  private static readonly propertiesLength = 2;

  constructor() {
    this.idx = -1;
    this.key = new MacKey(new Uint8Array([]));
  }

  static from_mac_key(key: MacKey, counter: number): ChainKey {
    const ck = new ChainKey();
    ck.key = key;
    ck.idx = counter;
    return ck;
  }

  next(): ChainKey {
    const ck = new ChainKey();
    ck.key = new MacKey(this.key.sign('1'));
    ck.idx = this.idx + 1;
    return ck;
  }

  message_keys(): MessageKeys {
    const base = this.key.sign('0');
    const derived_secrets = DerivedSecrets.kdf_without_salt(base, 'hash_ratchet');
    return new MessageKeys(derived_secrets.cipher_key, derived_secrets.mac_key, this.idx);
  }

  encode(encoder: CBOR.Encoder): CBOR.Encoder {
    encoder.object(ChainKey.propertiesLength);
    encoder.u8(0);
    this.key.encode(encoder);
    encoder.u8(1);
    return encoder.u32(this.idx);
  }

  static decode(decoder: CBOR.Decoder): ChainKey {
    const self = new ChainKey();

    const propertiesLength = decoder.object();
    if (propertiesLength === ChainKey.propertiesLength) {
      decoder.u8();
      self.key = MacKey.decode(decoder);

      decoder.u8();
      self.idx = decoder.u32();

      return self;
    }

    throw new DecodeError(`Unexpected number of properties: "${propertiesLength}"`);
  }
}
