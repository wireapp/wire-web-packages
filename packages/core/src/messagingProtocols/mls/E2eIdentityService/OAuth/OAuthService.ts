/*
 * Wire
 * Copyright (C) 2023 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {Auth0Client, IdToken, createAuth0Client} from '@auth0/auth0-spa-js';

interface Auth0Config {
  domain: string;
  clientId: string;
}

export class AuthService {
  private static instance: AuthService;
  private client: Auth0Client;

  private constructor(private config: Auth0Config) {
    void this.initClient();
  }

  private async initClient(): Promise<void> {
    this.client = await createAuth0Client({
      domain: this.config.domain,
      clientId: this.config.clientId,
    });
  }

  public static getInstance(config: Auth0Config): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(config);
    }
    return AuthService.instance;
  }

  public async login(): Promise<void> {
    await this.getClient().loginWithRedirect();
  }

  public async logout(): Promise<void> {
    await this.getClient().logout();
  }

  public async getIdToken(): Promise<IdToken> {
    const token = await this.getClient().getIdTokenClaims();
    if (!token) {
      throw new Error('Error while claiming OAuth idToken.');
    }
    return token;
  }

  private getClient(): Auth0Client {
    return this.client;
  }
}
