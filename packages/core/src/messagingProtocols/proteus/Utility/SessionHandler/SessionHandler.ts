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

import {QualifiedUserClients, UserClients} from '@wireapp/api-client/lib/conversation';
import {QualifiedId, UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';
import {CoreCrypto} from '@wireapp/core-crypto/platforms/web/corecrypto';
import {Logger} from 'logdown';

import {APIClient} from '@wireapp/api-client';

import {CryptographyService} from '../../../../cryptography';
import {isQualifiedUserClients, isUserClients} from '../../../../util';
import {createSessionsFromPreKeys, preKeyBundleToUserClients} from '../PrekeyHandler';

interface ConstructSessionIdParams {
  userId: string | QualifiedId;
  clientId: string;
  useQualifiedIds?: boolean;
  domain?: string;
}
const constructSessionId = ({userId, clientId, useQualifiedIds, domain}: ConstructSessionIdParams): string => {
  const id = typeof userId === 'string' ? userId : userId.id;
  const baseDomain = typeof userId === 'string' ? domain : userId.domain;
  const baseId = `${id}@${clientId}`;
  return baseDomain && useQualifiedIds ? `${baseDomain}@${baseId}` : baseId;
};

interface CreateSessionsBase {
  apiClient: APIClient;
  coreCryptoClient: CoreCrypto;
  cryptographyService: CryptographyService;
  logger?: Logger;
}

interface CreateLegacySessionsProps extends CreateSessionsBase {
  userClients: UserClients;
}

const createLegacySessions = async ({
  userClients,
  apiClient,
  coreCryptoClient,
  cryptographyService,
  logger,
}: CreateLegacySessionsProps): Promise<string[]> => {
  const preKeyBundleMap = await apiClient.api.user.postMultiPreKeyBundles(userClients);
  const sessions = await createSessionsFromPreKeys({
    preKeyBundleMap,
    coreCryptoClient,
    cryptographyService,
    logger,
  });

  return sessions;
};

interface CreateQualifiedSessionsProps extends CreateSessionsBase {
  userClientMap: QualifiedUserClients;
}

/**
 * Create sessions for the qualified clients.
 * @param {userClientMap} map of domain to (map of user IDs to client IDs)
 */
const createQualifiedSessions = async ({
  userClientMap,
  apiClient,
  coreCryptoClient,
  cryptographyService,
  logger,
}: CreateQualifiedSessionsProps): Promise<string[]> => {
  const prekeyBundleMap = await apiClient.api.user.postQualifiedMultiPreKeyBundles(userClientMap);

  const sessions: string[] = [];

  for (const domain in prekeyBundleMap) {
    const domainUsers = prekeyBundleMap[domain];

    const domainSessions = await createSessionsFromPreKeys({
      preKeyBundleMap: domainUsers,
      domain,
      coreCryptoClient,
      cryptographyService,
      logger,
    });
    sessions.push(...domainSessions);
  }

  return sessions;
};

interface CreateSessionsProps extends CreateSessionsBase {
  userClientMap: UserClients | QualifiedUserClients;
}

/**
 * Create sessions for legacy/qualified clients (umberella function).
 * Will call createQualifiedSessions or createLegacySessions based on passed userClientMap.
 * @param {userClientMap} map of domain to (map of user IDs to client IDs) or map of user IDs containg the lists of clients
 */
const createSessions = async ({
  userClientMap,
  apiClient,
  coreCryptoClient,
  cryptographyService,
  logger,
}: CreateSessionsProps): Promise<string[]> => {
  if (isQualifiedUserClients(userClientMap)) {
    return await createQualifiedSessions({userClientMap, apiClient, coreCryptoClient, cryptographyService, logger});
  }

  return await createLegacySessions({
    userClients: userClientMap,
    apiClient,
    coreCryptoClient,
    cryptographyService,
    logger,
  });
};

interface GetSessionsAndClientsFromRecipientsProps {
  recipients: UserPreKeyBundleMap | UserClients;
  domain?: string;
  apiClient: APIClient;
  coreCryptoClient: CoreCrypto;
  cryptographyService: CryptographyService;
  logger?: Logger;
}

const getSessionsAndClientsFromRecipients = async ({
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

export {createSessions, getSessionsAndClientsFromRecipients, constructSessionId};
