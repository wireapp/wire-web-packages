const fs = require('fs-extra');
import path = require('path');
import CRUDEngine from './CRUDEngine';
import {isBrowser} from './EnvironmentUtil';
import {
  PathValidationError,
  RecordAlreadyExistsError,
  RecordNotFoundError,
  RecordTypeError,
  UnsupportedError,
} from './error';

export default class FileEngine implements CRUDEngine {
  public storeName: string = '';
  public storeNameOriginal: string = '';
  private options: {fileExtension: string} = {
    fileExtension: '.dat',
  };

  constructor(private readonly baseDirectory: string = '') {}

  public async isSupported(): Promise<void> {
    if (isBrowser()) {
      const message = `Node.js' File System Module is not available on your platform.`;
      throw new UnsupportedError(message);
    }
  }

  public async init(storeName: string = '', options: {fileExtension: string}): Promise<any> {
    await this.isSupported();
    this.storeNameOriginal = storeName;
    this.storeName = path.resolve(path.join(this.baseDirectory, storeName));
    this.options = {...this.options, ...options};
    return Promise.resolve(storeName);
  }

  public purge(): Promise<void> {
    return fs.remove(this.storeName);
  }

  static checkPathTraversal(trustedRoot: string, testPath: string, forceWindows: boolean = false): void {
    const isPathSuspicious = (givenPath: string): boolean => {
      if (process.platform === 'win32' || forceWindows === true) {
        trustedRoot = path.win32.resolve(trustedRoot);
        const unsafePath = path.win32.resolve(path.win32.join(trustedRoot, givenPath));
        if (unsafePath.startsWith(trustedRoot) === false) {
          return true;
        }
      } else {
        trustedRoot = path.resolve(trustedRoot);
        const unsafePath = path.resolve(path.join(trustedRoot, givenPath));
        if (unsafePath.startsWith(trustedRoot) === false) {
          return true;
        }
      }
      return false;
    };

    if (isPathSuspicious(testPath)) {
      const message = `Path traversal has been detected on value "${testPath}".`;
      throw new PathValidationError(message);
    }
  }

  private resolvePath(tableName: string, primaryKey: string = ''): Promise<string> {
    return new Promise((resolve, reject) => {
      FileEngine.checkPathTraversal(this.baseDirectory, this.storeNameOriginal);
      FileEngine.checkPathTraversal(this.storeName, tableName);
      FileEngine.checkPathTraversal(path.join(this.storeName, tableName), primaryKey);

      const filePath = path.join(
        this.storeName,
        tableName,
        primaryKey ? `${primaryKey}${this.options.fileExtension}` : ''
      );

      const nonPrintableCharacters = new RegExp('[^\x20-\x7E]+', 'gm');
      if (filePath.match(nonPrintableCharacters)) {
        const message = `Cannot create file with path "${filePath}".`;
        return reject(new PathValidationError(message));
      }

      return resolve(filePath);
    });
  }

