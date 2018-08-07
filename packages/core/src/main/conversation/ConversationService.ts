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

import {
  ClientMismatch,
  Conversation,
  CONVERSATION_TYPE,
  NewConversation,
  NewOTRMessage,
  OTRRecipients,
  UserClients,
} from '@wireapp/api-client/dist/commonjs/conversation/';
import {CONVERSATION_TYPING, ConversationMemberLeaveEvent} from '@wireapp/api-client/dist/commonjs/event/';
import {UserPreKeyBundleMap} from '@wireapp/api-client/dist/commonjs/user/index';
import {AxiosError} from 'axios';
import {Encoder} from 'bazinga64';
import {
  AbortReason,
  AssetService,
  AssetTransferState,
  GenericMessageType,
  MessageTimer,
  PayloadBundleOutgoing,
  PayloadBundleOutgoingUnsent,
  PayloadBundleState,
  PayloadBundleType,
  ReactionType,
} from '../conversation/root';

import {
  Asset,
  ClientAction,
  Confirmation,
  Ephemeral,
  GenericMessage,
  Knock,
  Location,
  MessageDelete,
  MessageEdit,
  MessageHide,
  Reaction,
  Text,
} from '@wireapp/protocol-messaging';
import {
  ClientActionContent,
  ConfirmationContent,
  EditedTextContent,
  FileAssetAbortContent,
  FileAssetContent,
  FileAssetMetaDataContent,
  FileContent,
  FileMetaDataContent,
  ImageAssetContent,
  ImageContent,
  LocationContent,
  ReactionContent,
  RemoteData,
  TextContent,
} from '../conversation/content/';

import * as AssetCryptography from '../cryptography/AssetCryptography.node';
import {CryptographyService, EncryptedAsset} from '../cryptography/root';

import {APIClient} from '@wireapp/api-client';

const UUID = require('pure-uuid');

class ConversationService {
  private clientID: string = '';
  public readonly messageTimer: MessageTimer;

  constructor(
    private readonly apiClient: APIClient,
    private readonly cryptographyService: CryptographyService,
    private readonly assetService: AssetService
  ) {
    this.messageTimer = new MessageTimer();
  }

  private createEphemeral(originalGenericMessage: GenericMessage, expireAfterMillis: number): GenericMessage {
    const ephemeralMessage = Ephemeral.create({
      expireAfterMillis,
      [originalGenericMessage.content!]: originalGenericMessage[originalGenericMessage.content!],
    });

    const genericMessage = GenericMessage.create({
      [GenericMessageType.EPHEMERAL]: ephemeralMessage,
      messageId: originalGenericMessage.messageId,
    });

    return genericMessage;
  }

  // TODO: The correct functionality of this function is heavily based on the case that it always runs into the catch
  // block
  private getPreKeyBundles(conversationId: string): Promise<ClientMismatch | UserPreKeyBundleMap> {
    return this.apiClient.conversation.api.postOTRMessage(this.clientID, conversationId).catch((error: AxiosError) => {
      if (error.response && error.response.status === 412) {
        const recipients: UserClients = error.response.data.missing;
        return this.apiClient.user.api.postMultiPreKeyBundles(recipients);
      }
      throw error;
    });
  }

  private getSelfConversation(): Promise<Conversation> {
    const {userId} = this.apiClient.context!;
    return this.apiClient.conversation.api.getConversation(userId);
  }

  private async sendConfirmation(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    const confirmationMessage = Confirmation.create({
      firstMessageId: (payloadBundle.content as ConfirmationContent).confirmMessageId,
      type: Confirmation.Type.DELIVERED,
    });

    const genericMessage = GenericMessage.create({
      [GenericMessageType.CONFIRMATION]: confirmationMessage,
      messageId: payloadBundle.id,
    });

    await this.sendGenericMessage(this.clientID, conversationId, genericMessage);

    return {
      ...payloadBundle,
      conversation: conversationId,
      messageTimer: 0,
      state: PayloadBundleState.OUTGOING_SENT,
    };
  }

