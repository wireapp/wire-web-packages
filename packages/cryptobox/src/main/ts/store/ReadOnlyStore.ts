import * as ProteusKeys from '@wireapp/proteus/dist/keys/';
import * as ProteusSession from '@wireapp/proteus/dist/session/';
import {CryptoboxStore} from '../store';

/**
 * This store holds IDs of PreKeys which should be deleted.
 */
class ReadOnlyStore extends ProteusSession.PreKeyStore {
  private removePrekeys: Array<number> = [];
  // TODO: Use "prekeys" from "PreKeyStore"
  public prekeys: Array<ProteusKeys.PreKey> = [];

  constructor(private store: CryptoboxStore) {
    super();
    this.prekeys = [];
  }

  /**
   * Releases PreKeys from deletion list. Called when PreKeys have been deleted.
   */
  public release_prekeys(deletedPreKeyIds: Array<number>): void {
    deletedPreKeyIds.forEach((id: number) => {
      const index: number = this.removePrekeys.indexOf(id);
      if (index > -1) {
        this.prekeys.splice(index, 1);
      }
    });
  }

  /**
   * Returns a PreKey (if it's not marked for deletion) via the Cryptobox store.
   * @override
   */
  get_prekey(prekey_id: number): Promise<ProteusKeys.PreKey | undefined> {
    if (this.removePrekeys.indexOf(prekey_id) !== -1) {
      return Promise.reject(new Error(`PreKey "${prekey_id}" not found.`));
    }
    return this.store.load_prekey(prekey_id);
  }

  /**
   * Saves the PreKey ID which should get deleted.
   * @override
   */
  remove(prekey_id: number): Promise<void> {
    this.removePrekeys.push(prekey_id);
    return Promise.resolve();
  }
}

export default ReadOnlyStore;
