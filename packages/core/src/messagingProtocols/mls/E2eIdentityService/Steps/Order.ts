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
import {Nonce} from '../E2EIdentityService.types';
import {jsonToByteArray} from '../Helper';

type OrderUrl = string;

export interface CreateNewOrderParams {
  identity: WireE2eIdentity;
  nonce: Nonce;
  directory: AcmeDirectory;
  connection: AcmeService;
}
export type CreateNewOrderReturnValue = Promise<{
  order: NewAcmeOrder;
  nonce: string;
  authzUrl: string;
  orderUrl: OrderUrl;
}>;

export const createNewOrder = async ({
  identity,
  nonce,
  directory,
  connection,
}: CreateNewOrderParams): CreateNewOrderReturnValue => {
  const reqBody = identity.newOrderRequest(nonce);
  const response = await connection.createNewOrder(directory.newOrder, reqBody);
  if (response?.data && !!response.data.status.length && !!response.nonce.length && !!response.location?.length) {
    return {
      order: identity.newOrderResponse(jsonToByteArray(response.data)),
      authzUrl: response.data.authorizations[0],
      nonce: response.nonce,
      orderUrl: response.location,
    };
  }

  throw new Error('No createNewOrder-data received');
};

export interface FinalizeOrderParams {
  connection: AcmeService;
  identity: WireE2eIdentity;
  nonce: Nonce;
  orderUrl: OrderUrl;
}
export const finalizeOrder = async ({identity, nonce, orderUrl, connection}: FinalizeOrderParams) => {
  const statusReqBody = identity.checkOrderRequest(orderUrl, nonce);
  const statusResponse = await connection.checkStatusOfOrder(orderUrl, statusReqBody);

  if (statusResponse?.data && !!statusResponse.data.status.length && !!statusResponse.nonce.length) {
    const finalizeUrl = identity.checkOrderResponse(jsonToByteArray(statusResponse.data));
    const finalizeReqBody = identity.finalizeRequest(statusResponse.nonce);
    const finalizeResponse = await connection.finalizeOrder(finalizeUrl, finalizeReqBody);

    if (finalizeResponse?.data && !!finalizeResponse.data.status.length && !!finalizeResponse.nonce.length) {
      const certificateUrl = identity.finalizeResponse(jsonToByteArray(finalizeResponse.data));

      return {
        certificateUrl,
        nonce: finalizeResponse.nonce,
      };
    }
    throw new Error('Error while finalizing order');
  }

  throw new Error('Error while checking status of order');
};
