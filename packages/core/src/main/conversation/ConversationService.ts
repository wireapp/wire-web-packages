const UUID = require('pure-uuid');
import APIClient = require('@wireapp/api-client');
import {Context} from '@wireapp/api-client/dist/commonjs/auth/';
import {
  ClientMismatch,
  IncomingNotification,
  NewOTRMessage,
  OTRRecipients,
  UserClients,
} from '@wireapp/api-client/dist/commonjs/conversation/';
import {UserPreKeyBundleMap} from '@wireapp/api-client/dist/commonjs/user/';
import {CryptographyService} from '../crypto/';

export default class ConversationService {
  private context: Context;

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
    return this.apiClient.conversation.api.postOTRMessage(this.context.clientID, conversationId).catch(error => {
      if (error.response && error.response.status === 412) {
        const recipients: UserClients = error.response.data.missing;
        return this.apiClient.user.api.postMultiPreKeyBundles(recipients);
      }
      throw error;
    });
  }

  public sendTextMessage(conversationId: string, message: string): Promise<ClientMismatch> {
    const customTextMessage = this.protocolBuffers.GenericMessage.create({
      messageId: new UUID(4).format(),
      text: this.protocolBuffers.Text.create({content: message}),
    });

    return this.getPreKeyBundles(conversationId)
      .then((preKeyBundles: UserPreKeyBundleMap) => {
        const typedArray = this.protocolBuffers.GenericMessage.encode(customTextMessage).finish();
        return this.cryptographyService.encrypt(typedArray, preKeyBundles);
      })
      .then(payload => this.sendMessage(this.context.clientID, conversationId, payload));
  }

  public setContext(newContext: Context) {
    this.context = newContext;
  }
}
