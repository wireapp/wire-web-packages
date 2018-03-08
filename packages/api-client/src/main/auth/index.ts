//
// Wire
// Copyright (C) 2018 Wire Swiss GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see http://www.gnu.org/licenses/.
//

const AUTH_ACCESS_TOKEN_KEY: string = 'access-token';
const AUTH_COOKIE_KEY: string = 'cookie';
const AUTH_TABLE_NAME: string = 'authentication';

export {AUTH_ACCESS_TOKEN_KEY, AUTH_COOKIE_KEY, AUTH_TABLE_NAME};

export * from './AccessTokenData';
export * from './AccessTokenStore';
export * from './AuthAPI';
export * from './ClientPreKey';
export * from './Context';
export * from './Cookie';
export * from './LoginData';
export * from './PreKey';
export * from './PreKeyBundle';
export * from './RegisterData';
