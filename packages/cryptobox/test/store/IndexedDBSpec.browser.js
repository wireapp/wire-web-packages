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

describe('cryptobox.store.IndexedDB', () => {
  describe('"constructor"', () => {
    let store = undefined;

    afterEach(done => {
      if (store) {
        store
          .delete_all()
          .then(done)
          .catch(done.fail);
      }
    });

    it('works with a given Dexie instance', () => {
      const schema = {
        amplify: '',
        clients: ', meta.primary_key',
        conversation_events: ', conversation, time, type',
        conversations: ', id, last_event_timestamp',
        keys: '',
        prekeys: '',
        sessions: '',
      };

      const name = 'wire@production@532af01e-1e24-4366-aacf-33b67d4ee376@temporary';
      const db = new Dexie(name);
      db.version(7).stores(schema);

      store = new cryptobox.store.IndexedDB(db);
      expect(store.db.name).toBe(name);
    });
  });

  describe('"create_session"', () => {
    let store = undefined;

    beforeEach(() => {
      store = new cryptobox.store.IndexedDB('bobs_store');
    });

    afterEach(done => {
      if (store) {
        store
          .delete_all()
          .then(done)
          .catch(done.fail);
      }
    });

    it('saves a session with meta data', async done => {
      const alice = await Proteus.keys.IdentityKeyPair.new();

      const bob = await Proteus.keys.IdentityKeyPair.new();
      const preKey = await Proteus.keys.PreKey.new(Proteus.keys.PreKey.MAX_PREKEY_ID);
      const bobPreKeyBundle = await Proteus.keys.PreKeyBundle.new(bob.public_key, preKey);

      const sessionId = 'session_with_bob';

      const proteusSession = await Proteus.session.Session.init_from_prekey(alice, bobPreKeyBundle);
      await store.create_session(sessionId, proteusSession);

      const serialisedSession = await store.read(store.TABLE.SESSIONS, sessionId);
      expect(serialisedSession.created).toEqual(jasmine.any(Number));
      expect(serialisedSession.version).toEqual(cryptobox.Cryptobox.prototype.VERSION);

      const loadedSession = await store.read_session(alice, sessionId);
      expect(loadedSession.session_tag).toEqual(proteusSession.session_tag);

      done();
    });
  });
});
