/*
 * Wire
 * Copyright (C) 2023 Wire Swiss GmbH
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

import {Converter, EncodedData, Encoder} from 'bazinga64';

import {User} from '../E2EIService.types';

export const jsonToByteArray = (data: any): Uint8Array => {
  const encoder = new TextEncoder();
  return encoder.encode(JSON.stringify(data, null, 0));
};

export const uuidTobase64url = (uuid: string): EncodedData => {
  const noDashes = uuid.replace(/-/g, '');
  if (noDashes.length !== 32) {
    throw new Error('Invalid UUID');
  }

  return Encoder.toBase64Url(Converter.hexStringToArrayBufferView(noDashes));
};

export type E2EIClientId = `${string}:${string}@${string}`;
export const getE2EIClientId = (user: User, clientId: string): E2EIClientId => {
  return `${uuidTobase64url(user.id).asString}:${clientId}@${user.domain}`;
};

export const isResponseStatusValid = (status: string | undefined) => status && status === 'valid';
