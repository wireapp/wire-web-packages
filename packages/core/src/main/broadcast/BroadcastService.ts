/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
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

import {APIClient} from '@wireapp/api-client';
import {NewOTRMessage, OTRRecipients} from '@wireapp/api-client/src/conversation/';
import {UserPreKeyBundleMap} from '@wireapp/api-client/src/user/';
import {uuidToBytes} from '@wireapp/commons/src/main/util/StringUtil';
import {GenericMessage} from '@wireapp/protocol-messaging';
import {IUserEntry, IClientEntry, NewOtrMessage} from '@wireapp/protocol-messaging/web/otr';
import {Encoder} from 'bazinga64';
import Long from 'long';

import {ConversationService} from '../conversation/';
import {CryptographyService} from '../cryptography/';

export class BroadcastService {
  constructor(
    private readonly apiClient: APIClient,
    private readonly conversationService: ConversationService,
    private readonly cryptographyService: CryptographyService,
  ) {}

  private async getPreKeyBundle(teamId: string, skipOwnClients = false): Promise<UserPreKeyBundleMap> {
    const {members: teamMembers} = await this.apiClient.teams.member.api.getAllMembers(teamId);

    let members = teamMembers.map(member => ({id: member.user}));

    if (skipOwnClients) {
      const selfUser = await this.apiClient.self.api.getSelf();
      members = members.filter(member => member.id !== selfUser.id);
    }

    const preKeys = await Promise.all(members.map(member => this.apiClient.user.api.getUserPreKeys(member.id)));

    return preKeys.reduce((bundleMap: UserPreKeyBundleMap, bundle) => {
      bundleMap[bundle.user] = {};
      for (const client of bundle.clients) {
        bundleMap[bundle.user][client.client] = client.prekey;
      }
      return bundleMap;
    }, {});
  }

  public async broadcastGenericMessage(
    teamId: string,
    genericMessage: GenericMessage,
    sendAsProtobuf?: boolean,
  ): Promise<void> {
    const plainTextArray = GenericMessage.encode(genericMessage).finish();
    const preKeyBundle = await this.getPreKeyBundle(teamId);
    const recipients = await this.cryptographyService.encrypt(plainTextArray, preKeyBundle);
    return sendAsProtobuf
      ? this.sendOTRBroadcastProtobufMessage(this.apiClient.validatedClientId, recipients, plainTextArray)
      : this.sendOTRBroadcastMessage(this.apiClient.validatedClientId, recipients, plainTextArray);
  }

  private async sendOTRBroadcastProtobufMessage(
    sendingClientId: string,
    recipients: OTRRecipients<Uint8Array>,
    plainTextArray: Uint8Array,
    assetData?: Uint8Array,
  ): Promise<void> {
    function buildProtobuf(
      protoSendingClientId: string,
      protoRecipients?: OTRRecipients<Uint8Array>,
      protoAssetData?: Uint8Array,
    ): NewOtrMessage {
      const userEntries: IUserEntry[] = Object.entries(protoRecipients || recipients).map(([userId, otrClientMap]) => {
        const clients: IClientEntry[] = Object.entries(otrClientMap).map(([clientId, payload]) => {
          return {
            client: {
              client: Long.fromString(clientId, 16),
            },
            text: payload,
          };
        });

        return {
          clients,
          user: {
            uuid: uuidToBytes(userId),
          },
        };
      });

      const protoMessage = NewOtrMessage.create({
        recipients: userEntries,
        sender: {
          client: Long.fromString(protoSendingClientId, 16),
        },
      });

      if (protoAssetData) {
        protoMessage.blob = protoAssetData;
      }

      return protoMessage;
    }

    try {
      await this.apiClient.broadcast.api.postBroadcastProtobufMessage(
        sendingClientId,
        buildProtobuf(sendingClientId, recipients, assetData),
      );
    } catch (error) {
      const message: NewOTRMessage<Uint8Array> = {
        recipients,
        report_missing: Object.keys(recipients),
        sender: sendingClientId,
      };
      const {recipients: newRecipients, report_missing} = await this.conversationService.onClientMismatch(
        error,
        message,
        plainTextArray,
      );
      const reEncryptedMessage = buildProtobuf(sendingClientId, newRecipients);
      await this.apiClient.broadcast.api.postBroadcastProtobufMessage(
        sendingClientId,
        reEncryptedMessage,
        report_missing,
      );
    }
  }

  private async sendOTRBroadcastMessage(
    sendingClientId: string,
    recipients: OTRRecipients<Uint8Array>,
    plainTextArray: Uint8Array,
    data?: Uint8Array,
  ): Promise<void> {
    const message: NewOTRMessage<string> = {
      recipients: CryptographyService.convertArrayRecipientsToBase64(recipients),
      report_missing: Object.keys(recipients),
      sender: sendingClientId,
    };

    if (data) {
      message.data = Encoder.toBase64(data).asString;
    }

    try {
      await this.apiClient.broadcast.api.postBroadcastMessage(sendingClientId, message);
    } catch (error) {
      const uint8Message: NewOTRMessage<Uint8Array> = {
        ...message,
        data,
        recipients,
      };
      const reEncryptedMessage = await this.conversationService.onClientMismatch(error, uint8Message, plainTextArray);
      const reEncryptedUint8Message: NewOTRMessage<string> = {
        ...reEncryptedMessage,
        data: undefined,
        recipients: CryptographyService.convertArrayRecipientsToBase64(reEncryptedMessage.recipients),
      };

      if (reEncryptedMessage.data) {
        reEncryptedUint8Message.data = Encoder.toBase64(reEncryptedMessage.data).asString;
      }

      await this.apiClient.broadcast.api.postBroadcastMessage(sendingClientId, reEncryptedUint8Message);
    }
  }
}
