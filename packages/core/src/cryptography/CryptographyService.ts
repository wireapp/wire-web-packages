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

import {PreKey} from '@wireapp/api-client/lib/auth/';
import {RegisteredClient} from '@wireapp/api-client/lib/client/';
import {OTRClientMap, OTRRecipients} from '@wireapp/api-client/lib/conversation/';
import {QualifiedId} from '@wireapp/api-client/lib/user/';
import {Decoder, Encoder} from 'bazinga64';
import logdown from 'logdown';

import {APIClient} from '@wireapp/api-client';
import {Cryptobox, CryptoboxSession} from '@wireapp/cryptobox';
import {keys as ProteusKeys} from '@wireapp/proteus';
import {CRUDEngine} from '@wireapp/store-engine';

import {CryptographyDatabaseRepository} from './CryptographyDatabaseRepository';

export type SessionId = {
  userId: string;
  clientId: string;
  domain?: string;
};
export interface MetaClient extends RegisteredClient {
  meta: {
    is_verified?: boolean;
    primary_key: string;
  };
}

export class CryptographyService {
  private readonly logger: logdown.Logger;

  public cryptobox: Cryptobox;
  private readonly database: CryptographyDatabaseRepository;

  constructor(
    readonly apiClient: APIClient,
    private readonly storeEngine: CRUDEngine,
    private readonly config: {useQualifiedIds: boolean; nbPrekeys: number},
  ) {
    this.cryptobox = new Cryptobox(this.storeEngine, config.nbPrekeys);
    this.database = new CryptographyDatabaseRepository(this.storeEngine);
    this.logger = logdown('@wireapp/core/CryptographyService', {
      logger: console,
      markdown: false,
    });
  }

  public constructSessionId(userId: string | QualifiedId, clientId: string, domain?: string): string {
    const {id, domain: baseDomain} = typeof userId === 'string' ? {id: userId, domain} : userId;
    const baseId = `${id}@${clientId}`;
    return baseDomain && this.config.useQualifiedIds ? `${baseDomain}@${baseId}` : baseId;
  }

  private isSessionId(object: any): object is SessionId {
    return object.userId && object.clientId;
  }

  /**
   * Splits a sessionId into userId, clientId & domain (if any).
   */
  public parseSessionId(sessionId: string): SessionId {
    // see https://regex101.com/r/c8FtCw/1
    const regex = /((?<domain>.+)@)?(?<userId>.+)@(?<clientId>.+)$/g;
    const match = regex.exec(sessionId);
    if (!match || !this.isSessionId(match.groups)) {
      throw new Error(`given session id "${sessionId}" has wrong format`);
    }
    return match.groups;
  }

  public static convertArrayRecipientsToBase64(recipients: OTRRecipients<Uint8Array>): OTRRecipients<string> {
    return Object.fromEntries(
      Object.entries(recipients).map(([userId, otrClientMap]) => {
        const otrClientMapWithBase64: OTRClientMap<string> = Object.fromEntries(
          Object.entries(otrClientMap).map(([clientId, payload]) => {
            return [clientId, Encoder.toBase64(payload).asString];
          }),
        );
        return [userId, otrClientMapWithBase64];
      }),
    );
  }

  public setCryptoboxHooks({
    onNewPrekeys,
    onNewSession,
  }: {
    onNewPrekeys?: (prekeys: {id: number; key: string}[]) => void;
    onNewSession?: (sessionId: SessionId) => void;
  }) {
    if (onNewPrekeys) {
      this.cryptobox.on(Cryptobox.TOPIC.NEW_PREKEYS, prekeys => {
        const serializedPreKeys = prekeys.map(prekey => this.cryptobox.serialize_prekey(prekey));
        onNewPrekeys(serializedPreKeys);
      });
    }
    if (onNewSession) {
      this.cryptobox.on(Cryptobox.TOPIC.NEW_SESSION, sessionId => onNewSession(this.parseSessionId(sessionId)));
    }
  }

  public static convertBase64RecipientsToArray(recipients: OTRRecipients<string>): OTRRecipients<Uint8Array> {
    return Object.fromEntries(
      Object.entries(recipients).map(([userId, otrClientMap]) => {
        const otrClientMapWithUint8Array: OTRClientMap<Uint8Array> = Object.fromEntries(
          Object.entries(otrClientMap).map(([clientId, payload]) => {
            return [clientId, Decoder.fromBase64(payload).asBytes];
          }),
        );
        return [userId, otrClientMapWithUint8Array];
      }),
    );
  }

  public async createCryptobox(entropyData?: Uint8Array): Promise<PreKey[]> {
    const initialPreKeys = await this.cryptobox.create(entropyData);

    return initialPreKeys
      .map(preKey => {
        const preKeyJson = this.cryptobox.serialize_prekey(preKey);
        if (preKeyJson.id !== ProteusKeys.PreKey.MAX_PREKEY_ID) {
          return preKeyJson;
        }
        return {id: -1, key: ''};
      })
      .filter(serializedPreKey => serializedPreKey.key);
  }

  /**
   * Get the fingerprint of the local client.
   */
  public getLocalFingerprint(): string {
    return this.cryptobox.getIdentity().public_key.fingerprint();
  }

  /**
   * Get the fingerprint of a remote client
   * @param userId ID of user
   * @param clientId ID of client
   * @param prekey A prekey can be given to create a session if it doesn't already exist.
   *   If not provided and the session doesn't exists it will fetch a new prekey from the backend
   */
  public async getRemoteFingerprint(userId: QualifiedId, clientId: string, prekey?: PreKey): Promise<string> {
    const session = await this.getOrCreateSession(userId, clientId, prekey);
    return session.fingerprint_remote();
  }

  private async getOrCreateSession(
    userId: QualifiedId,
    clientId: string,
    initialPrekey?: PreKey,
  ): Promise<CryptoboxSession> {
    const sessionId = this.constructSessionId(userId, clientId);
    try {
      return await this.cryptobox.session_load(sessionId);
    } catch (error) {
      const prekey = initialPrekey ?? (await this.getUserPrekey(userId, clientId)).prekey;
      const prekeyBuffer = Decoder.fromBase64(prekey.key).asBytes;
      return this.cryptobox.session_from_prekey(sessionId, prekeyBuffer.buffer);
    }
  }

  private getUserPrekey(userId: QualifiedId, clientId: string) {
    return this.apiClient.api.user.getClientPreKey(userId, clientId);
  }

  public deleteCryptographyStores(): Promise<boolean[]> {
    return this.database.deleteStores();
  }

  public async resetSession(sessionId: string): Promise<void> {
    await this.cryptobox.session_delete(sessionId);
    this.logger.log(`Deleted session ID "${sessionId}".`);
  }
}
