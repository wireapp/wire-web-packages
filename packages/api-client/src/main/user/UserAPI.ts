import {AxiosRequestConfig, AxiosResponse} from 'axios';

import {HttpClient} from '../http';
import {ClientPreKey, PreKeyBundle} from '../auth';
import {PublicClient} from '../client/';
import {
  Activate,
  ActivationResponse,
  CheckHandles,
  CompletePasswordReset,
  HandleInfo,
  NewPasswordReset,
  SearchResult,
  SendActivationCode,
  User,
  UserPreKeyBundleMap,
  VerifyDelete,
} from '../user';
import UserClients from '../conversation/UserClients';

export default class UserAPI {
  constructor(private client: HttpClient) {}

  static get URL() {
    return {
      ACTIVATE: '/activate',
      CALLS: '/calls',
      CLIENTS: 'clients',
      CONTACTS: 'contacts',
      DELETE: '/delete',
      HANDLES: 'handles',
      PASSWORDRESET: '/password-reset',
      PRE_KEYS: 'prekeys',
      PROPERTIES: '/properties',
      SEARCH: '/search',
      SEND: 'send',
      USERS: '/users',
    };
  }

  /**
   * Clear all properties.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/clearProperties
   */
  public deleteProperties(): Promise<{}> {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: UserAPI.URL.PROPERTIES,
    };

