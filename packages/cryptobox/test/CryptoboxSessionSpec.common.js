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

/* eslint-disable no-magic-numbers */

const {StoreEngine} = require('@wireapp/store-engine');
const cryptobox = typeof window === 'object' ? window.cryptobox : require('@wireapp/cryptobox');
const Proteus = typeof window === 'object' ? window.Proteus : require('@wireapp/proteus');

describe('cryptobox.CryptoboxSession', () => {
  let sodium = undefined;

  beforeAll(async done => {
    if (typeof window === 'object') {
      sodium = window.sodium;
      done();
    } else {
      const _sodium = require('libsodium-wrappers-sumo');
      await _sodium.ready;
      sodium = _sodium;
      done();
    }
  });

  describe('PreKey messages', () => {
    async function setupAliceToBob() {
      const aliceEngine = new StoreEngine.MemoryEngine();
      await aliceEngine.init('alice');

      const bobEngine = new StoreEngine.MemoryEngine();
      await bobEngine.init('bob');

      alice = new cryptobox.Cryptobox(aliceEngine, 1);
      await alice.create();

      bob = new cryptobox.Cryptobox(bobEngine, 1);
      await bob.create();

      // 1. Bob creates and "uploads" a PreKey, which can be "consumed" by Alice
      const preKey = await bob.get_prekey();
      const bobBundle = await Proteus.keys.PreKeyBundle.new(bob.identity.public_key, preKey);
      // 2. Alice takes Bob's PreKey bundle to initiate a session
      const sessionWithBob = await alice.session_from_prekey('session-with-bob', bobBundle.serialise());
      return sessionWithBob;
    }

    describe('"fingerprints"', () => {
      it('returns the local & remote fingerprint', done => {
        setupAliceToBob()
          .then(sessionWithBob => {
            expect(sessionWithBob.fingerprint_local()).toBe(alice.identity.public_key.fingerprint());
            expect(sessionWithBob.fingerprint_remote()).toBe(bob.identity.public_key.fingerprint());
            done();
          })
          .catch(done.fail);
      });
    });

    describe('"encryption & decryption"', () => {
      const plaintext = 'Hello Bob, I am Alice.';

      it('encrypts a message from Alice which can be decrypted by Bob', done => {
        Promise.resolve()
          .then(() => {
            return setupAliceToBob();
          })
          .then(sessionWithBob => {
            return sessionWithBob.encrypt(plaintext);
          })
          .then(serialisedCipherText => {
            const envelope = Proteus.message.Envelope.deserialise(serialisedCipherText);
            expect(bob.pk_store.prekeys.length).toBe(0);
            return Proteus.session.Session.init_from_message(bob.identity, bob.pk_store, envelope);
          })
          .then(proteusSession => {
            const decryptedBuffer = proteusSession[1];
            const decrypted = sodium.to_string(decryptedBuffer);
            expect(decrypted).toBe(plaintext);
            done();
          })
          .catch(done.fail);
      });

      it("doesn't remove the last resort PreKey if consumed", done => {
        Promise.resolve()
          .then(() => {
            return setupAliceToBob(Proteus.keys.PreKey.MAX_PREKEY_ID);
          })
          .then(sessionWithBob => {
            return sessionWithBob.encrypt(plaintext);
          })
          .then(serialisedCipherText => {
            const envelope = Proteus.message.Envelope.deserialise(serialisedCipherText);
            expect(bob.pk_store.prekeys.length).toBe(0);
            return Proteus.session.Session.init_from_message(bob.identity, bob.pk_store, envelope);
          })
          .then(proteusSession => {
            expect(bob.pk_store.prekeys.length).toBe(0);
            const decryptedBuffer = proteusSession[1];
            const decrypted = sodium.to_string(decryptedBuffer);
            expect(decrypted).toBe(plaintext);
            done();
          })
          .catch(done.fail);
      });
    });
  });

  describe('Session reset', () => {
    it('throws an error when a session is broken', async done => {
      const aliceEngine = new StoreEngine.MemoryEngine();
      await aliceEngine.init('store-alice');

      const bobEngine = new StoreEngine.MemoryEngine();
      await bobEngine.init('store-bob');

      const alice = new cryptobox.Cryptobox(aliceEngine, 5);
      await alice.create();

      const bob = new cryptobox.Cryptobox(bobEngine, 5);
      await bob.create();

      const preKeyBundle = await bob.get_serialized_standard_prekeys();

      const deserialisedBundle = sodium.from_base64(preKeyBundle[1].key, sodium.base64_variants.ORIGINAL);

      const message = 'Hello Bob!';
      const ciphertext = await alice.encrypt('alice-to-bob', message, deserialisedBundle.buffer);
      const decrypted = await bob.decrypt('bob-to-alice', ciphertext);
      expect(sodium.to_string(decrypted)).toBe(message);

      const deletedSessionId = await alice.session_delete('alice-to-bob');
      expect(deletedSessionId).toBe('alice-to-bob');

      try {
        await alice.encrypt('alice-to-bob', `I'm back!`);
      } catch (error) {
        expect(error).toEqual(jasmine.any(StoreEngine.error.RecordNotFoundError));
        expect(error.code).toBe(2);
      }

      done();
    });
  });
});
