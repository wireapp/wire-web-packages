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
      try {
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
      } catch (err) {
        console.log(err);
      } finally {
        done();
      }
    });
  });

  describe('Serialisation', () => {
    it('can be serialised and deserialised to/from CBOR', async done => {
      try {
        const [alice_ident, bob_ident] = await Promise.all([0, 1].map(() => Proteus.keys.IdentityKeyPair.new()));
        const bob_store = new TestStore(await Proteus.keys.PreKey.generate_prekeys(0, 10));

        const bob_prekey = await bob_store.get_prekey(0);
        const bob_bundle = Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

        const alice = await Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle);
        expect(alice.session_states[alice.session_tag.toString()].state.recv_chains.length).toEqual(1);
        expect(alice.pending_prekey.length).toBe(2);

        const bytes = alice.serialise();

        const deserialised_session = Proteus.session.Session.deserialise(alice_ident, bytes);
        const deserialised_bytes = deserialised_session.serialise();

        expect(sodium.to_hex(new Uint8Array(bytes))).toEqual(sodium.to_hex(new Uint8Array(deserialised_bytes)));
      } catch (err) {
        console.log(err);
      } finally {
        done();
      }
    });

    it('encrypts and decrypts messages', async done => {
      try {
        const alice_ident = await Proteus.keys.IdentityKeyPair.new();
        const alice_store = new TestStore(await Proteus.keys.PreKey.generate_prekeys(0, 10));

        const bob_ident = await Proteus.keys.IdentityKeyPair.new();
        const bob_store = new TestStore(await Proteus.keys.PreKey.generate_prekeys(0, 10));

        const bob_prekey = await bob_store.get_prekey(0);
        const bob_bundle = Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

        const alice = await Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle);
        expect(alice.session_states[alice.session_tag.toString()].state.recv_chains.length).toBe(1);

        const hello_bob = await alice.encrypt('Hello Bob!');
        const hello_bob_delayed = await alice.encrypt('Hello delay!');

        expect(Object.keys(alice.session_states).length).toBe(1);
        expect(alice.session_states[alice.session_tag.toString()].state.recv_chains.length).toBe(1);

        const [bob, decrypted] = await Proteus.session.Session.init_from_message(bob_ident, bob_store, hello_bob);

        expect(sodium.to_string(decrypted)).toBe('Hello Bob!');

        expect(Object.keys(bob.session_states).length).toBe(1);
        expect(bob.session_states[bob.session_tag.toString()].state.recv_chains.length).toBe(1);

        const hello_alice = await bob.encrypt('Hello Alice!');

        expect(alice.pending_prekey.length).toBe(2);

        const textFromBob = await alice.decrypt(alice_store, hello_alice);
        expect(sodium.to_string(textFromBob)).toBe('Hello Alice!');

        expect(alice.pending_prekey).toBe(null);
        expect(alice.session_states[alice.session_tag.toString()].state.recv_chains.length).toBe(2);
        expect(alice.remote_identity.fingerprint()).toBe(bob.local_identity.public_key.fingerprint());

        const ping_bob_1 = await alice.encrypt('Ping1!');
        const ping_bob_2 = await alice.encrypt('Ping2!');

        expect(alice.session_states[alice.session_tag.toString()].state.prev_counter).toBe(2);

        expect(ping_bob_1.message).toEqual(jasmine.any(Proteus.message.CipherMessage));
        expect(ping_bob_2.message).toEqual(jasmine.any(Proteus.message.CipherMessage));

        expect('Ping1!').toBe(sodium.to_string(await bob.decrypt(bob_store, ping_bob_1)));

        expect(bob.session_states[bob.session_tag.toString()].state.recv_chains.length).toBe(2);

        const bob_ping2_decrypted = await bob.decrypt(bob_store, ping_bob_2);
        expect(sodium.to_string(bob_ping2_decrypted)).toBe('Ping2!');

        expect(bob.session_states[bob.session_tag.toString()].state.recv_chains.length).toBe(2);

        const pong_alice = await bob.encrypt('Pong!');
        const pong_alice_decrypted = await alice.decrypt(alice_store, pong_alice);
        expect(sodium.to_string(pong_alice_decrypted)).toBe('Pong!');

        expect(alice.session_states[alice.session_tag.toString()].state.recv_chains.length).toBe(3);
        expect(alice.session_states[alice.session_tag.toString()].state.prev_counter).toBe(2);

        const delay_decrypted = await bob.decrypt(bob_store, hello_bob_delayed);
        expect(sodium.to_string(delay_decrypted)).toBe('Hello delay!');

        expect(bob.session_states[bob.session_tag.toString()].state.recv_chains.length).toBe(2);
        expect(bob.session_states[bob.session_tag.toString()].state.prev_counter).toBe(1);

        const bytes_alice = alice.serialise();

        const deserialised_session_alice = Proteus.session.Session.deserialise(alice_ident, bytes_alice);
        const deserialised_bytes_alice = deserialised_session_alice.serialise();

        expect(sodium.to_hex(new Uint8Array(bytes_alice))).toEqual(
          sodium.to_hex(new Uint8Array(deserialised_bytes_alice))
        );

        const bytes_bob = bob.serialise();

        const deserialised_session_bob = Proteus.session.Session.deserialise(bob_ident, bytes_bob);
        const deserialised_bytes_bob = deserialised_session_bob.serialise();

        expect(sodium.to_hex(new Uint8Array(bytes_bob))).toEqual(sodium.to_hex(new Uint8Array(deserialised_bytes_bob)));
      } catch (err) {
        console.log(err);
      } finally {
        done();
      }
    });
  });
});
