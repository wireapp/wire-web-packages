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

import {
  MessageSendingStatus,
  Conversation,
  DefaultConversationRoleName,
  MutedStatus,
  NewConversation,
  QualifiedUserClients,
  UserClients,
  ClientMismatch,
  ConversationProtocol,
} from '@wireapp/api-client/lib/conversation';
import {CONVERSATION_TYPING, ConversationMemberUpdateData} from '@wireapp/api-client/lib/conversation/data';
import {ConversationMemberLeaveEvent} from '@wireapp/api-client/lib/event';
import {QualifiedId} from '@wireapp/api-client/lib/user';
import {XOR} from '@wireapp/commons/lib/util/TypeUtil';
import {Decoder} from 'bazinga64';

import {APIClient} from '@wireapp/api-client';
import {ConversationConfiguration, ExternalProposalType} from '@wireapp/core-crypto';
import {GenericMessage} from '@wireapp/protocol-messaging';

import {AddUsersParams, MLSReturnType, SendMlsMessageParams, SendResult} from './ConversationService.types';

import {MessageTimer, PayloadBundleState, RemoveUsersParams} from '../../conversation/';
import {CryptographyService} from '../../cryptography/';
import {decryptAsset} from '../../cryptography/AssetCryptography';
import {
  getConversationQualifiedMembers,
  MLSService,
  optionalToUint8Array,
  ProteusService,
  SendProteusMessageParams,
} from '../../messagingProtocols';
import {mapQualifiedUserClientIdsToFullyQualifiedClientIds} from '../../util/fullyQualifiedClientIdUtils';
import {RemoteData} from '../content';
import {sendMessage} from '../message/messageSender';
import {MessageService} from '../message/MessageService';

export class ConversationService {
  public readonly messageTimer: MessageTimer;
  private readonly messageService: MessageService;

  constructor(
    private readonly apiClient: APIClient,
    cryptographyService: CryptographyService,
    private readonly config: {useQualifiedIds?: boolean},
    private readonly mlsService: MLSService,
    private readonly proteusService: ProteusService,
  ) {
    this.messageTimer = new MessageTimer();
    this.messageService = new MessageService(this.apiClient, cryptographyService);
  }

  /**
   * Get a fresh list from backend of clients for all the participants of the conversation.
   * This is a hacky way of getting all the clients for a conversation.
   * The idea is to send an empty message to the backend to absolutely no users and let backend reply with a mismatch error.
   * We then get the missing members in the mismatch, that is our fresh list of participants' clients.
   *
   * @deprecated
   * @param {string} conversationId
   * @param {string} conversationDomain? - If given will send the message to the new qualified endpoint
   */
  public getAllParticipantsClients(conversationId: QualifiedId): Promise<UserClients | QualifiedUserClients> {
    const sendingClientId = this.apiClient.validatedClientId;
    const recipients = {};
    const text = new Uint8Array();
    return new Promise(async resolve => {
      const onClientMismatch = (mismatch: ClientMismatch | MessageSendingStatus) => {
        resolve(mismatch.missing);
        // When the mismatch happens, we ask the messageService to cancel the sending
        return false;
      };

      if (conversationId.domain && this.config.useQualifiedIds) {
        await this.messageService.sendFederatedMessage(sendingClientId, recipients, text, {
          conversationId,
          onClientMismatch,
          reportMissing: true,
        });
      } else {
        await this.messageService.sendMessage(sendingClientId, recipients, text, {
          conversationId,
          onClientMismatch,
        });
      }
    });
  }

