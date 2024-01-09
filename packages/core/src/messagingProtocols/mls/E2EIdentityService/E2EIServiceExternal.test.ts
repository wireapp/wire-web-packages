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

import {Ciphersuite, CoreCrypto, WireIdentity} from '@wireapp/core-crypto';

import {E2EIServiceExternal} from './E2EIServiceExternal';

import {ClientService} from '../../../client';
import {getUUID} from '../../../test/PayloadHelper';

function buildE2EIService() {
  const coreCrypto = {
    getUserIdentities: jest.fn(),
    getClientIds: jest.fn().mockResolvedValue([]),
  } as unknown as jest.Mocked<CoreCrypto>;

  const clientService = {} as jest.Mocked<ClientService>;

  return [
    new E2EIServiceExternal(coreCrypto, clientService, Ciphersuite.MLS_128_DHKEMP256_AES128GCM_SHA256_P256),
    {coreCrypto},
  ] as const;
}

function generateCoreCryptoIdentity({
  userId,
  status = 'Valid',
  deviceId = getUUID(),
}: {
  userId: string;
  status?: string;
  deviceId?: string;
}) {
  return {
    client_id: `${userId}:${deviceId}@elna.wire.link`,
    handle: 'adrian_wire2@elna.wire.link',
    display_name: 'Adrian Weiss 2',
    domain: 'elna.wire.link',
    certificate:
      '-----BEGIN CERTIFICATE-----\nMIICRTCCAeqgAwIBAgIQcpcbKbgHLM5qoB7xgxm6BTAKBggqhkjOPQQDAjAuMSww\nKgYDVQQDEyNlbG5hLndpcmUubGluayBFMkVJIEludGVybWVkaWF0ZSBDQTAeFw0y\nMzExMjIxMTIwMDVaFw0yMzExMjQxMTIwMDVaMDIxFzAVBgNVBAoTDmVsbmEud2ly\nZS5saW5rMRcwFQYDVQQDEw5BZHJpYW4gV2Vpc3MgMjAqMAUGAytlcAMhAMwP5B9X\nwanLL7JUmHEc1SJYAvHUvMnL1MS/D4CK3JaMo4IBEzCCAQ8wDgYDVR0PAQH/BAQD\nAgeAMB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjAdBgNVHQ4EFgQUrIPC\nem20zAl1ybZqXm2LkvD2U1swHwYDVR0jBBgwFoAU5bQTjX1Ps09suTYe4tzXUKgl\nN9YwdwYDVR0RBHAwboYpaW06d2lyZWFwcD0lNDBhZHJpYW5fd2lyZTJAZWxuYS53\naXJlLmxpbmuGQWltOndpcmVhcHA9U0tIRHNFc09TODJUcldUSE5Fc1ZOQS9lYjll\nMDM4NjE4MzllOWRhQGVsbmEud2lyZS5saW5rMCUGDCsGAQQBgqRkxihAAQQVMBMC\nAQYEDGRlZmF1bHR0ZWFtcwQAMAoGCCqGSM49BAMCA0kAMEYCIQCQQHVAd6wjp2A+\nVvKIXu4oVlCMZkAUATU5bXY4njvapwIhAO8rION7Mz5rSjixJsdEL8E+HHsNvCax\ndjrSL0FL9SM6\n-----END CERTIFICATE-----\n',
    status,
    thumbprint: 'mNyAo88vAF5s7v0UWBNxlQKxP3dfT91A-4PbuzEA5uQ',
  } as unknown as WireIdentity;
}

const groupId = 'AAEAAhJrE+8TbFFUqiagedTYDUMAZWxuYS53aXJlLmxpbms=';

describe('E2EIServiceExternal', () => {
  describe('getUsersIdentities', () => {
    it('returns the user identities', async () => {
      const [service, {coreCrypto}] = buildE2EIService();
      const user1 = {domain: 'elna.wire.link', id: '48a1c3b0-4b0e-4bcd-93ad-64c7344b1534'};
      const user2 = {domain: 'elna.wire.link', id: 'b7d287e4-7bbd-40e0-a550-6b18dcaf5f31'};
      const userIds = [user1, user2];

      coreCrypto.getUserIdentities.mockResolvedValue(
        new Map([
          [user1.id, [generateCoreCryptoIdentity({userId: user1.id}), generateCoreCryptoIdentity({userId: user1.id})]],
          [user2.id, [generateCoreCryptoIdentity({userId: user2.id})]],
        ]),
      );

      const userIdentities = await service.getUsersIdentities(groupId, userIds);

      expect(userIdentities.get(user1.id)).toHaveLength(2);
      expect(userIdentities.get(user2.id)).toHaveLength(1);
    });

    it('returns MLS basic devices with empty identity', async () => {
      const [service, {coreCrypto}] = buildE2EIService();
      const user1 = {domain: 'elna.wire.link', id: '48a1c3b0-4b0e-4bcd-93ad-64c7344b1534'};
      const user2 = {domain: 'elna.wire.link', id: 'b7d287e4-7bbd-40e0-a550-6b18dcaf5f31'};
      const userIds = [user1, user2];

      const user1Identities = [
        generateCoreCryptoIdentity({userId: user1.id}),
        generateCoreCryptoIdentity({userId: user1.id}),
      ];
      const encoder = new TextEncoder();
      coreCrypto.getUserIdentities.mockResolvedValue(new Map([[user1.id, user1Identities]]));

      const allClients = [
        ...user1Identities.map(identity => (identity as any).client_id),
        `${user1.id}:74a50c1f4352b41f@elna.wire.link`,
        `${user2.id}:452cb4c65f0369a8@elna.wire.link`,
      ];
      coreCrypto.getClientIds.mockResolvedValue(allClients.map(clientId => encoder.encode(clientId)));

      const userIdentities = await service.getUsersIdentities(groupId, userIds);

      expect(userIdentities.get(user1.id)).toHaveLength(3);
      expect(userIdentities.get(user2.id)).toHaveLength(1);
    });
  });
});
