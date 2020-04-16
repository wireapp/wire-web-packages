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

import {keys as ProteusKeys, session as ProteusSession} from '@wireapp/proteus';
import {CRUDEngine, error as StoreEngineError} from '@wireapp/store-engine';
import {Decoder, Encoder} from 'bazinga64';
import {PersistedRecord, SerialisedRecord} from '../store/';

export enum CRUDStoreKeys {
  LOCAL_IDENTITY = 'local_identity',
}

export enum CrudStoreStores {
  LOCAL_IDENTITY = 'keys',
  PRE_KEYS = 'prekeys',
  SESSIONS = 'sessions',
}

export class CryptoboxCRUDStore implements ProteusSession.PreKeyStore {
  public static readonly KEYS = CRUDStoreKeys;
  public static readonly STORES = CrudStoreStores;

  constructor(private readonly engine: CRUDEngine) {}

  private from_store(record: PersistedRecord): ArrayBuffer {
    return typeof record.serialised === 'string'
      ? Decoder.fromBase64(record.serialised).asBytes.buffer
      : record.serialised;
  }

  private to_store(serialised: ArrayBuffer | string): string {
    return Encoder.toBase64(serialised).asString;
  }

  public async delete_all(): Promise<true> {
    await Promise.resolve();
    await this.engine.deleteAll(CryptoboxCRUDStore.STORES.LOCAL_IDENTITY);
    await this.engine.deleteAll(CryptoboxCRUDStore.STORES.PRE_KEYS);
    await this.engine.deleteAll(CryptoboxCRUDStore.STORES.SESSIONS);
    return true;
  }

  /**
   * Deletes a specified PreKey.
   * @returns Resolves with the "ID" from the record, which has been deleted.
   */
  public async delete_prekey(prekey_id: number): Promise<number> {
    await this.engine.delete(CryptoboxCRUDStore.STORES.PRE_KEYS, prekey_id.toString());
    return prekey_id;
  }

  /**
   * Loads the local identity.
   * @returns Resolves with the "key pair" from the local identity.
   */
  public async load_identity(): Promise<ProteusKeys.IdentityKeyPair | undefined> {
    try {
      const record = await this.engine.read<PersistedRecord>(
        CryptoboxCRUDStore.STORES.LOCAL_IDENTITY,
        CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY,
      );
      const payload = this.from_store(record);
      const identity: ProteusKeys.IdentityKeyPair = ProteusKeys.IdentityKeyPair.deserialise(payload);
      return identity;
    } catch (error) {
      if (error instanceof StoreEngineError.RecordNotFoundError) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Loads and deserializes a specified PreKey.
   * @returns Resolves with the specified "PreKey".
   */
  public async load_prekey(prekey_id: number): Promise<ProteusKeys.PreKey | undefined> {
    try {
      const record = await this.engine.read<PersistedRecord>(CryptoboxCRUDStore.STORES.PRE_KEYS, prekey_id.toString());
      const payload = this.from_store(record);
      return ProteusKeys.PreKey.deserialise(payload);
    } catch (error) {
      if (error instanceof StoreEngineError.RecordNotFoundError) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Loads all available PreKeys.
   */
  public async load_prekeys(): Promise<ProteusKeys.PreKey[]> {
    const records = await this.engine.readAll<PersistedRecord>(CryptoboxCRUDStore.STORES.PRE_KEYS);
    return records.map(record => {
      const payload = this.from_store(record);
      return ProteusKeys.PreKey.deserialise(payload);
    });
  }

  /**
   * Saves the local identity.
   * @returns Resolves with the "fingerprint" from the saved local identity.
   */
  public async save_identity(identity: ProteusKeys.IdentityKeyPair): Promise<ProteusKeys.IdentityKeyPair> {
    const serialised = this.to_store(identity.serialise());
    const payload = new SerialisedRecord(serialised, CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY);
    await this.engine.create(CryptoboxCRUDStore.STORES.LOCAL_IDENTITY, payload.id, payload);
    return identity;
  }

  /**
   * Saves the serialised format of a specified PreKey.
   * @returns Resolves with the "ID" from the saved PreKey record.
   */
  public async save_prekey(pre_key: ProteusKeys.PreKey): Promise<ProteusKeys.PreKey> {
    const serialised = this.to_store(pre_key.serialise());
    const payload = new SerialisedRecord(serialised, pre_key.key_id.toString());
    await this.engine.create(CryptoboxCRUDStore.STORES.PRE_KEYS, payload.id, payload);
    return pre_key;
  }

  /**
   * Saves the serialised formats from a batch of PreKeys.
   */
  public async save_prekeys(pre_keys: ProteusKeys.PreKey[]): Promise<ProteusKeys.PreKey[]> {
    await Promise.all(pre_keys.map(pre_key => this.save_prekey(pre_key)));
    return pre_keys;
  }

  /**
   * Saves a specified session.
   * @returns Resolves with the saved session.
   */
  public async create_session(session_id: string, session: ProteusSession.Session): Promise<ProteusSession.Session> {
    const serialised = this.to_store(session.serialise());
    const payload = new SerialisedRecord(serialised, session_id);
    await this.engine.create(CryptoboxCRUDStore.STORES.SESSIONS, payload.id, payload);
    return session;
  }

  /**
   * Loads a specified session.
   * @returns Resolves with the specified "session".
   */
  public async read_session(
    identity: ProteusKeys.IdentityKeyPair,
    session_id: string,
  ): Promise<ProteusSession.Session> {
    const record = await this.engine.read<PersistedRecord>(CryptoboxCRUDStore.STORES.SESSIONS, session_id);
    const payload = this.from_store(record);
    return ProteusSession.Session.deserialise(identity, payload);
  }

  public async read_sessions(identity: ProteusKeys.IdentityKeyPair): Promise<Record<string, ProteusSession.Session>> {
    const sessionIds = await this.engine.readAllPrimaryKeys(CryptoboxCRUDStore.STORES.SESSIONS);
    const sessions: Record<string, ProteusSession.Session> = {};

    for (const sessionId of sessionIds) {
      sessions[sessionId] = await this.read_session(identity, sessionId);
    }

    return sessions;
  }

  public async update_session(session_id: string, session: ProteusSession.Session): Promise<ProteusSession.Session> {
    const serialised = this.to_store(session.serialise());
    const payload = new SerialisedRecord(serialised, session_id);
    await this.engine.update(CryptoboxCRUDStore.STORES.SESSIONS, payload.id, {serialised: payload.serialised});
    return session;
  }

  /**
   * Deletes a specified session.
   * @returns Promise<string> Resolves with the "ID" from the record, which has been deleted.
   */
  public async delete_session(session_id: string): Promise<string> {
    const primary_key = await this.engine.delete(CryptoboxCRUDStore.STORES.SESSIONS, session_id);
    return primary_key;
  }
}
