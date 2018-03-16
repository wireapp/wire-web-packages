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

import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine/index';
import {Cryptobox, store} from '@wireapp/cryptobox';
import {Decoder, Encoder} from 'bazinga64';
import {RegisteredClient} from '@wireapp/api-client/dist/commonjs/client/index';
import {UserPreKeyBundleMap} from '@wireapp/api-client/dist/commonjs/user/index';
import * as ProteusKeys from '@wireapp/proteus/dist/keys/root';
import * as auth from '@wireapp/api-client/dist/commonjs/auth/index';
import {SessionPayloadBundle} from '../crypto/root';
import {OTRRecipients} from '@wireapp/api-client/dist/commonjs/conversation/index';
import {EncryptedAsset} from '../crypto/root';
import * as crypto from 'crypto';

export default class CryptographyService {
  public static STORES = {
    CLIENTS: 'clients',
  };
  public cryptobox: Cryptobox;

  constructor(private storeEngine: CRUDEngine) {
    this.cryptobox = new Cryptobox(storeEngine);
  }

  public createCryptobox(): Promise<Array<auth.PreKey>> {
    return this.cryptobox.create().then((initialPreKeys: Array<ProteusKeys.PreKey>) => {
      return initialPreKeys
        .map(preKey => {
          const preKeyJson: auth.PreKey = this.cryptobox.serialize_prekey(preKey);
          if (preKeyJson.id !== ProteusKeys.PreKey.MAX_PREKEY_ID) {
            return preKeyJson;
          }
          return {id: -1, key: ''};
        })
        .filter(serializedPreKey => serializedPreKey.key);
    });
  }

  public constructSessionId(userId: string, clientId: string): string {
    return `${userId}@${clientId}`;
  }

  public decrypt(sessionId: string, encodedCiphertext: string): Promise<Uint8Array> {
    const messageBytes: Uint8Array = Decoder.fromBase64(encodedCiphertext).asBytes;
    return this.cryptobox.decrypt(sessionId, messageBytes.buffer);
  }

  public decryptAsset({cipherText, keyBytes, computedSha256}: EncryptedAsset): Buffer {
    const referenceSha256 = crypto
      .createHash('SHA256')
      .update(cipherText)
      .digest();

    if (!CryptographyService.equalHashes(referenceSha256, computedSha256)) {
      throw new Error('Computed SHA256 hash is not equal to the provided hash.');
    }

    const initializationVector = cipherText.slice(0, 16);
    const assetCipherText = cipherText.slice(16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBytes, initializationVector);
    const decipherUpdated = decipher.update(assetCipherText);
    const decipherFinal = decipher.final();

    return Buffer.concat([decipherUpdated, decipherFinal]);
  }

  private dismantleSessionId(sessionId: string): Array<string> {
    return sessionId.split('@');
  }

  public encrypt(plainText: Uint8Array, preKeyBundles: UserPreKeyBundleMap): Promise<OTRRecipients> {
    const recipients: OTRRecipients = {};
    const encryptions: Array<Promise<SessionPayloadBundle>> = [];

    for (const userId in preKeyBundles) {
      recipients[userId] = {};
      for (const clientId in preKeyBundles[userId]) {
        const preKeyPayload: auth.PreKey = preKeyBundles[userId][clientId];
        const preKey: string = preKeyPayload.key;
        const sessionId: string = this.constructSessionId(userId, clientId);
        encryptions.push(this.encryptPayloadForSession(sessionId, plainText, preKey));
      }
    }

    return Promise.all(encryptions).then((payloads: Array<SessionPayloadBundle>) => {
      const recipients: OTRRecipients = {};

      if (payloads) {
        payloads.forEach((payload: SessionPayloadBundle) => {
          const sessionId: string = payload.sessionId;
          const encrypted: string = payload.encryptedPayload;
          const [userId, clientId] = this.dismantleSessionId(sessionId);
          recipients[userId] = recipients[userId] || {};
          recipients[userId][clientId] = encrypted;
        });
      }

      return recipients;
    });
  }

  public encryptAsset(plainText: Buffer): EncryptedAsset {
    const initializationVector = crypto.randomBytes(16);
    const keyBytes = crypto.randomBytes(32);

    const cipher = crypto.createCipheriv('aes-256-cbc', keyBytes, initializationVector);
    const cipherUpdated = cipher.update(plainText);
    const cipherFinal = cipher.final();

    const cipherText = Buffer.concat([cipherUpdated, cipherFinal]);

    const ivCipherText = new Uint8Array(initializationVector.byteLength + cipherText.byteLength);
    ivCipherText.set(initializationVector, 0);
    ivCipherText.set(cipherText, initializationVector.byteLength);

    const computedSha256 = crypto
      .createHash('SHA256')
      .update(new Buffer(ivCipherText.buffer))
      .digest();

    return {
      cipherText: new Buffer(ivCipherText.buffer),
      keyBytes,
      computedSha256,
    };
  }

  private encryptPayloadForSession(
    sessionId: string,
    plainText: Uint8Array,
    base64EncodedPreKey: string
  ): Promise<SessionPayloadBundle> {
    const decodedPreKeyBundle: Uint8Array = Decoder.fromBase64(base64EncodedPreKey).asBytes;
    return this.cryptobox
      .encrypt(sessionId, plainText, decodedPreKeyBundle.buffer)
      .then((encryptedPayload: ArrayBuffer) => Encoder.toBase64(encryptedPayload).asString)
      .catch((error: Error) => '💣')
      .then((encryptedPayload: string) => ({sessionId, encryptedPayload}));
  }

  private static equalHashes(bufferA: Buffer, bufferB: Buffer): boolean {
    const arrayA = new Uint32Array(bufferA);
    const arrayB = new Uint32Array(bufferB);
    return arrayA.length === arrayB.length && arrayA.every((value, index) => value === arrayB[index]);
  }

  public deleteClient(): Promise<string> {
    return this.storeEngine.delete(CryptographyService.STORES.CLIENTS, store.CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY);
  }

  public loadClient(): Promise<RegisteredClient> {
    return this.cryptobox.load().then((initialPreKeys: Array<ProteusKeys.PreKey>) => {
      return this.storeEngine.read<RegisteredClient>(
        CryptographyService.STORES.CLIENTS,
        store.CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY
      );
    });
  }

  public saveClient(client: RegisteredClient): Promise<string> {
    const clientWithMeta = {
      ...client,
      meta: {primary_key: store.CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY, is_verified: true},
    };
    return this.storeEngine.create(
      CryptographyService.STORES.CLIENTS,
      store.CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY,
      clientWithMeta
    );
  }
}
