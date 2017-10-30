import {AccessTokenData} from '../../auth';
import {AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine';
import {HttpClient} from '../../http';

export const retrieveCookie = (response: AxiosResponse, engine: CRUDEngine): Promise<AccessTokenData> =>
  Promise.resolve(response.data);

export const sendRequestWithCookie = (client: HttpClient, config: AxiosRequestConfig): AxiosPromise =>
  client._sendRequest(config);
