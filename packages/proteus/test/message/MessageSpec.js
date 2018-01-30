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

describe('Message', () => {
  let bk;
  let ik;
  let rk;

  const fake_pubkey = async byte => {
    // TODO: libsodium doesn't accept fake pubkeys anymore.

    // const _alice = sodium.crypto_hash_sha256(new Buffer('alice'));
    // const alice = sodium.crypto_sign_seed_keypair(_alice);
    // sodium.crypto_sign_ed25519_pk_to_curve25519(alice.publicKey);

    await sodium.ready;

    const pub_edward = new Uint8Array(32).fill(byte);
    const pub_curve = sodium.crypto_sign_ed25519_pk_to_curve25519(pub_edward);

    return Proteus.keys.PublicKey.new(pub_edward, pub_curve);
  };

  const st = Proteus.message.SessionTag.new().tag.fill(42);

  before(async done => {
    try {
      let ik_pk = await fake_pubkey(0xa0);
      bk = await fake_pubkey(0xff);
      rk = await fake_pubkey(0xf0);
      ik = Proteus.keys.IdentityKey.new(ik_pk);

      done();
    } catch(err) {
      console.log(err)
      done(err);
    }
  });

  it('should serialise and deserialise a CipherMessage correctly', () => {
    const expected =
      '01a500502a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a010c020d03a1005820f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0044a0102030405060708090a';

    const msg = Proteus.message.CipherMessage.new(st, 12, 13, rk, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));

    const bytes = new Uint8Array(msg.serialise());
    assert(expected === sodium.to_hex(bytes).toLowerCase());

    const deserialised = Proteus.message.Message.deserialise(bytes.buffer);
    assert(deserialised.constructor === Proteus.message.CipherMessage);
    assert(deserialised.ratchet_key.fingerprint() === rk.fingerprint());
  });

  it('should serialise a PreKeyMessage correctly', () => {
    const expected =
      '02a400181801a1005820ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff02a100a1005820a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a003a500502a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a010c020d03a1005820f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0044a0102030405060708090a';

    const cmsg = Proteus.message.CipherMessage.new(st, 12, 13, rk, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    const pkmsg = Proteus.message.PreKeyMessage.new(24, bk, ik, cmsg);

    const bytes = new Uint8Array(pkmsg.serialise());
    assert(expected === sodium.to_hex(bytes).toLowerCase());

    const deserialised = Proteus.message.Message.deserialise(bytes.buffer);
    assert(deserialised.constructor === Proteus.message.PreKeyMessage);

    assert(deserialised.base_key.fingerprint() === bk.fingerprint());
    assert(deserialised.identity_key.fingerprint() === ik.fingerprint());

    assert(deserialised.message.ratchet_key.fingerprint() === rk.fingerprint());
  });
});
