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
import {Encoder} from 'bazinga64';

import {CoreCrypto} from '@wireapp/core-crypto';

import {CryptoClient, LAST_PREKEY_ID} from './CryptoClient.types';

export class CoreCryptoWrapper implements CryptoClient {
  constructor(private readonly coreCrypto: CoreCrypto) {}

  encrypt(sessions: string[], plainText: Uint8Array) {
    return this.coreCrypto.proteusEncryptBatched(sessions, plainText);
  }

  decrypt(sessionId: string, message: Uint8Array) {
    return this.coreCrypto.proteusDecrypt(sessionId, message);
  }

  init() {
    return this.coreCrypto.proteusInit();
  }

  async create(nbPrekeys: number, entropy?: Uint8Array) {
    if (entropy) {
      await this.coreCrypto.reseedRng(entropy);
    }
    const prekeys: PreKey[] = [];
    for (let id = 0; id < nbPrekeys; id++) {
      prekeys.push(await this.newPrekey(id));
    }
    return {
      prekeys,
      lastPrekey: await this.newPrekey(LAST_PREKEY_ID),
    };
  }

  getFingerprint() {
    return this.coreCrypto.proteusFingerprint();
  }

  getRemoteFingerprint(sessionId: string) {
    return this.coreCrypto.proteusFingerprintRemote(sessionId);
  }

  sessionFromMessage(sessionId: string, message: Uint8Array) {
    return this.coreCrypto.proteusSessionFromMessage(sessionId, message);
  }

  sessionFromPrekey(sessionId: string, prekey: Uint8Array) {
    return this.coreCrypto.proteusSessionFromPrekey(sessionId, prekey);
  }

  sessionExists(sessionId: string) {
    return this.coreCrypto.proteusSessionExists(sessionId);
  }

  saveSession(sessionId: string) {
    return this.coreCrypto.proteusSessionSave(sessionId);
  }

  deleteSession(sessionId: string) {
    return this.coreCrypto.proteusSessionDelete(sessionId);
  }

  async newPrekey(id: number) {
    // no need to generate prekey for cryptobox as they are generate internally
    const key = await this.coreCrypto.proteusNewPrekey(id);
    return {id, key: Encoder.toBase64(key).asString};
  }

  async debugBreakSession(_sessionId: string) {
    // TODO
  }

  addNewPrekeysListener() {
    // no need to implement this for core crypto as prekeys are manually generated
  }

  async migrateToCoreCrypto(dbName: string) {
    return this.coreCrypto.proteusCryptoboxMigrate(dbName);
  }

  get isCoreCrypto() {
    return true;
  }
}