  /**
   * Get a fresh list from backend of clients for all the participants of the conversation.
   * @fixme there are some case where this method is not enough to detect removed devices
   * @param {string} conversationId
   * @param {string} conversationDomain? - If given will send the message to the new qualified endpoint
   */
  public async fetchAllParticipantsClients(
    conversationId: string,
    conversationDomain?: string,
  ): Promise<UserClients | QualifiedUserClients> {
    const qualifiedMembers = await getConversationQualifiedMembers({
      apiClient: this.apiClient,
      conversationId: conversationDomain ? {id: conversationId, domain: conversationDomain} : conversationId,
    });
    const allClients = await this.apiClient.api.user.postListClients({qualified_users: qualifiedMembers});
    const qualifiedUserClients: QualifiedUserClients = {};

    Object.entries(allClients.qualified_user_map).map(([domain, userClientMap]) =>
      Object.entries(userClientMap).map(async ([userId, clients]) => {
        qualifiedUserClients[domain] ||= {};
        qualifiedUserClients[domain][userId] = clients.map(client => client.id);
      }),
    );

    return qualifiedUserClients;
  }

  /**
   * Create a group conversation.
   * @param  {string} name
   * @param  {string|string[]} otherUserIds
   * @deprecated
   * @returns Promise
   */
  public createProteusConversation(name: string, otherUserIds: string | string[]): Promise<Conversation>;
  /**
   * Create a group conversation.
   *
   * @note Do not include yourself as the requestor
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/createGroupConversation
   *
   * @param conversationData Payload object for group creation
   * @returns Resolves when the conversation was created
   */
  public createProteusConversation(conversationData: NewConversation): Promise<Conversation>;
  public createProteusConversation(
    conversationData: NewConversation | string,
    otherUserIds?: string | string[],
  ): Promise<Conversation> {
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

  public async getConversations(conversationId: string): Promise<Conversation>;
  public async getConversations(conversationIds?: string[]): Promise<Conversation[]>;
  public async getConversations(conversationIds?: string | string[]): Promise<Conversation[] | Conversation> {
    if (!conversationIds || !conversationIds.length) {
      return this.apiClient.api.conversation.getAllConversations();
    }
    if (typeof conversationIds === 'string') {
      return this.apiClient.api.conversation.getConversation(conversationIds);
    }
    return this.apiClient.api.conversation.getConversationsByIds(conversationIds);
  }

  public async getAsset({assetId, assetToken, otrKey, sha256}: RemoteData): Promise<Uint8Array> {
    const request = this.apiClient.api.asset.getAssetV3(assetId, assetToken);
    const encryptedBuffer = (await request.response).buffer;

    return decryptAsset({
      cipherText: new Uint8Array(encryptedBuffer),
      keyBytes: otrKey,
      sha256: sha256,
    });
  }

  public async getUnencryptedAsset(assetId: string, assetToken?: string): Promise<ArrayBuffer> {
    const request = await this.apiClient.api.asset.getAssetV3(assetId, assetToken);
    return (await request.response).buffer;
  }

  public async addUsersToProteusConversation({conversationId, qualifiedUserIds}: Omit<AddUsersParams, 'groupId'>) {
    return this.apiClient.api.conversation.postMembers(conversationId, qualifiedUserIds);
  }

  public async removeUserFromConversation(
    conversationId: QualifiedId,
    userId: QualifiedId,
  ): Promise<ConversationMemberLeaveEvent> {
    return this.apiClient.api.conversation.deleteMember(conversationId, userId);
  }

  /**
   * Sends a message to a conversation
   * @return resolves with the sending status
   */
  public async send(params: XOR<SendMlsMessageParams, SendProteusMessageParams>): Promise<SendResult> {
    function isMLS(params: SendProteusMessageParams | SendMlsMessageParams): params is SendMlsMessageParams {
      return params.protocol === ConversationProtocol.MLS;
    }
    return sendMessage(() =>
      isMLS(params) ? this.sendMLSMessage(params) : this.proteusService.sendProteusMessage(params),
    );
  }

  public sendTypingStart(conversationId: string): Promise<void> {
    return this.apiClient.api.conversation.postTyping(conversationId, {status: CONVERSATION_TYPING.STARTED});
  }

  public sendTypingStop(conversationId: string): Promise<void> {
    return this.apiClient.api.conversation.postTyping(conversationId, {status: CONVERSATION_TYPING.STOPPED});
  }

  public setConversationMutedStatus(
    conversationId: string,
    status: MutedStatus,
    muteTimestamp: number | Date,
  ): Promise<void> {
    if (typeof muteTimestamp === 'number') {
      muteTimestamp = new Date(muteTimestamp);
    }

    const payload: ConversationMemberUpdateData = {
      otr_muted_ref: muteTimestamp.toISOString(),
      otr_muted_status: status,
    };

    return this.apiClient.api.conversation.putMembershipProperties(conversationId, payload);
  }

  public toggleArchiveConversation(
    conversationId: string,
    archived: boolean,
    archiveTimestamp: number | Date = new Date(),
  ): Promise<void> {
    if (typeof archiveTimestamp === 'number') {
      archiveTimestamp = new Date(archiveTimestamp);
    }

    const payload: ConversationMemberUpdateData = {
      otr_archived: archived,
      otr_archived_ref: archiveTimestamp.toISOString(),
    };

    return this.apiClient.api.conversation.putMembershipProperties(conversationId, payload);
  }

  public setMemberConversationRole(
    conversationId: string,
    userId: string,
    conversationRole: DefaultConversationRoleName | string,
  ): Promise<void> {
    return this.apiClient.api.conversation.putOtherMember(userId, conversationId, {
      conversation_role: conversationRole,
    });
  }

  /**
   *   ###############################################
   *   ################ MLS Functions ################
   *   ###############################################
   */

  public async createMLSConversation(conversationData: NewConversation): Promise<MLSReturnType> {
    /**
     * @note For creating MLS conversations the users & qualified_users
     * field must be empty as backend is not aware which users
     * are in a MLS conversation because of the MLS architecture.
     */
    const newConversation = await this.apiClient.api.conversation.postConversation({
      ...conversationData,
      users: undefined,
      qualified_users: undefined,
    });
    const {group_id: groupId, qualified_id: qualifiedId} = newConversation;
    if (!groupId) {
      throw new Error('No group_id found in response which is required for creating MLS conversations.');
    }

    const groupIdBytes = Decoder.fromBase64(groupId).asBytes;
    const {qualified_users: qualifiedUsers = [], selfUserId} = conversationData;
    if (!selfUserId) {
      throw new Error('You need to pass self user qualified id in order to create an MLS conversation');
    }

    const mlsKeys = (await this.apiClient.api.client.getPublicKeys()).removal;
    const mlsKeyBytes = Object.values(mlsKeys).map((key: string) => Decoder.fromBase64(key).asBytes);
    const config: ConversationConfiguration = {
      externalSenders: mlsKeyBytes,
      ciphersuite: 1, // TODO: Use the correct ciphersuite enum.
    };

    await this.mlsService.createConversation(groupIdBytes, config);

    const coreCryptoKeyPackagesPayload = await this.mlsService.getKeyPackagesPayload([
      {
        id: selfUserId.id,
        domain: selfUserId.domain,
        /**
         * we should skip fetching key packages for current self client,
         * it's already added by the backend on the group creation time
         */
        skipOwn: conversationData.creator_client,
      },
      ...qualifiedUsers,
    ]);

    let response;
    if (coreCryptoKeyPackagesPayload.length !== 0) {
      response = await this.mlsService.addUsersToExistingConversation(groupIdBytes, coreCryptoKeyPackagesPayload);
    }

    // We schedule a key material renewal
    this.mlsService.scheduleKeyMaterialRenewal(groupId);

    // We fetch the fresh version of the conversation created on backend with the newly added users
    const conversation = await this.getConversations(qualifiedId.id);

    return {
      events: response?.events || [],
      conversation,
    };
  }

  private async sendMLSMessage({payload, groupId}: SendMlsMessageParams): Promise<SendResult> {
    const groupIdBytes = Decoder.fromBase64(groupId).asBytes;

    // immediately execute pending commits before sending the message
    await this.mlsService.commitPendingProposals({groupId});

    const encrypted = await this.mlsService.encryptMessage(groupIdBytes, GenericMessage.encode(payload).finish());

    let sentAt: string = '';
    try {
      const {time = ''} = await this.apiClient.api.conversation.postMlsMessage(encrypted);
      sentAt = time?.length > 0 ? time : new Date().toISOString();
    } catch {}

    return {
      id: payload.messageId,
      sentAt,
      state: sentAt ? PayloadBundleState.OUTGOING_SENT : PayloadBundleState.CANCELLED,
    };
  }

  public async addUsersToMLSConversation({
    qualifiedUserIds,
    groupId,
    conversationId,
  }: Required<AddUsersParams>): Promise<MLSReturnType> {
    const groupIdBytes = Decoder.fromBase64(groupId).asBytes;
    const coreCryptoKeyPackagesPayload = await this.mlsService.getKeyPackagesPayload([...qualifiedUserIds]);
    const response = await this.mlsService.addUsersToExistingConversation(groupIdBytes, coreCryptoKeyPackagesPayload);
    const conversation = await this.getConversations(conversationId.id);

    //We store the info when user was added (and key material was created), so we will know when to renew it
    this.mlsService.resetKeyMaterialRenewal(groupId);
    return {
      events: response?.events || [],
      conversation,
    };
  }

  public async removeUsersFromMLSConversation({
    groupId,
    conversationId,
    qualifiedUserIds,
  }: RemoveUsersParams): Promise<MLSReturnType> {
    const groupIdBytes = Decoder.fromBase64(groupId).asBytes;

    const clientsToRemove = await this.apiClient.api.user.postListClients({qualified_users: qualifiedUserIds});

    const fullyQualifiedClientIds = mapQualifiedUserClientIdsToFullyQualifiedClientIds(
      clientsToRemove.qualified_user_map,
    );

    const messageResponse = await this.mlsService.removeClientsFromConversation(groupIdBytes, fullyQualifiedClientIds);

    //key material gets updated after removing a user from the group, so we can reset last key update time value in the store
    this.mlsService.resetKeyMaterialRenewal(groupId);

    const conversation = await this.getConversations(conversationId.id);

    return {
      events: messageResponse?.events || [],
      conversation,
    };
  }

  public async joinByExternalCommit(conversationId: QualifiedId) {
    return this.mlsService.joinByExternalCommit(() => this.apiClient.api.conversation.getGroupInfo(conversationId));
  }

  /**
   * Will send an external proposal for the current device to join a specific conversation.
   * In order for the external proposal to be sent correctly, the underlying mls conversation needs to be in a non-established state
   * @param groupId The conversation to join
   * @param epoch The current epoch of the local conversation
   */
  public async sendExternalJoinProposal(groupId: string, epoch: number) {
    return sendMessage(async () => {
      const groupIdBytes = Decoder.fromBase64(groupId).asBytes;
      const externalProposal = await this.mlsService.newExternalProposal(ExternalProposalType.Add, {
        epoch,
        conversationId: groupIdBytes,
      });
      await this.apiClient.api.conversation.postMlsMessage(
        //@todo: it's temporary - we wait for core-crypto fix to return the actual Uint8Array instead of regular array
        optionalToUint8Array(externalProposal),
      );

      //We store the info when user was added (and key material was created), so we will know when to renew it
      this.mlsService.resetKeyMaterialRenewal(groupId);
    });
  }

  public async isMLSConversationEstablished(groupId: string) {
    const groupIdBytes = Decoder.fromBase64(groupId).asBytes;
    return this.mlsService.conversationExists(groupIdBytes);
  }

  public async wipeMLSConversation(groupId: Uint8Array): Promise<void> {
    return this.mlsService.wipeConversation(groupId);
  }
}
