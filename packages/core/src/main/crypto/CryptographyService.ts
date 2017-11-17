import {ConversationEvent, OTRMessageAdd} from '@wireapp/api-client/dist/commonjs/conversation/event/';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine/';
import {Cryptobox, store} from 'wire-webapp-cryptobox';
import {Decoder, Encoder} from 'bazinga64';
import {UserPreKeyBundleMap} from '@wireapp/api-client/dist/commonjs/user/';
import {PreKey} from '@wireapp/api-client/dist/commonjs/auth/';
import {
  ClientMismatch,
  NewOTRMessage,
  OTRRecipients,
  UserClients,
} from '@wireapp/api-client/dist/commonjs/conversation/';
import SessionPayloadBundle from './SessionPayloadBundle';

/**
 * CryptographyService operates the Cryptobox and manages encryption and decryption.
 * It doesn't know about the format of Wire's backend payloads.
 * @constructor
 */
export default class CryptographyService {
  public cryptobox: Cryptobox;

  constructor(config: { store: CRUDEngine }) {
    this.cryptobox = new Cryptobox(new store.CryptoboxCRUDStore(config.store));
  }

  public constructSessionId(userId: string, clientId: string): string {
    return `${userId}@${clientId}`;
  }

  public decrypt(sessionId: string, encodedCiphertext: string): Promise<Uint8Array> {
    const messageBytes: Uint8Array = Decoder.fromBase64(encodedCiphertext).asBytes;
    return this.cryptobox.decrypt(sessionId, messageBytes.buffer);
  }

  private dismantleSessionId(sessionId: string): Array<string> {
    return sessionId.split('@');
  }

  public encrypt(typedArray: Uint8Array, preKeyBundles: UserPreKeyBundleMap): Promise<OTRRecipients> {
    const recipients: OTRRecipients = {};
    const encryptions: Array<Promise<SessionPayloadBundle>> = [];

    for (const userId in preKeyBundles) {
      recipients[userId] = {};
      for (const clientId in preKeyBundles[userId]) {
        const preKeyPayload: PreKey = preKeyBundles[userId][clientId];
        const preKey: string = preKeyPayload.key;
        const sessionId: string = this.constructSessionId(userId, clientId);
        encryptions.push(this.encryptPayloadForSession(sessionId, typedArray, preKey));
      }
    }

    return Promise.all(encryptions).then((payloads: Array<SessionPayloadBundle>) => {
      const recipients: OTRRecipients = {};

      if (payloads) {
        payloads.forEach((payload: SessionPayloadBundle) => {
          const sessionId: string = payload.sessionId;
          const encrypted: string = payload.encryptedPayload;
          const [userId, clientId] = this.dismantleSessionId(sessionId);
          recipients[userId] = recipients[userId] || {};
          recipients[userId][clientId] = encrypted;
        });
      }

      return recipients;
    });
  }

  private encryptPayloadForSession(sessionId: string,
                                   typedArray: Uint8Array,
                                   encodedPreKey: string): Promise<SessionPayloadBundle> {
    const decodedPreKeyBundle: Uint8Array = Decoder.fromBase64(encodedPreKey).asBytes;
    return this.cryptobox
      .encrypt(sessionId, typedArray, decodedPreKeyBundle.buffer)
      .then(encryptedPayload => Encoder.toBase64(encryptedPayload).asString)
      .catch(error => '💣')
      .then(encryptedPayload => ({sessionId, encryptedPayload}));
  }
}
