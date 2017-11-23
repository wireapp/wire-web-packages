import ExpiredBundle from './ExpiredBundle';
import TransientBundle from './TransientBundle';
import {CRUDEngine} from '../engine';
import {EventEmitter} from 'events';
import {RecordAlreadyExistsError, RecordNotFoundError} from '../engine/error';

export default class TransientStore extends EventEmitter {
  private bundles: {[index: string]: TransientBundle} = {};
  private tableName: string;

  public static TOPIC = {
    EXPIRED: 'expired',
  };

  constructor(private engine: CRUDEngine) {
    super();
  }

  public init(tableName: string): Promise<Array<TransientBundle>> {
    this.tableName = tableName;

    let cacheKeys: Array<string> = [];

    return this.engine
      .readAllPrimaryKeys(this.tableName)
      .then((primaryKeys: Array<string>) => {
        const readBundles: Array<Promise<TransientBundle>> = [];

        primaryKeys.forEach((primaryKey: string) => {
          const cacheKey: string = this.constructCacheKey(primaryKey);
          cacheKeys.push(cacheKey);
          readBundles.push(this.engine.read(this.tableName, primaryKey));
        });

        return Promise.all(readBundles);
      })
      .then((bundles: Array<TransientBundle>) => {
        for (let index in bundles) {
          const bundle = bundles[index];
          const cacheKey = cacheKeys[index];

          this.startTimer(cacheKey).then(() => {
            this.bundles[cacheKey] = bundle;
          });
        }

        return bundles;
      });
  }

  /**
   * Returns a fully qualified name (FQN) which can be used to cache a transient bundle.
   * @param {string} primaryKey - Primary key from which the FQN is created
   * @returns {string} A fully qualified name
   */
  private constructCacheKey(primaryKey: string): string {
    return `${this.engine.storeName}@${this.tableName}@${primaryKey}`;
  }

  private constructPrimaryKey(cacheKey: string): string {
    return cacheKey.replace(`${this.engine.storeName}@${this.tableName}@`, '');
  }

  private createTransientBundle<T>(record: T, ttl: number) {
    return {
      expires: Date.now() + ttl,
      payload: record,
    };
  }

  public get(primaryKey: string): Promise<TransientBundle> {
    return this.getFromCache(primaryKey)
      .then((cachedBundle: TransientBundle) => {
        return cachedBundle !== undefined ? cachedBundle : this.getFromStore(primaryKey);
      })
      .catch(error => {
        if (error instanceof RecordNotFoundError) {
          return undefined;
        }
        throw error;
      });
  }

  private getFromCache(primaryKey: string): Promise<TransientBundle> {
    const cacheBundle = this.bundles[this.constructCacheKey(primaryKey)];
    return Promise.resolve(cacheBundle);
  }

  private getFromStore(primaryKey: string): Promise<TransientBundle> {
    return this.engine.read(this.tableName, primaryKey);
  }

  /**
   * Saves a transient record to the store and starts a timer to remove this record when the time to live (TTL) ended.
   * @param {string} primaryKey - Primary key from which the FQN is created
   * @param {string} record - A payload which should be kept in the TransientStore
   * @param {number} ttl - The time to live (TTL) in milliseconds (ex. 1000 is 1s)
   * @returns {Promise<TransientBundle>} A transient bundle, wrapping the initial record
   */
  public set<T>(primaryKey: string, record: T, ttl: number): Promise<TransientBundle> {
    const bundle: TransientBundle = this.createTransientBundle(record, ttl);

    return new Promise((resolve, reject) => {
      this.getFromCache(primaryKey).then((cachedBundle: TransientBundle) => {
        if (cachedBundle) {
          const message = `Record with primary key "${primaryKey}" already exists in table "${
            this.tableName
          }" of database "${this.engine.storeName}".`;
          reject(new RecordAlreadyExistsError(message));
        } else {
          this.save(primaryKey, bundle)
            .then((cacheKey: string) => Promise.all([cacheKey, this.startTimer(cacheKey)]))
            .then(([cacheKey, bundle]: [string, TransientBundle]) => {
              // Note: Save bundle with timeoutID in cache (not in persistent storage)
              resolve(this.saveInCache(cacheKey, bundle));
            });
        }
      });
    });
  }

  private save<TransientBundle>(primaryKey: string, bundle: TransientBundle): Promise<string> {
    const cacheKey: string = this.constructCacheKey(primaryKey);

    return Promise.all([this.saveInStore(primaryKey, bundle), this.saveInCache(cacheKey, bundle)]).then(() => cacheKey);
  }

  private saveInStore<TransientBundle>(primaryKey: string, bundle: TransientBundle): Promise<string> {
    return this.engine.create(this.tableName, primaryKey, bundle);
  }

  private saveInCache<TransientBundle>(cacheKey: string, bundle: TransientBundle): TransientBundle {
    return (this.bundles[cacheKey] = <any>bundle);
  }

  public delete(primaryKey: string): Promise<string> {
    const cacheKey = this.constructCacheKey(primaryKey);

    return Promise.all([this.deleteFromStore(primaryKey), this.deleteFromCache(cacheKey)]).then(() => cacheKey);
  }

  private deleteFromStore(primaryKey: string): Promise<string> {
    return this.engine.delete(this.tableName, primaryKey);
  }

  private deleteFromCache(cacheKey: string): string {
    const timeoutID = this.bundles[cacheKey] && this.bundles[cacheKey].timeoutID;
    if (timeoutID) {
      clearTimeout(<number>timeoutID);
    }
    delete this.bundles[cacheKey];
    return cacheKey;
  }

  private expireBundle(cacheKey: string): Promise<ExpiredBundle> {
    const expiredBundle: ExpiredBundle = {
      cacheKey: cacheKey,
      payload: this.bundles[cacheKey].payload,
      primaryKey: this.constructPrimaryKey(cacheKey),
    };

    return this.delete(expiredBundle.primaryKey).then(() => expiredBundle);
  }

  // TODO: Change method signature to "cacheKey: string, bundle: TransientBundle"
  private startTimer(cacheKey: string): Promise<TransientBundle> {
    const primaryKey = this.constructPrimaryKey(cacheKey);
    return this.get(primaryKey).then((bundle: TransientBundle) => {
      const {expires, timeoutID} = bundle;
      const timespan: number = expires - Date.now();

      if (expires <= 0) {
        this.expireBundle(cacheKey);
      } else if (!timeoutID) {
        bundle.timeoutID = setTimeout(() => {
          this.expireBundle(cacheKey).then((expiredBundle: ExpiredBundle) => {
            this.emit(TransientStore.TOPIC.EXPIRED, expiredBundle);
          });
        }, timespan);
      }

      return bundle;
    });
  }
}