  private async sendExternalGenericMessage(
    sendingClientId: string,
    conversationId: string,
    asset: EncryptedAsset,
    preKeyBundles: UserPreKeyBundleMap
  ): Promise<ClientMismatch> {
    const {cipherText, keyBytes, sha256} = asset;
    const messageId = ConversationService.createId();

    const externalMessage = {
      otrKey: new Uint8Array(keyBytes),
      sha256: new Uint8Array(sha256),
    };

    const base64CipherText = Encoder.toBase64(cipherText).asString;

    const customTextMessage = GenericMessage.create({
      external: externalMessage,
      messageId,
    });

    const plainTextBuffer = GenericMessage.encode(customTextMessage).finish();
    const recipients = await this.cryptographyService.encrypt(plainTextBuffer, preKeyBundles as UserPreKeyBundleMap);

    const message: NewOTRMessage = {
      data: base64CipherText,
      recipients,
      sender: sendingClientId,
    };

    return this.apiClient.conversation.api.postOTRMessage(sendingClientId, conversationId, message);
  }

  private async sendGenericMessage(
    sendingClientId: string,
    conversationId: string,
    genericMessage: GenericMessage
  ): Promise<ClientMismatch> {
    const plainTextBuffer: Uint8Array = GenericMessage.encode(genericMessage).finish();
    const preKeyBundles = await this.getPreKeyBundles(conversationId);
    const recipients = await this.cryptographyService.encrypt(plainTextBuffer, preKeyBundles as UserPreKeyBundleMap);

    return this.sendOTRMessage(sendingClientId, conversationId, recipients);
  }

  private async sendEditedText(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    const {originalMessageId, text} = payloadBundle.content as EditedTextContent;

    const editedMessage = MessageEdit.create({
      replacingMessageId: originalMessageId,
      text: Text.create({content: text}),
    });

    const genericMessage = GenericMessage.create({
      [GenericMessageType.EDITED]: editedMessage,
      messageId: payloadBundle.id,
    });

    await this.sendGenericMessage(this.clientID, conversationId, genericMessage);

    return {
      ...payloadBundle,
      conversation: conversationId,
      messageTimer: 0,
      state: PayloadBundleState.OUTGOING_SENT,
    };
  }

  private async sendFileData(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    if (!payloadBundle.content) {
      throw new Error('No content for sendFileData provided.');
    }

    const encryptedAsset = payloadBundle.content as FileAssetContent;

    const remoteData = Asset.RemoteData.create({
      assetId: encryptedAsset.asset.key,
      assetToken: encryptedAsset.asset.token,
      otrKey: encryptedAsset.asset.keyBytes,
      sha256: encryptedAsset.asset.sha256,
    });

    const assetMessage = Asset.create({
      uploaded: remoteData,
    });

    assetMessage.status = AssetTransferState.UPLOADED;

    let genericMessage = GenericMessage.create({
      [GenericMessageType.ASSET]: assetMessage,
      messageId: payloadBundle.id,
    });

    const expireAfterMillis = this.messageTimer.getMessageTimer(conversationId);
    if (expireAfterMillis > 0) {
      genericMessage = this.createEphemeral(genericMessage, expireAfterMillis);
    }

    const preKeyBundles = await this.getPreKeyBundles(conversationId);
    const plainTextBuffer: Uint8Array = GenericMessage.encode(genericMessage).finish();
    const payload: EncryptedAsset = await AssetCryptography.encryptAsset(plainTextBuffer);

    await this.sendExternalGenericMessage(this.clientID, conversationId, payload, preKeyBundles as UserPreKeyBundleMap);
    return {
      ...payloadBundle,
      conversation: conversationId,
      messageTimer: this.messageTimer.getMessageTimer(conversationId),
      state: PayloadBundleState.OUTGOING_SENT,
    };
  }

  private async sendFileMetaData(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    if (!payloadBundle.content) {
      throw new Error('No content for sendFileMetaData provided.');
    }

    const encryptedAsset = payloadBundle.content as FileAssetMetaDataContent;

    const original = Asset.Original.create({
      mimeType: encryptedAsset.metaData.type,
      name: encryptedAsset.metaData.name,
      size: encryptedAsset.metaData.length,
    });

    let genericMessage = GenericMessage.create({
      [GenericMessageType.ASSET]: Asset.create({original}),
      messageId: payloadBundle.id,
    });

    const expireAfterMillis = this.messageTimer.getMessageTimer(conversationId);
    if (expireAfterMillis > 0) {
      genericMessage = this.createEphemeral(genericMessage, expireAfterMillis);
    }

    const preKeyBundles = await this.getPreKeyBundles(conversationId);
    const plainTextBuffer: Uint8Array = GenericMessage.encode(genericMessage).finish();
    const payload: EncryptedAsset = await AssetCryptography.encryptAsset(plainTextBuffer);

    await this.sendExternalGenericMessage(this.clientID, conversationId, payload, preKeyBundles as UserPreKeyBundleMap);

    return {
      ...payloadBundle,
      conversation: conversationId,
      messageTimer: this.messageTimer.getMessageTimer(conversationId),
      state: PayloadBundleState.OUTGOING_SENT,
    };
  }

