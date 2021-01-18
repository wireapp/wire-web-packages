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

import {Contact} from '.';
import {Role} from '../team';

export enum SearchOrder {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export interface SearchOptions {
  /** Filter results by member role */
  frole?: Role[];
  /** Sort order (asc | desc | undefined) */
  order?: SearchOrder;
  /** Max number of search results. Defaults to 15 results. Min 1, max 500. */
  size?: number;
  /** Sort results */
  sortby?: keyof Pick<Contact, 'email' | 'name' | 'handle' | 'created_at' | 'role' | 'managed_by' | 'saml_idp'>;
}
