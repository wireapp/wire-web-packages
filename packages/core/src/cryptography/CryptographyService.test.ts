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

import * as crypto from 'crypto';
import {promisify} from 'util';

import {APIClient} from '@wireapp/api-client';
import {Cryptobox} from '@wireapp/cryptobox';
import * as Proteus from '@wireapp/proteus';
import {CRUDEngine, MemoryEngine} from '@wireapp/store-engine';

import {decryptAsset, encryptAsset} from './AssetCryptography';
import {CryptographyService} from './CryptographyService';

async function createEngine(storeName: string): Promise<CRUDEngine> {
  const engine = new MemoryEngine();
  await engine.init(storeName);
  return engine;
}

describe('CryptographyService', () => {
  let cryptographyService: CryptographyService;
  let bob: Cryptobox;

  beforeAll(async () => {
    await Proteus.init();
  });

  beforeEach(async () => {
    cryptographyService = new CryptographyService(new APIClient(), await createEngine('wire'), {
      nbPrekeys: 1,
      useQualifiedIds: false,
    });
    bob = new Cryptobox(await createEngine('wire'));
    await bob.create();
  });

  describe('"constructor"', () => {
    it('creates an instance.', () => {
      expect(cryptographyService).toBeDefined();
    });
  });

  describe('constructSessionId & parseSessionId', () => {
    it('constructs a Session ID by a given User ID and Client ID.', () => {
      const clientId = '1ceb9063fced26d3';
      const userId = 'afbb5d60-1187-4385-9c29-7361dea79647';
      const actual = cryptographyService.constructSessionId(userId, clientId);
      expect(actual).toContain(clientId);
      expect(actual).toContain(userId);

      const parsedSessionId = cryptographyService.parseSessionId(actual);
      expect(parsedSessionId).toEqual({
        userId,
        clientId,
        domain: undefined,
      });
    });

    it('constructs a Session ID by a given User ID and Client ID and domain.', async () => {
      const cryptographyService = new CryptographyService(new APIClient(), await createEngine('wire'), {
        useQualifiedIds: true,
        nbPrekeys: 1,
      });
      const clientId = '1ceb9063fced26d3';
      const userId = 'afbb5d60-1187-4385-9c29-7361dea79647';
      const domain = 'test.wire.link';
      const actual = cryptographyService.constructSessionId(userId, clientId, domain);
      expect(actual).toContain(clientId);
      expect(actual).toContain(userId);
      expect(actual).toContain(domain);

      const parsedSessionId = cryptographyService.parseSessionId(actual);
      expect(parsedSessionId).toEqual({
        userId,
        clientId,
        domain,
      });
    });

    it('constructs a qualified Session ID by a given qualified User ID and Client ID.', async () => {
      const cryptographyService = new CryptographyService(new APIClient(), await createEngine('wire'), {
        useQualifiedIds: true,
        nbPrekeys: 1,
      });
      const clientId = '1ceb9063fced26d3';
      const userId = 'afbb5d60-1187-4385-9c29-7361dea79647';
      const domain = 'test.wire.link';
      const actual = cryptographyService.constructSessionId({id: userId, domain}, clientId);
      expect(actual).toContain(clientId);
      expect(actual).toContain(userId);
      expect(actual).toContain(domain);

      const parsedSessionId = cryptographyService.parseSessionId(actual);
      expect(parsedSessionId).toEqual({
        userId,
        clientId,
        domain,
      });
    });

    it('fails to parse wrongly formatted session Id', () => {
      expect(() => {
        cryptographyService.parseSessionId('jfkdsmqfd');
      }).toThrow(Error);
    });
  });

  describe('"encryptAsset"', () => {
    it('encrypts and decrypts ArrayBuffer', async () => {
      const bytes = new Uint8Array(16);
      await promisify(crypto.randomFill)(bytes);
      const byteBuffer = Buffer.from(bytes);

      const encryptedAsset = await encryptAsset({plainText: byteBuffer});
      const decryptedBuffer = await decryptAsset(encryptedAsset);

      expect(decryptedBuffer).toEqual(byteBuffer);
    });
  });
});