  private async sendFileAbort(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    if (!payloadBundle.content) {
      throw new Error('No content for sendFileAbort provided.');
    }

    const abortContent = payloadBundle.content as FileAssetAbortContent;

    const assetMessage = Asset.create({
      notUploaded: abortContent.reason,
    });

    assetMessage.status = AssetTransferState.NOT_UPLOADED;

    let genericMessage = GenericMessage.create({
      [GenericMessageType.ASSET]: assetMessage,
      messageId: payloadBundle.id,
    });

    const expireAfterMillis = this.messageTimer.getMessageTimer(conversationId);
    if (expireAfterMillis > 0) {
      genericMessage = this.createEphemeral(genericMessage, expireAfterMillis);
    }

    const preKeyBundles = await this.getPreKeyBundles(conversationId);
    const plainTextBuffer: Uint8Array = GenericMessage.encode(genericMessage).finish();
    const payload: EncryptedAsset = await AssetCryptography.encryptAsset(plainTextBuffer);

    await this.sendExternalGenericMessage(this.clientID, conversationId, payload, preKeyBundles as UserPreKeyBundleMap);

    return {
      ...payloadBundle,
      conversation: conversationId,
      messageTimer: this.messageTimer.getMessageTimer(conversationId),
      state: PayloadBundleState.OUTGOING_SENT,
    };
  }

  private async sendImage(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    if (!payloadBundle.content) {
      throw new Error('No content for sendImage provided.');
    }

    const encryptedAsset = payloadBundle.content as ImageAssetContent;

    const imageMetadata = Asset.ImageMetaData.create({
      height: encryptedAsset.image.height,
      width: encryptedAsset.image.width,
    });

    const original = Asset.Original.create({
      [GenericMessageType.IMAGE]: imageMetadata,
      mimeType: encryptedAsset.image.type,
      name: null,
      size: encryptedAsset.image.data.length,
    });

    const remoteData = Asset.RemoteData.create({
      assetId: encryptedAsset.asset.key,
      assetToken: encryptedAsset.asset.token,
      otrKey: encryptedAsset.asset.keyBytes,
      sha256: encryptedAsset.asset.sha256,
    });

    const assetMessage = Asset.create({
      original,
      uploaded: remoteData,
    });

    assetMessage.status = AssetTransferState.UPLOADED;

    let genericMessage = GenericMessage.create({
      [GenericMessageType.ASSET]: assetMessage,
      messageId: payloadBundle.id,
    });

    const expireAfterMillis = this.messageTimer.getMessageTimer(conversationId);
    if (expireAfterMillis > 0) {
      genericMessage = this.createEphemeral(genericMessage, expireAfterMillis);
    }

    const preKeyBundles = await this.getPreKeyBundles(conversationId);
    const plainTextBuffer: Uint8Array = GenericMessage.encode(genericMessage).finish();
    const payload: EncryptedAsset = await AssetCryptography.encryptAsset(plainTextBuffer);

    await this.sendExternalGenericMessage(this.clientID, conversationId, payload, preKeyBundles as UserPreKeyBundleMap);
    return {
      ...payloadBundle,
      conversation: conversationId,
      messageTimer: this.messageTimer.getMessageTimer(conversationId),
      state: PayloadBundleState.OUTGOING_SENT,
    };
  }

  private async sendLocation(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    const {latitude, longitude, name, zoom} = payloadBundle.content as LocationContent;

    const locationMessage = Location.create({
      latitude,
      longitude,
      name,
      zoom,
    });

    const genericMessage = GenericMessage.create({
      [GenericMessageType.LOCATION]: locationMessage,
      messageId: payloadBundle.id,
    });

    await this.sendGenericMessage(this.clientID, conversationId, genericMessage);

    return {
      ...payloadBundle,
      conversation: conversationId,
      messageTimer: 0,
      state: PayloadBundleState.OUTGOING_SENT,
    };
  }

  private sendOTRMessage(
    sendingClientId: string,
    conversationId: string,
    recipients: OTRRecipients
  ): Promise<ClientMismatch> {
    const message: NewOTRMessage = {
      recipients,
      sender: sendingClientId,
    };
    return this.apiClient.conversation.api.postOTRMessage(sendingClientId, conversationId, message);
  }

