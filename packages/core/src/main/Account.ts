//
// Wire
// Copyright (C) 2018 Wire Swiss GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see http://www.gnu.org/licenses/.
//

const pkg = require('../package.json');
import {IncomingNotification} from '@wireapp/api-client/dist/commonjs/conversation/index';
import {CryptographyService, GenericMessageType, PayloadBundle} from './crypto/root';
import {Context, LoginData, PreKey} from '@wireapp/api-client/dist/commonjs/auth/index';
import {
  ConversationEvent,
  ConversationEventType,
  OTRMessageAdd,
} from '@wireapp/api-client/dist/commonjs/conversation/event/index';
import {
  ClientClassification,
  ClientType,
  Location,
  NewClient,
  RegisteredClient,
} from '@wireapp/api-client/dist/commonjs/client/index';
import {LoginSanitizer, ClientInfo} from './auth/root';
import {RecordNotFoundError} from '@wireapp/store-engine/dist/commonjs/engine/error/index';
import {Root} from 'protobufjs';
import {WebSocketClient} from '@wireapp/api-client/dist/commonjs/tcp/index';
import {ConversationService} from './conversation/root';
import Client = require('@wireapp/api-client');
import EventEmitter = require('events');

class Account extends EventEmitter {
  public static INCOMING = {
    TEXT_MESSAGE: 'Account.INCOMING.TEXT_MESSAGE',
  };
  private apiClient: Client;
  private client: RegisteredClient;
  public context: Context;
  private protocolBuffers: any = {};
  public service: {conversation: ConversationService; crypto: CryptographyService};

  constructor(apiClient: Client = new Client()) {
    super();
    this.apiClient = apiClient;
  }

  private decodeEvent(event: ConversationEvent): Promise<string> {
    return new Promise(resolve => {
      switch (event.type) {
        case ConversationEventType.OTR_MESSAGE_ADD:
          const otrMessage: OTRMessageAdd = event as OTRMessageAdd;
          const sessionId: string = this.service.crypto.constructSessionId(otrMessage.from, otrMessage.data.sender);
          const ciphertext: string = otrMessage.data.text;
          this.service.crypto.decrypt(sessionId, ciphertext).then((decryptedMessage: Uint8Array) => {
            const genericMessage = this.protocolBuffers.GenericMessage.decode(decryptedMessage);
            switch (genericMessage.content) {
              case GenericMessageType.TEXT:
                resolve(genericMessage.text.content);
                break;
              default:
                resolve(undefined);
            }
          });
          break;
      }
    });
  }

  private handleEvent(event: ConversationEvent): Promise<PayloadBundle> {
    const {conversation, from} = event;
    return this.decodeEvent(event).then((content: string) => {
      return {
        content,
        conversation,
        from,
      };
    });
  }

  private handleNotification(notification: IncomingNotification): void {
    for (const event of notification.payload) {
      this.handleEvent(event).then((data: PayloadBundle) => {
        if (data.content) {
          this.emit(Account.INCOMING.TEXT_MESSAGE, data);
        }
      });
    }
  }

