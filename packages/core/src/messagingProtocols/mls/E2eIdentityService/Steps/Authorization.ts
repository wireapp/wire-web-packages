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

import {NewAcmeAuthz, WireE2eIdentity} from '@wireapp/core-crypto/platforms/web/corecrypto';

import {AcmeService} from '../Connection';
import {Nonce} from '../E2eIdentityService.types';
import {jsonToByteArray} from '../Helper';

interface GetAuthorizationParams {
  nonce: Nonce;
  authzUrl: string;
  identity: WireE2eIdentity;
  connection: AcmeService;
}
export type GetAuthorizationReturnValue = {authorization: NewAcmeAuthz; nonce: Nonce};

export const getAuthorization = async ({
  authzUrl,
  nonce,
  identity,
  connection,
}: GetAuthorizationParams): Promise<GetAuthorizationReturnValue> => {
  const reqBody = identity.newAuthzRequest(authzUrl, nonce);
  const response = await connection.getAuthorization(authzUrl, reqBody);

  if (response?.data && !!response.data.status.length && !!response.nonce.length) {
    // eslint-disable-next-line no-console
    console.log(
      'acme Authorization response data: ',
      JSON.stringify(response.data),
      jsonToByteArray(JSON.stringify(response.data)),
    );
    return {
      authorization: identity.newAuthzResponse(jsonToByteArray(JSON.stringify(response.data))),
      nonce: response.nonce,
    };
  }

  throw new Error('No authorization-data received');
};
