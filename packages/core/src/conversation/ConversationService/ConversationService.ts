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
  Conversation,
  DefaultConversationRoleName,
  MutedStatus,
  NewConversation,
  QualifiedUserClients,
  ConversationProtocol,
  RemoteConversations,
  PostMlsMessageResponse,
  MLSConversation,
  SUBCONVERSATION_ID,
  Subconversation,
  isMLS1to1Conversation,
} from '@wireapp/api-client/lib/conversation';
import {CONVERSATION_TYPING, ConversationMemberUpdateData} from '@wireapp/api-client/lib/conversation/data';
import {
  BackendEvent,
  CONVERSATION_EVENT,
  ConversationMLSMessageAddEvent,
  ConversationMLSWelcomeEvent,
  ConversationMemberLeaveEvent,
  ConversationOtrMessageAddEvent,
} from '@wireapp/api-client/lib/event';
import {BackendError, BackendErrorLabel} from '@wireapp/api-client/lib/http';
import {QualifiedId} from '@wireapp/api-client/lib/user';
import {XOR} from '@wireapp/commons/lib/util/TypeUtil';
import {Decoder} from 'bazinga64';

import {APIClient} from '@wireapp/api-client';
import {LogFactory, TypedEventEmitter} from '@wireapp/commons';
import {ConversationId, isMlsOrphanWelcomeError} from '@wireapp/core-crypto';
import {GenericMessage} from '@wireapp/protocol-messaging';

import {
  AddUsersParams,
  BaseCreateConversationResponse,
  KeyPackageClaimUser,
  SendMlsMessageParams,
  SendResult,
} from './ConversationService.types';

import {MessageTimer, MessageSendingState, RemoveUsersParams} from '../../conversation/';
import {MLSService, MLSServiceEvents} from '../../messagingProtocols/mls';
import {queueConversationRejoin} from '../../messagingProtocols/mls/conversationRejoinQueue';
import {isCoreCryptoMLSWrongEpochError} from '../../messagingProtocols/mls/MLSService/CoreCryptoMLSError';
import {getConversationQualifiedMembers, ProteusService} from '../../messagingProtocols/proteus';
import {
  AddUsersToProteusConversationParams,
  SendProteusMessageParams,
} from '../../messagingProtocols/proteus/ProteusService/ProteusService.types';
import {HandledEventPayload, HandledEventResult} from '../../notification';
import {CoreDatabase} from '../../storage/CoreDB';
import {isMLSConversation} from '../../util';
import {mapQualifiedUserClientIdsToFullyQualifiedClientIds} from '../../util/fullyQualifiedClientIdUtils';
import {isSendingMessage, sendMessage} from '../message/messageSender';
import {SubconversationService} from '../SubconversationService/SubconversationService';

type Events = {
  MLSConversationRecovered: {conversationId: QualifiedId};
  [MLSServiceEvents.MLS_EVENT_DISTRIBUTED]: {events: any; time: string};
};

export class ConversationService extends TypedEventEmitter<Events> {
  public readonly messageTimer: MessageTimer;
  private readonly logger = LogFactory.getLogger('@wireapp/core/ConversationService');

  constructor(
    private readonly apiClient: APIClient,
    private readonly proteusService: ProteusService,
    private readonly coreDatabase: CoreDatabase,
    private readonly groupIdFromConversationId: (
      conversationId: QualifiedId,
      subconversationId?: SUBCONVERSATION_ID,
    ) => Promise<string | undefined>,
    private readonly subconversationService: SubconversationService,
    private readonly isMLSConversationRecoveryEnabled: () => Promise<boolean>,
    private readonly _mlsService?: MLSService,
  ) {
    super();
    this.messageTimer = new MessageTimer();

    if (this._mlsService) {
      this.mlsService.on(MLSServiceEvents.MLS_EVENT_DISTRIBUTED, data => {
        this.emit(MLSServiceEvents.MLS_EVENT_DISTRIBUTED, data);
      });
    }
  }

  get mlsService(): MLSService {
    if (!this._mlsService) {
      throw new Error('Cannot do MLS operations on a non-mls environment');
    }
    return this._mlsService;
  }

