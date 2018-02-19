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

describe('cryptobox.Cryptobox', () => {
  const cryptobox = typeof window === 'object' ? window.cryptobox : require('@wireapp/cryptobox');
  const Proteus = typeof window === 'object' ? window.Proteus : require('@wireapp/proteus');
  const {MemoryEngine} = require('@wireapp/store-engine').StoreEngine;

  beforeEach(() => {
    store = new cryptobox.store.Cache();
  });

  async function generatePreKeyBundle() {
    const identity = await Proteus.keys.IdentityKeyPair.new();
    const preKey = await Proteus.keys.PreKey.new(0);
    return Proteus.keys.PreKeyBundle.new(identity.public_key, preKey);
  }

  describe('"encrypt"', () => {
    it('encrypts messages for multiple recipients / clients', async done => {
      const alice = new cryptobox.Cryptobox(new cryptobox.store.CryptoboxCRUDStore(new MemoryEngine('alice')));
      const text = 'Hello, World!';

      expect(alice.cachedPreKeys.length).toBe(0);
      await alice.create();
      expect(alice.cachedPreKeys.length).toBe(1);

      const bobBundle = await generatePreKeyBundle();
      const eveBundle = await generatePreKeyBundle();
      const malloryBundle = await generatePreKeyBundle();

      Promise.all([
        alice.encrypt('session-with-bob', text, bobBundle.serialise()),
        alice.encrypt('session-with-eve', text, eveBundle.serialise()),
        alice.encrypt('session-with-mallory', text, malloryBundle.serialise()),
      ])
        .then(encryptedPayloads => {
          expect(encryptedPayloads.length).toBe(3);
          done();
        })
        .catch(done.fail);
    });
  });
});
