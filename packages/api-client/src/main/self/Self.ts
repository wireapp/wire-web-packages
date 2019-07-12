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

import {AccentColor} from '@wireapp/commons';
import {Picture, SSOSignature} from '../self/';
import {UserAsset} from '../user/';

export interface Self {
  accent_id?: AccentColor.UserAccentColor;
  assets: UserAsset[];
  deleted?: boolean;
  email?: string;
  expires_at?: string;
  handle?: string;
  id: string;
  locale: string;
  name: string;
  phone?: string;
  picture?: Picture[];
  sso_id?: SSOSignature;
  team?: string;
}