  private async sendPing(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    let genericMessage = GenericMessage.create({
      [GenericMessageType.KNOCK]: Knock.create(),
      messageId: payloadBundle.id,
    });

    const expireAfterMillis = this.messageTimer.getMessageTimer(conversationId);
    if (expireAfterMillis > 0) {
      genericMessage = this.createEphemeral(genericMessage, expireAfterMillis);
    }

    await this.sendGenericMessage(this.clientID, conversationId, genericMessage);

    return {
      ...payloadBundle,
      conversation: conversationId,
      messageTimer: this.messageTimer.getMessageTimer(conversationId),
      state: PayloadBundleState.OUTGOING_SENT,
    };
  }

  private async sendReaction(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    const reactionContent = payloadBundle.content as ReactionContent;

    const reaction = Reaction.create({
      emoji: reactionContent.type,
      messageId: reactionContent.originalMessageId,
    });

    const genericMessage = GenericMessage.create({
      [GenericMessageType.REACTION]: reaction,
      messageId: payloadBundle.id,
    });

    await this.sendGenericMessage(this.clientID, conversationId, genericMessage);

    return {
      ...payloadBundle,
      conversation: conversationId,
      messageTimer: 0,
      state: PayloadBundleState.OUTGOING_SENT,
    };
  }

  private async sendSessionReset(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    const sessionReset = GenericMessage.create({
      [GenericMessageType.CLIENT_ACTION]: ClientAction.RESET_SESSION,
      messageId: payloadBundle.id,
    });

    await this.sendGenericMessage(this.clientID, conversationId, sessionReset);

    return {
      ...payloadBundle,
      conversation: conversationId,
      messageTimer: this.messageTimer.getMessageTimer(conversationId),
      state: PayloadBundleState.OUTGOING_SENT,
    };
  }

  private async sendText(
    conversationId: string,
    originalPayloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    const payloadBundle: PayloadBundleOutgoing = {
      ...originalPayloadBundle,
      conversation: conversationId,
      messageTimer: this.messageTimer.getMessageTimer(conversationId),
      state: PayloadBundleState.OUTGOING_SENT,
    };

    let genericMessage = GenericMessage.create({
      messageId: payloadBundle.id,
      [GenericMessageType.TEXT]: Text.create({
        content: (payloadBundle.content as TextContent).text,
      }),
    });

    const expireAfterMillis = this.messageTimer.getMessageTimer(conversationId);
    if (expireAfterMillis > 0) {
      genericMessage = this.createEphemeral(genericMessage, expireAfterMillis);
    }

    const preKeyBundles = await this.getPreKeyBundles(conversationId);
    const plainTextBuffer = GenericMessage.encode(genericMessage).finish();

    if (this.shouldSendAsExternal(plainTextBuffer, preKeyBundles as UserPreKeyBundleMap)) {
      const encryptedAsset: EncryptedAsset = await AssetCryptography.encryptAsset(plainTextBuffer);

      await this.sendExternalGenericMessage(
        this.clientID,
        conversationId,
        encryptedAsset,
        preKeyBundles as UserPreKeyBundleMap
      );
      return payloadBundle;
    }

    const payload: OTRRecipients = await this.cryptographyService.encrypt(
      plainTextBuffer,
      preKeyBundles as UserPreKeyBundleMap
    );

    await this.sendOTRMessage(this.clientID, conversationId, payload);
    return payloadBundle;
  }

  private shouldSendAsExternal(plainText: Uint8Array, preKeyBundles: UserPreKeyBundleMap): boolean {
    const EXTERNAL_MESSAGE_THRESHOLD_BYTES = 200 * 1024;

    let clientCount = 0;
    for (const user in preKeyBundles) {
      clientCount += Object.keys(preKeyBundles[user]).length;
    }

    const messageInBytes = new Uint8Array(plainText).length;
    const estimatedPayloadInBytes = clientCount * messageInBytes;

    return estimatedPayloadInBytes > EXTERNAL_MESSAGE_THRESHOLD_BYTES;
  }

  public createEditedText(
    newMessageText: string,
    originalMessageId: string,
    messageId: string = ConversationService.createId()
  ): PayloadBundleOutgoingUnsent {
    return {
      content: {
        originalMessageId,
        text: newMessageText,
      },
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.MESSAGE_EDIT,
    };
  }

  public async createFileData(file: FileContent, messageId: string): Promise<PayloadBundleOutgoingUnsent> {
    const imageAsset = await this.assetService.uploadFileAsset(file);

    const content: FileAssetContent = {
      asset: imageAsset,
      file,
    };

    return {
      content,
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET,
    };
  }

