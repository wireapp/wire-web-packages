import RegisterData from './RegisterData';
import {User} from '../user';
import {AccessTokenData, LoginData} from '../auth';
import {AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine';
import {retrieveCookie, sendRequestWithCookie} from '../shims/node/cookie';
import {HttpClient} from '../http';

export default class AuthAPI {
  constructor(private client: HttpClient, private engine: CRUDEngine) {}

  static get URL() {
    return {
      ACCESS: '/access',
      COOKIES: '/cookies',
      INVITATIONS: '/invitations',
      LOGIN: '/login',
      LOGOUT: 'logout',
      REGISTER: '/register',
    };
  }

  public postCookiesRemove(login: LoginData, labels?: string[]): AxiosPromise {
    const config: AxiosRequestConfig = {
      data: {
        email: login.email,
        labels: labels,
        password: login.password.toString(),
      },
      method: 'post',
      url: `${AuthAPI.URL.COOKIES}/remove`,
    };

    return this.client.sendRequest(config);
  }

  public postLogin(login: LoginData): Promise<AccessTokenData> {
    login.password = login.password.toString();
    const config: AxiosRequestConfig = {
      data: login,
      method: 'post',
      params: {
        persist: login.persist.toString(),
      },
      url: AuthAPI.URL.LOGIN,
      withCredentials: true,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => retrieveCookie(response, this.engine));
  }

  public postLogout(): AxiosPromise {
    const config: AxiosRequestConfig = {
      withCredentials: true,
      method: 'post',
      url: `${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public postAccess(expiredAccessToken?: AccessTokenData): Promise<AccessTokenData> {
    const config: AxiosRequestConfig = {
      headers: {},
      withCredentials: true,
      method: 'post',
      url: `${AuthAPI.URL.ACCESS}`,
    };

    if (expiredAccessToken) {
      config.headers['Authorization'] = `${expiredAccessToken.token_type} ${decodeURIComponent(
        expiredAccessToken.access_token,
      )}`;
    }

    return sendRequestWithCookie(this.client, config, this.engine).then((response: AxiosResponse) => response.data);
  }

  public postRegister(register: RegisterData): Promise<User> {
    const config: AxiosRequestConfig = {
      data: register,
      method: 'post',
      url: AuthAPI.URL.REGISTER,
      withCredentials: true,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }
}
