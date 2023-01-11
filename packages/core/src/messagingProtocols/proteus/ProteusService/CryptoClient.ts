/*
 * Wire
 * Copyright (C) 2023 Wire Swiss GmbH
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

import {PreKey} from '@wireapp/api-client/lib/auth';

import {CoreCrypto} from '@wireapp/core-crypto';
import {Cryptobox} from '@wireapp/cryptobox';

import {LAST_PREKEY_ID} from './PrekeysGenerator';

export type CryptoClient = ReturnType<typeof wrapCryptoClient>;

export function wrapCryptoClient(cryptoClient: CoreCrypto | Cryptobox) {
  const isCoreCrypto = cryptoClient instanceof CoreCrypto;
  return {
    async encrypt(sessions: string[], plainText: Uint8Array) {
      if (isCoreCrypto) {
        return cryptoClient.proteusEncryptBatched(sessions, plainText);
      }
      const encryptedPayloads: [string, Uint8Array][] = [];
      for (const sessionId of sessions) {
        const encrypted = await cryptoClient.encrypt(sessionId, plainText);
        encryptedPayloads.push([sessionId, new Uint8Array(encrypted)]);
      }
      return new Map(encryptedPayloads);
    },

    decrypt(sessionId: string, message: Uint8Array) {
      return isCoreCrypto
        ? cryptoClient.proteusDecrypt(sessionId, message)
        : cryptoClient.decrypt(sessionId, message.buffer);
    },

    init() {
      return isCoreCrypto ? cryptoClient.proteusInit() : cryptoClient.load();
    },

    async create(entropy?: Uint8Array) {
      if (isCoreCrypto) {
        if (entropy) {
          await cryptoClient.reseedRng(entropy);
        }
        return undefined;
      }
      const initialPrekeys = await cryptoClient.create(entropy);
      const prekeys = initialPrekeys
        .map(preKey => {
          const preKeyJson = cryptoClient.serialize_prekey(preKey);
          if (preKeyJson.id !== LAST_PREKEY_ID) {
            return preKeyJson;
          }
          return {id: -1, key: ''};
        })
        .filter(serializedPreKey => serializedPreKey.key);

      return {
        prekeys,
        lastPrekey: cryptoClient.serialize_prekey(cryptoClient.lastResortPreKey!),
      };
    },

    async getFingerprint() {
      return isCoreCrypto
        ? await cryptoClient.proteusFingerprint()
        : cryptoClient.getIdentity().public_key.fingerprint();
    },

    async getRemoteFingerprint(sessionId: string) {
      if (isCoreCrypto) {
        return cryptoClient.proteusFingerprintRemote(sessionId);
      }
      const session = await cryptoClient.session_load(sessionId);
      return session.fingerprint_remote();
    },

    async sessionFromMessage(sessionId: string, message: Uint8Array) {
      return isCoreCrypto
        ? cryptoClient.proteusSessionFromMessage(sessionId, message)
        : this.decrypt(sessionId, message);
    },

    sessionFromPrekey(sessionId: string, prekey: Uint8Array) {
      return isCoreCrypto
        ? cryptoClient.proteusSessionFromPrekey(sessionId, prekey)
        : cryptoClient.session_from_prekey(sessionId, prekey.buffer);
    },

    async sessionExists(sessionId: string) {
      if (isCoreCrypto) {
        return cryptoClient.proteusSessionExists(sessionId);
      }
      try {
        return !!(await cryptoClient.session_load(sessionId));
      } catch {
        return false;
      }
    },

    saveSession(sessionId: string) {
      return isCoreCrypto && cryptoClient.proteusSessionSave(sessionId);
    },
    deleteSession(sessionId: string) {
      return isCoreCrypto ? cryptoClient.proteusSessionDelete(sessionId) : cryptoClient.session_delete(sessionId);
    },

    newPrekey(id: number) {
      // no need to generate prekey for cryptobox as they are generate internally
      return isCoreCrypto ? cryptoClient.proteusNewPrekey(id) : new Uint8Array();
    },

    addNewPrekeysListener(onNewPrekeys: (prekeys: PreKey[]) => void) {
      if (!isCoreCrypto) {
        cryptoClient.on(Cryptobox.TOPIC.NEW_PREKEYS, prekeys => {
          const serializedPreKeys = prekeys.map(prekey => cryptoClient.serialize_prekey(prekey));
          onNewPrekeys(serializedPreKeys);
        });
      }
    },
  };
}
