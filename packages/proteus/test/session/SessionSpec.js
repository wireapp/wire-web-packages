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
//@ts-check
/// <reference types="../../proteus" />
/// <reference path="../../libsodium.d.ts" />
const Proteus = require('../../dist/commonjs/proteus').default;
const sodium = require('libsodium-wrappers-sumo');
const assert = require('chai').assert;

class TestStore extends Proteus.session.PreKeyStore {
  constructor(prekeys) {
    super();

    /** @type {Array<PreKey>}; */
    this.prekeys = prekeys;
  }

  /** @returns {Promise<PreKey>}; */
  get_prekey(/** @type {number}; */ prekey_id) {
    return new Promise((resolve, reject) => {
      resolve(this.prekeys[prekey_id]);
    });
  }

  /** @returns {Promise<void>}; */
  remove(prekey_id) {
    return new Promise((resolve, reject) => {
      delete this.prekeys[prekey_id];
      resolve();
    });
  }
}

/** @returns {Promise<Session>} */
const assert_init_from_message = (
  /** @type {IdentityKeyPair} */ ident,
  /** @type {PreKeyStore} */ store,
  /** @type {Envelope} */ msg,
  /** @type {string} */ expected
) => {
  return new Promise((resolve, reject) => {
    Proteus.session.Session.init_from_message(ident, store, msg)
      .then(messageArray => {
        const [session, message] = messageArray;
        assert.strictEqual(sodium.to_string(message), expected);
        resolve(session);
      })
      .catch(err => reject(err));
  });
};

/** @returns {Promise<void>} */
const assert_decrypt = (/** @type {string} */ expected, /** @type {Promise<Uint8Array>} */ decryptedPromise) => {
  return new Promise((resolve, reject) => {
    decryptedPromise
      .then(actual => {
        assert.strictEqual(expected, sodium.to_string(actual));
        resolve();
      })
      .catch(err => reject(err));
  });
};

describe('Session', () => {
  it('should limit the number of sessions', async done => {
    const [alice_ident, bob_ident] = await Promise.all([0, 1].map(() => Proteus.keys.IdentityKeyPair.new()));
    const bob_store = new TestStore(
      await Proteus.keys.PreKey.generate_prekeys(0, Proteus.session.Session.MAX_SESSION_STATES + 2)
    );

    const obj_size = obj => Object.keys(obj).length;
    const bob_bundle = (index, store) => Proteus.keys.PreKeyBundle.new(bob_ident.public_key, store.prekeys[index]);

    let alice = null;
    let bob = null;
    let hello_bob = null;

    return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle(1, bob_store))
      .then(session => {
        alice = session;
        return alice.encrypt('Hello Bob!');
      })
      .then(bob_message => assert_init_from_message(bob_ident, bob_store, bob_message, 'Hello Bob!'))
      .then(session => {
        bob = session;

        assert(obj_size(bob.session_states) === 1);

        return Promise.all(
          Array.from({length: Proteus.session.Session.MAX_SESSION_STATES}, (obj, index) => {
            return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle(index + 2, bob_store))
              .then(alice_session => {
                alice = alice_session;
                return alice.encrypt('Hello Bob!');
              })
              .then(message => {
                hello_bob = message;
                assert_decrypt('Hello Bob!', bob.decrypt(bob_store, hello_bob));
              });
          })
        );
      })
      .then(() => {
        assert.isAtMost(obj_size(alice.session_states), Proteus.session.Session.MAX_SESSION_STATES);
        assert.isAtMost(obj_size(bob.session_states), Proteus.session.Session.MAX_SESSION_STATES);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
