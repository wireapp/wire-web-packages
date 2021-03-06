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
import {ClientType} from '@wireapp/api-client/src/client';
import {UserPreKeyBundleMap} from '@wireapp/api-client/src/user';
import {GenericMessage, LegalHoldStatus, Text} from '@wireapp/protocol-messaging';
import {MemoryEngine} from '@wireapp/store-engine';

import {Account} from '../Account';
import * as PayloadHelper from '../test/PayloadHelper';
import {MentionContent, QuoteContent} from './content';

const createMessage = (content: string) => {
  const customTextMessage = GenericMessage.create({
    messageId: PayloadHelper.getUUID(),
    text: Text.create({content}),
  });

  return GenericMessage.encode(customTextMessage).finish();
};

const generatePreKeyBundle = (userCount: number, clientsPerUser: number): UserPreKeyBundleMap => {
  const prekeyBundle: UserPreKeyBundleMap = {};
  for (let userIndex = 0; userIndex < userCount; userIndex++) {
    const userId = PayloadHelper.getUUID();
    prekeyBundle[userId] = {};
    for (let clientIndex = 0; clientIndex < clientsPerUser; clientIndex++) {
      const clientId = PayloadHelper.getUUID();
      prekeyBundle[userId][clientId] = {
        id: -1,
        key: '',
      };
    }
  }
  return prekeyBundle;
};

