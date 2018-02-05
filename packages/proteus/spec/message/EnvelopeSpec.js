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

const Proteus = require('@wireapp/proteus');

describe('Envelope', () => {
  const mk = Proteus.derived.MacKey.new(new Uint8Array(32).fill(1));

  const tg = Proteus.message.SessionTag.new();

  let ik;
  let bk;
  let rk;

  beforeAll(async done => {
    ik = Proteus.keys.IdentityKey.new((await Proteus.keys.KeyPair.new()).public_key);
    bk = (await Proteus.keys.KeyPair.new()).public_key;
    rk = (await Proteus.keys.KeyPair.new()).public_key;

    done();
  });

  it('encapsulates a CipherMessage', () => {
    const msg = Proteus.message.CipherMessage.new(tg, 42, 3, rk, new Uint8Array([1, 2, 3, 4, 5]));
    const env = Proteus.message.Envelope.new(mk, msg);

    expect(env.verify(mk)).toBe(true);
  });

  it('encapsulates a PreKeyMessage', () => {
    const msg = Proteus.message.PreKeyMessage.new(
      42,
      bk,
      ik,
      Proteus.message.CipherMessage.new(tg, 42, 43, rk, new Uint8Array([1, 2, 3, 4]))
    );

    const env = Proteus.message.Envelope.new(mk, msg);
    expect(env.verify(mk)).toBe(true);
  });

  it('encodes to and decode from CBOR', () => {
    const msg = Proteus.message.PreKeyMessage.new(
      42,
      bk,
      ik,
      Proteus.message.CipherMessage.new(tg, 42, 43, rk, new Uint8Array([1, 2, 3, 4]))
    );

    const env = Proteus.message.Envelope.new(mk, msg);
    expect(env.verify(mk)).toBe(true);

    const env_bytes = env.serialise();
    const env_cpy = Proteus.message.Envelope.deserialise(env_bytes);

    expect(env_cpy.verify(mk)).toBe(true);
  });

  it('fails when passing invalid input', () => {
    const empty_buffer = new ArrayBuffer(0);
    try {
      Proteus.message.Envelope.deserialise(empty_buffer);
    } catch (error) {
      expect(error instanceof RangeError).toBe(true);
    }
  });
});
