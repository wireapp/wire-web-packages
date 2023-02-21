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

import {CoreCrypto, WireE2eIdentity} from '@wireapp/core-crypto/platforms/web/corecrypto';
import logdown from 'logdown';

import {APIClient} from '@wireapp/api-client';

export class E2eIdentityService {
  private logger = logdown('@wireapp/core/E2EIdentityService');
  private identity: WireE2eIdentity | undefined;

  constructor(private readonly apiClient: APIClient, private readonly coreCryptoClient: CoreCrypto) {
    this.coreCryptoClient
      .newAcmeEnrollment()
      .then((identity: WireE2eIdentity) => {
        this.identity = identity;
      })
      .catch((error: Error) => {
        this.logger.error('Failed to create new identity', error);
      });
  }
}
