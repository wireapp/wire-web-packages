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

// import {UserManager, User} from 'oidc-client-ts';

// export class OidcClientService {
//   private userManager: UserManager;

//   constructor(private authority: string, private clientId: string, private redirectUri: string) {
//     const dexioConfig = {
//       authority: authority,
//       client_id: clientId,
//       redirect_uri: redirectUri,
//       response_type: 'code',
//       scope: 'openid',
//     };

//     this.userManager = new UserManager(dexioConfig);
//   }

//   public async authenticate(): Promise<void> {
//     await this.userManager.signinRedirect();
//   }

//   public handleAuthentication(): Promise<User> {
//     return this.userManager.signinRedirectCallback();
//   }
// }

export default true;
