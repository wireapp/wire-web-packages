/*
 * Wire
 * Copyright (C) 2016 Wire Swiss GmbH
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

describe('Envelope', () => {
  const mac_key = Proteus.derived.MacKey.new(new Uint8Array(32).fill(1));
  let bob_keypair;
  let bob_bk;
  let identity_keypair;
  let identity_key;
  let r_keypair;
  let r_key;
  let tg;

  before(async () => {
    bob_keypair = await Proteus.keys.KeyPair.new();
    bob_bk = bob_keypair.public_key;

    identity_keypair = await Proteus.keys.KeyPair.new();
    identity_key = Proteus.keys.IdentityKey.new(identity_keypair.public_key);

    r_keypair = await Proteus.keys.KeyPair.new();
    r_key = r_keypair.public_key;

    tg = Proteus.message.SessionTag.new();
  });

  it('should encapsulate a CipherMessage', async () => {
    const msg = Proteus.message.CipherMessage.new(tg, 42, 3, r_key, new Uint8Array([1, 2, 3, 4, 5]));
    const envelope = await Proteus.message.Envelope.new(mac_key, msg);
    const envelope_verified = await envelope.verify(mac_key);

    assert(envelope_verified);
  });

  it('should encapsulate a PreKeyMessage', async () => {
    const msg = Proteus.message.PreKeyMessage.new(
      42,
      bob_bk,
      identity_key,
      Proteus.message.CipherMessage.new(tg, 42, 43, r_key, new Uint8Array([1, 2, 3, 4]))
    );

    const envelope = await Proteus.message.Envelope.new(mac_key, msg);
    const envelope_verified = await envelope.verify(mac_key);

    assert(envelope_verified);
  });

  it('should encode to and decode from CBOR', async () => {
    const msg = Proteus.message.PreKeyMessage.new(
      42,
      bob_bk,
      identity_key,
      Proteus.message.CipherMessage.new(tg, 42, 43, r_key, new Uint8Array([1, 2, 3, 4]))
    );

    const envelope = await Proteus.message.Envelope.new(mac_key, msg);
    const envelope_verified = await envelope.verify(mac_key);

    assert(envelope_verified);

    const envelope_bytes = envelope.serialise();
    const envelope_copy = Proteus.message.Envelope.deserialise(envelope_bytes);

    const envelope_copy_verified = await envelope_copy.verify(mac_key);

    assert(envelope_copy_verified);
  });

  it('fails when passing invalid input', () => {
    const empty_buffer = new ArrayBuffer(0);
    try {
      Proteus.message.Envelope.deserialise(empty_buffer);
    } catch (error) {
      assert.instanceOf(error, RangeError);
    }
  });
});
