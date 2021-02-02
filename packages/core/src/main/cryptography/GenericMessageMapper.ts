/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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

import type {ConversationOtrMessageAddEvent} from '@wireapp/api-client/src/event/';
import type {Ephemeral, GenericMessage} from '@wireapp/protocol-messaging';
import logdown from 'logdown';

import {
  BasePayloadBundle,
  GenericMessageType,
  PayloadBundle,
  PayloadBundleContent,
  PayloadBundleSource,
  PayloadBundleState,
  PayloadBundleType,
  ReactionType,
} from '../conversation';
import type {
  AssetContent,
  ButtonActionContent,
  ClearedContent,
  ConfirmationContent,
  DeletedContent,
  EditedTextContent,
  HiddenContent,
  KnockContent,
  LinkPreviewContent,
  LocationContent,
  ReactionContent,
  TextContent,
} from '../conversation/content';
import type {ButtonActionMessage} from '../conversation/message/OtrMessage';

export type GenericEphemeralMessageWithMessageId = Ephemeral & {
  messageId: string;
};

export class GenericMessageMapper {
  private static readonly logger = logdown('@wireapp/core/cryptography/GenericMessageMapper', {
    logger: console,
    markdown: false,
  });

  private static mapButtonActionMessage(
    genericMessage: GenericMessage,
    event: ConversationOtrMessageAddEvent,
    source: PayloadBundleSource,
  ): ButtonActionMessage {
    const {buttonAction, messageId} = genericMessage;
    return {
      content: buttonAction!,
      conversation: event.conversation,
      from: event.from,
      fromClientId: event.data.sender,
      id: messageId,
      messageTimer: 0,
      source,
      state: PayloadBundleState.INCOMING,
      timestamp: new Date(event.time).getTime(),
      type: PayloadBundleType.BUTTON_ACTION,
    };
  }

