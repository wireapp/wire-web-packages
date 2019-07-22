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

import {CipherKey} from '../derived/CipherKey';
import {DerivedSecrets} from '../derived/DerivedSecrets';
import {InputError} from '../errors/InputError';
import {KeyPair} from '../keys/KeyPair';
import {PublicKey} from '../keys/PublicKey';
import * as ClassUtil from '../util/ClassUtil';
import {ChainKey} from './ChainKey';

export class RootKey {
  key: CipherKey;

  constructor() {
    this.key = new CipherKey();
  }

  /**
   * @param cipher_key Cipher key generated by derived secrets
   */
  static from_cipher_key(cipher_key: CipherKey): RootKey {
    const rk = ClassUtil.new_instance(RootKey);
    rk.key = cipher_key;
    return rk;
  }

  /**
   * @param ours Our key pair
   * @param theirs Their public key
   */
  dh_ratchet(ours: KeyPair, theirs: PublicKey): [RootKey, ChainKey] {
    const secret = ours.secret_key.shared_secret(theirs);
    const derived_secrets = DerivedSecrets.kdf(secret, this.key.key, 'dh_ratchet');

    return [RootKey.from_cipher_key(derived_secrets.cipher_key), ChainKey.from_mac_key(derived_secrets.mac_key, 0)];
  }

  encode(encoder: CBOR.Encoder): CBOR.Encoder {
    encoder.object(1);
    encoder.u8(0);
    return this.key.encode(encoder);
  }

  static decode(decoder: CBOR.Decoder): RootKey {
    let cipher_key = null;

    const nprops = decoder.object();
    for (let index = 0; index <= nprops - 1; index++) {
      switch (decoder.u8()) {
        case 0:
          cipher_key = CipherKey.decode(decoder);
          break;
        default:
          decoder.skip();
      }
    }

    if (cipher_key) {
      return RootKey.from_cipher_key(cipher_key);
    } else {
      throw new InputError.TypeError(`Given RootKey doesn't match expected signature.`, InputError.CODE.CASE_407);
    }
  }
}
