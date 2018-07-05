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

import {UnknownConversationError} from '../conversation/';
import {BackendError, BackendErrorLabel, StatusCode} from '../http/';
import {UnknownUserError} from '../user/';

class BackendErrorMapper {
  public static map(error: BackendError): Error {
    const errors: {
      [code: number]: {
        [label: string]: {
          [message: string]: Error;
        };
      };
    } = {
      [Number(StatusCode.BAD_REQUEST)]: {
        [String(BackendErrorLabel.CLIENT_ERROR)]: {
          ["[path] 'cnv' invalid: Failed reading: Invalid UUID"]: new UnknownConversationError(
            'Conversation ID is unknown.'
          ),
          ["[path] 'usr' invalid: Failed reading: Invalid UUID"]: new UnknownUserError('User ID is unknown.'),
        },
      },
    };

    try {
      const mappedError: Error | undefined = errors[Number(error.code)][error.label][error.message];
      if (mappedError) {
        return mappedError;
      }
      return new Error(error.message);
    } catch (mappingError) {
      return new Error(error.message);
    }
  }
}

export {BackendErrorMapper};
