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

import type {AccentColor} from '@wireapp/commons';

import type {ServiceRef} from '../conversation/';
import type {Picture} from '../self/';
import type {UserAsset} from '../user/';
import type {QualifiedId} from './QualifiedId';

export interface User {
  accent_id?: AccentColor.AccentColorID;
  assets?: UserAsset[];
  deleted?: boolean;
  email?: string;
  email_unvalidated?: string;
  expires_at?: string;
  handle?: string;
  id: string;
  name: string;
  picture?: Picture[];
  qualified_id?: QualifiedId;
  service?: ServiceRef;
  team?: string;
}
