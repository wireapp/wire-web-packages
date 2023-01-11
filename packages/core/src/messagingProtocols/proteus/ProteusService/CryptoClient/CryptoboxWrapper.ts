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

import {Cryptobox} from '@wireapp/cryptobox';

import {CryptoClient, LAST_PREKEY_ID} from './CryptoClient.types';

export class CryptoboxWrapper implements CryptoClient {
  constructor(private readonly cryptobox: Cryptobox) {}

  async encrypt(sessions: string[], plainText: Uint8Array) {
    const encryptedPayloads: [string, Uint8Array][] = [];
    for (const sessionId of sessions) {
      const encrypted = await this.cryptobox.encrypt(sessionId, plainText);
      encryptedPayloads.push([sessionId, new Uint8Array(encrypted)]);
    }
    return new Map(encryptedPayloads);
  }

  decrypt(sessionId: string, message: Uint8Array) {
    return this.cryptobox.decrypt(sessionId, message.buffer);
  }

  async init() {
    await this.cryptobox.load();
  }

  async create(_nbPrekeys: number, entropy?: Uint8Array) {
    const initialPrekeys = await this.cryptobox.create(entropy);
    const prekeys = initialPrekeys
      .map(preKey => {
        const preKeyJson = this.cryptobox.serialize_prekey(preKey);
        if (preKeyJson.id !== LAST_PREKEY_ID) {
          return preKeyJson;
        }
        return {id: -1, key: ''};
      })
      .filter(serializedPreKey => serializedPreKey.key);

    return {
      prekeys,
      lastPrekey: this.cryptobox.serialize_prekey(this.cryptobox.lastResortPreKey!),
    };
  }

  async getFingerprint() {
    return this.cryptobox.getIdentity().public_key.fingerprint();
  }

  async getRemoteFingerprint(sessionId: string) {
    const session = await this.cryptobox.session_load(sessionId);
    return session.fingerprint_remote();
  }

  sessionFromMessage(sessionId: string, message: Uint8Array) {
    return this.decrypt(sessionId, message);
  }

  async sessionFromPrekey(sessionId: string, prekey: Uint8Array) {
    return void (await this.cryptobox.session_from_prekey(sessionId, prekey.buffer));
  }

  async sessionExists(sessionId: string) {
    try {
      return !!(await this.cryptobox.session_load(sessionId));
    } catch {
      return false;
    }
  }

  async saveSession(_sessionId: string) {
    //no need to saveSession with cryptobox
  }

  async deleteSession(sessionId: string) {
    return void (await this.cryptobox.session_delete(sessionId));
  }

  async newPrekey(id: number) {
    // no need to generate prekey for cryptobox as they are generate internally
    return {id, key: ''};
  }

  async debugBreakSession(sessionId: string) {
    const session = await this.cryptobox.session_load(sessionId);
    session.session.session_states = {};

    this.cryptobox['cachedSessions'].set(sessionId, session);
  }

  addNewPrekeysListener(onNewPrekeys: (prekeys: PreKey[]) => void) {
    this.cryptobox.on(Cryptobox.TOPIC.NEW_PREKEYS, prekeys => {
      const serializedPreKeys = prekeys.map(prekey => this.cryptobox.serialize_prekey(prekey));
      onNewPrekeys(serializedPreKeys);
    });
  }

  async migrateToCoreCrypto(_dbName: string) {
    // No migration needed for cryptobox
  }

  get isCoreCrypto() {
    return false;
  }
}