  public createFileMetadata(
    metaData: FileMetaDataContent,
    messageId: string = ConversationService.createId()
  ): PayloadBundleOutgoingUnsent {
    const content: FileAssetMetaDataContent = {
      metaData,
    };

    return {
      content,
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_META,
    };
  }

  public async createFileAbort(reason: AbortReason, messageId: string): Promise<PayloadBundleOutgoingUnsent> {
    const content: FileAssetAbortContent = {
      reason,
    };

    return {
      content,
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_ABORT,
    };
  }

  public static createId(): string {
    return new UUID(4).format();
  }

  public async createImage(
    image: ImageContent,
    messageId: string = ConversationService.createId()
  ): Promise<PayloadBundleOutgoingUnsent> {
    const imageAsset = await this.assetService.uploadImageAsset(image);

    const content: ImageAssetContent = {
      asset: imageAsset,
      image,
    };

    return {
      content,
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.ASSET_IMAGE,
    };
  }

  public createLocation(
    location: LocationContent,
    messageId: string = ConversationService.createId()
  ): PayloadBundleOutgoingUnsent {
    return {
      content: location,
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.LOCATION,
    };
  }

  public createReaction(
    originalMessageId: string,
    type: ReactionType,
    messageId: string = ConversationService.createId()
  ): PayloadBundleOutgoingUnsent {
    const content: ReactionContent = {originalMessageId, type};

    return {
      content,
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.REACTION,
    };
  }

  public createText(text: string, messageId: string = ConversationService.createId()): PayloadBundleOutgoingUnsent {
    const content: TextContent = {text};

    return {
      content,
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.TEXT,
    };
  }

  public createConfirmation(
    confirmMessageId: string,
    messageId: string = ConversationService.createId()
  ): PayloadBundleOutgoingUnsent {
    const content: ConfirmationContent = {confirmMessageId};
    return {
      content,
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CONFIRMATION,
    };
  }

  public createPing(messageId: string = ConversationService.createId()): PayloadBundleOutgoingUnsent {
    return {
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.PING,
    };
  }

  public createSessionReset(messageId: string = ConversationService.createId()): PayloadBundleOutgoingUnsent {
    const content: ClientActionContent = {
      clientAction: ClientAction.RESET_SESSION,
    };
    return {
      content,
      from: this.apiClient.context!.userId,
      id: messageId,
      state: PayloadBundleState.OUTGOING_UNSENT,
      timestamp: Date.now(),
      type: PayloadBundleType.CLIENT_ACTION,
    };
  }

  public async deleteMessageLocal(conversationId: string, messageIdToHide: string): Promise<PayloadBundleOutgoing> {
    const messageId = new UUID(4).format();

    const messageHide = MessageHide.create({
      conversationId,
      messageId: messageIdToHide,
    });

    const genericMessage = GenericMessage.create({
      [GenericMessageType.HIDDEN]: messageHide,
      messageId,
    });

    const {id: selfConversationId} = await this.getSelfConversation();

    await this.sendGenericMessage(this.clientID, selfConversationId, genericMessage);

    return {
      conversation: conversationId,
      from: this.apiClient.context!.userId,
      id: messageId,
      messageTimer: this.messageTimer.getMessageTimer(conversationId),
      state: PayloadBundleState.OUTGOING_SENT,
      timestamp: Date.now(),
      type: PayloadBundleType.MESSAGE_HIDE,
    };
  }

  public async deleteMessageEveryone(
    conversationId: string,
    messageIdToDelete: string
  ): Promise<PayloadBundleOutgoing> {
    const messageId = new UUID(4).format();

    const messageDelete = MessageDelete.create({
      messageId: messageIdToDelete,
    });

    const genericMessage = GenericMessage.create({
      [GenericMessageType.DELETED]: messageDelete,
      messageId,
    });

    await this.sendGenericMessage(this.clientID, conversationId, genericMessage);

    return {
      conversation: conversationId,
      from: this.apiClient.context!.userId,
      id: messageId,
      messageTimer: this.messageTimer.getMessageTimer(conversationId),
      state: PayloadBundleState.OUTGOING_SENT,
      timestamp: Date.now(),
      type: PayloadBundleType.MESSAGE_DELETE,
    };
  }

  public leaveConversation(conversationId: string): Promise<ConversationMemberLeaveEvent> {
    return this.apiClient.conversation.api.deleteMember(conversationId, this.apiClient.context!.userId);
  }

