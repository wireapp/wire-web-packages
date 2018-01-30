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

  const st = Proteus.message.SessionTag.new().tag.fill(42);

  before(async done => {
    try {
      bk = Proteus.keys.PublicKey.new(
        new Uint8Array([
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
          255,
        ]),
        new Uint8Array([
          63,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
          75,
        ])
      );
      rk = Proteus.keys.PublicKey.new(
        new Uint8Array([
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
          240,
        ]),
        new Uint8Array([
          185,
          178,
          44,
          203,
          178,
          44,
          203,
          178,
          44,
          203,
          178,
          44,
          203,
          178,
          44,
          203,
          178,
          44,
          203,
          178,
          44,
          203,
          178,
          44,
          203,
          178,
          44,
          203,
          178,
          44,
          203,
          114,
        ])
      );
      const ik_pk = Proteus.keys.PublicKey.new(
        new Uint8Array([
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
          160,
        ]),
        new Uint8Array([
          92,
          62,
          6,
          231,
          99,
          112,
          62,
          6,
          231,
          99,
          112,
          62,
          6,
          231,
          99,
          112,
          62,
          6,
          231,
          99,
          112,
          62,
          6,
          231,
          99,
          112,
          62,
          6,
          231,
          99,
          112,
          126,
        ])
      );
      ik = Proteus.keys.IdentityKey.new(ik_pk);

      done();
    } catch (err) {
      console.log(err);
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
