import {AxiosRequestConfig, AxiosResponse} from 'axios';

import {HttpClient} from '../http';
import {Connection, ConnectionRequest, ConnectionUpdate, UserConnectionList} from '../connection';

export default class ConnectionsAPI {
  constructor(private client: HttpClient) {}

  static get URL() {
    return {
      CONNECTIONS: '/connections',
    };
  }

  /**
   * Get an existing connection to another user.
   * @param userId The ID of the other user
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/connection
   */
  public getConnection(userId: string): Promise<Connection> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${ConnectionsAPI.URL.CONNECTIONS}/${userId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * List the connections to other users.
   * @param limit Number of results to return (default 100, max 500)
   * @param connectionId The connection ID to start from
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/connections
   */
  public getConnections(limit: number = 100, connectionId?: string): Promise<UserConnectionList> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        size: limit,
      },
      url: ConnectionsAPI.URL.CONNECTIONS,
    };

    if (connectionId) {
      config.params.start = connectionId;
    }

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Create a connection to another user.
   * Note: You can have no more than 1000 connections in accepted or sent state.
   * @param connectionRequestData: The connection request
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/createConnection
   */
  public postConnection(connectionRequestData: ConnectionRequest): Promise<Connection> {
    const config: AxiosRequestConfig = {
      data: connectionRequestData,
      method: 'post',
      url: ConnectionsAPI.URL.CONNECTIONS,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Update a connection.
   * Note: You can have no more than 1000 connections in accepted or sent state.
   * @param updatedConnection: The updated connection
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/updateConnection
   */
  public putConnection(updatedConnection: ConnectionUpdate): Promise<Connection> {
    const config: AxiosRequestConfig = {
      data: updatedConnection,
      method: 'put',
      url: ConnectionsAPI.URL.CONNECTIONS,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }
}
