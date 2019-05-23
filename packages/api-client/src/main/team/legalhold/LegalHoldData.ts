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

export enum LegalHoldStatus {
  ENABLED_NOT_CONFIGURED = 'enabled_not_configured',
  ENABLED_CONFIGURED = 'enabled_configured',
  DISABLED = 'disabled',
}

export interface LegalHoldData {
  enabled: LegalHoldStatus;
  // settings data is only present when legal hold is LegalHoldStatus.ENABLED_CONFIGURED
  settings?: {
    team_id: string;
    fingerprint: string;
    base_url: string;
  };
}
