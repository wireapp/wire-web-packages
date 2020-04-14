/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
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

import {Button, Composite, Text} from '@wireapp/protocol-messaging';
import {CompositeContent, LegalHoldStatus} from '../content';
import {CompositeMessage, EditedTextMessage} from './OtrMessage';

import Item = Composite.Item;

export class CompositeContentBuilder {
  private readonly content: CompositeContent;
  private readonly payloadBundle: CompositeMessage | EditedTextMessage;

  constructor(payloadBundle: CompositeMessage | EditedTextMessage) {
    this.payloadBundle = payloadBundle;
    this.content = this.payloadBundle.content as CompositeContent;
  }

  public build(): CompositeMessage {
    this.payloadBundle.content = this.content;
    return this.payloadBundle;
  }

  public withReadConfirmation(expectsReadConfirmation: boolean = false): CompositeContentBuilder {
    if (typeof expectsReadConfirmation !== 'undefined') {
      this.content.expectsReadConfirmation = expectsReadConfirmation;
    }
    return this;
  }

  public withLegalHoldStatus(legalHoldStatus = LegalHoldStatus.UNKNOWN): CompositeContentBuilder {
    if (typeof legalHoldStatus !== 'undefined') {
      this.content.legalHoldStatus = legalHoldStatus;
    }
    return this;
  }

  public addText(text: Text): CompositeContentBuilder {
    if (!this.content.items) {
      this.content.items = [];
    }
    this.content.items.push(Item.create({text}));
    return this;
  }

  public addButton(buttonText: string): CompositeContentBuilder {
    const buttonProtos = [];
    buttonProtos.push(Button.create({id: '', text: buttonText}));

    if (!this.content.items) {
      this.content.items = [];
    }
    this.content.items = [...this.content.items, ...buttonProtos.map(button => Item.create({button}))];
    return this;
  }
}
