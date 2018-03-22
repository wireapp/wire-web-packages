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

import APIClient = require('@wireapp/api-client');
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine/index';
import {Cryptobox, store as CryptoboxStore} from '@wireapp/cryptobox';
import {Decoder, Encoder} from 'bazinga64';
import {RegisteredClient} from '@wireapp/api-client/dist/commonjs/client/index';
import {UserPreKeyBundleMap} from '@wireapp/api-client/dist/commonjs/user/index';
import * as ProteusKeys from '@wireapp/proteus/dist/keys/root';
import {PreKey as SerializedPreKey} from '@wireapp/api-client/dist/commonjs/auth/index';
import CryptographyDatabaseRepository from './CryptographyDatabaseRepository';
import {SessionPayloadBundle} from '../cryptography/root';
import {ClientService} from '../client/root';
import {OTRRecipients} from '@wireapp/api-client/dist/commonjs/conversation/index';

export interface MetaClient extends RegisteredClient {
  meta: {
    primary_key: string;
    is_verified?: boolean;
  };
}

export default class CryptographyService {
  public cryptobox: Cryptobox;
  private database: CryptographyDatabaseRepository;

  constructor(private apiClient: APIClient, private storeEngine: CRUDEngine, private clientService: ClientService) {
    this.cryptobox = new Cryptobox(storeEngine);
    this.database = new CryptographyDatabaseRepository(this.storeEngine);
  }

  public static constructSessionId(userId: string, clientId: string): string {
    return `${userId}@${clientId}`;
  }

  public async createCryptobox(): Promise<Array<SerializedPreKey>> {
    const initialPreKeys: Array<ProteusKeys.PreKey> = await this.cryptobox.create();

    return initialPreKeys
      .map(preKey => {
        const preKeyJson: SerializedPreKey = this.cryptobox.serialize_prekey(preKey);
        if (preKeyJson.id !== ProteusKeys.PreKey.MAX_PREKEY_ID) {
          return preKeyJson;
        }
        return {id: -1, key: ''};
      })
      .filter(serializedPreKey => serializedPreKey.key);
  }

  public decrypt(sessionId: string, encodedCiphertext: string): Promise<Uint8Array> {
    const messageBytes: Uint8Array = Decoder.fromBase64(encodedCiphertext).asBytes;
    return this.cryptobox.decrypt(sessionId, messageBytes.buffer);
  }

  private static dismantleSessionId(sessionId: string): Array<string> {
    return sessionId.split('@');
  }

  public async encrypt(plainText: Uint8Array, preKeyBundles: UserPreKeyBundleMap): Promise<OTRRecipients> {
    const recipients: OTRRecipients = {};
    const encryptions: Array<Promise<SessionPayloadBundle>> = [];

    for (const userId in preKeyBundles) {
      recipients[userId] = {};

      for (const clientId in preKeyBundles[userId]) {
        const preKeyPayload: SerializedPreKey = preKeyBundles[userId][clientId];
        const preKey: string = preKeyPayload.key;
        const sessionId: string = CryptographyService.constructSessionId(userId, clientId);
        encryptions.push(this.encryptPayloadForSession(sessionId, plainText, preKey));
      }
    }

    const payloads: Array<SessionPayloadBundle> = await Promise.all(encryptions);

    if (payloads) {
      payloads.forEach((payload: SessionPayloadBundle) => {
        const sessionId: string = payload.sessionId;
        const encrypted: string = payload.encryptedPayload;
        const [userId, clientId] = CryptographyService.dismantleSessionId(sessionId);
        recipients[userId][clientId] = encrypted;
      });
    }

    return recipients;
  }

  private async encryptPayloadForSession(
    sessionId: string,
    plainText: Uint8Array,
    base64EncodedPreKey: string
  ): Promise<SessionPayloadBundle> {
    let encryptedPayload;

    try {
      const decodedPreKeyBundle: Uint8Array = Decoder.fromBase64(base64EncodedPreKey).asBytes;
      const payloadAsBuffer: ArrayBuffer = await this.cryptobox.encrypt(
        sessionId,
        plainText,
        decodedPreKeyBundle.buffer
      );
      encryptedPayload = Encoder.toBase64(payloadAsBuffer).asString;
    } catch (error) {
      encryptedPayload = '💣';
    }

    return {sessionId, encryptedPayload};
  }

  public async loadLocalIdentityClient(): Promise<RegisteredClient> {
    const initialPreKeys: Array<ProteusKeys.PreKey> = await this.cryptobox.load();
    return this.clientService.getLocalIdentityClient();
  }

  public deleteCryptographyStores(): Promise<boolean[]> {
    return this.database.deleteStores();
  }
}
