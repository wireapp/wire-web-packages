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

import type {QualifiedUserClients, UserClients} from '@wireapp/api-client/lib/conversation';
import type {UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';
import type {CoreCrypto} from '@wireapp/core-crypto/platforms/web/corecrypto';

import type {APIClient} from '@wireapp/api-client';
import type {Logger} from '@wireapp/commons';

import type {CryptographyService} from '../../../../../cryptography';
import {isUserClients} from '../../../../../util';
import {preKeyBundleToUserClients} from '../../../../../util/preKeyBundleToUserClients/preKeyBundleToUserClients';
import {createSessions} from '../createSessions';

interface GetSessionsAndClientsFromRecipientsProps {
  recipients: UserPreKeyBundleMap | UserClients;
  domain?: string;
  apiClient: APIClient;
  coreCryptoClient: CoreCrypto;
  cryptographyService: CryptographyService;
  logger?: Logger;
}

export const getSessionsAndClientsFromRecipients = async ({
  recipients,
  domain = '',
  apiClient,
  coreCryptoClient,
  cryptographyService,
  logger,
}: GetSessionsAndClientsFromRecipientsProps) => {
  const userClients = isUserClients(recipients) ? recipients : preKeyBundleToUserClients(recipients);

  const userClientMap: QualifiedUserClients | UserClients = domain ? {[domain]: userClients} : userClients;

  const sessions = await createSessions({
    userClientMap,
    apiClient,
    coreCryptoClient,
    cryptographyService,
    logger,
  });

  return {sessions, userClients};
};
