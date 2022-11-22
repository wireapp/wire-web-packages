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

import {APIClient} from '@wireapp/api-client/lib/APIClient';
import {PreKey} from '@wireapp/api-client/lib/auth';
import {
  Conversation,
  NewConversation,
  OTRRecipients,
  QualifiedOTRRecipients,
  QualifiedUserClients,
  UserClients,
} from '@wireapp/api-client/lib/conversation';
import {QualifiedId, QualifiedUserPreKeyBundleMap, UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';
import {Decoder} from 'bazinga64';
import logdown from 'logdown';

import {CoreCrypto} from '@wireapp/core-crypto';

import {
  AddUsersToProteusConversationParams,
  CreateProteusConversationParams,
  ProteusServiceConfig,
  SendProteusMessageParams,
} from './ProteusService.types';

import {MessageSendingState, SendResult} from '../../../conversation';
import {MessageService} from '../../../conversation/message/MessageService';
import {CryptographyService} from '../../../cryptography';
import {isQualifiedUserClients, isUserClients} from '../../../util';
import {preKeyBundleToUserClients} from '../../../util/preKeyBundleToUserClients';
import {EventHandlerResult} from '../../common.types';
import {EventHandlerParams, handleBackendEvent} from '../EventHandler';
<<<<<<< HEAD
import {createSession} from '../Utility/createSession';
import {getGenericMessageParams} from '../Utility/getGenericMessageParams';
import {isClearFromMismatch} from '../Utility/isClearFromMismatch';
import {constructSessionId} from '../Utility/SessionIdBuilder';
=======
>>>>>>> 2fcdea123 (test: extract extractEncryptedAndMissingFromBatchedPayload to separate module)

export class ProteusService {
  private readonly messageService: MessageService;
  private readonly logger = logdown('@wireapp/core/ProteusService');

  constructor(
    private readonly apiClient: APIClient,
    private readonly cryptographyService: CryptographyService,
    private readonly coreCryptoClient: CoreCrypto,
    private readonly config: ProteusServiceConfig,
  ) {
    this.messageService = new MessageService(this.apiClient, this);
  }

  public async handleEvent(params: Pick<EventHandlerParams, 'event' | 'source' | 'dryRun'>): EventHandlerResult {
    return handleBackendEvent({
      ...params,
      coreCryptoClient: this.coreCryptoClient,
      useQualifiedIds: this.config.useQualifiedIds,
      apiClient: this.apiClient,
    });
  }

  /**
   * Get the fingerprint of the local client.
   */
  public getLocalFingerprint() {
    return this.coreCryptoClient.proteusFingerprint();
  }

  public constructSessionId(userId: string | QualifiedId, clientId: string, domain?: string): string {
    return constructSessionId({clientId, userId, domain, useQualifiedIds: this.config.useQualifiedIds});
  }

  /**
   * Get the fingerprint of a remote client
   * @param userId ID of user
   * @param clientId ID of client
   * @param prekey A prekey can be given to create a session if it doesn't already exist.
   *   If not provided and the session doesn't exists it will fetch a new prekey from the backend
   */
  public async getRemoteFingerprint(userId: QualifiedId, clientId: string, prekey?: PreKey) {
    const sessionId = this.cryptographyService.constructSessionId(userId, clientId);
    const sessionExists = (await this.coreCryptoClient.proteusSessionExists(sessionId)) as unknown as boolean;
    if (!sessionExists) {
      await createSession({
        sessionId,
        userId,
        clientId,
        initialPrekey: prekey,
        apiClient: this.apiClient,
        coreCryptoClient: this.coreCryptoClient,
      });
    }
    return this.coreCryptoClient.proteusFingerprintRemote(sessionId);
  }

  /**
   * Create sessions for all the clients from given prekey bundle map.
   * @param prekeyBundleMap map of user IDs to client IDs
   * @param domain client domain
   */
  private async createSessionsFromPreKeys(
    prekeyBundleMap: UserPreKeyBundleMap,
    domain: string = '',
  ): Promise<string[]> {
    const sessions: string[] = [];

    for (const userId in prekeyBundleMap) {
      const userClients = prekeyBundleMap[userId];

      for (const clientId in userClients) {
        const prekey = userClients[clientId];

        if (!prekey) {
          this.logger.error(
            `A prekey for client ${clientId} of user ${userId}${
              domain ? ` on domain ${domain}` : ''
            } was not found, session won't be created.`,
          );
          break;
        }

        const sessionId = this.cryptographyService.constructSessionId(userId, clientId, domain);
        const prekeyBuffer = Decoder.fromBase64(prekey.key).asBytes;

        const sessionExists = (await this.coreCryptoClient.proteusSessionExists(sessionId)) as unknown as boolean;

        if (!sessionExists) {
          await this.coreCryptoClient.proteusSessionFromPrekey(sessionId, prekeyBuffer);
        }

        sessions.push(sessionId);
      }
    }

    return sessions;
  }

  /**
   * Create sessions for all the clients without domain assigned.
   * @param userClients map of user IDs containg the lists of clients
   * Note that this function uses deprecated endpoint ("/users/prekeys") under the hood.
   * Use createQualifiedSessions instead if possible.
   */
  private async createLegacySessions(userClients: UserClients): Promise<string[]> {
    const prekeyBundleMap = await this.apiClient.api.user.postMultiPreKeyBundles(userClients);
    const sessions = await this.createSessionsFromPreKeys(prekeyBundleMap);

    return sessions;
  }

  /**
   * Create sessions for the qualified clients.
   * @param userClientMap map of domain to (map of user IDs to client IDs)
   */
  private async createQualifiedSessions(userClientMap: QualifiedUserClients): Promise<string[]> {
    const prekeyBundleMap = await this.apiClient.api.user.postQualifiedMultiPreKeyBundles(userClientMap);

    const sessions: string[] = [];

    for (const domain in prekeyBundleMap) {
      const domainUsers = prekeyBundleMap[domain];

      const domainSessions = await this.createSessionsFromPreKeys(domainUsers, domain);
      sessions.push(...domainSessions);
    }

    return sessions;
  }

  /**
   * Create sessions for legacy/qualified clients (umberella function).
   * Will call createQualifiedSessions or createLegacySessions based on passed userClientMap.
   * @param userClientMap map of domain to (map of user IDs to client IDs) or map of user IDs containg the lists of clients
   */
  private async createSessions(userClientMap: UserClients | QualifiedUserClients): Promise<string[]> {
    if (isQualifiedUserClients(userClientMap)) {
      return await this.createQualifiedSessions(userClientMap);
    }

    return await this.createLegacySessions(userClientMap);
  }

  private async createSession(userId: QualifiedId, clientId: string, initialPrekey?: PreKey): Promise<void> {
    const sessionId = this.cryptographyService.constructSessionId(userId, clientId);

    const prekey = initialPrekey ?? (await this.getUserPrekey(userId, clientId)).prekey;
    const prekeyBuffer = Decoder.fromBase64(prekey.key).asBytes;
    return this.coreCryptoClient.proteusSessionFromPrekey(sessionId, prekeyBuffer);
  }

  private getUserPrekey(userId: QualifiedId, clientId: string) {
    return this.apiClient.api.user.getClientPreKey(userId, clientId);
  }

  public async createConversation({
    conversationData,
    otherUserIds,
  }: CreateProteusConversationParams): Promise<Conversation> {
    let payload: NewConversation;
    if (typeof conversationData === 'string') {
      const ids = typeof otherUserIds === 'string' ? [otherUserIds] : otherUserIds;

      payload = {
        name: conversationData,
        receipt_mode: null,
        users: ids ?? [],
      };
    } else {
      payload = conversationData;
    }

    return this.apiClient.api.conversation.postConversation(payload);
  }

  public async addUsersToConversation({conversationId, qualifiedUserIds}: AddUsersToProteusConversationParams) {
    return this.apiClient.api.conversation.postMembers(conversationId, qualifiedUserIds);
  }

  public async sendMessage({
    userIds,
    sendAsProtobuf,
    conversationId,
    nativePush,
    targetMode,
    payload,
    onClientMismatch,
  }: SendProteusMessageParams): Promise<SendResult> {
    const messageParams = await getGenericMessageParams({
      apiClient: this.apiClient,
      sendingClientId: this.apiClient.validatedClientId,
      conversationId,
      genericMessage: payload,
      useQualifiedIds: this.config.useQualifiedIds,
      options: {
        userIds,
        sendAsProtobuf,
        nativePush,
        targetMode,
        onClientMismatch,
      },
    });

    const {federated, sendingClientId, recipients, plainText, options} = messageParams;
    const response = federated
      ? await this.messageService.sendFederatedMessage(sendingClientId, recipients, plainText, {
          ...options,
          onClientMismatch: mismatch => onClientMismatch?.(mismatch, false),
        })
      : await this.messageService.sendMessage(sendingClientId, recipients, plainText, {
          ...options,
          sendAsProtobuf,
          onClientMismatch: mismatch => onClientMismatch?.(mismatch, false),
        });

    if (!response.errored) {
      if (!isClearFromMismatch(response)) {
        // We warn the consumer that there is a mismatch that did not prevent message sending
        await onClientMismatch?.(response, true);
      }
      this.logger.log(`Successfully sent Proteus message to conversation '${conversationId.id}'`);
    }

    return {
      id: payload.messageId,
      sentAt: response.time,
      state: response.errored ? MessageSendingState.CANCELLED : MessageSendingState.OUTGOING_SENT,
    };
  }

  public async encrypt(
    plainText: Uint8Array,
    users: UserPreKeyBundleMap | UserClients,
    domain: string = '',
  ): Promise<{missing: UserClients; encrypted: OTRRecipients<Uint8Array>}> {
    const {sessions, userClients} = await this.getSessionsAndClientsFromRecipients(users, domain);

    const payload = await this.coreCryptoClient.proteusEncryptBatched(sessions, plainText);

    return this.extractEncryptedAndMissingFromBatchedPayload(payload, userClients, domain);
  }

  private async getSessionsAndClientsFromRecipients(
    recipients: UserPreKeyBundleMap | UserClients,
    domain: string = '',
  ) {
    const userClients = isUserClients(recipients) ? recipients : preKeyBundleToUserClients(recipients);

    const userClientMap: QualifiedUserClients | UserClients = domain ? {[domain]: userClients} : userClients;

    const sessions = await this.createSessions(userClientMap);

    return {sessions, userClients};
  }

  private extractEncryptedAndMissingFromBatchedPayload(
    payload: Map<string, Uint8Array>,
    users: UserClients,
    domain: string = '',
  ): {missing: UserClients; encrypted: OTRRecipients<Uint8Array>} {
    const encrypted: OTRRecipients<Uint8Array> = {};
    const missing: UserClients = {};

    const userClientsArr = Object.entries(users);
    for (const [userId, clientIds] of userClientsArr) {
      for (const clientId of clientIds) {
        const sessionId = this.cryptographyService.constructSessionId(userId, clientId, domain);

        if (payload.has(sessionId)) {
          encrypted[userId] ||= {};
          encrypted[userId][clientId] = payload.get(sessionId)!;
        } else {
          missing[userId] ||= [];
          missing[userId].push(clientId);
        }
      }
    }

    return {encrypted, missing};
  }

  public async encryptQualified(
    plainText: Uint8Array,
    preKeyBundles: QualifiedUserPreKeyBundleMap | QualifiedUserClients,
  ): Promise<{missing: QualifiedUserClients; encrypted: QualifiedOTRRecipients}> {
    const qualifiedOTRRecipients: QualifiedOTRRecipients = {};
    const missing: QualifiedUserClients = {};

    for (const [domain, preKeyBundleMap] of Object.entries(preKeyBundles)) {
      const result = await this.encrypt(plainText, preKeyBundleMap, domain);
      qualifiedOTRRecipients[domain] = result.encrypted;
      missing[domain] = result.missing;
    }

    return {
      encrypted: qualifiedOTRRecipients,
      missing,
    };
  }
}