  create<T>(tableName: string, primaryKey: string, entity: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (entity) {
        this.resolvePath(tableName, primaryKey)
          .then((filePath: string) => {
            if (typeof entity === 'object') {
              try {
                entity = JSON.stringify(entity);
              } catch (error) {
                entity = entity.toString();
              }
            }

            fs.writeFile(filePath, entity, {flag: 'wx'}, (error: NodeJS.ErrnoException) => {
              if (error) {
                if (error.code === 'ENOENT') {
                  fs.outputFile(filePath, entity)
                    .then(() => resolve(primaryKey))
                    .catch((error: Error) => reject(error));
                } else if (error.code === 'EEXIST') {
                  const message: string = `Record "${primaryKey}" already exists in "${tableName}". You need to delete the record first if you want to overwrite it.`;
                  reject(new RecordAlreadyExistsError(message));
                } else {
                  reject(error);
                }
              } else {
                resolve(primaryKey);
              }
            });
          })
          .catch(reject);
      } else {
        const message: string = `Record "${primaryKey}" cannot be saved in "${tableName}" because it's "undefined" or "null".`;
        reject(new RecordTypeError(message));
      }
    });
  }

  delete(tableName: string, primaryKey: string): Promise<string> {
    return this.resolvePath(tableName, primaryKey).then(file => {
      return fs
        .remove(file)
        .then(() => primaryKey)
        .catch(() => false);
    });
  }

  deleteAll(tableName: string): Promise<boolean> {
    return this.resolvePath(tableName).then(directory => {
      return fs
        .remove(directory)
        .then(() => true)
        .catch(() => false);
    });
  }

  read<T>(tableName: string, primaryKey: string): Promise<T> {
    return this.resolvePath(tableName, primaryKey).then(file => {
      return new Promise<T>((resolve, reject) => {
        fs.readFile(file, {encoding: 'utf8', flag: 'r'}, (error: any, data: any) => {
          if (error) {
            if (error.code === 'ENOENT') {
              const message: string = `Record "${primaryKey}" in "${tableName}" could not be found.`;
              reject(new RecordNotFoundError(message));
            } else {
              reject(error);
            }
          } else {
            try {
              data = JSON.parse(data);
            } catch (error) {
              // No JSON found but that's okay
            }
            resolve(data);
          }
        });
      });
    });
  }

  readAll<T>(tableName: string): Promise<T[]> {
    return this.resolvePath(tableName).then(directory => {
      return new Promise<T[]>((resolve, reject) => {
        fs.readdir(directory, (error: NodeJS.ErrnoException, files: Array<string>) => {
          if (error) {
            reject(error);
          } else {
            const recordNames = files.map(file => path.basename(file, path.extname(file)));
            const promises: Array<Promise<T>> = recordNames.map(primaryKey => this.read(tableName, primaryKey));
            Promise.all(promises).then((records: T[]) => resolve(records));
          }
        });
      });
    });
  }

  readAllPrimaryKeys(tableName: string): Promise<string[]> {
    return this.resolvePath(tableName).then(directory => {
      return new Promise<string[]>(resolve => {
        fs.readdir(directory, (error: NodeJS.ErrnoException, files: Array<string>) => {
          if (error) {
            if (error.code === 'ENOENT') {
              resolve([]);
            } else {
              throw error;
            }
          } else {
            const fileNames: string[] = files.map((file: string) => path.parse(file).name);
            resolve(fileNames);
          }
        });
      });
    });
  }

  append(tableName: string, primaryKey: string, additions: string): Promise<string> {
    return this.resolvePath(tableName, primaryKey).then(file => {
      return this.read(tableName, primaryKey)
        .then((record: any) => {
          if (typeof record === 'string') {
            record += additions;
          } else {
            const message: string = `Cannot append text to record "${primaryKey}" because it's not a string.`;
            throw new RecordTypeError(message);
          }
          return record;
        })
        .then((updatedRecord: any) => fs.outputFile(file, updatedRecord))
        .then(() => primaryKey);
    });
  }

  update(tableName: string, primaryKey: string, changes: Object): Promise<string> {
    return this.resolvePath(tableName, primaryKey).then(file => {
      return this.read(tableName, primaryKey)
        .then((record: any) => {
          if (typeof record === 'string') {
            record = JSON.parse(record);
          }
          const updatedRecord: Object = {...record, ...changes};
          return JSON.stringify(updatedRecord);
        })
        .then((updatedRecord: any) => fs.outputFile(file, updatedRecord))
        .then(() => primaryKey);
    });
  }

  public updateOrCreate(tableName: string, primaryKey: string, changes: Object): Promise<string> {
    return this.update(tableName, primaryKey, changes)
      .catch(error => {
        if (error instanceof RecordNotFoundError) {
          return this.create(tableName, primaryKey, changes);
        }
        throw error;
      })
      .then(() => primaryKey);
  }
}
