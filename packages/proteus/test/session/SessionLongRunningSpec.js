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

class TestStore extends Proteus.session.PreKeyStore {
  constructor(prekeys) {
    super();
    this.prekeys = prekeys;
  }

  get_prekey(prekey_id) {
    return Promise.resolve(this.prekeys[prekey_id]);
  }

  remove(prekey_id) {
    delete this.prekeys[prekey_id];
    return Promise.resolve();
  }
}

const assert_init_from_message = async (ident, store, msg, expected) => {
  try {
    return await Proteus.session.Session.init_from_message(ident, store, msg).then(messageArray => {
      const [session, message] = messageArray;
      assert.strictEqual(sodium.to_string(message), expected);
      resolve(session);
    });
  } catch (error) {
    throw new Error(error);
  }
};

const assert_decrypt = (expected, decryptedPromise) => {
  return new Promise((resolve, reject) => {
    decryptedPromise
      .then(actual => {
        assert.strictEqual(expected, sodium.to_string(actual));
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
};

const assert_serialise_deserialise = async (local_identity, session) => {
  const bytes = session.serialise();

  const deser = await Proteus.session.Session.deserialise(local_identity, bytes);
  console.log('deser', deser);
  const deser_bytes = deser.serialise();

  assert.deepEqual(sodium.to_hex(new Uint8Array(bytes)), sodium.to_hex(new Uint8Array(deser_bytes)));
};

describe('LongRunning', () => {
  describe('Session', () => {
    it('should handle mass communication', async done => {
      try {
        const alice_ident = await Proteus.keys.IdentityKeyPair.new();
        const bob_ident = await Proteus.keys.IdentityKeyPair.new();

        const alice_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));
        const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));

        const alice_store = new TestStore(alice_prekeys);
        const bob_store = new TestStore(bob_prekeys);

        const bob_prekey = bob_store.prekeys[0];
        const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

        const alice_session = await Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle);

        const hello_bob = await alice_session.encrypt('Hello Bob!');
        const bob_session = await assert_init_from_message(bob_ident, bob_store, hello_bob, 'Hello Bob!');

        // XXX: need to serialize/deserialize to/from CBOR here
        const messages = await Promise.all(
          Array.from({length: 999}, async () => await bob_session.encrypt('Hello Alice!'))
        );

        await Promise.all(
          messages.map(message =>
            assert_decrypt(
              'Hello Alice!',
              alice_session.decrypt(alice_store, Proteus.message.Envelope.deserialise(message.serialise()))
            )
          )
        );
        await assert_serialise_deserialise(alice_ident, alice_session);
        await assert_serialise_deserialise(bob_ident, bob_session);
        done();
      } catch (error) {
        done(new Error(error));
      }
    });

    it('pathological case', async function(done) {
      this.timeout(0);

      const num_alices = 32;
      let alices = null;
      let bob = null;

      const alice_ident = await Proteus.keys.IdentityKeyPair.new();
      const bob_ident = await Proteus.keys.IdentityKeyPair.new();

      const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, num_alices));
      const bob_store = new TestStore(bob_prekeys);

      Promise.all(
        bob_store.prekeys.map(async pk => {
          const bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, pk);
          const session = await Proteus.session.Session.init_from_prekey(alice_ident, bundle);
          return session;
        })
      )
        .then(session => {
          alices = session;
          assert(alices.length === num_alices);
          return alices[0].encrypt('Hello Bob!');
        })
        .then(async message => await assert_init_from_message(bob_ident, bob_store, message, 'Hello Bob!'))
        .then(session => {
          bob = session;

          return Promise.all(
            alices.map(alice => {
              return new Promise(resolve => {
                Promise.all(Array.from({length: 900}, () => alice.encrypt('hello')))
                  .then(async () => await alice.encrypt('Hello Bob!'))
                  .then(message => resolve(assert_decrypt('Hello Bob!', bob.decrypt(bob_store, message))));
              });
            })
          );
        })
        .then(() => {
          assert(Object.keys(bob.session_states).length === num_alices);

          return Promise.all(
            alices.map(async alice => {
              const message = await alice.encrypt('Hello Bob!');
              return assert_decrypt('Hello Bob!', bob.decrypt(bob_store, message));
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
  });
});
