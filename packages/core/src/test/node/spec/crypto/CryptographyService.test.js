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

const {crypto} = require('@wireapp/core');
const {MemoryEngine} = require('@wireapp/store-engine').StoreEngine;

let cryptographyService;

describe('CryptographyService', () => {
  beforeEach((done) => {
    const config = {
      store: new MemoryEngine('temporary'),
    };
    cryptographyService = new crypto.CryptographyService(config);
    cryptographyService.cryptobox.create().then(done);
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
      const from = 'afbb5d60-1187-4385-9c29-7361dea79647';
      const sender = '85f9cdd3192e0159';
      const text = 'owABAaEAWCCBbsXWbIFm08+6F8NNbcmo3/t0uNDPMPNNii9OFDj/jQJYuwKkAAABoQBYIBv5a2HgvG7AZCWCWklQd3KpIngF47fTc9AhwUOw3NqIAqEAoQBYIPEwuJe1+E6KjebmEAE6H0Bnc22FpZURY0qoKKM1+AqBA6UAUHAVdJh1DZ17vRlXKSsN0t8BAAIAA6EAWCB291yR0iUw+G42r3+OcVvilfcazK6DMlnRr1D6KidzpgRYK/qPH+i4bYP/rthWxO3bIn6q+ZC90OhN+k+NioF6b/TT9h+kp1tfFjRX/Ho=';
      const sessionId = cryptographyService.constructSessionId(from, sender);
      cryptographyService.decrypt(sessionId, text)
        .then((decryptedMessage) => {
          expect(decryptedMessage).toBeDefined();
        })
        .catch(done.fail);
    });
  });
});
