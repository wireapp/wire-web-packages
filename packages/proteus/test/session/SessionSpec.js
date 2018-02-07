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
  it('skipped message keys', async done => {
    const [alice_ident, bob_ident] = await Promise.all([0, 1].map(() => Proteus.keys.IdentityKeyPair.new()));
    const [alice_store, bob_store] = await Promise.all(
      [0, 1].map(async () => new TestStore(await Proteus.keys.PreKey.generate_prekeys(0, 10)))
    );

    const bob_prekey = bob_store.prekeys[0];
    const bob_bundle = Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

    let alice = null;
    let bob = null;
    let hello_bob = null;
    let hello_alice0 = null;
    let hello_alice2 = null;
    let hello_bob0 = null;
    let hello_again0 = null;
    let hello_again1 = null;

    return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle)
      .then(session => {
        alice = session;
        return alice.encrypt('Hello Bob!');
      })
      .then(message => {
        hello_bob = message;

        (() => {
          const state = alice.session_states[alice.session_tag.toString()].state;
          assert(state.recv_chains.length === 1);
          assert(state.recv_chains[0].chain_key.idx === 0);
          assert(state.send_chain.chain_key.idx === 1);
          assert(state.recv_chains[0].message_keys.length === 0);
        })();

        return assert_init_from_message(bob_ident, bob_store, hello_bob, 'Hello Bob!');
      })
      .then(session => {
        bob = session;

        (() => {
          // Normal exchange. Bob has created a new receive chain without skipped message keys.

          const state = bob.session_states[bob.session_tag.toString()].state;
          assert(state.recv_chains.length === 1);
          assert(state.recv_chains[0].chain_key.idx === 1);
          assert(state.send_chain.chain_key.idx === 0);
          return assert(state.recv_chains[0].message_keys.length === 0);
        })();

        return bob.encrypt('Hello0');
      })
      .then(message => {
        hello_alice0 = message;
        bob.encrypt('Hello1'); // unused result
        return bob.encrypt('Hello2');
      })
      .then(message => {
        hello_alice2 = message;
        return alice.decrypt(alice_store, hello_alice2);
      })
      .then(() => {
        (() => {
          // Alice has two skipped message keys in her new receive chain.

          const state = alice.session_states[alice.session_tag.toString()].state;
          assert(state.recv_chains.length === 2);
          assert(state.recv_chains[0].chain_key.idx === 3);
          assert(state.send_chain.chain_key.idx === 0);
          assert(state.recv_chains[0].message_keys.length === 2);
          assert(state.recv_chains[0].message_keys[0].counter === 0);
          assert(state.recv_chains[0].message_keys[1].counter === 1);
        })();

        return alice.encrypt('Hello0');
      })
      .then(message => {
        hello_bob0 = message;
        return assert_decrypt('Hello0', bob.decrypt(bob_store, hello_bob0));
      })
      .then(() => {
        (() => {
          // For Bob everything is normal still. A new message from Alice means a
          // new receive chain has been created and again no skipped message keys.

          const state = bob.session_states[bob.session_tag.toString()].state;
          assert(state.recv_chains.length === 2);
          assert(state.recv_chains[0].chain_key.idx === 1);
          assert(state.send_chain.chain_key.idx === 0);
          assert(state.recv_chains[0].message_keys.length === 0);
        })();

        return assert_decrypt('Hello0', alice.decrypt(alice_store, hello_alice0));
      })
      .then(() => {
        (() => {
          // Alice received the first of the two missing messages. Therefore
          // only one message key is still skipped (counter value = 1).

          const state = alice.session_states[alice.session_tag.toString()].state;
          assert(state.recv_chains.length === 2);
          assert(state.recv_chains[0].message_keys.length === 1);
          assert(state.recv_chains[0].message_keys[0].counter === 1);
        })();

        return bob.encrypt('Again0');
      })
      .then(message => {
        hello_again0 = message;
        return bob.encrypt('Again1');
      })
      .then(message => {
        hello_again1 = message;
        return assert_decrypt('Again1', alice.decrypt(alice_store, hello_again1));
      })
      .then(() => {
        (() => {
          // Alice received the first of the two missing messages. Therefore
          // only one message key is still skipped (counter value = 1).

          const state = alice.session_states[alice.session_tag.toString()].state;
          assert(state.recv_chains.length === 3);
          assert(state.recv_chains[0].message_keys.length === 1);
          assert(state.recv_chains[1].message_keys.length === 1);
          assert(state.recv_chains[0].message_keys[0].counter === 0);
          assert(state.recv_chains[1].message_keys[0].counter === 1);
        })();

        return assert_decrypt('Again0', alice.decrypt(alice_store, hello_again0));
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('replaced prekeys', async done => {
    const [alice_ident, bob_ident] = await Promise.all([0, 1].map(() => Proteus.keys.IdentityKeyPair.new()));
    const [bob_store1, bob_store2] = await Promise.all(
      [0, 1, 2].map(async () => new TestStore(await Proteus.keys.PreKey.generate_prekeys(0, 10)))
    );

    const bob_prekey = bob_store1.prekeys[0];
    const bob_bundle = Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

    let alice = null;
    let bob = null;
    let hello_bob1 = null;
    let hello_bob2 = null;
    let hello_bob3 = null;

    return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle)
      .then(session => {
        alice = session;
        return alice.encrypt('Hello Bob1!');
      })
      .then(message => {
        hello_bob1 = message;
        return assert_init_from_message(bob_ident, bob_store1, hello_bob1, 'Hello Bob1!');
      })
      .then(session => {
        bob = session;
        assert(Object.keys(bob.session_states).length === 1);
        return alice.encrypt('Hello Bob2!');
      })
      .then(message => {
        hello_bob2 = message;
        assert_decrypt('Hello Bob2!', bob.decrypt(bob_store1, hello_bob2));
        assert(Object.keys(bob.session_states).length === 1);
        return alice.encrypt('Hello Bob3!');
      })
      .then(message => {
        hello_bob3 = message;
        assert_decrypt('Hello Bob3!', bob.decrypt(bob_store2, hello_bob3));
        assert(Object.keys(bob.session_states).length === 1);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('max counter gap', async function(done) {
    this.timeout(0);

    const [alice_ident, bob_ident] = await Promise.all([0, 1].map(() => Proteus.keys.IdentityKeyPair.new()));

    const keys = [];
    keys[Proteus.keys.PreKey.MAX_PREKEY_ID] = await Proteus.keys.PreKey.last_resort();

    const bob_store = new TestStore(keys);

    const bob_prekey = bob_store.prekeys[Proteus.keys.PreKey.MAX_PREKEY_ID];
    const bob_bundle = Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

    let alice = null;
    let bob = null;

    return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle)
      .then(session => {
        alice = session;
        return alice.encrypt('Hello Bob1!');
      })
      .then(hello_bob1 => assert_init_from_message(bob_ident, bob_store, hello_bob1, 'Hello Bob1!'))
      .then(session => {
        bob = session;
        assert(Object.keys(bob.session_states).length === 1);

        return Promise.all(
          Array.from({length: 1001}, () => {
            return new Promise((resolve, reject) => {
              return alice.encrypt('Hello Bob2!').then(hello_bob2 => {
                assert_decrypt('Hello Bob2!', bob.decrypt(bob_store, hello_bob2));
                assert.strictEqual(Object.keys(bob.session_states).length, 1);
                resolve();
              });
            });
          })
        );
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

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