  /**
   * Get a fresh list from backend of clients for all the participants of the conversation.
   * @fixme there are some case where this method is not enough to detect removed devices
   * @param {string} conversationId
   * @param {string} conversationDomain? - If given will send the message to the new qualified endpoint
   */
  public async fetchAllParticipantsClients(conversationId: QualifiedId): Promise<QualifiedUserClients> {
    const qualifiedMembers = await getConversationQualifiedMembers({
      apiClient: this.apiClient,
      conversationId,
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
   *
   * This method might fail with a `BackendsNotConnectedError` if there are users from not connected backends that are part of the payload
   *
   * @note Do not include yourself as the requestor
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/conversations/createGroupConversation
   *
   * @param conversationData Payload object for group creation
   * @returns Resolves when the conversation was created
   */
  public async createProteusConversation(conversationData: NewConversation) {
    return this.proteusService.createConversation(conversationData);
  }

  public async getConversation(conversationId: QualifiedId): Promise<Conversation> {
    return this.apiClient.api.conversation.getConversation(conversationId);
  }

  public async getMLSSelfConversation(): Promise<MLSConversation> {
    return this.apiClient.api.conversation.getMLSSelfConversation();
  }

  public async getConversations(conversationIds?: QualifiedId[]): Promise<RemoteConversations> {
    if (!conversationIds) {
      const conversationIdsToSkip = await this.coreDatabase.getAll('conversationBlacklist');
      return this.apiClient.api.conversation.getConversationList(conversationIdsToSkip);
    }
    return this.apiClient.api.conversation.getConversationsByQualifiedIds(conversationIds);
  }

  public async addUsersToProteusConversation(params: AddUsersToProteusConversationParams) {
    return this.proteusService.addUsersToConversation(params);
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
    return sendMessage(() => (isMLS(params) ? this.sendMLSMessage(params) : this.proteusService.sendMessage(params)));
  }

  public sendTypingStart(conversationId: QualifiedId): Promise<void> {
    return this.apiClient.api.conversation.postTyping(conversationId, {status: CONVERSATION_TYPING.STARTED});
  }

  public sendTypingStop(conversationId: QualifiedId): Promise<void> {
    return this.apiClient.api.conversation.postTyping(conversationId, {status: CONVERSATION_TYPING.STOPPED});
  }

  /**
   * Blacklists a conversation.
   * When conversations is blacklisted, it means that it will be completely ignored by a client, even though it does exist on backend and we're the conversation member.
   * @param conversationId id of the conversation to blacklist
   */
  public readonly blacklistConversation = async (conversationId: QualifiedId): Promise<void> => {
    await this.coreDatabase.put('conversationBlacklist', conversationId, conversationId.id);
  };

  /**
   * Removes a conversation from the blacklists.
   * @param conversationId id of the conversation to remove from the blacklist
   */
  public readonly removeConversationFromBlacklist = async (conversationId: QualifiedId): Promise<void> => {
    await this.coreDatabase.delete('conversationBlacklist', conversationId.id);
  };

  /**
   * returns the number of messages that are in the queue expecting to be sent
   */
  isSendingMessage(): boolean {
    return isSendingMessage();
  }

  public setConversationMutedStatus(
    conversationId: QualifiedId,
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
    conversationId: QualifiedId,
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
    conversationId: QualifiedId,
    userId: QualifiedId,
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

  /**
   * Will create a conversation on backend and register it to CoreCrypto once created
   * @param conversationData
   */
  public async createMLSConversation(
    conversationData: NewConversation,
    selfUserId: QualifiedId,
    selfClientId: string,
  ): Promise<BaseCreateConversationResponse> {
    const {qualified_users: qualifiedUsers = []} = conversationData;

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

    return this.establishMLSGroupConversation(groupId, qualifiedUsers, selfUserId, selfClientId, qualifiedId);
  }

  /**
   * Centralized handler for scenarios where an MLS conversation is detected as broken.
   * It resets the conversation and then invokes the provided callback so callers can retry
   * their original operation (e.g., re-adding/removing users, re-joining, etc.) with the new group id.
   *
   * Contract:
   * - input: conversationId to reset; callback invoked after reset with the new group id
   * - output: the value returned by the callback
   * - error: throws if reset fails or new group id is missing
   */
  private async handleBrokenMLSConversation<T>(
    conversationId: QualifiedId,
    afterReset: (newGroupId: string) => Promise<T>,
  ): Promise<T>;
  private async handleBrokenMLSConversation(conversationId: QualifiedId): Promise<undefined>;
  private async handleBrokenMLSConversation<T>(
    conversationId: QualifiedId,
    afterReset?: (newGroupId: string) => Promise<T>,
  ): Promise<T | undefined> {
    if (!(await this.isMLSConversationRecoveryEnabled())) {
      throw new Error('MLS conversation recovery is disabled');
    }
    const {
      conversation: {group_id: newGroupId},
    } = await this.resetMLSConversation(conversationId);
    if (!newGroupId) {
      const errorMessage = 'Tried to reset MLS conversation but no group_id found in response';
      this.logger.error(errorMessage, {conversationId});
      throw new Error(errorMessage);
    }
    if (afterReset) {
      return afterReset(newGroupId);
    }

    return undefined;
  }

  /**
   * Will create a conversation on backend and register it to CoreCrypto once created
   * @param conversationData
   */
  public async establishMLSGroupConversation(
    groupId: string,
    userIdsToAdd: QualifiedId[],
    selfUserId: QualifiedId,
    selfClientId: string,
    conversationQualifiedId: QualifiedId,
  ): Promise<BaseCreateConversationResponse> {
    const failures = await this.mlsService.registerConversation(groupId, userIdsToAdd.concat(selfUserId), {
      creator: {
        user: selfUserId,
        client: selfClientId,
      },
    });

    // We fetch the fresh version of the conversation created on backend with the newly added users
    const conversation = await this.apiClient.api.conversation.getConversation(conversationQualifiedId);

    return {
      conversation,
      failedToAdd: failures,
    };
  }

  private async sendMLSMessage(params: SendMlsMessageParams, shouldRetry = true): Promise<SendResult> {
    const {payload, groupId, conversationId} = params;
    const groupIdBytes = Decoder.fromBase64(groupId).asBytes;

    try {
      // immediately execute pending commits before sending the message
      await this.mlsService.commitPendingProposals(groupId, true, params);

      const encrypted = await this.mlsService.encryptMessage(
        new ConversationId(groupIdBytes),
        GenericMessage.encode(payload).finish(),
      );

      const response = await this.apiClient.api.conversation.postMlsMessage(encrypted);
      const sentAt = response.time?.length > 0 ? response.time : new Date().toISOString();

      const failedToSend =
        response?.failed || (response?.failed_to_send ?? []).length > 0
          ? {
              queued: response?.failed_to_send,
              failed: response?.failed,
            }
          : undefined;

      return {
        id: payload.messageId,
        sentAt,
        failedToSend,
        state: sentAt ? MessageSendingState.OUTGOING_SENT : MessageSendingState.CANCELED,
      };
    } catch (error) {
      this.logger.error('Failed to execute pending proposals', {error, groupId});

      if (!shouldRetry) {
        this.logger.warn("Tried to execute pending proposals but it's still failing after recovery", {
          error,
          groupId,
        });
        throw error;
      }

      if (MLSService.isBrokenMLSConversationError(error)) {
        this.logger.info('Failed to execute pending proposals because broken MLS conversation, triggering a reset', {
          error,
          groupId,
        });

        await this.handleBrokenMLSConversation(conversationId);
        return this.sendMLSMessage(params, false);
      }

      if (MLSService.isMLSStaleMessageError(error)) {
        this.logger.info(
          'Failed to execute pending proposals because of stale message, recovering by joining with external commit',
          {
            error,
            groupId,
          },
        );

        await this.recoverMLSGroupFromEpochMismatch(conversationId);
        return this.sendMLSMessage(params, false);
      }

      this.logger.error('Failed to send MLS message, error did not match any known patterns, rethrowing the error', {
        error,
        groupId,
      });
      throw error;
    }
  }

  /**
   * Will add users to existing MLS group by claiming their key packages and passing them to CoreCrypto.addClientsToConversation
   *
   * @param qualifiedUsers List of qualified user ids (with optional skipOwnClientId field - if provided we will not claim key package for this self client)
   * @param groupId Id of the group to which we want to add users
   * @param conversationId Id of the conversation to which we want to add users
   */
  public async addUsersToMLSConversation({
    qualifiedUsers,
    groupId,
    conversationId,
    shouldRetry = true,
  }: Required<AddUsersParams> & {shouldRetry?: boolean}): Promise<BaseCreateConversationResponse> {
    try {
      const exisitingClientIdsInGroup = await this.mlsService.getClientIdsInGroup(groupId);
      const conversation = await this.getConversation(conversationId);

      const {keyPackages, failures: keysClaimingFailures} = await this.mlsService.getKeyPackagesPayload(
        qualifiedUsers,
        exisitingClientIdsInGroup,
      );

      // We had cases where did not get any key packages, but still used core-crypto to call the backend (which results in failure).
      if (keyPackages && keyPackages.length > 0) {
        await this.mlsService.addUsersToExistingConversation(groupId, keyPackages);

        //We store the info when user was added (and key material was created), so we will know when to renew it
        await this.mlsService.resetKeyMaterialRenewal(groupId);
      }

      return {
        conversation,
        failedToAdd: keysClaimingFailures,
      };
    } catch (error) {
      if (MLSService.isBrokenMLSConversationError(error)) {
        if (!shouldRetry) {
          this.logger.warn("Tried to add users to MLS conversation but it's still broken after reset", error);
          throw error;
        }
        this.logger.warn("Tried to add users to MLS conversation but it's broken, resetting the conversation", error);
        return this.handleBrokenMLSConversation(conversationId, newGroupId =>
          this.addUsersToMLSConversation({qualifiedUsers, groupId: newGroupId, conversationId, shouldRetry: false}),
        );
      }
      throw error;
    }
  }

  public async removeUsersFromMLSConversation({
    groupId,
    conversationId,
    qualifiedUserIds,
    shouldRetry = true,
  }: RemoveUsersParams & {shouldRetry?: boolean}): Promise<Conversation> {
    try {
      const clientsToRemove = await this.apiClient.api.user.postListClients({qualified_users: qualifiedUserIds});

      const fullyQualifiedClientIds = mapQualifiedUserClientIdsToFullyQualifiedClientIds(
        clientsToRemove.qualified_user_map,
      );

      await this.mlsService.removeClientsFromConversation(groupId, fullyQualifiedClientIds);

      // key material gets updated after removing a user from the group, so we can reset last key update time value in the store
      await this.mlsService.resetKeyMaterialRenewal(groupId);

      return await this.getConversation(conversationId);
    } catch (error) {
      if (MLSService.isBrokenMLSConversationError(error)) {
        if (!shouldRetry) {
          this.logger.warn("Tried to remove users from MLS conversation but it's still broken after reset", error);
          throw error;
        }
        this.logger.info(
          "Tried to remove users from MLS conversation but it's broken, resetting the conversation",
          error,
        );
        return this.handleBrokenMLSConversation(conversationId, newGroupId =>
          this.removeUsersFromMLSConversation({
            groupId: newGroupId,
            conversationId,
            qualifiedUserIds,
            shouldRetry: false,
          }),
        );
      }

      throw error;
    }
  }

  public async joinByExternalCommit(conversationId: QualifiedId, shouldRetry = true): Promise<void> {
    try {
      await this.mlsService.joinByExternalCommit(() => this.apiClient.api.conversation.getGroupInfo(conversationId));
    } catch (error) {
      this.logger.warn(`Failed to join MLS conversation ${conversationId.id} via external commit`, error);
      if (MLSService.isBrokenMLSConversationError(error)) {
        this.logger.info('Resetting MLS conversation due to broken mls conversation error', error);
        if (!shouldRetry) {
          this.logger.warn("Tried to join MLS conversation but it's still broken after reset", error);
          throw error;
        }
        return this.handleBrokenMLSConversation(conversationId);
      }
      throw error;
    }
  }

  private async resetMLSConversation(conversationId: QualifiedId): Promise<BaseCreateConversationResponse> {
    this.logger.info(`Resetting MLS conversation with id ${conversationId.id}`);

    // STEP 1: Fetch the conversation to retrieve the group ID & epoch
    const conversation = await this.apiClient.api.conversation.getConversation(conversationId);
    const {group_id: groupId, epoch} = conversation;

    if (!groupId || !epoch) {
      const errorMessage = 'Could not find group id or epoch for the conversation';
      this.logger.error(errorMessage, {conversationId});
      throw new Error(errorMessage);
    }

    // STEP 2: Request backend to reset the conversation
    this.logger.info(`Requesting backend to reset the conversation (group_id: ${groupId}, epoch: ${String(epoch)})`);
    await this.apiClient.api.conversation.resetMLSConversation({
      epoch,
      groupId,
    });

    // STEP 3: fetch self user info
    this.logger.info(
      `Re-establishing the conversation by re-adding all members (conversation_id: ${conversationId.id})`,
    );
    const {validatedClientId: clientId, userId, domain} = this.apiClient;

    if (!userId || !domain) {
      const errorMessage = 'Could not find userId or domain of the self user';
      this.logger.error(errorMessage, {conversationId});
      throw new Error(errorMessage);
    }

    const selfUserQualifiedId = {id: userId, domain};

    // STEP 4: Fetch the updated conversation data from backend to retrieve the new group ID
    const updatedConversation = await this.apiClient.api.conversation.getConversation(conversationId);
    const {group_id: newGroupId, members} = updatedConversation;

    this.logger.info(`MLS conversation new group ID fetched from backend ${conversationId.id}`, {
      newGroupId,
    });

    if (!newGroupId || !clientId) {
      throw new Error(`Failed to recover MLS conversation: missing groupId (${newGroupId}), or clientId (${clientId})`);
    }

    const usersToReAdd = members.others.map(member => member.qualified_id).filter(userId => !!userId);

    // STEP 5: Re-establish the conversation by re-adding all members
    return await this.establishMLSGroupConversation(
      newGroupId,
      usersToReAdd,
      selfUserQualifiedId,
      clientId,
      conversationId,
    ).then(result => {
      this.logger.info(`Successfully reset MLS conversation`, {
        conversationId: conversationId.id,
        oldGroupId: groupId,
        newGroupId,
      });
      return result;
    });
  }

  /**
   * Will check if mls group exists locally.
   * @param groupId groupId of the conversation
   */
  public async mlsGroupExistsLocally(groupId: string) {
    return this.mlsService.conversationExists(groupId);
  }

  /**
   * Will check if mls group is established locally.
   * Group is established after the first commit was sent in the group and epoch number is at least 1.
   * @param groupId groupId of the conversation
   */
  public async isMLSGroupEstablishedLocally(groupId: string) {
    return this.mlsService.isConversationEstablished(groupId);
  }

  public async wipeMLSConversation(groupId: string): Promise<void> {
    return this.mlsService.wipeConversation(groupId);
  }

  private async matchesEpoch(groupId: string, backendEpoch: number): Promise<boolean> {
    const localEpoch = await this.mlsService.getEpoch(groupId);

    this.logger.debug(
      `Comparing conversation's (group_id: ${groupId}) local and backend epoch number: {local: ${String(
        localEpoch,
      )}, backend: ${backendEpoch}}`,
    );
    //corecrypto stores epoch number as BigInt, we're mapping both values to be sure comparison is valid
    return BigInt(localEpoch) === BigInt(backendEpoch);
  }

  public async handleConversationsEpochMismatch() {
    this.logger.warn(`There were some missed messages, handling possible epoch mismatch in MLS conversations.`);

    //fetch all the mls conversations from backend
    const conversations = await this.apiClient.api.conversation.getConversationList();
    const foundConversations = conversations.found || [];

    const mlsConversations = foundConversations.filter(isMLSConversation);

    //check all the established conversations' epoch with the core-crypto epoch
    for (const mlsConversation of mlsConversations) {
      await this.handleConversationEpochMismatch(mlsConversation);
    }
  }

  /**
   * Handles epoch mismatch in a subconversation.
   * @param subconversation - subconversation
   */
  private async handleSubconversationEpochMismatch(subconversation: Subconversation, parentGroupId: string) {
    const {
      parent_qualified_id: parentConversationId,
      group_id: groupId,
      epoch,
      subconv_id: subconversationId,
    } = subconversation;

    if (await this.hasEpochMismatch(groupId, epoch)) {
      this.logger.warn(
        `Subconversation "${subconversationId}" (parent id: ${parentConversationId.id}) was not established or its epoch number was out of date, joining via external commit`,
      );

      // We only support conference subconversations for now
      if (subconversationId !== SUBCONVERSATION_ID.CONFERENCE) {
        throw new Error('Unexpected subconversation id');
      }

      try {
        await this.subconversationService.joinConferenceSubconversation(parentConversationId, parentGroupId);
      } catch (error) {
        const message = `There was an error while handling epoch mismatch in MLS subconversation (id: ${parentConversationId.id}, subconv: ${subconversationId}):`;
        this.logger.error(message, error);
      }
    }
  }

  /**
   * Handles epoch mismatch in a MLS conversation.
   * @param mlsConversation - mls conversation
   */
  private async handleConversationEpochMismatch(
    remoteMlsConversation: MLSConversation,
    onSuccessfulRejoin?: () => void,
  ) {
    const {qualified_id: qualifiedId, group_id: groupId, epoch} = remoteMlsConversation;

    if (await this.hasEpochMismatch(groupId, epoch)) {
      this.logger.warn(
        `Conversation (id ${qualifiedId.id}) was not established or it's epoch number was out of date, joining via external commit`,
      );

      try {
        await this.joinByExternalCommit(qualifiedId);
        onSuccessfulRejoin?.();
      } catch (error) {
        const message = `There was an error while handling epoch mismatch in MLS conversation (id: ${qualifiedId.id}):`;
        this.logger.error(message, error);
      }
    }
  }

  /**
   * Handles epoch mismatch in a MLS group.
   * Compares the epoch of the local group with the epoch of the remote conversation.
   * If the epochs do not match, it will call onEpochMismatch callback.
   * @param groupId - id of the MLS group
   * @param epoch - epoch of the remote conversation
   * @param onEpochMismatch - callback to be called when epochs do not match
   */
  private async hasEpochMismatch(groupId: string, epoch: number) {
    const isEstablished = await this.mlsGroupExistsLocally(groupId);
    const doesEpochMatch = isEstablished && (await this.matchesEpoch(groupId, epoch));

    //if conversation is not established or epoch does not match -> try to rejoin
    return !isEstablished || !doesEpochMatch;
  }

  /**
   * Get a MLS 1:1-conversation with a given user.
   * @param userId - qualified user id
   */
  async getMLS1to1Conversation(userId: QualifiedId) {
    const conversation = await this.apiClient.api.conversation.getMLS1to1Conversation(userId);

    if (isMLS1to1Conversation(conversation)) {
      return conversation;
    }
    return {conversation};
  }

  /**
   * Will try registering mls 1:1 conversation adding the other user.
   * If it fails and the conversation is already established, it will try joining via external commit instead.
   *
   * @param mlsConversation - mls 1:1 conversation
   * @param selfUser - user and client ids of the self user
   * @param otherUserId - id of the other user
   */
  public readonly establishMLS1to1Conversation = async (
    groupId: string,
    selfUser: {user: QualifiedId; client: string},
    otherUserId: QualifiedId,
    shouldRetry = true,
  ): Promise<MLSConversation> => {
    this.logger.debug(`Trying to establish a MLS 1:1 conversation with user ${otherUserId.id}...`);

    // Before trying to register a group, check if the group is already established o backend.
    // If remote epoch is higher than 0, it means that the group was already established.
    // It's possible that we've already received a welcome message.

    const {conversation: mlsConversation, public_keys} = await this.getMLS1to1Conversation(otherUserId);

    if (mlsConversation.epoch > 0) {
      this.logger.debug(
        `Conversation (id ${mlsConversation.qualified_id.id}) is already established on backend, checking the local epoch...`,
      );

      const isMLSGroupEstablishedLocally = await this.isMLSGroupEstablishedLocally(groupId);

      // If group is already established locally, there's nothing more to do
      if (isMLSGroupEstablishedLocally) {
        this.logger.debug(`Conversation (id ${mlsConversation.qualified_id.id}) is already established locally.`);
        return mlsConversation;
      }

      // If local epoch is 0 it means that we've not received a welcome message
      // We try joining via external commit.
      this.logger.debug(
        `Conversation (id ${mlsConversation.qualified_id.id}) is not yet established locally, joining via external commit...`,
      );

      await this.joinByExternalCommit(mlsConversation.qualified_id);
      const {conversation: updatedMLSConversation} = await this.getMLS1to1Conversation(otherUserId);
      return updatedMLSConversation;
    }

    // If group is not established on backend,
    // we wipe the it locally (in case it exsits in the local store) and try to register it.
    await this.mlsService.wipeConversation(groupId);

    try {
      await this.mlsService.register1to1Conversation(groupId, otherUserId, selfUser, public_keys?.removal);

      this.logger.info(`Conversation (id ${mlsConversation.qualified_id.id}) established successfully.`);

      const {conversation: updatedMLSConversation} = await this.getMLS1to1Conversation(otherUserId);
      return updatedMLSConversation;
    } catch (error) {
      if (!shouldRetry) {
        this.logger.error(`Could not register MLS group with id ${groupId}: `, error);

        throw error;
      }

      this.logger.error(
        `Conversation (id ${mlsConversation.qualified_id.id}) is not established, retrying to establish it`,
      );
      return this.establishMLS1to1Conversation(groupId, selfUser, otherUserId, false);
    }
  };

  /**
   * Will try to register mls group by sending an empty commit to establish it.
   * After group was successfully established, it will try to add other users to the group.
   *
   * @param groupId - id of the MLS group
   * @param conversationId - id of the conversation
   * @param selfUserId - id of the self user
   * @param qualifiedUsers - list of qualified users to add to the group (should not include the self user)
   */
  public async tryEstablishingMLSGroup({
    groupId,
    conversationId,
    selfUserId,
    qualifiedUsers,
  }: {
    groupId: string;
    conversationId: QualifiedId;
    selfUserId: QualifiedId;
    qualifiedUsers: QualifiedId[];
  }): Promise<void> {
    try {
      const wasGroupEstablishedBySelfClient = await this.mlsService.tryEstablishingMLSGroup(groupId);

      if (!wasGroupEstablishedBySelfClient) {
        this.logger.debug('Group was not established by self client, skipping adding users to the group.');
        return;
      }

      this.logger.debug('Group was established by self client, adding other users to the group...');

      const usersToAdd: KeyPackageClaimUser[] = [
        ...qualifiedUsers,
        {...selfUserId, skipOwnClientId: this.apiClient.validatedClientId},
      ];

      const {conversation} = await this.addUsersToMLSConversation({
        conversationId,
        groupId,
        qualifiedUsers: usersToAdd,
      });

      const addedUsers = conversation.members.others;
      if (addedUsers.length > 0) {
        this.logger.debug(`Successfully added ${addedUsers} users to the group.`);
      } else {
        this.logger.debug('No other users were added to the group.');
      }
    } catch (error) {
      this.logger.error('Failed to establish MLS group', error);
      throw error;
    }
  }

  private async handleMLSMessageAddEvent(event: ConversationMLSMessageAddEvent): Promise<HandledEventPayload | null> {
    try {
      return await this.mlsService.handleMLSMessageAddEvent(event, this.groupIdFromConversationId);
    } catch (error) {
      if (isCoreCryptoMLSWrongEpochError(error)) {
        this.logger.warn(
          `Received message for the wrong epoch in conversation ${event.conversation}, handling epoch mismatch...`,
        );
        const {qualified_conversation: conversationId, subconv} = event;
        if (!conversationId) {
          throw new Error('Qualified conversation id is missing in the event');
        }

        void queueConversationRejoin(conversationId.id, () =>
          this.recoverMLSGroupFromEpochMismatch(conversationId, subconv),
        );
        return null;
      }
      throw error;
    }
  }

  private async recoverMLSGroupFromEpochMismatch(conversationId: QualifiedId, subconversationId?: SUBCONVERSATION_ID) {
    if (subconversationId) {
      const parentGroupId = await this.groupIdFromConversationId(conversationId);
      const subconversation = await this.apiClient.api.conversation.getSubconversation(
        conversationId,
        subconversationId,
      );

      if (!parentGroupId) {
        throw new Error('Could not find parent group id for the subconversation');
      }
      return this.handleSubconversationEpochMismatch(subconversation, parentGroupId);
    }

    const mlsConversation = await this.apiClient.api.conversation.getConversation(conversationId);

    if (!isMLSConversation(mlsConversation)) {
      throw new Error('Conversation is not an MLS conversation');
    }

    return this.handleConversationEpochMismatch(mlsConversation, () =>
      this.emit('MLSConversationRecovered', {conversationId: mlsConversation.qualified_id}),
    );
  }

  private async handleMLSWelcomeMessageEvent(event: ConversationMLSWelcomeEvent) {
    try {
      this.logger.info('Handling MLS welcome message event', {event});
      return await this.mlsService.handleMLSWelcomeMessageEvent(event, this.apiClient.validatedClientId);
    } catch (error) {
      this.logger.warn('Failed to handle MLS welcome message event', {event, error});
      if (isMlsOrphanWelcomeError(error)) {
        this.logger.warn('Received an orphan welcome message, trying to join the conversation via external commit');
        const {qualified_conversation: conversationId} = event;

        // Note that we don't care about a subconversation here, as the welcome message is always for the parent conversation.
        // Subconversations are always joined via external commit.

        if (!conversationId) {
          throw new Error('Qualified conversation id is missing in the event');
        }

        this.logger.warn(
          `Received an orphan welcome message, joining the conversation (${conversationId.id}) via external commit...`,
        );

        void queueConversationRejoin(conversationId.id, () => this.joinByExternalCommit(conversationId));
        return null;
      }

      throw error;
    }
  }

  private async handleOtrMessageAddEvent(event: ConversationOtrMessageAddEvent) {
    return this.proteusService.handleOtrMessageAddEvent(event);
  }

  private async isConversationBlacklisted(conversationId: string): Promise<boolean> {
    const foundEntry = await this.coreDatabase.get('conversationBlacklist', conversationId);
    return !!foundEntry;
  }

  /**
   * Will process one conversation event
   * @param event The backend event to process
   * @return Event handling status (if handled successfully also the decrypted payload and the raw event)
   */
  public async handleEvent(event: BackendEvent): Promise<HandledEventResult> {
    if ('conversation' in event) {
      const isBlacklisted = await this.isConversationBlacklisted(event.conversation);
      if (isBlacklisted) {
        this.logger.info(`Conversation ${event.conversation} is blacklisted, ignoring event ${event.type}`);
        return {status: 'ignored'};
      }
    }

    switch (event.type) {
      case CONVERSATION_EVENT.MLS_MESSAGE_ADD:
        return {status: 'handled', payload: await this.handleMLSMessageAddEvent(event)};
      case CONVERSATION_EVENT.MLS_WELCOME_MESSAGE:
        return {status: 'handled', payload: await this.handleMLSWelcomeMessageEvent(event)};
      case CONVERSATION_EVENT.OTR_MESSAGE_ADD:
        return {status: 'handled', payload: await this.handleOtrMessageAddEvent(event)};
    }

    return {status: 'unhandled'};
  }
}
