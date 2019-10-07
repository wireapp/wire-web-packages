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
import {APIClient} from '@wireapp/api-client';
import {Cryptobox} from '@wireapp/cryptobox';
import * as Proteus from '@wireapp/proteus';
import {CRUDEngine, MemoryEngine} from '@wireapp/store-engine';
import * as bazinga64 from 'bazinga64';
import * as crypto from 'crypto';
import {promisify} from 'util';

import * as CryptographyHelper from '../test/CryptographyHelper';
import {decryptAsset, encryptAsset} from './AssetCryptography.node';
import {CryptographyService} from './CryptographyService';

async function createEngine(storeName: string): Promise<CRUDEngine> {
  const engine = new MemoryEngine();
  await engine.init(storeName);
  return engine;
}

describe('CryptographyService', () => {
  let cryptographyService: CryptographyService;
  let aliceLastResortPreKey: Proteus.keys.PreKey;
  let bob: Cryptobox;

  beforeEach(async () => {
    cryptographyService = new CryptographyService(new APIClient(), await createEngine('wire'));
    const preKeys = await cryptographyService.cryptobox.create();
    aliceLastResortPreKey = preKeys.filter(preKey => preKey.key_id === Proteus.keys.PreKey.MAX_PREKEY_ID)[0];
    bob = new Cryptobox(await createEngine('wire'));
    await bob.create();
  });

  describe('"constructor"', () => {
    it('creates an instance.', () => {
      expect(cryptographyService.cryptobox.identity!.public_key.fingerprint()).toBeDefined();
      expect(cryptographyService).toBeDefined();
    });
  });

  describe('"constructSessionId"', () => {
    it('constructs a Session ID by a given User ID and Client ID.', () => {
      const clientId = '1ceb9063fced26d3';
      const userId = 'afbb5d60-1187-4385-9c29-7361dea79647';
      const actual = CryptographyService.constructSessionId(userId, clientId);
      expect(actual).toContain(clientId);
      expect(actual).toContain(userId);
    });
  });

  describe('"decrypt"', () => {
    it('decrypts a Base64-encoded cipher message.', async () => {
      const alicePublicKey = cryptographyService.cryptobox.identity!.public_key;
      const publicPreKeyBundle = Proteus.keys.PreKeyBundle.new(alicePublicKey, aliceLastResortPreKey);
      const text = 'Hello Alice!';
      const encryptedPreKeyMessage = await bob.encrypt(
        'alice-user-id@alice-client-id',
        text,
        publicPreKeyBundle.serialise(),
      );
      const encodedPreKeyMessage = bazinga64.Encoder.toBase64(encryptedPreKeyMessage).asString;
      const decryptedMessage = await cryptographyService.decrypt('bob-user-id@bob-client-id', encodedPreKeyMessage);
      const plaintext = Buffer.from(decryptedMessage).toString('utf8');
      expect(plaintext).toBe(text);
    });

    it('is resistant to duplicated message errors', async () => {
      const receiver = cryptographyService.cryptobox.identity!;
      const preKey = await cryptographyService.cryptobox.get_prekey();
      const text = 'Hi!';
      const encodedPreKeyMessage = await CryptographyHelper.createEncodedCipherText(receiver, preKey!, text);
      const sessionId = 'alice-to-bob';
      const plaintext = await CryptographyHelper.getPlainText(cryptographyService, encodedPreKeyMessage, sessionId);
      // Testing to decrypt the same message multiple times (to provoke duplicate message errors)
      await CryptographyHelper.getPlainText(cryptographyService, encodedPreKeyMessage, sessionId);
      await CryptographyHelper.getPlainText(cryptographyService, encodedPreKeyMessage, sessionId);
      await CryptographyHelper.getPlainText(cryptographyService, encodedPreKeyMessage, sessionId);
      expect(plaintext).toBe(text);
    });
  });

  describe('"dismantleSessionId"', () => {
    it('gets User ID and Client ID from a Session ID.', () => {
      const clientId = '1ceb9063fced26d3';
      const userId = 'afbb5d60-1187-4385-9c29-7361dea79647';
      const sessionId = CryptographyService.constructSessionId(userId, clientId);
      const [actualUserId, actualClientId] = CryptographyService['dismantleSessionId'](sessionId);
      expect(actualClientId).toBe(clientId);
      expect(actualUserId).toBe(userId);
    });
  });

  describe('"encrypt"', () => {
    it('generates a set of encrypted data based on PreKeys from multiple clients.', async () => {
      const firstUserID = 'bc0c99f1-49a5-4ad2-889a-62885af37088';
      const secondUserID = '2bde49aa-bdb5-458f-98cf-7d3552b10916';

      const firstClientId = '2b83ee08d7ac550d';

      const preKeyBundleMap = {
        [firstUserID]: {
          '5e80ea7886680975': {
            id: 1337,
            key:
              'pQABARn//wKhAFggJ1Fbpg5l6wnzKOJE+vXpRnkqUYhIvVnR5lNXEbO2o/0DoQChAFggHxZvgvtDktY/vqBcpjjo6rQnXvcNQhfwmy8AJQJKlD0E9g==',
          },
          be67218b77d02d30: {
            id: 72,
            key:
              'pQABARn//wKhAFggTWwHUoppQ8aXWhbH95YWnNp6uOYMxo2y4wbarWbF+EEDoQChAFggUiFoPtsiR0WFowIvl0myD+bVnFQJBYarqieI0Gly46QE9g==',
          },
          [firstClientId]: {
            id: 42,
            key:
              'pQABARn//wKhAFggWcbwny0jdqlcnnn0j4QSENIVVq/KgyQ3mmdpunfvGZQDoQChAFggrsQBkQkrVZ8sWhr8wTeaC+dmctuJ3oRqfdHsymTtKmgE9g==',
          },
        },
        [secondUserID]: {
          '5bad8cdeddc5a90f': {
            id: 1,
            key:
              'pQABARn//wKhAFggEYATUNJBQ7E2tfHT7HMLxa4O3Ckd7PciUdyKiGNNWbYDoQChAFggP/s0BHmHQDNwrO4pC1dqdNHsW7bnpmF9mBadrbep4PoE9g==',
          },
          bc78eded90386d20: {
            id: 65535,
            key:
              'pQABARn//wKhAFgg1xOfzMpWmpN2aBGW+0RG23L0I301pncd/HXqUm+pVyoDoQChAFggnl+dmwGW45AArcPutjUkAjYmhIbXBPrqkVrNyg0ZI08E9g==',
          },
        },
      };

      const text = new Uint8Array([72, 101, 108, 108, 111, 33]); // "Hello!"
      const otrBundle = await cryptographyService.encrypt(text, preKeyBundleMap);
      expect(Object.keys(otrBundle).length).toBe(2);
      expect(Object.keys(otrBundle[firstUserID]).length).toBe(3);
      expect(Object.keys(otrBundle[secondUserID]).length).toBe(2);
      expect(otrBundle[firstUserID][firstClientId]).toEqual(jasmine.any(String));
    });
  });

  describe('"encryptAsset"', () => {
    it('encrypts and decrypts ArrayBuffer', async () => {
      const bytes = new Uint8Array(16);
      await promisify(crypto.randomFill)(bytes);
      const byteBuffer = Buffer.from(bytes.buffer);

      const encryptedAsset = await encryptAsset(byteBuffer);
      const decryptedBuffer = await decryptAsset(encryptedAsset);

      expect(decryptedBuffer).toEqual(byteBuffer);
    });
  });

  describe('"encryptPayloadForSession"', () => {
    it('encodes plaintext.', async () => {
      const sessionWithBobId = 'bob-user-id@bob-client-id';
      const text = new Uint8Array([72, 101, 108, 108, 111, 32, 66, 111, 98, 33]); // "Hello Bob!"
      const encodedPreKey =
        'pQABAQACoQBYIHOFFWPnWlr4sulxUWYoP0A6rsJiBO/Ec3Y914t67CIAA6EAoQBYIPFH5CK/a0YwKEx4n/+U/IPRN+mJXVv++MCs5Z4dLmz4BPY=';
      const {sessionId, encryptedPayload} = await cryptographyService['encryptPayloadForSession'](
        sessionWithBobId,
        text,
        encodedPreKey,
      );
      expect(encryptedPayload).not.toBe('💣');
      expect(sessionId).toBe(sessionWithBobId);
    });

    it('encodes invalid text as Bomb Emoji.', async () => {
      const sessionWithBobId = 'bob-user-id@bob-client-id';
      const encodedPreKey =
        'pQABAQACoQBYIHOFFWPnWlr4sulxUWYoP0A6rsJiBO/Ec3Y914t67CIAA6EAoQBYIPFH5CK/a0YwKEx4n/+U/IPRN+mJXVv++MCs5Z4dLmz4BPY=';
      const {sessionId, encryptedPayload} = await cryptographyService['encryptPayloadForSession'](
        sessionWithBobId,
        undefined as any,
        encodedPreKey,
      );
      expect(encryptedPayload).toBe('💣');
      expect(sessionId).toBe(sessionWithBobId);
    });
  });
});
