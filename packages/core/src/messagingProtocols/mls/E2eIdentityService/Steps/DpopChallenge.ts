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

import {AcmeChallenge, WireE2eIdentity} from '@wireapp/core-crypto/platforms/web/corecrypto';
import {Decoder} from 'bazinga64';

import {APIClient} from '@wireapp/api-client';

import {GetAuthorizationReturnValue} from './Authorization';

import {AcmeConnectionService} from '../Connection';
import {Account, Nonce, User} from '../E2eIdentityService.types';

type GetClientNonceParams = Pick<DoWireDpopChallengeParams, 'clientId' | 'apiClient'>;
const getClientNonce = async ({apiClient, clientId}: GetClientNonceParams) => {
  try {
    const nonce = await apiClient.api.client.getNonce(clientId);
    if (nonce) {
      return nonce;
    }
    throw new Error('No client-nonce received');
  } catch (e) {
    throw new Error('Error while trying to receive a nonce', {cause: e});
  }
};

type GetClientAccessTokenParams = Pick<
  DoWireDpopChallengeParams,
  'clientId' | 'apiClient' | 'user' | 'expiryDays' | 'identity'
> & {
  clientNonce: Nonce;
  wireDpopChallenge: AcmeChallenge;
};
const getClientAccessToken = async ({
  apiClient,
  clientId,
  clientNonce,
  identity,
  user,
  expiryDays,
  wireDpopChallenge,
}: GetClientAccessTokenParams) => {
  // The access token URL needs to be the same URL we call to get the Access Token
  const accessTokenUrl = `${apiClient.api.client.getAccessTokenUrl(clientId)}`;
  // We need to decode the client nonce because the DPoP token expects a string
  const decodedClientNonce = Decoder.fromBase64(clientNonce).asString;
  // We need to format the client ID because the coreCrypto function expects a BigInt
  const formattedClientId = BigInt(parseInt(clientId, 16));

  const dpopToken = identity.createDpopToken(
    accessTokenUrl,
    user.id,
    formattedClientId,
    user.domain,
    wireDpopChallenge,
    decodedClientNonce,
    expiryDays,
  );
  return await apiClient.api.client.getAccessToken(clientId, dpopToken);
};

interface DoWireDpopChallengeParams {
  apiClient: APIClient;
  clientId: string;
  authData: GetAuthorizationReturnValue;
  identity: WireE2eIdentity;
  user: User;
  expiryDays: number;
  connection: AcmeConnectionService;
  account: Account;
  nonce: Nonce;
}
export const doWireDpopChallenge = async ({
  apiClient,
  clientId,
  authData,
  expiryDays,
  identity,
  user,
  account,
  nonce,
  connection,
}: DoWireDpopChallengeParams) => {
  const {wireDpopChallenge} = authData.authorization;
  if (!wireDpopChallenge) {
    throw new Error('No wireDpopChallenge defined');
  }

  const clientNonce = await getClientNonce({clientId, apiClient});
  const clientAccessTokenData = await getClientAccessToken({
    apiClient,
    clientId,
    clientNonce,
    expiryDays,
    identity,
    user,
    wireDpopChallenge,
  });

  const reqBody = identity.newDpopChallengeRequest(clientAccessTokenData.token, wireDpopChallenge, account, nonce);

  const dpopChallengeResponse = await connection.validateDpopChallenge(wireDpopChallenge.url, reqBody);
  if (!dpopChallengeResponse) {
    throw new Error('No response received while validating DPOP challenge');
  }

  return dpopChallengeResponse;
};
