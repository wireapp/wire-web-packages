import CRUDEngine from './CRUDEngine';
import {RecordAlreadyExistsError, RecordNotFoundError, RecordTypeError} from './error';

export default class MemoryEngine implements CRUDEngine {
  private stores: {[index: string]: {[index: string]: any}} = {};

  constructor(public storeName: string) {
    this.stores[storeName] = {};
  }

  private prepareTable(tableName: string) {
    if (!this.stores[this.storeName][tableName]) {
      this.stores[this.storeName][tableName] = {};
    }
  }

  public create<T>(tableName: string, primaryKey: string, entity: T): Promise<string> {
    if (entity) {
      this.prepareTable(tableName);

      const record = this.stores[this.storeName][tableName][primaryKey];

      if (record) {
        const message: string = `Record "${primaryKey}" already exists in "${
          tableName
        }". You need to delete the record first if you want to overwrite it.`;
        const error = new RecordAlreadyExistsError(message);
        return Promise.reject(error);
      }

      this.stores[this.storeName][tableName][primaryKey] = entity;
      return Promise.resolve(primaryKey);
    }

    const message: string = `Record "${primaryKey}" cannot be saved in "${
      tableName
    }" because it's "undefined" or "null".`;
    return Promise.reject(new RecordTypeError(message));
  }

  public delete(tableName: string, primaryKey: string): Promise<string> {
    this.prepareTable(tableName);
    return Promise.resolve().then(() => {
      delete this.stores[this.storeName][tableName][primaryKey];
      return primaryKey;
    });
  }

  public deleteAll(tableName: string): Promise<boolean> {
    return Promise.resolve().then(() => {
      delete this.stores[this.storeName][tableName];
      return true;
    });
  }

  public read<T>(tableName: string, primaryKey: string): Promise<T> {
    this.prepareTable(tableName);
    const record = this.stores[this.storeName][tableName][primaryKey];

    if (record) {
      return Promise.resolve(record);
    } else {
      const message: string = `Record "${primaryKey}" in "${tableName}" could not be found.`;
      return Promise.reject(new RecordNotFoundError(message));
    }
  }

  public readAll<T>(tableName: string): Promise<T[]> {
    this.prepareTable(tableName);
    const promises: Array<Promise<T>> = [];

    for (let primaryKey of Object.keys(this.stores[this.storeName][tableName])) {
      promises.push(this.read(tableName, primaryKey));
    }

    return Promise.all(promises);
  }

  public readAllPrimaryKeys(tableName: string): Promise<string[]> {
    this.prepareTable(tableName);
    return Promise.resolve(Object.keys(this.stores[this.storeName][tableName]));
  }

  public update(tableName: string, primaryKey: string, changes: Object): Promise<string> {
    this.prepareTable(tableName);
    return this.read(tableName, primaryKey)
      .then((entity: Object) => {
        return Object.assign(entity, changes);
      })
      .then((updatedEntity: Object) => {
        this.stores[this.storeName][tableName][primaryKey] = updatedEntity;
        return primaryKey;
      });
  }
}