    return this.client.sendJSON(config).then(() => ({}));
  }

  /**
   * Delete a property.
   * @param propertyKey The property key to delete
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/deleteProperty
   */
  public deleteProperty(propertyKey: string): Promise<{}> {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: `${UserAPI.URL.PROPERTIES}/${propertyKey}`,
    };

    return this.client.sendJSON(config).then(() => ({}));
  }

  /**
   * Activate (i.e. confirm) an email address or phone number.
   * @param activationCode Activation code
   * @param activationKey Activation key
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/activate
   */
  public getActivation(activationCode: string, activationKey: string): Promise<ActivationResponse> {
    const config: AxiosRequestConfig = {
      params: {
        code: activationCode,
        key: activationKey,
      },
      method: 'get',
      url: UserAPI.URL.ACTIVATE,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Retrieve TURN server addresses and credentials.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getCallsConfig
   */
  public getCallsConfiguration(): Promise<RTCConfiguration> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.CALLS}/config`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Get a specific client of a user.
   * @param userId The user ID
   * @param clientId The client ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getUserClient
   */
  public getClient(userId: string, clientId: string): Promise<PublicClient> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${userId}/${UserAPI.URL.CLIENTS}/${clientId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Get a prekey for a specific client of a user.
   * @param userId The user ID
   * @param clientId The client ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getPrekey
   */
  public getClientPreKey(userId: string, clientId: string): Promise<ClientPreKey> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${userId}/${UserAPI.URL.PRE_KEYS}/${clientId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Get all of a user's clients.
   * @param userId The user ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getUserClients
   */
  public getClients(userId: string): Promise<PublicClient[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${userId}/${UserAPI.URL.CLIENTS}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Get information on a user handle.
   * @param handle The user's handle
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getUserHandleInfo
   */
  public getHandle(handle: string): Promise<HandleInfo> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${UserAPI.URL.HANDLES}/${handle}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * List all property keys.
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/listPropertyKeys
   */
  public getProperties(): Promise<string[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: UserAPI.URL.PROPERTIES,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Get a property value.
   * @param propertyKey The property key to get
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getProperty
   */
  public getProperty(propertyKey: string): Promise<Object> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.PROPERTIES}/${propertyKey}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Search for users.
   * @param query The search query
   * @param limit Number of results to return
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/search
   */
  public getSearchContacts(query: string, limit?: number): Promise<SearchResult> {
    const config: AxiosRequestConfig = {
      params: {
        q: query,
      },
      method: 'get',
      url: `${UserAPI.URL.SEARCH}/${UserAPI.URL.CONTACTS}`,
    };

    if (limit) {
      config.params.size = limit;
    }

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Get a user by ID.
   * @param userId The user ID
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/user
   */
  public getUser(userId: string): Promise<User> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${userId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Get a prekey for each client of a user.
   * @param userId
   */
  public getUserPreKeys(userId: string): Promise<PreKeyBundle> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${UserAPI.URL.USERS}/${userId}/${UserAPI.URL.PRE_KEYS}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * List users.
   * Note: The 'ids' and 'handles' parameters are mutually exclusive.
   * @param parameters Multiple user's handles or IDs
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/users
   */
  public getUsers(parameters: {handles?: string[]; ids?: string[]}): Promise<User[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {},
      url: UserAPI.URL.USERS,
    };

    if (parameters.handles) {
      config.params.handles = parameters.handles.join(',');
    } else if (parameters.ids) {
      config.params.ids = parameters.ids.join(',');
    }

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Activate (i.e. confirm) an email address or phone number.
   * Note: Activation only succeeds once and the number of failed attempts for a valid key is limited.
   * @param activationData Data to activate an account
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/activate_0
   */
  public postActivation(activationData: Activate): Promise<ActivationResponse> {
    const config: AxiosRequestConfig = {
      data: activationData,
      method: 'post',
      url: UserAPI.URL.ACTIVATE,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Send (or resend) an email or phone activation code.
   * @param activationCodeData Data to send an activation code
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/sendActivationCode
   */
  public postActivationCode(activationCodeData: SendActivationCode): Promise<{}> {
    const config: AxiosRequestConfig = {
      data: activationCodeData,
      method: 'post',
      url: `${UserAPI.URL.ACTIVATE}/${UserAPI.URL.SEND}`,
    };

    return this.client.sendJSON(config).then(() => ({}));
  }

  /**
   * Verify account deletion with a code.
   * @param verificationData Data to verify the account deletion
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/verifyDeleteUser
   */
  public postDelete(verificationData: VerifyDelete): Promise<{}> {
    const config: AxiosRequestConfig = {
      data: verificationData,
      method: 'post',
      url: UserAPI.URL.DELETE,
    };

    return this.client.sendJSON(config).then(() => ({}));
  }

  /**
   * Check availability of user handles.
   * @param handles The handles to check
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/checkUserHandles
   */
  public postHandles(handles: CheckHandles): Promise<string[]> {
    const config: AxiosRequestConfig = {
      data: handles,
      method: 'post',
      url: `${UserAPI.URL.USERS}/${UserAPI.URL.HANDLES}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Given a map of user IDs to client IDs return a prekey for each one.
   * Note: The maximum map size is 128 entries.
   * @param userClientMap A map of the user's clients
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/getMultiPrekeyBundles
   */
  public postMultiPreKeyBundles(userClientMap: UserClients): Promise<UserPreKeyBundleMap> {
    const config: AxiosRequestConfig = {
      data: userClientMap,
      method: 'post',
      url: `${UserAPI.URL.USERS}/${UserAPI.URL.PRE_KEYS}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Initiate or complete a password reset.
   * @param resetData The data needed to initiate or complete the reset
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/beginPasswordReset
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/completePasswordReset
   */
  public postPasswordReset(resetData: NewPasswordReset | CompletePasswordReset): Promise<{}> {
    const config: AxiosRequestConfig = {
      data: resetData,
      method: 'post',
      url: UserAPI.URL.PASSWORDRESET,
    };

    return this.client.sendJSON(config).then(() => ({}));
  }

  /**
   * Set a user property.
   * @param propertyKey The property key to set
   * @param propertyData The property data to set
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/setProperty
   */
  public putProperty(propertyKey: string, propertyData: Object): Promise<{}> {
    const config: AxiosRequestConfig = {
      data: propertyData,
      method: 'put',
      url: `${UserAPI.URL.PROPERTIES}/${propertyKey}`,
    };

    return this.client.sendJSON(config).then(() => ({}));
  }
}
