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

import {AcmeConnectionService} from '../Connection';
import {Nonce, Account, User} from '../E2eIdentityService.types';
import {E2eClientId, jsonToByteArray} from '../Helper';

export interface CreateNewOrderParams {
  identity: WireE2eIdentity;
  account: Account;
  nonce: Nonce;
  expiryDays: number;
  e2eClientId: E2eClientId;
  user: User;
  directory: AcmeDirectory;
  connection: AcmeConnectionService;
}
export type CreateNewOrderReturnValue = Promise<{order: NewAcmeOrder; nonce: string; authzUrl: string}>;

export const createNewOrder = async ({
  account,
  nonce,
  e2eClientId,
  directory,
  expiryDays,
  identity,
  user,
  connection,
}: CreateNewOrderParams): CreateNewOrderReturnValue => {
  const {displayName, handle} = user;
  console.log(e2eClientId);
  const reqBody = identity.newOrderRequest(displayName, e2eClientId, handle, expiryDays, directory, account, nonce);

  const response = await connection.createNewOrder(directory.newOrder, reqBody);
  if (response?.data && !!response.data.status.length && !!response.nonce.length) {
    return {
      order: identity.newOrderResponse(jsonToByteArray(JSON.stringify(response.data))),
      authzUrl: response.data.authorizations[0],
      nonce: response.nonce,
    };
  }

  throw new Error('No order-data received');
};