  private init(): Promise<void> {
    const proto = {
      options: {java_package: 'com.waz.model'},
      nested: {
        GenericMessage: {
          oneofs: {
            content: {
              oneof: [
                'text',
                'image',
                'knock',
                'lastRead',
                'cleared',
                'external',
                'clientAction',
                'calling',
                'asset',
                'hidden',
                'location',
                'deleted',
                'edited',
                'confirmation',
                'reaction',
                'ephemeral',
                'availability',
              ],
            },
          },
          fields: {
            messageId: {rule: 'required', type: 'string', id: 1},
            text: {type: 'Text', id: 2},
            image: {type: 'ImageAsset', id: 3},
            knock: {type: 'Knock', id: 4},
            lastRead: {type: 'LastRead', id: 6},
            cleared: {type: 'Cleared', id: 7},
            external: {type: 'External', id: 8},
            clientAction: {type: 'ClientAction', id: 9},
            calling: {type: 'Calling', id: 10},
            asset: {type: 'Asset', id: 11},
            hidden: {type: 'MessageHide', id: 12},
            location: {type: 'Location', id: 13},
            deleted: {type: 'MessageDelete', id: 14},
            edited: {type: 'MessageEdit', id: 15},
            confirmation: {type: 'Confirmation', id: 16},
            reaction: {type: 'Reaction', id: 17},
            ephemeral: {type: 'Ephemeral', id: 18},
            availability: {type: 'Availability', id: 19},
          },
        },
        Availability: {
          fields: {type: {rule: 'required', type: 'Type', id: 1}},
          nested: {Type: {values: {NONE: 0, AVAILABLE: 1, AWAY: 2, BUSY: 3}}},
        },
        Ephemeral: {
          oneofs: {content: {oneof: ['text', 'image', 'knock', 'asset', 'location']}},
          fields: {
            expireAfterMillis: {rule: 'required', type: 'int64', id: 1},
            text: {type: 'Text', id: 2},
            image: {type: 'ImageAsset', id: 3},
            knock: {type: 'Knock', id: 4},
            asset: {type: 'Asset', id: 5},
            location: {type: 'Location', id: 6},
          },
        },
        Text: {
          fields: {
            content: {rule: 'required', type: 'string', id: 1},
            mention: {rule: 'repeated', type: 'Mention', id: 2, options: {packed: false}},
            linkPreview: {rule: 'repeated', type: 'LinkPreview', id: 3, options: {packed: false}},
          },
        },
        Knock: {fields: {hotKnock: {rule: 'required', type: 'bool', id: 1, options: {default: false}}}},
        LinkPreview: {
          oneofs: {preview: {oneof: ['article']}, metaData: {oneof: ['tweet']}},
          fields: {
            url: {rule: 'required', type: 'string', id: 1},
            urlOffset: {rule: 'required', type: 'int32', id: 2},
            article: {type: 'Article', id: 3},
            permanentUrl: {type: 'string', id: 5},
            title: {type: 'string', id: 6},
            summary: {type: 'string', id: 7},
            image: {type: 'Asset', id: 8},
            tweet: {type: 'Tweet', id: 9},
          },
        },
        Tweet: {fields: {author: {type: 'string', id: 1}, username: {type: 'string', id: 2}}},
        Article: {
          fields: {
            permanentUrl: {rule: 'required', type: 'string', id: 1},
            title: {type: 'string', id: 2},
            summary: {type: 'string', id: 3},
            image: {type: 'Asset', id: 4},
          },
        },
        Mention: {
          fields: {
            userId: {rule: 'required', type: 'string', id: 1},
            userName: {rule: 'required', type: 'string', id: 2},
          },
        },
        LastRead: {
          fields: {
            conversationId: {rule: 'required', type: 'string', id: 1},
            lastReadTimestamp: {rule: 'required', type: 'int64', id: 2},
          },
        },
        Cleared: {
          fields: {
            conversationId: {rule: 'required', type: 'string', id: 1},
            clearedTimestamp: {rule: 'required', type: 'int64', id: 2},
          },
        },
        MessageHide: {
          fields: {
            conversationId: {rule: 'required', type: 'string', id: 1},
            messageId: {rule: 'required', type: 'string', id: 2},
          },
        },
        MessageDelete: {fields: {messageId: {rule: 'required', type: 'string', id: 1}}},
        MessageEdit: {
          oneofs: {content: {oneof: ['text']}},
          fields: {replacingMessageId: {rule: 'required', type: 'string', id: 1}, text: {type: 'Text', id: 2}},
        },
        Confirmation: {
          fields: {
            type: {rule: 'required', type: 'Type', id: 2},
            firstMessageId: {rule: 'required', type: 'string', id: 1},
            moreMessageIds: {rule: 'repeated', type: 'string', id: 3},
          },
          nested: {Type: {values: {DELIVERED: 0, READ: 1}}},
        },
        Location: {
          fields: {
            longitude: {rule: 'required', type: 'float', id: 1},
            latitude: {rule: 'required', type: 'float', id: 2},
            name: {type: 'string', id: 3},
            zoom: {type: 'int32', id: 4},
          },
        },
        ImageAsset: {
          fields: {
            tag: {rule: 'required', type: 'string', id: 1},
            width: {rule: 'required', type: 'int32', id: 2},
            height: {rule: 'required', type: 'int32', id: 3},
            originalWidth: {rule: 'required', type: 'int32', id: 4},
            originalHeight: {rule: 'required', type: 'int32', id: 5},
            mimeType: {rule: 'required', type: 'string', id: 6},
            size: {rule: 'required', type: 'int32', id: 7},
            otrKey: {type: 'bytes', id: 8},
            macKey: {type: 'bytes', id: 9},
            mac: {type: 'bytes', id: 10},
            sha256: {type: 'bytes', id: 11},
          },
        },
        Asset: {
          oneofs: {status: {oneof: ['notUploaded', 'uploaded']}},
          fields: {
            original: {type: 'Original', id: 1},
            notUploaded: {type: 'NotUploaded', id: 3},
            uploaded: {type: 'RemoteData', id: 4},
            preview: {type: 'Preview', id: 5},
          },
          nested: {
            Original: {
              oneofs: {metaData: {oneof: ['image', 'video', 'audio']}},
              fields: {
                mimeType: {rule: 'required', type: 'string', id: 1},
                size: {rule: 'required', type: 'uint64', id: 2},
                name: {type: 'string', id: 3},
                image: {type: 'ImageMetaData', id: 4},
                video: {type: 'VideoMetaData', id: 5},
                audio: {type: 'AudioMetaData', id: 6},
                source: {type: 'string', id: 7},
                caption: {type: 'string', id: 8},
              },
            },
            Preview: {
              oneofs: {metaData: {oneof: ['image']}},
              fields: {
                mimeType: {rule: 'required', type: 'string', id: 1},
                size: {rule: 'required', type: 'uint64', id: 2},
                remote: {type: 'RemoteData', id: 3},
                image: {type: 'ImageMetaData', id: 4},
              },
            },
            ImageMetaData: {
              fields: {
                width: {rule: 'required', type: 'int32', id: 1},
                height: {rule: 'required', type: 'int32', id: 2},
                tag: {type: 'string', id: 3},
              },
            },
            VideoMetaData: {
              fields: {
                width: {type: 'int32', id: 1},
                height: {type: 'int32', id: 2},
                durationInMillis: {type: 'uint64', id: 3},
              },
            },
            AudioMetaData: {
              fields: {durationInMillis: {type: 'uint64', id: 1}, normalizedLoudness: {type: 'bytes', id: 3}},
            },
            NotUploaded: {values: {CANCELLED: 0, FAILED: 1}},
            RemoteData: {
              fields: {
                otrKey: {rule: 'required', type: 'bytes', id: 1},
                sha256: {rule: 'required', type: 'bytes', id: 2},
                assetId: {type: 'string', id: 3},
                assetToken: {type: 'string', id: 5},
                encryption: {type: 'EncryptionAlgorithm', id: 6},
              },
            },
          },
        },
        External: {
          fields: {
            otrKey: {rule: 'required', type: 'bytes', id: 1},
            sha256: {type: 'bytes', id: 2},
            encryption: {type: 'EncryptionAlgorithm', id: 3},
          },
        },
        Reaction: {fields: {emoji: {type: 'string', id: 1}, messageId: {rule: 'required', type: 'string', id: 2}}},
        ClientAction: {values: {RESET_SESSION: 0}},
        Calling: {fields: {content: {rule: 'required', type: 'string', id: 1}}},
        EncryptionAlgorithm: {values: {AES_CBC: 0, AES_GCM: 1}},
      },
    };
    return Promise.resolve(Root.fromJSON(proto))
      .then((root: Root) => {
        this.protocolBuffers.GenericMessage = root.lookup('GenericMessage');
        this.protocolBuffers.Text = root.lookup('Text');
        return this.apiClient.config.store.init('wire');
      })
      .then(() => {
        const crypto: CryptographyService = new CryptographyService(this.apiClient.config.store);
        const conversation: ConversationService = new ConversationService(this.apiClient, this.protocolBuffers, crypto);
        this.service = {
          conversation,
          crypto,
        };
      });
  }

