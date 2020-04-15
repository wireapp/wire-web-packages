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
import {DecodeError} from '../errors';
import {InputError} from '../errors/InputError';
import {PublicKey} from './PublicKey';
import {SecretKey} from './SecretKey';

/** Construct an ephemeral key pair. */
export class KeyPair {
  readonly public_key: PublicKey;
  readonly secret_key: SecretKey;
  private static readonly propertiesLength = 2;

  constructor(publicKey: PublicKey, secretKey: SecretKey) {
    this.public_key = publicKey;
    this.secret_key = secretKey;
  }

  static async new(): Promise<KeyPair> {
    await sodium.ready;

    const ed25519KeyPair = sodium.crypto_sign_keypair();

    return new KeyPair(KeyPair.construct_public_key(ed25519KeyPair), KeyPair.construct_private_key(ed25519KeyPair));
  }

  /**
   * Ed25519 keys can be converted to Curve25519 keys, so that the same key pair can be
   * used both for authenticated encryption (`crypto_box`) and for signatures (`crypto_sign`).
   * @param ed25519KeyPair Key pair based on Edwards-curve (Ed25519)
   * @returns Constructed private key
   * @see https://download.libsodium.org/doc/advanced/ed25519-curve25519.html
   */
  static construct_private_key(ed25519KeyPair: sodium.KeyPair): SecretKey {
    const skEd25519 = ed25519KeyPair.privateKey;
    const skCurve25519 = ed2curve.convertSecretKey(skEd25519);
    if (skCurve25519) {
      return new SecretKey(skEd25519, skCurve25519);
    }
    throw new InputError.ConversionError('Could not convert private key with ed2curve.', 409);
  }

  /**
   * @param ed25519KeyPair Key pair based on Edwards-curve (Ed25519)
   * @returns Constructed public key
   */
  static construct_public_key(ed25519KeyPair: sodium.KeyPair): PublicKey {
    const pkEd25519 = ed25519KeyPair.publicKey;
    const pkCurve25519 = ed2curve.convertPublicKey(pkEd25519);
    if (pkCurve25519) {
      return new PublicKey(pkEd25519, pkCurve25519);
    }
    throw new InputError.ConversionError('Could not convert public key with ed2curve.', 408);
  }

  encode(encoder: CBOR.Encoder): CBOR.Encoder {
    encoder.object(KeyPair.propertiesLength);

    encoder.u8(0);
    this.secret_key.encode(encoder);

    encoder.u8(1);
    this.public_key.encode(encoder);

    return encoder;
  }

  static decode(decoder: CBOR.Decoder): KeyPair {
    const propertiesLength = decoder.object();
    if (propertiesLength === KeyPair.propertiesLength) {
      decoder.u8();
      const secretKey = SecretKey.decode(decoder);

      decoder.u8();
      const publicKey = PublicKey.decode(decoder);

      return new KeyPair(publicKey, secretKey);
    }

    throw new DecodeError(`Unexpected number of properties: "${propertiesLength}"`);
  }
}
