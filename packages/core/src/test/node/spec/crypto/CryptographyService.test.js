/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
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

const bazinga64 = require('bazinga64');
const cryptobox = require('wire-webapp-cryptobox');
const Proteus = require('wire-webapp-proteus');
const {crypto} = require('@wireapp/core');
const {MemoryEngine} = require('@wireapp/store-engine').StoreEngine;

let cryptographyService;
let aliceLastResortPreKey;
let bob;

describe('CryptographyService', () => {
  beforeEach((done) => {
    cryptographyService = new crypto.CryptographyService({store: new MemoryEngine('alice')});
    cryptographyService.cryptobox.create()
      .then((preKeys) => {
        aliceLastResortPreKey = preKeys.filter((preKey) => (preKey.key_id === Proteus.keys.PreKey.MAX_PREKEY_ID))[0];
        const storageEngine = new MemoryEngine('bob');
        const cryptoboxStore = new cryptobox.store.CryptoboxCRUDStore(storageEngine);
        bob = new cryptobox.Cryptobox(cryptoboxStore);
        return bob.create();
      })
      .then((done));
  });
  
  describe('"constructor"', () => {
    it('creates an instance.', () => {
      expect(cryptographyService.cryptobox.identity.public_key.fingerprint()).toBeDefined();
      expect(cryptographyService).toBeDefined();
    });
  });
  
  describe('"constructSessionId"', () => {
    it('constructs a Session ID by a given User ID and Client ID.', () => {
      const clientId = '1ceb9063fced26d3';
      const userId = 'afbb5d60-1187-4385-9c29-7361dea79647';
      const actual = cryptographyService.constructSessionId(userId, clientId);
      expect(actual).toContain(clientId);
      expect(actual).toContain(userId);
    });
  });
  
  describe('"decrypt"', () => {
    it('creates an instance', (done) => {
      const alicePublicKey = cryptographyService.cryptobox.identity.public_key;
      const publicPreKeyBundle = Proteus.keys.PreKeyBundle.new(alicePublicKey, aliceLastResortPreKey);
      const text = 'Hello Alice!';
      bob.encrypt('alice-user-id@alice-client-id', text, publicPreKeyBundle.serialise())
        .then((encryptedPreKeyMessage) => {
          const encodedPreKeyMessage = bazinga64.Encoder.toBase64(encryptedPreKeyMessage).asString;
          return cryptographyService.decrypt('bob-user-id@bob-client-id', encodedPreKeyMessage);
        })
        .then((decodedMessageBuffer) => {
          const plaintext = Buffer.from(decodedMessageBuffer).toString('utf8');
          expect(plaintext).toBe(text);
          done();
        })
        .catch(done.fail);
    });
  });
});