  private initClient(context: Context, loginData: LoginData): Promise<RegisteredClient> {
    this.context = context;
    this.service.conversation.setClientID(<string>this.context.clientId);
    return this.service.crypto.loadClient().catch(error => {
      if (error instanceof RecordNotFoundError) {
        return this.registerClient(loginData);
      }
      throw error;
    });
  }

  public listen(loginData: LoginData, notificationHandler?: Function): Promise<WebSocketClient> {
    return Promise.resolve()
      .then(() => (this.context ? this.context : this.login(loginData, true)))
      .then(() => {
        if (notificationHandler) {
          this.apiClient.transport.ws.on(WebSocketClient.TOPIC.ON_MESSAGE, (notification: IncomingNotification) =>
            notificationHandler(notification)
          );
        } else {
          this.apiClient.transport.ws.on(WebSocketClient.TOPIC.ON_MESSAGE, this.handleNotification.bind(this));
        }
        return this.apiClient.connect();
      });
  }

  public login(loginData: LoginData, initClient: boolean = true): Promise<Context> {
    return this.init()
      .then(() => {
        LoginSanitizer.removeNonPrintableCharacters(loginData);
        return this.apiClient.init();
      })
      .catch((error: Error) => this.apiClient.login(loginData))
      .then((context: Context) => {
        if (initClient) {
          return this.initClient(context, loginData).then(client => {
            this.apiClient.context.clientId = client.id;
          });
        }
        return undefined;
      })
      .then(() => {
        this.context = this.apiClient.context;
        this.service.conversation.setClientID(<string>this.context.clientId);
        return this.context;
      });
  }

