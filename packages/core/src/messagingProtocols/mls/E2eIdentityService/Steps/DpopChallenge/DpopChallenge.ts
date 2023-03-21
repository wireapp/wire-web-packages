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

import {Decoder} from 'bazinga64';

import {DoWireDpopChallengeParams, GetClientAccessTokenParams, GetClientNonceParams} from './DpopChallenge.types';

const getClientNonce = async ({apiClient, e2eClientId}: GetClientNonceParams) => {
  try {
    const nonce = await apiClient.api.client.getNonce(e2eClientId);
    if (nonce) {
      return nonce;
    }
    throw new Error('No client-nonce received');
  } catch (e) {
    throw new Error('Error while trying to receive a nonce', {cause: e});
  }
};

const getClientAccessToken = async ({
  apiClient,
  e2eClientId,
  clientNonce,
  identity,
  expiryDays,
  wireDpopChallenge,
}: GetClientAccessTokenParams) => {
  // The access token URL needs to be the same URL we call to get the Access Token
  const accessTokenUrl = `${apiClient.api.client.getAccessTokenUrl(e2eClientId)}`;
  // We need to decode the client nonce because the DPoP token expects a string
  const decodedClientNonce = Decoder.fromBase64(clientNonce).asString;

  const dpopToken = identity.createDpopToken(
    accessTokenUrl,
    e2eClientId,
    wireDpopChallenge,
    decodedClientNonce,
    expiryDays,
  );
  return await apiClient.api.client.getAccessToken(e2eClientId, dpopToken);
};

export const doWireDpopChallenge = async ({
  apiClient,
  e2eClientId,
  authData,
  expiryDays,
  identity,
  account,
  nonce,
  connection,
}: DoWireDpopChallengeParams) => {
  const {wireDpopChallenge} = authData.authorization;
  if (!wireDpopChallenge) {
    throw new Error('No wireDpopChallenge defined');
  }

  const clientNonce = await getClientNonce({e2eClientId, apiClient});
  const clientAccessTokenData = await getClientAccessToken({
    apiClient,
    e2eClientId,
    clientNonce,
    expiryDays,
    identity,
    wireDpopChallenge,
  });

  const reqBody = identity.newDpopChallengeRequest(clientAccessTokenData.token, wireDpopChallenge, account, nonce);

  const dpopChallengeResponse = await connection.validateDpopChallenge(wireDpopChallenge.url, reqBody);
  if (!dpopChallengeResponse) {
    throw new Error('No response received while validating DPOP challenge');
  }

  return dpopChallengeResponse;
};
