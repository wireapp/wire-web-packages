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

const assert_init_from_message = (ident, store, message, expected) => {
  return new Promise(async (resolve, reject) => {
    await Proteus.session.Session.init_from_message(ident, store, message)
      .then(messageArray => {
        const [session, message] = messageArray;
        assert.strictEqual(sodium.to_string(message), expected);
        resolve(session);
      })
      .catch(err => reject(err));
  });
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

const assert_prev_count = (session, expected) => {
  assert.strictEqual(expected, session.session_states[session.session_tag].state.prev_counter);
};

const assert_serialise_deserialise = async (local_identity, session) => {
  const bytes = session.serialise();

  const deser = await Proteus.session.Session.deserialise(local_identity, bytes);
  const deser_bytes = deser.serialise();

  assert.deepEqual(sodium.to_hex(new Uint8Array(bytes)), sodium.to_hex(new Uint8Array(deser_bytes)));
};

describe('Session', () => {
  it('can be serialised and deserialised to/from CBOR', async () => {
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));
    const bob_store = new TestStore(bob_prekeys);

    const bob_prekey = bob_store.prekeys[0];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

    const alice = await Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle);
    const alice_state = await alice.session_states[alice.session_tag].state;
    assert(alice_state.recv_chains.length === 1);
    await assert_serialise_deserialise(alice_ident, alice);
  });

  it('encrypts and decrypts messages', async done => {
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const alice_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));
    const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));

    const alice_store = new TestStore(alice_prekeys);
    const bob_store = new TestStore(bob_prekeys);

    /*alice_ident.secret_key.sec_edward = new Uint8Array([86,216,232,120,132,180,67,105,201,74,168,249,139,105,101,216,254,179,217,190,15,37,193,218,117,66,210,131,239,21,191,168,26,41,238,95,147,136,3,178,52,225,120,84,63,205,24,121,245,89,229,184,198,156,116,250,255,64,67,205,89,239,79,60]);
    alice_ident.secret_key.sec_curve = new Uint8Array([176,232,65,194,172,117,101,136,172,204,19,157,147,213,199,62,22,11,138,19,20,20,21,55,203,69,161,155,199,153,163,92]);
    alice_ident.public_key.public_key.pub_edward = new Uint8Array([26,41,238,95,147,136,3,178,52,225,120,84,63,205,24,121,245,89,229,184,198,156,116,250,255,64,67,205,89,239,79,60]);
    alice_ident.public_key.public_key.pub_curve = new Uint8Array([83,172,53,182,2,164,36,96,82,138,23,228,21,148,255,60,51,159,207,29,166,161,97,64,91,83,62,72,216,125,221,42]);
    bob_ident.secret_key.sec_edward = new Uint8Array([171,205,72,160,157,127,166,98,226,147,2,202,32,255,245,115,3,45,221,36,125,101,29,238,198,17,18,118,80,138,194,9,33,55,102,163,107,64,243,178,61,199,151,197,97,38,55,141,166,155,179,251,116,5,184,59,54,175,58,124,159,113,235,77]);
    bob_ident.secret_key.sec_curve = new Uint8Array([232,59,18,55,80,93,87,230,50,40,230,254,120,138,57,164,105,50,205,169,182,195,187,57,92,216,205,240,133,174,104,78]);
    bob_ident.public_key.public_key.pub_edward = new Uint8Array([33,55,102,163,107,64,243,178,61,199,151,197,97,38,55,141,166,155,179,251,116,5,184,59,54,175,58,124,159,113,235,77])
    bob_ident.public_key.public_key.pub_curve = new Uint8Array([20,215,145,190,175,94,121,60,209,120,175,82,38,100,220,90,147,227,34,169,174,84,99,163,126,184,193,246,148,169,155,75]);
    alice_store.prekeys[0].key_pair.secret_key.sec_edward = new Uint8Array([236,9,92,41,155,129,2,75,234,63,174,182,131,196,94,230,78,51,41,105,91,123,44,67,122,78,9,37,89,34,250,59,182,172,86,94,191,62,201,110,109,189,69,3,82,207,150,146,170,31,201,252,4,209,0,52,205,216,20,198,168,91,193,50]);
    alice_store.prekeys[0].key_pair.secret_key.sec_curve = new Uint8Array([24,194,61,214,151,249,15,174,39,102,89,70,179,34,115,230,198,119,208,24,139,19,186,83,16,71,93,190,127,129,254,78]);
    alice_store.prekeys[0].key_pair.public_key.pub_edward = new Uint8Array([182,172,86,94,191,62,201,110,109,189,69,3,82,207,150,146,170,31,201,252,4,209,0,52,205,216,20,198,168,91,193,50]);
    alice_store.prekeys[0].key_pair.public_key.pub_curve = new Uint8Array([141,41,46,234,142,194,108,231,207,139,192,84,242,225,233,130,224,222,137,110,102,90,13,35,95,41,9,10,2,25,40,61]);
    bob_store.prekeys[0].key_pair.secret_key.sec_edward = new Uint8Array([41,189,97,28,216,17,226,21,151,105,186,189,15,165,47,71,142,172,205,219,1,113,92,172,94,149,54,181,159,142,219,3,152,70,102,178,231,13,171,207,71,21,90,136,233,12,212,2,83,146,241,223,103,120,131,81,21,203,43,113,69,227,49,159]);
    bob_store.prekeys[0].key_pair.secret_key.sec_curve = new Uint8Array([0,173,79,196,182,44,99,112,103,71,165,80,67,223,66,78,12,102,39,23,107,129,44,129,169,220,157,2,238,239,243,105]);
    bob_store.prekeys[0].key_pair.public_key.pub_edward = new Uint8Array([152,70,102,178,231,13,171,207,71,21,90,136,233,12,212,2,83,146,241,223,103,120,131,81,21,203,43,113,69,227,49,159]);
    bob_store.prekeys[0].key_pair.public_key.pub_curve = new Uint8Array([55,217,221,51,150,157,197,122,207,162,105,172,38,206,91,43,91,181,168,58,113,117,196,208,44,7,231,89,133,101,250,1]);*/

    const bob_prekey = bob_store.prekeys[0];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

      let bob = null;

      let hello_bob = null;
      let hello_bob_delayed = null;
      let hello_alice = null;
      let ping_bob_1 = null;
      let ping_bob_2 = null;
      let pong_alice = null;

      const alice = await Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle);
      const alice_state = await alice.session_states[alice.session_tag].state;
      assert(alice_state.recv_chains.length === 1);

      return Promise.all(['Hello Bob!', 'Hello delay!'].map(async text => await alice.encrypt(text)))
        .then(async msgs => {
          [hello_bob, hello_bob_delayed] = msgs;

          assert(Object.keys(alice.session_states).length === 1);

          const alice_state = await alice.session_states[alice.session_tag].state;

          assert(alice_state.recv_chains.length === 1);

          return assert_init_from_message(bob_ident, bob_store, hello_bob, 'Hello Bob!');
        })
        .then(async session => {
          bob = session;

          assert(Object.keys(bob.session_states).length === 1);
          assert(bob.session_states[bob.session_tag].state.recv_chains.length === 1);

          return await bob.encrypt('Hello Alice!');
        })
        .then(async message => {
          hello_alice = message;
          return assert_decrypt('Hello Alice!', await alice.decrypt(alice_store, hello_alice));
        })
        .then(() => {
          assert(alice.pending_prekey === null);
          assert(alice.session_states[alice.session_tag].state.recv_chains.length === 2);
          assert(alice.remote_identity.fingerprint() === bob.local_identity.public_key.fingerprint());

          return Promise.all(['Ping1!', 'Ping2!'].map(async text => await alice.encrypt(text)));
        })
        .then(async msgs => {
          [ping_bob_1, ping_bob_2] = msgs;

          assert_prev_count(alice, 2);

          assert(ping_bob_1.message instanceof Proteus.message.CipherMessage);
          assert(ping_bob_2.message instanceof Proteus.message.CipherMessage);

          return assert_decrypt('Ping1!', await bob.decrypt(bob_store, ping_bob_1));
        })
        .then(async () => {
          assert(bob.session_states[bob.session_tag].state.recv_chains.length === 2);
          return assert_decrypt('Ping2!', await bob.decrypt(bob_store, ping_bob_2));
        })
        .then(() => {
          assert(bob.session_states[bob.session_tag].state.recv_chains.length === 2);
          return bob.encrypt('Pong!');
        })
        .then(async message => {
          pong_alice = message;
          assert_prev_count(bob, 1);
          return assert_decrypt('Pong!', await alice.decrypt(alice_store, pong_alice));
        })
        .then(async () => {
          assert(alice.session_states[alice.session_tag].state.recv_chains.length === 3);
          assert_prev_count(alice, 2);
          return assert_decrypt('Hello delay!', await bob.decrypt(bob_store, hello_bob_delayed));
        })
        .then(async () => {
          assert(bob.session_states[bob.session_tag].state.recv_chains.length === 2);
          assert_prev_count(bob, 1);

          await assert_serialise_deserialise(alice_ident, alice);
          return await assert_serialise_deserialise(bob_ident, bob);
        })
        .then(() => {
          done();
        })
        .catch(err => {
          done(err);
        });
  });

  it('should limit the number of receive chains', async done => {
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const alice_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));
    const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));

    const alice_store = new TestStore(alice_prekeys);
    const bob_store = new TestStore(bob_prekeys);

    const bob_prekey = bob_store.prekeys[0];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

    let alice = null;
    let bob = null;

    return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle)
      .then(session => {
        alice = session;
        return alice.encrypt('Hello Bob!');
      })
      .then(hello_bob => assert_init_from_message(bob_ident, bob_store, hello_bob, 'Hello Bob!'))
      .then(session => {
        bob = session;

        assert(alice.session_states[alice.session_tag].state.recv_chains.length === 1);
        assert(bob.session_states[bob.session_tag].state.recv_chains.length === 1);

        return Promise.all(
          Array.from({length: Proteus.session.Session.MAX_RECV_CHAINS * 2}, () => {
            return new Promise((resolve, reject) => {
              return bob
                .encrypt('ping')
                .then(message => assert_decrypt('ping', alice.decrypt(alice_store, message)))
                .then(() => alice.encrypt('pong'))
                .then(message => assert_decrypt('pong', bob.decrypt(bob_store, message)))
                .then(() => {
                  assert.isAtMost(
                    alice.session_states[alice.session_tag].state.recv_chains.length,
                    Proteus.session.Session.MAX_RECV_CHAINS
                  );
                  assert.isAtMost(
                    bob.session_states[bob.session_tag].state.recv_chains.length,
                    Proteus.session.Session.MAX_RECV_CHAINS
                  );
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

  it('should handle a counter mismatch', async done => {
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const alice_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));
    const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));

    const alice_store = new TestStore(alice_prekeys);
    const bob_store = new TestStore(bob_prekeys);

    const bob_prekey = bob_store.prekeys[0];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

    let alice = null;
    let bob = null;

    let ciphertexts = null;

    return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle)
      .then(session => {
        alice = session;
        return alice.encrypt('Hello Bob!');
      })
      .then(message => assert_init_from_message(bob_ident, bob_store, message, 'Hello Bob!'))
      .then(session => {
        bob = session;
        return Promise.all(['Hello1', 'Hello2', 'Hello3', 'Hello4', 'Hello5'].map(text => bob.encrypt(text)));
      })
      .then(encryptArray => {
        ciphertexts = encryptArray;
        return assert_decrypt('Hello2', alice.decrypt(alice_store, ciphertexts[1]));
      })
      .then(async () => {
        assert(alice.session_states[alice.session_tag].state.recv_chains[0].message_keys.length === 1);
        await assert_serialise_deserialise(alice_ident, alice);
        return assert_decrypt('Hello1', alice.decrypt(alice_store, ciphertexts[0]));
      })
      .then(() => {
        assert(alice.session_states[alice.session_tag].state.recv_chains[0].message_keys.length === 0);
        return assert_decrypt('Hello3', alice.decrypt(alice_store, ciphertexts[2]));
      })
      .then(() => {
        assert(alice.session_states[alice.session_tag].state.recv_chains[0].message_keys.length === 0);
        return assert_decrypt('Hello5', alice.decrypt(alice_store, ciphertexts[4]));
      })
      .then(() => {
        assert(alice.session_states[alice.session_tag].state.recv_chains[0].message_keys.length === 1);
        return assert_decrypt('Hello4', alice.decrypt(alice_store, ciphertexts[3]));
      })
      .then(() => {
        assert(alice.session_states[alice.session_tag].state.recv_chains[0].message_keys.length === 0);
        return Promise.all(
          ciphertexts.map(text => {
            return new Promise((resolve, reject) => {
              return alice
                .decrypt(alice_store, text)
                .then(() => assert.fail('should have raised Proteus.errors.DecryptError.DuplicateMessage'))
                .catch(err => {
                  assert.instanceOf(err, Proteus.errors.DecryptError.DuplicateMessage);
                  assert.strictEqual(err.code, Proteus.errors.DecryptError.CODE.CASE_209);
                  resolve();
                });
            });
          })
        );
      })
      .then(async () => {
        await assert_serialise_deserialise(alice_ident, alice);
        await assert_serialise_deserialise(bob_ident, bob);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should handle multiple prekey messages', async done => {
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));
    const bob_store = new TestStore(bob_prekeys);

    const bob_prekey = bob_store.prekeys[0];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

    let alice = null;
    let bob = null;

    let hello_bob1 = null;
    let hello_bob2 = null;
    let hello_bob3 = null;

    return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle)
      .then(session => {
        alice = session;
        return Promise.all(['Hello Bob1!', 'Hello Bob2!', 'Hello Bob3!'].map(text => alice.encrypt(text)));
      })
      .then(message => {
        [hello_bob1, hello_bob2, hello_bob3] = message;
        return assert_init_from_message(bob_ident, bob_store, hello_bob1, 'Hello Bob1!');
      })
      .then(session => {
        bob = session;
        assert(Object.keys(bob.session_states).length === 1);
        return assert_decrypt('Hello Bob2!', bob.decrypt(bob_store, hello_bob2));
      })
      .then(() => {
        assert(Object.keys(bob.session_states).length === 1);
        return assert_decrypt('Hello Bob3!', bob.decrypt(bob_store, hello_bob3));
      })
      .then(async () => {
        assert(Object.keys(bob.session_states).length === 1);
        await assert_serialise_deserialise(alice_ident, alice);
        return await assert_serialise_deserialise(bob_ident, bob);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should handle simultaneous prekey messages', async done => {
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const alice_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));
    const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));

    const alice_store = new TestStore(alice_prekeys);
    const bob_store = new TestStore(bob_prekeys);

    const bob_prekey = bob_store.prekeys[0];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

    const alice_prekey = alice_store.prekeys[0];
    const alice_bundle = await Proteus.keys.PreKeyBundle.new(alice_ident.public_key, alice_prekey);

    let alice = null;
    let bob = null;

    let hello_bob = null;
    let hello_alice = null;

    return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle)
      .then(async session => {
        alice = session;
        return await alice.encrypt('Hello Bob!');
      })
      .then(message => {
        hello_bob = message;
        bob = Proteus.session.Session.init_from_prekey(bob_ident, alice_bundle);
        return bob;
      })
      .then(async session => {
        bob = session;
        return await bob.encrypt('Hello Alice!');
      })
      .then(message => {
        hello_alice = message;
        assert.notStrictEqual(alice.session_tag.toString(), bob.session_tag.toString());
        return assert_decrypt('Hello Bob!', bob.decrypt(bob_store, hello_bob));
      })
      .then(() => {
        assert(Object.keys(bob.session_states).length === 2);
        return assert_decrypt('Hello Alice!', alice.decrypt(alice_store, hello_alice));
      })
      .then(async () => {
        assert(Object.keys(alice.session_states).length === 2);
        return await alice.encrypt('That was fast!');
      })
      .then(async message => {
        assert_decrypt('That was fast!', bob.decrypt(bob_store, message));
        return await bob.encrypt(':-)');
      })
      .then(async message => {
        assert_decrypt(':-)', alice.decrypt(alice_store, message));

        assert.strictEqual(alice.session_tag.toString(), bob.session_tag.toString());

        await assert_serialise_deserialise(alice_ident, alice);
        return await assert_serialise_deserialise(bob_ident, bob);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should handle simultaneous repeated messages', async done => {
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const alice_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));
    const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));

    const alice_store = new TestStore(alice_prekeys);
    const bob_store = new TestStore(bob_prekeys);

    const bob_prekey = bob_store.prekeys[0];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

    const alice_prekey = alice_store.prekeys[0];
    const alice_bundle = await Proteus.keys.PreKeyBundle.new(alice_ident.public_key, alice_prekey);

    let alice = null;
    let bob = null;

    let hello_bob = null;
    let echo_bob1 = null;
    let echo_bob2 = null;
    let stop_bob = null;
    let hello_alice = null;
    let echo_alice1 = null;
    let echo_alice2 = null;

    return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle)
      .then(async session => {
        alice = session;
        return await alice.encrypt('Hello Bob!');
      })
      .then(message => {
        hello_bob = message;
        return Proteus.session.Session.init_from_prekey(bob_ident, alice_bundle);
      })
      .then(async session => {
        bob = session;
        return await bob.encrypt('Hello Alice!');
      })
      .then(message => {
        hello_alice = message;
        assert(alice.session_tag.toString() !== bob.session_tag.toString());
        return assert_decrypt('Hello Bob!', bob.decrypt(bob_store, hello_bob));
      })
      .then(() => assert_decrypt('Hello Alice!', alice.decrypt(alice_store, hello_alice)))
      .then(async () => await alice.encrypt('Echo Bob1!'))
      .then(message => {
        echo_bob1 = message;
        return bob.encrypt('Echo Alice1!');
      })
      .then(async message => {
        echo_alice1 = message;

        assert_decrypt('Echo Bob1!', bob.decrypt(bob_store, echo_bob1));
        assert(Object.keys(bob.session_states).length === 2);
        assert_decrypt('Echo Alice1!', alice.decrypt(alice_store, echo_alice1));
        assert(Object.keys(alice.session_states).length === 2);
        assert(alice.session_tag.toString() !== bob.session_tag.toString());

        return await alice.encrypt('Echo Bob2!');
      })
      .then(message => {
        echo_bob2 = message;
        return bob.encrypt('Echo Alice2!');
      })
      .then(message => {
        echo_alice2 = message;
        return assert_decrypt('Echo Bob2!', bob.decrypt(bob_store, echo_bob2));
      })
      .then(() => {
        assert(Object.keys(bob.session_states).length === 2);
        return assert_decrypt('Echo Alice2!', alice.decrypt(alice_store, echo_alice2));
      })
      .then(() => {
        assert(Object.keys(alice.session_states).length === 2);
        assert(alice.session_tag.toString() !== bob.session_tag.toString());
        return alice.encrypt('Stop it!');
      })
      .then(message => {
        stop_bob = message;
        assert_decrypt('Stop it!', bob.decrypt(bob_store, stop_bob));
        return bob.encrypt('OK');
      })
      .then(async message => {
        const answer_alice = message;
        assert_decrypt('OK', alice.decrypt(alice_store, answer_alice));

        assert(alice.session_tag.toString() === bob.session_tag.toString());

        await assert_serialise_deserialise(alice_ident, alice);
        await assert_serialise_deserialise(bob_ident, bob);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should fail retry init from message', async done => {
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));
    const bob_store = new TestStore(bob_prekeys);

    const bob_prekey = bob_store.prekeys[0];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

    let alice = null;
    let hello_bob = null;

    return Proteus.session.Session.init_from_prekey(alice_ident, bob_bundle)
      .then(session => {
        alice = session;
        return alice.encrypt('Hello Bob!');
      })
      .then(message => {
        hello_bob = message;
        return assert_init_from_message(bob_ident, bob_store, hello_bob, 'Hello Bob!');
      })
      .then(session => {
        bob = session;
        return Proteus.session.Session.init_from_message(bob_ident, bob_store, hello_bob);
      })
      .then(() => assert.fail('should have thrown Proteus.errors.ProteusError'))
      .catch(err => {
        assert.instanceOf(err, Proteus.errors.ProteusError);
        assert.strictEqual(err.code, Proteus.errors.ProteusError.prototype.CODE.CASE_101);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('skipped message keys', async done => {
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const alice_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));
    const bob_prekeys = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 10));

    const alice_store = new TestStore(alice_prekeys);
    const bob_store = new TestStore(bob_prekeys);

    const bob_prekey = bob_store.prekeys[0];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

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
          const state = alice.session_states[alice.session_tag].state;
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

          const state = bob.session_states[bob.session_tag].state;
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

          const state = alice.session_states[alice.session_tag].state;
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

          const state = bob.session_states[bob.session_tag].state;
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

          const state = alice.session_states[alice.session_tag].state;
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

          const state = alice.session_states[alice.session_tag].state;
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
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const bob_prekeys1 = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 1));
    const bob_prekeys2 = await Promise.all(Proteus.keys.PreKey.generate_prekeys(0, 1));

    const bob_store1 = new TestStore(bob_prekeys1);
    const bob_store2 = new TestStore(bob_prekeys2);

    const bob_prekey = bob_store1.prekeys[0];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

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

    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const keys = [];
    keys[Proteus.keys.PreKey.MAX_PREKEY_ID] = await Proteus.keys.PreKey.last_resort();

    const bob_store = new TestStore(keys);

    const bob_prekey = bob_store.prekeys[Proteus.keys.PreKey.MAX_PREKEY_ID];
    const bob_bundle = await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, bob_prekey);

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
    const alice_ident = await Proteus.keys.IdentityKeyPair.new();
    const bob_ident = await Proteus.keys.IdentityKeyPair.new();

    const bob_prekeys = await Promise.all(
      Proteus.keys.PreKey.generate_prekeys(0, Proteus.session.Session.MAX_SESSION_STATES + 2)
    );
    const bob_store = new TestStore(bob_prekeys);

    const obj_size = obj => Object.keys(obj).length;
    const bob_bundle = async (index, store) =>
      await Proteus.keys.PreKeyBundle.new(bob_ident.public_key, store.prekeys[index]);

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
