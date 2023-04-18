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

import {UserManager, User, UserManagerSettings} from 'oidc-client-ts';

interface OIDCServiceConfig {
  authorityUrl: string;
  audience: string;
  redirectUri: string;
}

export class OIDCService {
  private userManager: UserManager;

  constructor(config: OIDCServiceConfig) {
    const {authorityUrl, audience, redirectUri} = config;
    const dexioConfig: UserManagerSettings = {
      authority: authorityUrl,
      client_id: audience,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile',
    };

    this.userManager = new UserManager(dexioConfig);
  }

  public async authenticate(): Promise<void> {
    await this.userManager.signinRedirect();
  }

  public handleAuthentication(): Promise<User> {
    return this.userManager.signinRedirectCallback().then(user => {
      return user;
    });
  }
}
