import * as ProteusKeys from '@wireapp/proteus/dist/keys/root';
import * as ProteusSession from '@wireapp/proteus/dist/session/root';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine/index';
import {CryptoboxStore, PersistedRecord, SerialisedRecord} from '../store/root';
import {error as storeError} from '../store/root';

class CryptoboxCRUDStore implements CryptoboxStore {
  constructor(private engine: CRUDEngine) {}

  static get KEYS() {
    return {
      LOCAL_IDENTITY: 'local_identity',
    };
  }

  static get STORES() {
    return {
      LOCAL_IDENTITY: 'keys',
      PRE_KEYS: 'prekeys',
      SESSIONS: 'sessions',
    };
  }

  private from_store(record: PersistedRecord): SerialisedRecord {
    const decodedData: Buffer | ArrayBuffer =
      typeof record.serialised === 'string' ? Buffer.from(record.serialised, 'base64') : <ArrayBuffer>record.serialised;

    return {
      created: record.created,
      id: record.id,
      serialised: new Uint8Array(decodedData).buffer,
      version: record.version,
    };
  }

  private to_store(record: SerialisedRecord): PersistedRecord {
    return {
      created: record.created,
      id: record.id,
      serialised: new Buffer(record.serialised).toString('base64'),
      version: record.version,
    };
  }

  public delete_all(): Promise<boolean> {
    return Promise.resolve()
      .then(() => this.engine.deleteAll(CryptoboxCRUDStore.STORES.LOCAL_IDENTITY))
      .then(() => this.engine.deleteAll(CryptoboxCRUDStore.STORES.PRE_KEYS))
      .then(() => this.engine.deleteAll(CryptoboxCRUDStore.STORES.SESSIONS))
      .then(() => true);
  }

  public delete_prekey(prekey_id: number): Promise<number> {
    return this.engine.delete(CryptoboxCRUDStore.STORES.PRE_KEYS, prekey_id.toString()).then(() => prekey_id);
  }

  public load_identity(): Promise<ProteusKeys.IdentityKeyPair | undefined> {
    return this.engine
      .read<PersistedRecord>(CryptoboxCRUDStore.STORES.LOCAL_IDENTITY, CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY)
      .then((payload: PersistedRecord) => {
        const record: SerialisedRecord = this.from_store(payload);
        const identity: ProteusKeys.IdentityKeyPair = ProteusKeys.IdentityKeyPair.deserialise(record.serialised);
        return identity;
      })
      .catch((error: Error) => {
        if (error instanceof storeError.RecordNotFoundError) {
          return undefined;
        }
        throw error;
      });
  }

  public load_prekey(prekey_id: number): Promise<ProteusKeys.PreKey | undefined> {
    return this.engine
      .read<PersistedRecord>(CryptoboxCRUDStore.STORES.PRE_KEYS, prekey_id.toString())
      .then((payload: PersistedRecord) => {
        const record: SerialisedRecord = this.from_store(payload);
        return ProteusKeys.PreKey.deserialise(record.serialised);
      })
      .catch((error: Error) => {
        if (error instanceof storeError.RecordNotFoundError) {
          return undefined;
        }
        throw error;
      });
  }

  public load_prekeys(): Promise<Array<ProteusKeys.PreKey>> {
    return this.engine.readAll(CryptoboxCRUDStore.STORES.PRE_KEYS).then((records: Array<any>) => {
      const preKeys: Array<ProteusKeys.PreKey> = [];

      records.forEach((payload: PersistedRecord) => {
        const record: SerialisedRecord = this.from_store(payload);
        let preKey: ProteusKeys.PreKey = ProteusKeys.PreKey.deserialise(record.serialised);
        preKeys.push(preKey);
      });

      return preKeys;
    });
  }

  public save_identity(identity: ProteusKeys.IdentityKeyPair): Promise<ProteusKeys.IdentityKeyPair> {
    const record: SerialisedRecord = new SerialisedRecord(identity.serialise(), CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY);
    const payload: PersistedRecord = this.to_store(record);
    return this.engine.create(CryptoboxCRUDStore.STORES.LOCAL_IDENTITY, record.id, payload).then(() => identity);
  }

  public save_prekey(pre_key: ProteusKeys.PreKey): Promise<ProteusKeys.PreKey> {
    const record: SerialisedRecord = new SerialisedRecord(pre_key.serialise(), pre_key.key_id.toString());
    const payload: PersistedRecord = this.to_store(record);
    return this.engine.create(CryptoboxCRUDStore.STORES.PRE_KEYS, record.id, payload).then(() => pre_key);
  }

  public save_prekeys(pre_keys: ProteusKeys.PreKey[]): Promise<ProteusKeys.PreKey[]> {
    const promises: Array<Promise<ProteusKeys.PreKey>> = pre_keys.map(pre_key => this.save_prekey(pre_key));
    return Promise.all(promises).then(() => pre_keys);
  }

  public create_session(session_id: string, session: ProteusSession.Session): Promise<ProteusSession.Session> {
    const record: SerialisedRecord = new SerialisedRecord(session.serialise(), session_id);
    const payload: PersistedRecord = this.to_store(record);
    return this.engine.create(CryptoboxCRUDStore.STORES.SESSIONS, record.id, payload).then(() => session);
  }

  public read_session(identity: ProteusKeys.IdentityKeyPair, session_id: string): Promise<ProteusSession.Session> {
    return this.engine
      .read<PersistedRecord>(CryptoboxCRUDStore.STORES.SESSIONS, session_id)
      .then((payload: PersistedRecord) => {
        const record: SerialisedRecord = this.from_store(payload);
        return ProteusSession.Session.deserialise(identity, record.serialised);
      });
  }

  public update_session(session_id: string, session: ProteusSession.Session): Promise<ProteusSession.Session> {
    const record: SerialisedRecord = new SerialisedRecord(session.serialise(), session_id);
    const payload: PersistedRecord = this.to_store(record);
    return this.engine
      .update(CryptoboxCRUDStore.STORES.SESSIONS, record.id, {serialised: payload.serialised})
      .then(() => session);
  }

  public delete_session(session_id: string): Promise<string> {
    return this.engine
      .delete(CryptoboxCRUDStore.STORES.SESSIONS, session_id)
      .then((primary_key: string) => primary_key);
  }
}

export default CryptoboxCRUDStore;
