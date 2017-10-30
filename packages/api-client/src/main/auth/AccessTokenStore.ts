import AccessTokenData from './AccessTokenData';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine';
import {RecordNotFoundError} from '@wireapp/store-engine/dist/commonjs/engine/error';
import EventEmitter = require('events');

export default class AccessTokenStore extends EventEmitter {
  private ACCESS_TOKEN_KEY: string = 'access-token';
  private ACCESS_TOKEN_TABLE: string = 'authentication';

  public accessToken: AccessTokenData;

  public static TOPIC = {
    ACCESS_TOKEN_REFRESH: 'AccessTokenStore.TOPIC.ACCESS_TOKEN_REFRESH',
  };

  constructor(private tokenStore: CRUDEngine) {
    super();
  }

  public delete(): Promise<void> {
    return this.tokenStore
      .delete(this.ACCESS_TOKEN_TABLE, this.ACCESS_TOKEN_KEY)
      .then(() => (this.accessToken = undefined));
  }

  public updateToken(accessToken: AccessTokenData): Promise<AccessTokenData> {
    if (this.accessToken !== accessToken) {
      return this.tokenStore
        .delete(this.ACCESS_TOKEN_TABLE, this.ACCESS_TOKEN_KEY)
        .then(() => this.tokenStore.create(this.ACCESS_TOKEN_TABLE, this.ACCESS_TOKEN_KEY, accessToken))
        .then(() => (this.accessToken = accessToken));
    }
    return Promise.resolve(this.accessToken);
  }

  public init(): Promise<AccessTokenData> {
    return this.tokenStore
      .read(this.ACCESS_TOKEN_TABLE, this.ACCESS_TOKEN_KEY)
      .catch(error => {
        if (error instanceof RecordNotFoundError) {
          return undefined;
        }

        throw error;
      })
      .then((accessToken: AccessTokenData) => (this.accessToken = accessToken));
  }
}
