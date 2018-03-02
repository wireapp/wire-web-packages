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

const Proteus = require('@wireapp/proteus');
const cryptobox = require('@wireapp/cryptobox');
const {StoreEngine} = require('@wireapp/store-engine');

fdescribe('cryptobox.store.IndexedDB', () => {
  async function createEngine(storeName) {
    const engine = new StoreEngine.IndexedDBEngine();
    await engine.init(storeName);
    engine.db.version(1).stores({
      keys: '',
      prekeys: '',
      sessions: '',
    });
    return engine;
  }

  describe('"create_session"', () => {
    beforeEach(() => {
      window.indexedDB.deleteDatabase('alice_db');
    });

    it('saves a session with meta data', async done => {
      const engine = await createEngine('alice_db');
      const store = new cryptobox.store.CryptoboxCRUDStore(engine);

      const alice = await Proteus.keys.IdentityKeyPair.new();
      const bob = await Proteus.keys.IdentityKeyPair.new();
      const preKey = await Proteus.keys.PreKey.new(Proteus.keys.PreKey.MAX_PREKEY_ID);
      const bobPreKeyBundle = await Proteus.keys.PreKeyBundle.new(bob.public_key, preKey);

      const sessionId = 'session_with_bob';
      const proteusSession = await Proteus.session.Session.init_from_prekey(alice, bobPreKeyBundle);
      await store.create_session(sessionId, proteusSession);

      const tableName = cryptobox.store.CryptoboxCRUDStore.STORES.SESSIONS;
      const serialisedSession = await store.engine.read(tableName, sessionId);
      expect(serialisedSession.created).toEqual(jasmine.any(Number));
      expect(serialisedSession.version).toEqual(cryptobox.Cryptobox.prototype.VERSION);

      const loadedSession = await store.read_session(alice, sessionId);
      expect(loadedSession.session_tag).toEqual(proteusSession.session_tag);

      done();
    });
  });
});
