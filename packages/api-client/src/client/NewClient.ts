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

import type {PreKey} from '../auth/';
import type {ClientClassification, ClientType, Location} from './';
import {ClientCapabilityData} from './ClientCapabilityData';

interface SharedClientModel {
  label?: string;
  lastkey: PreKey;
  prekeys: PreKey[];
}

export interface NewClient extends SharedClientModel {
  class: ClientClassification.DESKTOP | ClientClassification.PHONE | ClientClassification.TABLET;
  cookie: string;
  location?: Location;
  model?: string;
  password?: string;
  verification_code?: string;
  type: ClientType.PERMANENT | ClientType.TEMPORARY;
}

export type UpdatedClient = Partial<SharedClientModel & ClientCapabilityData>;
