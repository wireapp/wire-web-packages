import AccessTokenData from '../auth/AccessTokenData';
import axios, {AxiosError, AxiosPromise, AxiosRequestConfig} from 'axios';
import {AccessTokenStore, AuthAPI} from '../auth';
import {ContentType} from '../http';
import PriorityQueue from '@wireapp/queue-priority/dist/commonjs/PriorityQueue';
import Logdown = require('logdown');

export default class HttpClient {
  private _authAPI: AuthAPI;
  private logger: Logdown;
  private requestQueue: PriorityQueue<number>;

  constructor(private baseURL: string, public accessTokenStore: AccessTokenStore) {
    this.logger = new Logdown(this.constructor.name);

    this.requestQueue = new PriorityQueue({
      maxRetries: 0,
      retryDelay: 1000,
    });

    axios.interceptors.response.use(null, (error: AxiosError) => {
      let backendResponse: string = undefined;
      try {
        backendResponse = JSON.stringify(error.response.data);
      } finally {
        this.logger.error(
          `HTTP Error (${error.response.status}) on '${error.response.config
            .url}': ${error.message} (${backendResponse}`,
        );
      }
      return Promise.reject(error);
    });
  }

  set authAPI(authAPI: AuthAPI) {
    this._authAPI = authAPI;
  }

  public createUrl(url: string) {
    return `${this.baseURL}${url}`;
  }

  public _sendRequest(config: AxiosRequestConfig, tokenAsParam: boolean = false): AxiosPromise {
    config.baseURL = this.baseURL;

    if (this.accessTokenStore.accessToken) {
      const {token_type, access_token} = this.accessTokenStore.accessToken;

      if (tokenAsParam) {
        config.params = {
          ...config.params,
          access_token,
        };
      } else {
        config.headers = {
          ...config.headers,
          Authorization: `${token_type} ${access_token}`,
        };
      }
    }

    return axios.request(config).catch((error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        return this.refreshAccessToken().then(() => this._sendRequest(config, tokenAsParam));
      }

      return Promise.reject(error);
    });
  }

  public refreshAccessToken(): Promise<AccessTokenData> {
    let expiredAccessToken: AccessTokenData = undefined;
    if (this.accessTokenStore.accessToken && this.accessTokenStore.accessToken.access_token) {
      expiredAccessToken = this.accessTokenStore.accessToken;
    }

    return this._authAPI
      .postAccess(expiredAccessToken)
      .then((accessToken: AccessTokenData) => this.accessTokenStore.updateToken(accessToken));
  }

  public sendRequest(config: AxiosRequestConfig, tokenAsParam: boolean = false): AxiosPromise {
    return this.requestQueue.add(() => this._sendRequest(config, tokenAsParam));
  }

  public sendJSON(config: AxiosRequestConfig): AxiosPromise {
    config.headers = {
      ...config.headers,
      'Content-Type': ContentType.APPLICATION_JSON,
    };
    return this.sendRequest(config);
  }

  public sendProtocolBuffer(config: AxiosRequestConfig): AxiosPromise {
    config.headers = {
      ...config.headers,
      'Content-Type': ContentType.APPLICATION_PROTOBUF,
    };
    return this.sendRequest(config);
  }
}
