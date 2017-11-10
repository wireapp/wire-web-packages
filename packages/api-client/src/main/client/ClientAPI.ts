import {AxiosRequestConfig, AxiosResponse} from 'axios';

import {HttpClient} from '../http';
import {NewClient, RegisteredClient} from '../client/';
import {PreKeyBundle} from '../auth';

export default class ClientAPI {
  constructor(private client: HttpClient) {}

  static get URL() {
    return {
      CLIENTS: '/clients',
    };
  }

  public postClient(newClient: NewClient): Promise<RegisteredClient> {
    const config: AxiosRequestConfig = {
      data: newClient,
      method: 'post',
      url: ClientAPI.URL.CLIENTS,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public deleteClient(clientId: string, password?: string): Promise<Object> {
    const config: AxiosRequestConfig = {
      data: {
        password,
      },
      method: 'delete',
      url: `${ClientAPI.URL.CLIENTS}/${clientId}`,
    };

    return this.client.sendJSON(config).then(() => ({}));
  }

  public getClient(clientId: string): Promise<RegisteredClient> {
    const config: AxiosRequestConfig = {
      data: {},
      method: 'get',
      url: `${ClientAPI.URL.CLIENTS}/${clientId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public getClients(): Promise<RegisteredClient[]> {
    const config: AxiosRequestConfig = {
      data: {},
      method: 'get',
      url: ClientAPI.URL.CLIENTS,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public getClientPreKeys(clientId: string): Promise<PreKeyBundle> {
    const config: AxiosRequestConfig = {
      data: {},
      method: 'get',
      url: `${ClientAPI.URL.CLIENTS}/${clientId}/prekeys`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }
}
