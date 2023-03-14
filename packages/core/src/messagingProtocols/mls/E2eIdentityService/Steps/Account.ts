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

import {WireE2eIdentity, AcmeDirectory} from '@wireapp/core-crypto/platforms/web/corecrypto';

import {AcmeConnectionService} from '../Connection';
import {Nonce} from '../E2eIdentityService.types';
import {jsonToByteArray} from '../Helper';

type CreateNewAccountParams = {
  nonce: Nonce;
  identity: WireE2eIdentity;
  connection: AcmeConnectionService;
  directory: AcmeDirectory;
};
type CreateNewAccountReturnValue = Promise<{account: Uint8Array; nonce: string}>;

export const createNewAccount = async ({
  nonce,
  connection,
  directory,
  identity,
}: CreateNewAccountParams): CreateNewAccountReturnValue => {
  const reqBody = identity.newAccountRequest(directory, nonce);
  const response = await connection.createNewAccount(directory.newAccount, reqBody);

  if (response?.account && !!response.account.status.length && !!response.nonce.length) {
    return {
      account: identity.newAccountResponse(jsonToByteArray(JSON.stringify(response.account))),
      nonce: response.nonce,
    };
  }

  throw new Error('No account-data received');
};
