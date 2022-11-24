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

import logdown from 'logdown';

import {errors as ProteusErrors} from '@wireapp/proteus';

import {generateDecryptionError} from './DecryptionErrorGenerator';
import {conversationOtrMessageAddEventMock} from './DecryptionErrorGenerator.mocks';

import {DecryptionError} from '../../../../errors/DecryptionError';

const logger = {
  warn: jest.fn(),
} as unknown as logdown.Logger;

describe('generateDecryptionError', () => {
  it('returns a ProteusError.DecryptError', () => {
    const error = generateDecryptionError(conversationOtrMessageAddEventMock, new Error(), logger);
    expect(error).toBeInstanceOf(DecryptionError);
  });
  it('return right error message for an unknown error', () => {
    const error = generateDecryptionError(conversationOtrMessageAddEventMock, new Error(), logger);
    expect(error.message).toBe('Unknown decryption error');
  });

  it('return right error message for DecryptError.OutdatedMessage', () => {
    const error = generateDecryptionError(
      conversationOtrMessageAddEventMock,
      new ProteusErrors.DecryptError.OutdatedMessage(),
      logger,
    );
    expect(error.message).toContain('is outdated or a duplicate');
  });

  it('return right error message for DecryptError.DuplicateMessage', () => {
    const error = generateDecryptionError(
      conversationOtrMessageAddEventMock,
      new ProteusErrors.DecryptError.DuplicateMessage(),
      logger,
    );
    expect(error.message).toContain('is outdated or a duplicate');
  });

  it('return right error message for DecryptError.RemoteIdentityChanged', () => {
    const error = generateDecryptionError(
      conversationOtrMessageAddEventMock,
      new ProteusErrors.DecryptError.RemoteIdentityChanged(),
      logger,
    );
    expect(error.message).toContain("Remote identity of client 'sender-id' ");
  });
  it('return right error message for DecryptError.InvalidMessage', () => {
    const error = generateDecryptionError(
      conversationOtrMessageAddEventMock,
      new ProteusErrors.DecryptError.InvalidMessage(),
      logger,
    );
    expect(error.message).toContain("Session with user 'user-id' (sender-id) is broken");
  });
  it('return right error message for DecryptError.InvalidSignature', () => {
    const error = generateDecryptionError(
      conversationOtrMessageAddEventMock,
      new ProteusErrors.DecryptError.InvalidSignature(),
      logger,
    );
    expect(error.message).toContain("Session with user 'user-id' (sender-id) is broken");
  });
});