  public static mapGenericMessage(
    genericMessage: GenericMessage | GenericEphemeralMessageWithMessageId,
    event: ConversationOtrMessageAddEvent,
    source: PayloadBundleSource,
  ): BasePayloadBundle<PayloadBundleContent> {
    switch (genericMessage.content) {
      case GenericMessageType.TEXT: {
        const {
          content: text,
          expectsReadConfirmation,
          legalHoldStatus,
          linkPreview: linkPreviews,
          mentions,
          quote,
        } = genericMessage[GenericMessageType.TEXT]!;

        const content: TextContent = {
          expectsReadConfirmation: expectsReadConfirmation ?? undefined,
          legalHoldStatus: legalHoldStatus ?? undefined,
          text,
        };

        if (linkPreviews?.length) {
          content.linkPreviews = linkPreviews as LinkPreviewContent[];
        }

        if (mentions?.length) {
          content.mentions = mentions;
        }

        if (quote) {
          content.quote = quote;
        }

        if (legalHoldStatus) {
          content.legalHoldStatus = legalHoldStatus;
        }

        return {
          content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.TEXT,
        } as PayloadBundle<TextContent>;
      }
      case GenericMessageType.BUTTON_ACTION: {
        return GenericMessageMapper.mapButtonActionMessage(
          genericMessage,
          event,
          source,
        ) as PayloadBundle<ButtonActionContent>;
      }
      case GenericMessageType.CALLING: {
        return {
          content: genericMessage[GenericMessageType.CALLING]!.content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.CALL,
        } as PayloadBundle<string>;
      }
      case GenericMessageType.CONFIRMATION: {
        const {firstMessageId, moreMessageIds, type} = genericMessage[GenericMessageType.CONFIRMATION]!;

        const content: ConfirmationContent = {firstMessageId, moreMessageIds, type};

        return {
          content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.CONFIRMATION,
        } as PayloadBundle<ConfirmationContent>;
      }
      case GenericMessageType.CLEARED: {
        const content: ClearedContent = genericMessage[GenericMessageType.CLEARED]!;

        return {
          content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.CONVERSATION_CLEAR,
        } as PayloadBundle<ClearedContent>;
      }
      case GenericMessageType.DELETED: {
        const originalMessageId = genericMessage[GenericMessageType.DELETED]!.messageId;

        const content: DeletedContent = {messageId: originalMessageId};

        return {
          content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.MESSAGE_DELETE,
        } as PayloadBundle<DeletedContent>;
      }
      case GenericMessageType.EDITED: {
        const {text, replacingMessageId} = genericMessage[GenericMessageType.EDITED]!;

        const {
          expectsReadConfirmation,
          content: editedText,
          legalHoldStatus,
          linkPreview: editedLinkPreviews,
          mentions: editedMentions,
          quote: editedQuote,
        } = text!;

        const content: EditedTextContent = {
          expectsReadConfirmation: expectsReadConfirmation ?? undefined,
          legalHoldStatus: legalHoldStatus ?? undefined,
          originalMessageId: replacingMessageId,
          text: editedText,
        };

        if (editedLinkPreviews?.length) {
          content.linkPreviews = editedLinkPreviews as LinkPreviewContent[];
        }

        if (editedMentions?.length) {
          content.mentions = editedMentions;
        }

        if (editedQuote) {
          content.quote = editedQuote;
        }

        return {
          content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.MESSAGE_EDIT,
        } as PayloadBundle<EditedTextContent>;
      }
      case GenericMessageType.HIDDEN: {
        const {conversationId, messageId} = genericMessage[GenericMessageType.HIDDEN]!;

        const content: HiddenContent = {
          conversationId,
          messageId,
        };

        return {
          content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.MESSAGE_HIDE,
        } as PayloadBundle<HiddenContent>;
      }

      case GenericMessageType.KNOCK: {
        const {expectsReadConfirmation, legalHoldStatus} = genericMessage[GenericMessageType.KNOCK]!;
        const content: KnockContent = {expectsReadConfirmation, hotKnock: false, legalHoldStatus};

        return {
          content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.PING,
        } as PayloadBundle<KnockContent>;
      }

      case GenericMessageType.LOCATION: {
        const {expectsReadConfirmation, latitude, legalHoldStatus, longitude, name, zoom} = genericMessage[
          GenericMessageType.LOCATION
        ]!;

        const content: LocationContent = {
          expectsReadConfirmation: expectsReadConfirmation ?? undefined,
          latitude,
          legalHoldStatus: legalHoldStatus ?? undefined,
          longitude,
          name: name ?? undefined,
          zoom: zoom ?? undefined,
        };

        return {
          content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.LOCATION,
        } as PayloadBundle<LocationContent>;
      }

      case GenericMessageType.ASSET: {
        const {expectsReadConfirmation, legalHoldStatus, notUploaded, original, preview, uploaded} = genericMessage[
          GenericMessageType.ASSET
        ]!;
        const isImage = !!uploaded?.assetId && !!original?.image;

        const content: AssetContent = {
          abortReason: notUploaded ?? undefined,
          expectsReadConfirmation: expectsReadConfirmation ?? undefined,
          legalHoldStatus: legalHoldStatus ?? undefined,
          original: original ?? undefined,
          preview: preview ?? undefined,
          uploaded: {
            assetId: uploaded?.assetId || '',
            assetToken: uploaded?.assetToken,
            encryption: uploaded?.encryption,
            otrKey: uploaded?.otrKey || new Uint8Array(),
            sha256: uploaded?.sha256 || new Uint8Array(),
          },
        };

        return {
          content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: isImage ? PayloadBundleType.ASSET_IMAGE : PayloadBundleType.ASSET,
        } as PayloadBundle<AssetContent>;
      }

      case GenericMessageType.REACTION: {
        const {emoji, legalHoldStatus, messageId} = genericMessage[GenericMessageType.REACTION]!;

        const content: ReactionContent = {
          legalHoldStatus: legalHoldStatus ?? undefined,
          originalMessageId: messageId,
          type: emoji as ReactionType,
        };

        return {
          content,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.REACTION,
        } as PayloadBundle<ReactionContent>;
      }

      default: {
        this.logger.warn(`Unhandled event type "${genericMessage.content}": ${JSON.stringify(genericMessage)}`);
        return {
          content: genericMessage.content as any,
          conversation: event.conversation,
          from: event.from,
          fromClientId: event.data.sender,
          id: genericMessage.messageId,
          messageTimer: 0,
          source,
          state: PayloadBundleState.INCOMING,
          timestamp: new Date(event.time).getTime(),
          type: PayloadBundleType.UNKNOWN,
        } as PayloadBundle;
      }
    }
  }
}
