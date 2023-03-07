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

import {NewAcmeAuthz, NewAcmeOrder} from '@wireapp/core-crypto/platforms/web/corecrypto';

export type User = {
  displayName: string;
  handle: string;
  domain: string;
};
type Account = Uint8Array;
type Nonce = string;

export type CreateNewAccountReturnValue = Promise<{account: Uint8Array; nonce: string} | undefined>;

export interface CreateNewOrderParams {
  account: Account;
  nonce: Nonce;
}
export type CreateNewOrderReturnValue = Promise<{order: NewAcmeOrder; nonce: string; authzUrl: string} | undefined>;

export interface GetAuthorizationParams {
  account: Account;
  nonce: Nonce;
  authzUrl: string;
}
export type GetAuthorizationReturnValue = Promise<{authorization: NewAcmeAuthz; nonce: string} | undefined>;
