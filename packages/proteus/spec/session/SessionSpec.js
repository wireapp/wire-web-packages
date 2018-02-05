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
const _sodium = require('libsodium-wrappers-sumo');
let sodium;

class TestStore extends Proteus.session.PreKeyStore {
  constructor(prekeys) {
    super();
    this.prekeys = prekeys;
  }

  get_prekey(prekey_id) {
    return Promise.resolve(this.prekeys[prekey_id]);
  }

  remove(prekey_id) {
    return Promise.resolve().then(() => delete this.prekeys[prekey_id]);
  }
}

beforeAll(async () => {
  await _sodium.ready;
  sodium = _sodium;
});

describe('Session', () => {
  describe('Setup', () => {
    it('generates a session from a prekey message', async done => {
      const preKeys = await Proteus.keys.PreKey.generate_prekeys(0, 10);
      const bobStore = new TestStore(preKeys);

      const alice = await Proteus.keys.IdentityKeyPair.new();
      const bob = await Proteus.keys.IdentityKeyPair.new();
      const preKey = await bobStore.get_prekey(0);
      const bobPreKeyBundle = Proteus.keys.PreKeyBundle.new(bob.public_key, preKey);
      const aliceToBob = await Proteus.session.Session.init_from_prekey(alice, bobPreKeyBundle);

      const plaintext = 'Hello Bob!';
      const preKeyMessage = await aliceToBob.encrypt(plaintext);

      const envelope = Proteus.message.Envelope.deserialise(preKeyMessage.serialise());

      const [bobToAlice, decrypted] = await Proteus.session.Session.init_from_message(bob, bobStore, envelope);

      expect(sodium.to_string(decrypted)).toBe(plaintext);
      expect(bobToAlice).toBeDefined();

      done();
    });
  });
});
