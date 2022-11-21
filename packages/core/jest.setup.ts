/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import 'fake-indexeddb/auto';

import nodeCrypto from 'crypto';

// @ts-ignore
global.crypto = nodeCrypto.webcrypto;
global.btoa = (text: string) => Buffer.from(text).toString('base64');
global.atob = (base64: string) => Buffer.from(base64, 'base64').toString();
