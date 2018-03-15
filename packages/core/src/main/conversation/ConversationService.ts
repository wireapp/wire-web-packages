const UUID = require('pure-uuid');
import APIClient = require('@wireapp/api-client');
import {AxiosError} from 'axios';
import {
  ClientMismatch,
  NewOTRMessage,
  OTRRecipients,
  UserClients,
} from '@wireapp/api-client/dist/commonjs/conversation/index';
import {UserPreKeyBundleMap} from '@wireapp/api-client/dist/commonjs/user/index';
import {PublicClient} from '@wireapp/api-client/dist/commonjs/client/index';
import {CryptographyService} from '../crypto/root';

export default class ConversationService {
  private clientID: string = '';

  constructor(
    private apiClient: APIClient,
    private protocolBuffers: any = {},
    private cryptographyService: CryptographyService
  ) {}

  public sendMessage(
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

  // TODO: The correct functionality of this function is heavily based on the case that it always runs into the catch block
  private getPreKeyBundles(conversationId: string): Promise<ClientMismatch | UserPreKeyBundleMap> {
    return this.apiClient.conversation.api.postOTRMessage(this.clientID, conversationId).catch((error: AxiosError) => {
      if (error.response && error.response.status === 412) {
        const recipients: UserClients = error.response.data.missing;
        return this.apiClient.user.api.postMultiPreKeyBundles(recipients);
      }
      throw error;
    });
  }

  public getAllClientsInConversation(conversationId: string): Promise<PublicClient[]> {
    return this.apiClient.conversation.api
      .getConversation(conversationId)
      .then(conversation => {
        const {others, self} = conversation.members;
        const allUsers = others.concat(self);

        return Promise.all(allUsers.map(user => this.apiClient.user.api.getClients(user.id)));
      })
      .then(clients => [].concat.apply([], clients));
  }

  private shouldSendAsExternal(conversationId: string, customTextMessage: any): Promise<boolean> {
    const EXTERNAL_MESSAGE_THRESHOLD = 200 * 1024;

    return this.getAllClientsInConversation(conversationId).then(clients => {
      const messageBuffer = this.protocolBuffers.GenericMessage.encode(customTextMessage).finish();
      const messageInBytes = new Uint8Array(messageBuffer).length;
      const clientCount = clients.length;

      const estimatedPayloadInBytes = clientCount * messageInBytes;

      return estimatedPayloadInBytes > EXTERNAL_MESSAGE_THRESHOLD;
    });
  }

  public sendTextMessage(conversationId: string, message: string): Promise<ClientMismatch> {
    const customTextMessage = this.protocolBuffers.GenericMessage.create({
      messageId: new UUID(4).format(),
      text: this.protocolBuffers.Text.create({content: message}),
    });

    return this.shouldSendAsExternal(conversationId, customTextMessage).then(result => {
      if (result === true) {
        throw new Error('should send as external!');
        //  return this._sendExternalGenericMessage(conversationId)
      }
      return this.getPreKeyBundles(conversationId)
        .then((preKeyBundles: ClientMismatch | UserPreKeyBundleMap) => {
          const plainText = this.protocolBuffers.GenericMessage.encode(customTextMessage).finish();
          return this.cryptographyService.encrypt(plainText, <UserPreKeyBundleMap>preKeyBundles);
        })
        .then((payload: OTRRecipients) => {
          return this.sendMessage(this.clientID, conversationId, payload);
        });
    });
  }

  public setClientID(clientID: string) {
    this.clientID = clientID;
  }
}