describe('ConversationService', () => {
  let account: Account;

  beforeAll(async () => {
    const client = new APIClient({urls: APIClient.BACKEND.STAGING});
    account = new Account(client);
    await account.initServices(new MemoryEngine());
  });

  describe("'shouldSendAsExternal'", () => {
    it('returns true for a big payload', () => {
      const preKeyBundles = generatePreKeyBundle(128, 4);

      const longMessage =
        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem';
      const plainText = createMessage(longMessage);

      const shouldSendAsExternal = account.service!.conversation['shouldSendAsExternal'](plainText, preKeyBundles);
      expect(shouldSendAsExternal).toBe(true);
    });

    it('returns false for a small payload', async () => {
      const preKeyBundles = generatePreKeyBundle(2, 1);

      const shortMessage = PayloadHelper.getUUID();
      const plainText = createMessage(shortMessage);

      const shouldSendAsExternal = account.service!.conversation['shouldSendAsExternal'](plainText, preKeyBundles);
      expect(shouldSendAsExternal).toBe(false);
    });
  });

  describe('"createText"', () => {
    it('adds link previews correctly', async () => {
      account['apiClient'].context = {
        clientType: ClientType.NONE,
        userId: PayloadHelper.getUUID(),
      };

      const url = 'http://example.com';

      const permanentUrl = url;
      const summary = 'Summary';
      const text = url;
      const title = 'Title';
      const tweet = {
        author: 'Author',
        username: 'Username',
      };
      const urlOffset = 0;

      const linkPreview = await account.service!.conversation.messageBuilder.createLinkPreview({
        permanentUrl,
        summary,
        title,
        tweet,
        url,
        urlOffset,
      });
      const textMessage = account
        .service!.conversation.messageBuilder.createText({conversationId: '', text})
        .withLinkPreviews([linkPreview])
        .build();

      expect(textMessage.content.text).toEqual(text);
      expect(textMessage.content.linkPreviews).toEqual(jasmine.any(Array));
      expect(textMessage.content.linkPreviews!.length).toBe(1);

      expect(textMessage.content.linkPreviews![0]).toEqual(
        jasmine.objectContaining({
          permanentUrl,
          summary,
          title,
          tweet,
          url,
          urlOffset,
        }),
      );
    });

    it('does not add link previews', () => {
      account['apiClient'].context = {
        clientType: ClientType.NONE,
        userId: PayloadHelper.getUUID(),
      };

      const text = 'Hello, world!';
      const textMessage = account.service!.conversation.messageBuilder.createText({conversationId: '', text}).build();

      expect(textMessage.content.linkPreviews).toBeUndefined();
    });

    it('uploads link previews', async () => {
      account['apiClient'].context = {
        clientType: ClientType.NONE,
        userId: PayloadHelper.getUUID(),
      };

      spyOn(account.service!.asset, 'uploadImageAsset').and.returnValue(
        Promise.resolve({
          cipherText: Buffer.from([]),
          key: '',
          keyBytes: Buffer.from([]),
          sha256: Buffer.from([]),
          token: '',
        }),
      );

      const url = 'http://example.com';
      const image = {
        data: Buffer.from([]),
        height: 123,
        type: 'image/jpeg',
        width: 456,
      };
      const text = url;
      const urlOffset = 0;

      const linkPreview = await account.service!.conversation.messageBuilder.createLinkPreview({image, url, urlOffset});
      const textMessage = account
        .service!.conversation.messageBuilder.createText({conversationId: '', text})
        .withLinkPreviews([linkPreview])
        .build();

      expect(account.service!.asset.uploadImageAsset).toHaveBeenCalledTimes(1);

      expect(textMessage.content.linkPreviews).toEqual(jasmine.any(Array));
      expect(textMessage.content.linkPreviews!.length).toBe(1);

      expect(textMessage.content.linkPreviews![0]).toEqual(
        jasmine.objectContaining({
          url,
          urlOffset,
        }),
      );
    });

    it('adds mentions correctly', () => {
      account['apiClient'].context = {
        clientType: ClientType.NONE,
        userId: PayloadHelper.getUUID(),
      };

      const text = 'Hello @user!';

      const mention: MentionContent = {
        length: 5,
        start: 6,
        userId: PayloadHelper.getUUID(),
      };

      const textMessage = account
        .service!.conversation.messageBuilder.createText({conversationId: '', text})
        .withMentions([mention])
        .build();

      expect(textMessage.content.text).toEqual(text);
      expect(textMessage.content.mentions).toEqual(jasmine.any(Array));
      expect(textMessage.content.mentions!.length).toBe(1);

      expect(textMessage.content.mentions![0]).toEqual(jasmine.objectContaining(mention));
    });

    it('does not add mentions', () => {
      account['apiClient'].context = {
        clientType: ClientType.NONE,
        userId: PayloadHelper.getUUID(),
      };

      const text = 'Hello, world!';
      const textMessage = account.service!.conversation.messageBuilder.createText({conversationId: '', text}).build();

      expect(textMessage.content.mentions).toBeUndefined();
    });

    it('adds a quote correctly', () => {
      account['apiClient'].context = {
        clientType: ClientType.NONE,
        userId: PayloadHelper.getUUID(),
      };

      const quoteId = PayloadHelper.getUUID();
      const text = 'I totally agree.';

      const quote: QuoteContent = {
        quotedMessageId: quoteId,
      };

      const replyMessage = account
        .service!.conversation.messageBuilder.createText({conversationId: '', text})
        .withQuote(quote)
        .build();

      expect(replyMessage.content.text).toEqual(text);
      expect(replyMessage.content.quote).toEqual(jasmine.objectContaining({quotedMessageId: quoteId}));
      expect(replyMessage.content.quote).toEqual(jasmine.objectContaining(quote));
    });

    it('does not add a quote', () => {
      account['apiClient'].context = {
        clientType: ClientType.NONE,
        userId: PayloadHelper.getUUID(),
      };

      const text = 'Hello, world!';
      const textMessage = account.service!.conversation.messageBuilder.createText({conversationId: '', text}).build();

      expect(textMessage.content.quote).toBeUndefined();
    });

    it('adds a read confirmation request correctly', () => {
      account['apiClient'].context = {
        clientType: ClientType.NONE,
        userId: PayloadHelper.getUUID(),
      };

      const text = 'Please read me';

      const replyMessage = account
        .service!.conversation.messageBuilder.createText({conversationId: '', text})
        .withReadConfirmation(true)
        .build();

      expect(replyMessage.content.text).toEqual(text);
      expect(replyMessage.content.expectsReadConfirmation).toEqual(true);
    });

    it('adds a legal hold status', () => {
      account['apiClient'].context = {
        clientType: ClientType.NONE,
        userId: PayloadHelper.getUUID(),
      };

      const text = 'Please read me';

      const firstMessage = account
        .service!.conversation.messageBuilder.createText({conversationId: '', text})
        .withLegalHoldStatus()
        .build();

      expect(firstMessage.content.legalHoldStatus).toEqual(LegalHoldStatus.UNKNOWN);

      const replyMessage = account
        .service!.conversation.messageBuilder.createText({conversationId: '', text})
        .withLegalHoldStatus(LegalHoldStatus.ENABLED)
        .build();

      expect(replyMessage.content.text).toEqual(text);
      expect(replyMessage.content.legalHoldStatus).toEqual(LegalHoldStatus.ENABLED);
    });
  });
});