  public async leaveConversations(conversationIds?: string[]): Promise<ConversationMemberLeaveEvent[]> {
    if (!conversationIds) {
      const conversation = await this.getConversations();
      conversationIds = conversation
        .filter(conversation => conversation.type === CONVERSATION_TYPE.REGULAR)
        .map(conversation => conversation.id);
    }

    return Promise.all(conversationIds.map(conversationId => this.leaveConversation(conversationId)));
  }

  public createConversation(name: string, otherUserIds: string | string[] = []): Promise<Conversation> {
    const ids = typeof otherUserIds === 'string' ? [otherUserIds] : otherUserIds;

    const newConversation: NewConversation = {
      name,
      users: ids,
    };

    return this.apiClient.conversation.api.postConversation(newConversation);
  }

  public async getConversations(conversationId: string): Promise<Conversation>;
  public async getConversations(conversationId?: string[]): Promise<Conversation[]>;
  public async getConversations(conversationId?: string | string[]): Promise<Conversation[] | Conversation> {
    if (!conversationId || !conversationId.length) {
      return this.apiClient.conversation.api.getAllConversations();
    }
    if (typeof conversationId === 'string') {
      return this.apiClient.conversation.api.getConversation(conversationId);
    }
    return this.apiClient.conversation.api.getConversationsByIds(conversationId);
  }

  public async getAsset({assetId, assetToken, otrKey, sha256}: RemoteData): Promise<Buffer> {
    const encryptedBuffer = await this.apiClient.asset.api.getAsset(assetId, assetToken);

    return AssetCryptography.decryptAsset({
      cipherText: Buffer.from(encryptedBuffer),
      keyBytes: Buffer.from(otrKey),
      sha256: Buffer.from(sha256),
    });
  }

  public async addUser(conversationId: string, userId: string): Promise<string>;
  public async addUser(conversationId: string, userIds: string[]): Promise<string[]>;
  public async addUser(conversationId: string, userIds: string | string[]): Promise<string | string[]> {
    const ids = typeof userIds === 'string' ? [userIds] : userIds;
    await this.apiClient.conversation.api.postMembers(conversationId, ids);
    return userIds;
  }

  public async removeUser(conversationId: string, userId: string): Promise<string> {
    await this.apiClient.conversation.api.deleteMember(conversationId, userId);
    return userId;
  }

  public async send(
    conversationId: string,
    payloadBundle: PayloadBundleOutgoingUnsent
  ): Promise<PayloadBundleOutgoing> {
    switch (payloadBundle.type) {
      case PayloadBundleType.ASSET:
        return this.sendFileData(conversationId, payloadBundle);
      case PayloadBundleType.ASSET_ABORT:
        return this.sendFileAbort(conversationId, payloadBundle);
      case PayloadBundleType.ASSET_META:
        return this.sendFileMetaData(conversationId, payloadBundle);
      case PayloadBundleType.ASSET_IMAGE:
        return this.sendImage(conversationId, payloadBundle);
      case PayloadBundleType.CLIENT_ACTION: {
        if (payloadBundle.content === ClientAction.RESET_SESSION) {
          return this.sendSessionReset(conversationId, payloadBundle);
        }
        throw new Error(
          `No send method implemented for "${payloadBundle.type}" and ClientAction "${payloadBundle.content}".`
        );
      }
      case PayloadBundleType.CONFIRMATION:
        return this.sendConfirmation(conversationId, payloadBundle);
      case PayloadBundleType.LOCATION:
        return this.sendLocation(conversationId, payloadBundle);
      case PayloadBundleType.MESSAGE_EDIT:
        return this.sendEditedText(conversationId, payloadBundle);
      case PayloadBundleType.PING:
        return this.sendPing(conversationId, payloadBundle);
      case PayloadBundleType.REACTION:
        return this.sendReaction(conversationId, payloadBundle);
      case PayloadBundleType.TEXT:
        return this.sendText(conversationId, payloadBundle);
      default:
        throw new Error(`No send method implemented for "${payloadBundle.type}".`);
    }
  }

  public sendTypingStart(conversationId: string): Promise<void> {
    return this.apiClient.conversation.api.postTyping(conversationId, {status: CONVERSATION_TYPING.STARTED});
  }

  public sendTypingStop(conversationId: string): Promise<void> {
    return this.apiClient.conversation.api.postTyping(conversationId, {status: CONVERSATION_TYPING.STOPPED});
  }

  public setClientID(clientID: string) {
    this.clientID = clientID;
  }
}

export {ConversationService};
