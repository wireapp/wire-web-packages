import CRUDEngine from './CRUDEngine';

export default class FileSystemEngine implements CRUDEngine {
  public storeName: string = '';

  init(storeName: string, ...args: any[]): Promise<any> {
    throw new Error('Method not implemented.');
  }

  create<T>(tableName: string, primaryKey: string, entity: T): Promise<string> {
    throw new Error('Method not implemented.');
  }

  delete(tableName: string, primaryKey: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  deleteAll(tableName: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  read<T>(tableName: string, primaryKey: string): Promise<T> {
    throw new Error('Method not implemented.');
  }

  readAll<T>(tableName: string): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  readAllPrimaryKeys(tableName: string): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  update(tableName: string, primaryKey: string, changes: Object): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
