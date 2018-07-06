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
import {UnconnectedUserError, UnknownUserError} from '../user/';

class BackendErrorMapper {
  public static map(error: BackendError): BackendError {
    const BACKEND_ERRORS: {
      [code: number]: {
        [label: string]: {
          [message: string]: BackendError;
        };
      };
    } = {
      [Number(StatusCode.TOO_MANY_REQUESTS)]: {
        [String(BackendErrorLabel.CLIENT_ERROR)]: {
          ['Logins too frequent']: new BackendError('Logins too frequent. User login temporarily disabled.'),
        },
      },
      [Number(StatusCode.FORBIDDEN)]: {
        [String(BackendErrorLabel.NOT_CONNECTED)]: {
          ['Users are not connected']: new UnconnectedUserError('Users are not connected.'),
        },
      },
      [Number(StatusCode.BAD_REQUEST)]: {
        [String(BackendErrorLabel.CLIENT_ERROR)]: {
          ["[path] 'cnv' invalid: Failed reading: Invalid UUID"]: new UnknownConversationError(
            'Conversation ID is unknown.'
          ),
          ["[path] 'usr' invalid: Failed reading: Invalid UUID"]: new UnknownUserError('User ID is unknown.'),
          ['Error in $: Failed reading: satisfy']: new BackendError('Wrong set of parameters.'),
        },
      },
    };

    try {
      const mappedError: BackendError | undefined = BACKEND_ERRORS[Number(error.code)][error.label][
        error.message
      ] as BackendError;
      if (mappedError) {
        return mappedError;
      }
      return new BackendError(error.message);
    } catch (mappingError) {
      return new BackendError(error.message);
    }
  }
}

export {BackendErrorMapper};
