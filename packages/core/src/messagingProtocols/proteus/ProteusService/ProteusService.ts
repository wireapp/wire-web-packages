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
import {Conversation, NewConversation} from '@wireapp/api-client/lib/conversation';
import {QualifiedId} from '@wireapp/api-client/lib/user';
import logdown from 'logdown';

import {CoreCrypto} from '@wireapp/core-crypto';

import {
  AddUsersToProteusConversationParams,
  CreateProteusConversationParams,
  ProteusServiceConfig,
  SendProteusMessageParams,
} from './ProteusService.types';

import {PayloadBundleState, SendResult} from '../../../conversation';
import {MessageService} from '../../../conversation/message/MessageService';
import {CryptographyService} from '../../../cryptography';
import {EventHandlerResult} from '../../common.types';
import {decryptMessage} from '../CryptMessages';
import {DecryptionParams} from '../CryptMessages/CryptMessage.types';
import {EventHandlerParams, handleBackendEvent} from '../EventHandler';
import {isClearFromMismatch} from '../Utility';
import {createSession} from '../Utility/createSession';
import {getGenericMessageParams} from '../Utility/getGenericMessageParams';

export class ProteusService {
  private readonly messageService: MessageService;
  private readonly logger = logdown('@wireapp/core/messagingProtocols/proteus/ProteusService');

  constructor(
    private readonly apiClient: APIClient,
    private readonly cryptographyService: CryptographyService,
    private readonly coreCryptoClient: CoreCrypto,
    private readonly config: ProteusServiceConfig,
  ) {
    this.messageService = new MessageService(this.apiClient, this.cryptographyService);
  }

  public async handleEvent(params: Pick<EventHandlerParams, 'event' | 'source' | 'dryRun'>): EventHandlerResult {
    return handleBackendEvent({
      ...params,
      cryptographyService: this.cryptographyService,
      coreCryptoClient: this.coreCryptoClient,
      useQualifiedIds: this.config.useQualifiedIds,
      apiClient: this.apiClient,
    });
  }

  public decryptMessage = (params: Omit<DecryptionParams, 'coreCryptoClient'>) => {
    return decryptMessage({...params, coreCryptoClient: this.coreCryptoClient});
  };

  /**
   * Get the fingerprint of the local client.
   */
  public getLocalFingerprint() {
    return this.coreCryptoClient.proteusFingerprint();
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
      state: response.errored ? PayloadBundleState.CANCELLED : PayloadBundleState.OUTGOING_SENT,
    };
  }
}
