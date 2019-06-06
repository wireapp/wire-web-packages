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

import {BackendErrorLabel, StatusCode} from '../http/';

export class BackendError extends Error {
  code: StatusCode;
  label: BackendErrorLabel;
  message: string;

  constructor(
    message: string,
    label: BackendErrorLabel = BackendErrorLabel.UNKNOWN,
    code: StatusCode = StatusCode.UNKNOWN
  ) {
    super(message);
    this.code = code;
    this.label = label;
    this.message = message;
    // see https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, BackendError.prototype);
  }
}
