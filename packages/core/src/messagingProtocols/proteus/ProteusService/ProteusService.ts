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

import type {APIClient} from '@wireapp/api-client/lib/APIClient';
import type {PreKey} from '@wireapp/api-client/lib/auth';
import type {
  Conversation,
  NewConversation,
  OTRRecipients,
  QualifiedOTRRecipients,
  QualifiedUserClients,
  UserClients,
} from '@wireapp/api-client/lib/conversation';
import type {QualifiedId, QualifiedUserPreKeyBundleMap, UserPreKeyBundleMap} from '@wireapp/api-client/lib/user';
import logdown from 'logdown';

import type {CoreCrypto} from '@wireapp/core-crypto';

import {PrekeyGenerator} from './PrekeysGenerator';
import type {
  AddUsersToProteusConversationParams,
  CreateProteusConversationParams,
  ProteusServiceConfig,
  SendProteusMessageParams,
} from './ProteusService.types';

import {MessageSendingState, SendResult} from '../../../conversation';
import {MessageService} from '../../../conversation/message/MessageService';
import {CoreDatabase} from '../../../storage/CoreDB';
import type {EventHandlerResult} from '../../common.types';
import {EventHandlerParams, handleBackendEvent} from '../EventHandler';
import {getGenericMessageParams} from '../Utility/getGenericMessageParams';
import {isClearFromMismatch} from '../Utility/isClearFromMismatch';
import {buildEncryptedPayloads, constructSessionId, initSession, initSessions} from '../Utility/SessionHandler';

export class ProteusService {
  private readonly messageService: MessageService;
  private readonly logger = logdown('@wireapp/core/ProteusService');
  private readonly prekeyGenerator: PrekeyGenerator;

  constructor(
    private readonly apiClient: APIClient,
    private readonly coreCryptoClient: CoreCrypto,
    db: CoreDatabase,
    private readonly config: ProteusServiceConfig,
  ) {
    this.messageService = new MessageService(this.apiClient, this);
    this.prekeyGenerator = new PrekeyGenerator(coreCryptoClient, db);
  }

  public async handleEvent(params: Pick<EventHandlerParams, 'event' | 'source' | 'dryRun'>): EventHandlerResult {
    return handleBackendEvent({
      ...params,
      decryptMessage: (payload, userId, clientId) => this.decrypt(payload, userId, clientId),
    });
  }

  public init() {
    return this.coreCryptoClient.proteusInit();
  }

  public createClient(nbPrekeys: number) {
    return this.prekeyGenerator.generateInitialPrekeys(nbPrekeys);
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
    const sessionId = await initSession(
      {userId, clientId, initialPrekey: prekey},
      {coreCrypto: this.coreCryptoClient, apiClient: this.apiClient},
    );
    return this.coreCryptoClient.proteusFingerprintRemote(sessionId);
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

  private async decrypt(encryptedText: Uint8Array, userId: QualifiedId, clientId: string) {
    const sessionId = this.constructSessionId(userId, clientId);
    const sessionExists = (await this.coreCryptoClient.proteusSessionExists(sessionId)) as unknown as boolean;

    const decryptedMessage: Uint8Array = !sessionExists
      ? ((await this.coreCryptoClient.proteusSessionFromMessage(sessionId, encryptedText)) as unknown as Uint8Array) //TODO: fix types once defined in core-crypto
      : await this.coreCryptoClient.proteusDecrypt(sessionId, encryptedText);

    if (!sessionExists) {
      await this.coreCryptoClient.proteusSessionSave(sessionId);
      await this.prekeyGenerator.consumePrekey();
      this.logger.info(`Created a new session from message for session ID "${sessionId}" and decrypted the message`);
    } else {
      this.logger.info(`Decrypted message for session ID "${sessionId}"`);
    }

    return decryptedMessage;
  }

  public async encrypt(
    plainText: Uint8Array,
    recipients: UserPreKeyBundleMap | UserClients,
    domain: string = '',
  ): Promise<OTRRecipients<Uint8Array>> {
    const sessions = await initSessions({
      recipients,
      domain,
      apiClient: this.apiClient,
      coreCrypto: this.coreCryptoClient,
      logger: this.logger,
    });

    const payload = await this.coreCryptoClient.proteusEncryptBatched(sessions, plainText);

    return buildEncryptedPayloads(payload);
  }

  public async encryptQualified(
    plainText: Uint8Array,
    preKeyBundles: QualifiedUserPreKeyBundleMap | QualifiedUserClients,
  ): Promise<QualifiedOTRRecipients> {
    const qualifiedOTRRecipients: QualifiedOTRRecipients = {};

    for (const [domain, preKeyBundleMap] of Object.entries(preKeyBundles)) {
      const result = await this.encrypt(plainText, preKeyBundleMap, domain);
      qualifiedOTRRecipients[domain] = result;
    }

    return qualifiedOTRRecipients;
  }
}
