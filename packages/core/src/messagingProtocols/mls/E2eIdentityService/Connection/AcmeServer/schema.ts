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

import z from 'zod';

const nonOptionalString = z.string().min(1);

export const ResponseHeaderNonceSchema = z.object({
  'replay-nonce': nonOptionalString,
});
export type ResponseHeaderNonce = z.infer<typeof ResponseHeaderNonceSchema>;

export const ResponseHeaderLocationSchema = z.object({
  location: z.string().url(),
});
export type ResponseHeaderLocation = z.infer<typeof ResponseHeaderLocationSchema>;

export const DirectoryResponseDataSchema = z.object({
  newAccount: z.string().url(),
  newNonce: z.string().url(),
  newOrder: z.string().url(),
});
export type DirectoryResponseData = z.infer<typeof DirectoryResponseDataSchema>;

export const NewAccountResponseDataSchema = z.object({
  status: nonOptionalString,
  orders: z.string().url(),
  contact: z.array(z.string().email()),
});
export type NewAccountResponseData = z.infer<typeof NewAccountResponseDataSchema>;

export const NewOrderResponseDataSchema = z.object({
  status: nonOptionalString,
  expires: nonOptionalString,
  notBefore: nonOptionalString,
  notAfter: nonOptionalString,
  identifiers: z.array(
    z.object({
      type: nonOptionalString,
      value: nonOptionalString,
    }),
  ),
  authorizations: z.array(z.string().url()),
  finalize: z.string().url(),
});
export type NewOrderResponseData = z.infer<typeof NewOrderResponseDataSchema>;

export const AuthorizationResponseDataSchema = z.object({
  status: nonOptionalString,
  expires: nonOptionalString,
  //wildcard: z.boolean(),
  identifier: z.object({
    type: nonOptionalString,
    value: nonOptionalString,
  }),
  challenges: z.array(
    z.object({
      type: nonOptionalString,
      url: z.string().url(),
      status: nonOptionalString,
      token: nonOptionalString,
      target: z.string().url(),
    }),
  ),
});
export type AuthorizationResponseData = z.infer<typeof AuthorizationResponseDataSchema>;

export const ValidateDpopChallengeResponseDataSchema = z.object({
  type: nonOptionalString,
  url: z.string().url(),
  status: nonOptionalString,
  token: nonOptionalString,
});
export type ValidateDpopChallengeResponseData = z.infer<typeof ValidateDpopChallengeResponseDataSchema>;

export const ValidateOidcChallengeResponseDataSchema = z.object({});
export type ValidateOidcChallengeResponseData = z.infer<typeof ValidateOidcChallengeResponseDataSchema>;
