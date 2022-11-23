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

import {ConversationOtrMessageAddEvent} from '@wireapp/api-client/lib/event';
import {CoreCrypto} from '@wireapp/core-crypto/platforms/web/corecrypto';

import {APIClient} from '@wireapp/api-client';

import {DecryptMessageParams, decryptOtrMessage} from './CryptMessages';
import * as Decrypt from './decrypt';

import * as CreateSession from '../Utility/createSession';

jest.mock('../Utility/createSession', () => ({
  createSession: jest.fn(),
}));
const mockedCreateSession = CreateSession as jest.Mocked<typeof CreateSession>;

jest.mock('./decrypt', () => ({
  decrypt: jest.fn().mockResolvedValue(new TextEncoder().encode('Hallo Welt')),
}));
const mockedDecrypt = Decrypt as jest.Mocked<typeof Decrypt>;

jest.mock('@wireapp/protocol-messaging', () => ({
  GenericMessage: {
    decode: jest.fn().mockReturnValue('decoded'),
  },
}));

const otrMessageMock = {
  conversation: 'b268bb9f-ac5e-4450-ad7d-044ed6b462e8',
  data: {
    data: '',
    recipient: 'e88154f611025a7f',
    sender: '149c77d9857d87fc',
    text: 'owABAaEAWCAh20Cn7JvIrV3qDPdbrDYVI3jD+k2LUECpQsbSI/lMSAJYwwKkABgtAaEAWCBlou0HPL9knGaRZY6gPw4jcZMgXMZNgDXXC9bB4MFS/gKhAKEAWCA3uSthhRGlC/v0KlXHASw0jqhFFaDDcAPkUebhMvPRbAOlAFCyENSM2b4VgIKDcqhDdNMMAQECAAOhAFgg92jhp2+YCu9bFRJykwuiDzjifgA8ynWt0Rr47M4TMBwEWDJBjEcmxvqNhEWk68nImm8i5IdLVb+vajsOHrHdyrH8o8BMOOBXj7bElPsn4WbNYfWheg==',
  },
  from: '36a353bb-fb43-48c1-b764-da38eafe11fa',
  qualified_conversation: {
    domain: 'staging.zinfra.io',
    id: 'b268bb9f-ac5e-4450-ad7d-044ed6b462e8',
  },
  qualified_from: {
    domain: 'staging.zinfra.io',
    id: '36a353bb-fb43-48c1-b764-da38eafe11fa',
  },
  time: '2022-11-23T12:49:23.209Z',
  type: 'conversation.otr-message-add',
} as ConversationOtrMessageAddEvent;

const decryptParams: DecryptMessageParams = {
  coreCryptoClient: {
    proteusSessionExists: jest.fn().mockResolvedValue(true),
  } as unknown as CoreCrypto,
  apiClient: {} as APIClient,
  otrMessage: otrMessageMock,
  useQualifiedIds: false,
};

describe('decryptOtrMessage', () => {
  it('throws an error when decryption fails', async () => {
    mockedDecrypt.decrypt.mockRejectedValueOnce(new Error('Decryption failed'));
    let error: {message: string} | undefined;
    try {
      await decryptOtrMessage(decryptParams);
    } catch (e) {
      error = e as {message: string};
    } finally {
      expect(error).toBeDefined();
      expect(error!.message).toBe('Unknown decryption error');
    }
  });

  it('should create a session when no session exists', async () => {
    const coreCryptoClient = {
      proteusSessionExists: jest.fn().mockResolvedValue(false),
    } as unknown as CoreCrypto;

    await decryptOtrMessage({...decryptParams, coreCryptoClient});

    expect(mockedCreateSession.createSession).toHaveBeenCalled();
  });

  it('should not create a session when a session exists', async () => {
    const coreCryptoClient = {
      proteusSessionExists: jest.fn().mockResolvedValue(true),
    } as unknown as CoreCrypto;

    await decryptOtrMessage({...decryptParams, coreCryptoClient});

    expect(mockedCreateSession.createSession).not.toHaveBeenCalled();
  });
});
