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

import {WireE2eIdentity} from '@wireapp/core-crypto/platforms/web/corecrypto';

import {APIClient} from '@wireapp/api-client';

import {ClientId} from '../../../types';
import {AcmeConnectionService} from '../../Connection';
import {Nonce} from '../../E2eIdentityService.types';
import {GetAuthorizationReturnValue} from '../Authorization';

export interface DoWireDpopChallengeParams {
  apiClient: APIClient;
  clientId: ClientId;
  authData: GetAuthorizationReturnValue;
  identity: WireE2eIdentity;
  connection: AcmeConnectionService;
  nonce: Nonce;
}

export type GetClientNonceParams = Pick<DoWireDpopChallengeParams, 'clientId' | 'apiClient'>;

export type GetClientAccessTokenParams = Pick<DoWireDpopChallengeParams, 'clientId' | 'apiClient' | 'identity'> & {
  clientNonce: Nonce;
};
