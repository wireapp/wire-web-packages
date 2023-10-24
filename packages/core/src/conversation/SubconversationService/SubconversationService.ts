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

import {SUBCONVERSATION_ID, Subconversation} from '@wireapp/api-client/lib/conversation';
import {QualifiedId} from '@wireapp/api-client/lib/user';
import {TimeInMillis} from '@wireapp/commons/lib/util/TimeUtil';
import logdown from 'logdown';

import {APIClient} from '@wireapp/api-client';
import {TypedEventEmitter} from '@wireapp/commons';

import {MLSService} from '../../messagingProtocols/mls';
import {subconversationGroupIdStore} from '../../messagingProtocols/mls/MLSService/stores/subconversationGroupIdStore/subconversationGroupIdStore';

type Events = {
  MLSConversationRecovered: {conversationId: QualifiedId};
};

export interface SubconversationEpochInfoMember {
  userid: `${string}@${string}`;
  clientid: string;
  in_subconv: boolean;
}

export class SubconversationService extends TypedEventEmitter<Events> {
  private readonly logger = logdown('@wireapp/core/SubconversationService');

  constructor(
    private readonly apiClient: APIClient,
    private readonly _mlsService?: MLSService,
  ) {
    super();
  }

  get mlsService(): MLSService {
    if (!this._mlsService) {
      throw new Error('MLSService was not initialised!');
    }
    return this._mlsService;
  }

  public async joinSubconversationByExternalCommit(conversationId: QualifiedId, subconversation: SUBCONVERSATION_ID) {
    await this.mlsService.joinByExternalCommit(() =>
      this.apiClient.api.conversation.getSubconversationGroupInfo(conversationId, subconversation),
    );
  }

  public async getConferenceSubconversation(conversationId: QualifiedId): Promise<Subconversation> {
    return this.apiClient.api.conversation.getSubconversation(conversationId, SUBCONVERSATION_ID.CONFERENCE);
  }

  private async deleteConferenceSubconversation(
    conversationId: QualifiedId,
    data: {groupId: string; epoch: number},
  ): Promise<void> {
    return this.apiClient.api.conversation.deleteSubconversation(conversationId, SUBCONVERSATION_ID.CONFERENCE, data);
  }

  /**
   * Will join or register an mls subconversation for conference calls.
   * Will return the secret key derived from the subconversation
   *
   * @param conversationId Id of the parent conversation in which the call should happen
   */
  public async joinConferenceSubconversation(conversationId: QualifiedId): Promise<{groupId: string; epoch: number}> {
    const {
      group_id: subconversationGroupId,
      epoch: subconversationEpoch,
      epoch_timestamp: subconversationEpochTimestamp,
      subconv_id: subconversationId,
    } = await this.getConferenceSubconversation(conversationId);

    if (subconversationEpoch === 0) {
      const doesConversationExistsLocally = await this.mlsService.conversationExists(subconversationGroupId);
      if (doesConversationExistsLocally) {
        await this.mlsService.wipeConversation(subconversationGroupId);
      }

      // If subconversation is not yet established, create it and upload the commit bundle.
      await this.mlsService.registerConversation(subconversationGroupId, []);
    } else {
      const epochUpdateTime = new Date(subconversationEpochTimestamp).getTime();
      const epochAge = new Date().getTime() - epochUpdateTime;

      if (epochAge > TimeInMillis.DAY) {
        // If subconversation does exist, but it's older than 24h, delete and re-join
        await this.deleteConferenceSubconversation(conversationId, {
          groupId: subconversationGroupId,
          epoch: subconversationEpoch,
        });
        await this.mlsService.wipeConversation(subconversationGroupId);

        return this.joinConferenceSubconversation(conversationId);
      }

      await this.joinSubconversationByExternalCommit(conversationId, SUBCONVERSATION_ID.CONFERENCE);
    }

    const epoch = Number(await this.mlsService.getEpoch(subconversationGroupId));

    // We store the mapping between the subconversation and the parent conversation
    subconversationGroupIdStore.storeGroupId(conversationId, subconversationId, subconversationGroupId);

    return {groupId: subconversationGroupId, epoch};
  }

  /**
   * Will leave conference subconversation if it's known by client and established.
   *
   * @param conversationId Id of the parent conversation which subconversation we want to leave
   */
  public async leaveConferenceSubconversation(conversationId: QualifiedId): Promise<void> {
    const subconversationGroupId = subconversationGroupIdStore.getGroupId(
      conversationId,
      SUBCONVERSATION_ID.CONFERENCE,
    );

    if (!subconversationGroupId) {
      return;
    }

    const isSubconversationEstablished = await this.mlsService.conversationExists(subconversationGroupId);
    if (!isSubconversationEstablished) {
      // if the subconversation was known by a client but is not established anymore, we can remove it from the store
      return subconversationGroupIdStore.removeGroupId(conversationId, SUBCONVERSATION_ID.CONFERENCE);
    }

    try {
      await this.apiClient.api.conversation.deleteSubconversationSelf(conversationId, SUBCONVERSATION_ID.CONFERENCE);
    } catch (error) {
      this.logger.error(`Failed to leave conference subconversation:`, error);
    }

    await this.mlsService.wipeConversation(subconversationGroupId);

    // once we've left the subconversation, we can remove it from the store
    subconversationGroupIdStore.removeGroupId(conversationId, SUBCONVERSATION_ID.CONFERENCE);
  }

  public async leaveStaleConferenceSubconversations(): Promise<void> {
    const conversationIds = subconversationGroupIdStore.getAllGroupIdsBySubconversationId(
      SUBCONVERSATION_ID.CONFERENCE,
    );

    for (const {parentConversationId} of conversationIds) {
      await this.leaveConferenceSubconversation(parentConversationId);
    }
  }
}
