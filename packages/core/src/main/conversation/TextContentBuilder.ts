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

import {ConversationContent, LinkPreviewUploadedContent, TextContent} from '../conversation/content/';
import {PayloadBundleOutgoingUnsent, PayloadBundleState, PayloadBundleType} from '../conversation/root';

class TextContentBuilder {
  constructor(private readonly payloadBundle: PayloadBundleOutgoingUnsent) {
    this.payloadBundle = payloadBundle;
  }

  public get content(): ConversationContent | undefined {
    return this.payloadBundle.content;
  }

  public get from(): string {
    return this.payloadBundle.from;
  }

  public get id(): string {
    return this.payloadBundle.id;
  }

  public get state(): PayloadBundleState {
    return this.payloadBundle.state;
  }

  public get timestamp(): number {
    return this.payloadBundle.timestamp;
  }

  public get type(): PayloadBundleType {
    return this.payloadBundle.type;
  }

  public withLinkPreviews(linkPreviews: LinkPreviewUploadedContent[]): TextContentBuilder {
    const content = this.payloadBundle.content as TextContent;
    content.linkPreviews = linkPreviews;

    return this;
  }
}

export {TextContentBuilder};
