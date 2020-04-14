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
import {CompositeMessage} from './OtrMessage';

import Item = Composite.Item;

export class CompositeContentBuilder {
  private readonly content: CompositeContent;
  private readonly payloadBundle: CompositeMessage;

  constructor(payloadBundle: CompositeMessage) {
    this.payloadBundle = payloadBundle;
    this.content = this.payloadBundle.content as CompositeContent;
    this.content.items = [];
  }

  build(): CompositeMessage {
    this.payloadBundle.content = this.content;
    return this.payloadBundle;
  }

  withReadConfirmation(expectsReadConfirmation: boolean = false): CompositeContentBuilder {
    if (typeof expectsReadConfirmation !== 'undefined') {
      this.content.expectsReadConfirmation = expectsReadConfirmation;
    }
    return this;
  }

  withLegalHoldStatus(legalHoldStatus = LegalHoldStatus.UNKNOWN): CompositeContentBuilder {
    if (typeof legalHoldStatus !== 'undefined') {
      this.content.legalHoldStatus = legalHoldStatus;
    }
    return this;
  }

  addText(text: Text): CompositeContentBuilder {
    this.content.items.push(Item.create({text}));
    return this;
  }

  addButton(buttonText: string): CompositeContentBuilder {
    const buttonProtos = [];
    buttonProtos.push(Button.create({id: '', text: buttonText}));

    this.content.items = [...this.content.items, ...buttonProtos.map(button => Item.create({button}))];
    return this;
  }
}
