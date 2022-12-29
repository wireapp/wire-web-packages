/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import {QualifiedId} from '@wireapp/api-client/lib/user';

import {DecryptionError} from '../../../../errors/DecryptionError';

type ErrorWithCode = Error & {code?: number};
const hasErrorCode = (error: any): ErrorWithCode => error && error.code;

export const ProteusErrors = {
  InvalidMessage: 201,
  RemoteIdentityChanged: 204,
  Unknown: 999,
} as const;

type ProteusErrorCode = typeof ProteusErrors[keyof typeof ProteusErrors];

const CoreCryptoErrorMapping: Record<string, ProteusErrorCode> = {
  InvalidMessage: ProteusErrors.InvalidMessage,
  RemoteIdentityChanged: ProteusErrors.RemoteIdentityChanged,
};

const mapCoreCryptoError = (error: any): ProteusErrorCode => {
  const code = hasErrorCode(error) ? error.code : CoreCryptoErrorMapping[error.message];
  return code ?? ProteusErrors.Unknown;
};

const getErrorMessage = (code: ProteusErrorCode, userId: QualifiedId, clientId: string): string => {
  const sender = `${userId.id} (${clientId})`;
  switch (code) {
    case ProteusErrors.InvalidMessage:
      return `Invalid message from ${sender}`;

    case ProteusErrors.RemoteIdentityChanged:
      return `Remote identity of ${sender} has changed`;

    case ProteusErrors.Unknown:
      return `Failed to decrypt message from ${sender} with unkown error`;

    default:
      return `Unhandled error code "${code}" from ${sender}`;
  }
};

type SenderInfo = {clientId: string; userId: QualifiedId};
export const generateDecryptionError = (senderInfo: SenderInfo, error: any): DecryptionError => {
  const {clientId: remoteClientId, userId} = senderInfo;

  const code = mapCoreCryptoError(error);
  const message = getErrorMessage(code, userId, remoteClientId);

  return new DecryptionError(message, code);
};