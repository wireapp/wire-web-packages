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

const CORE_CRYPTO_ERROR_NAMES = {
  MlsErrorConversationAlreadyExists: 'MlsErrorConversationAlreadyExists',
  DuplicateMessage: 'DuplicateMessage',
  BufferedFutureMessage: 'BufferedFutureMessage',
  MessageEpochTooOld: 'MessageEpochTooOld',
  SelfCommitIgnored: 'SelfCommitIgnored',
  UnmergedPendingGroup: 'UnmergedPendingGroup',
  StaleProposal: 'StaleProposal',
  StaleCommit: 'StaleCommit',
  Other: 'Other',
  SessionNotFound: 'SessionNotFound',
  RemoteIdentityChanged: 'RemoteIdentityChanged',
  WrongEpoch: 'WrongEpoch',
  OrphanWelcomeMessage: 'OrphanWelcomeMessage',
  MlsErrorUnmergedPendingGroup: 'MlsErrorUnmergedPendingGroup',
};

export const isCoreCryptoMLSWrongEpochError = (error: unknown): boolean => {
  return error instanceof Error && error.name === CORE_CRYPTO_ERROR_NAMES.WrongEpoch;
};

export const isCoreCryptoMLSConversationAlreadyExistsError = (error: unknown): boolean => {
  return error instanceof Error && error.name === CORE_CRYPTO_ERROR_NAMES.MlsErrorConversationAlreadyExists;
};

export const isCoreCryptoMLSOrphanWelcomeMessageError = (error: unknown): boolean => {
  return error instanceof Error && error.name === CORE_CRYPTO_ERROR_NAMES.OrphanWelcomeMessage;
};

const mlsDecryptionErrorNamesToIgnore: string[] = [
  CORE_CRYPTO_ERROR_NAMES.StaleCommit,
  CORE_CRYPTO_ERROR_NAMES.StaleProposal,
  CORE_CRYPTO_ERROR_NAMES.DuplicateMessage,
  CORE_CRYPTO_ERROR_NAMES.BufferedFutureMessage,
  CORE_CRYPTO_ERROR_NAMES.MlsErrorUnmergedPendingGroup,
];

export const shouldMLSDecryptionErrorBeIgnored = (error: unknown): error is Error => {
  return error instanceof Error && mlsDecryptionErrorNamesToIgnore.includes(error.name);
};
