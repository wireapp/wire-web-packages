import * as ProteusKeys from '@wireapp/proteus/dist/keys/';
import * as ProteusSession from '@wireapp/proteus/dist/session/';
import {CryptoboxStore} from '../store';

/**
 * This store holds IDs of PreKeys which should be deleted.
 */
class ReadOnlyStore extends ProteusSession.PreKeyStore {
  public prekeysThatShouldBeRemoved: Array<number> = [];

  constructor(private store: CryptoboxStore) {
    super();
  }

  /**
   * Releases PreKeys from list. Called when PreKeys have been deleted.
   */
  public release_prekeys(deletedPreKeyIds: Array<number>): void {
    deletedPreKeyIds.forEach((id: number) => {
      const index: number = this.prekeysThatShouldBeRemoved.indexOf(id);
      if (index > -1) {
        this.prekeysThatShouldBeRemoved.splice(index, 1);
      }
    });
  }

  /**
   * Returns a PreKey (if it's not marked for deletion) via the Cryptobox store.
   * @override
   */
  get_prekey(prekey_id: number): Promise<ProteusKeys.PreKey | undefined> {
    if (this.prekeysThatShouldBeRemoved.indexOf(prekey_id) !== -1) {
      return Promise.reject(new Error(`PreKey "${prekey_id}" not found.`));
    }
    return this.store.load_prekey(prekey_id);
  }

  /**
   * Saves the PreKey ID which should get deleted.
   * @override
   */
  remove(prekey_id: number): Promise<void> {
    this.prekeysThatShouldBeRemoved.push(prekey_id);
    return Promise.resolve();
  }
}

export default ReadOnlyStore;
