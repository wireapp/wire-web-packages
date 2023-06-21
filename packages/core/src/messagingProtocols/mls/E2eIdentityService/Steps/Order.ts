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

import {AcmeDirectory, NewAcmeOrder, WireE2eIdentity} from '@wireapp/core-crypto/platforms/web/corecrypto';

import {AcmeService} from '../Connection';
import {Nonce} from '../E2eIdentityService.types';
import {jsonToByteArray} from '../Helper';

export interface CreateNewOrderParams {
  identity: WireE2eIdentity;
  nonce: Nonce;
  directory: AcmeDirectory;
  connection: AcmeService;
}
export type CreateNewOrderReturnValue = Promise<{order: NewAcmeOrder; nonce: string; authzUrl: string}>;

export const createNewOrder = async ({
  identity,
  nonce,
  directory,
  connection,
}: CreateNewOrderParams): CreateNewOrderReturnValue => {
  const reqBody = identity.newOrderRequest(nonce);

  const response = await connection.createNewOrder(directory.newOrder, reqBody);
  if (response?.data && !!response.data.status.length && !!response.nonce.length) {
    console.log('acme Order response data: ', JSON.stringify(response.data), jsonToByteArray(response.data));
    return {
      order: identity.newOrderResponse(jsonToByteArray(response.data)),
      authzUrl: response.data.authorizations[0],
      nonce: response.nonce,
    };
  }

  throw new Error('No order-data received');
};