  private resetContext(): void {
    delete this.client;
    delete this.context;
    delete this.service;
  }

  public logout(): Promise<void> {
    return this.apiClient.logout().then(() => this.resetContext());
  }

  public registerClient(
    loginData: LoginData,
    clientInfo: ClientInfo = {
      classification: ClientClassification.DESKTOP,
      cookieLabel: 'default',
      model: `${pkg.name} v${pkg.version}`,
      location: {lat: 52.53269, lon: 13.402315},
    }
  ): Promise<RegisteredClient> {
    return this.service.crypto
      .createCryptobox()
      .then((serializedPreKeys: Array<PreKey>) => {
        if (this.service.crypto.cryptobox.lastResortPreKey) {
          const newClient: NewClient = {
            class: clientInfo.classification,
            cookie: clientInfo.cookieLabel,
            lastkey: this.service.crypto.cryptobox.serialize_prekey(this.service.crypto.cryptobox.lastResortPreKey),
            location: clientInfo.location,
            password: String(loginData.password),
            prekeys: serializedPreKeys,
            model: clientInfo.model,
            sigkeys: {
              enckey: 'Wuec0oJi9/q9VsgOil9Ds4uhhYwBT+CAUrvi/S9vcz0=',
              mackey: 'Wuec0oJi9/q9VsgOil9Ds4uhhYwBT+CAUrvi/S9vcz0=',
            },
            type: loginData.persist ? ClientType.PERMANENT : ClientType.TEMPORARY,
          };

          return newClient;
        } else {
          throw new Error('Cryptobox got initialized without a last resort PreKey.');
        }
      })
      .then((newClient: NewClient) => this.apiClient.client.api.postClient(newClient))
      .then((client: RegisteredClient) => {
        this.client = client;
        return this.service.crypto.saveClient(client);
      })
      .then(() => this.client);
  }
}

export {Account};
