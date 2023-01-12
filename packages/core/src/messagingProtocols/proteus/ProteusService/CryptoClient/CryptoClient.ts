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

import {PreKey} from '@wireapp/api-client/lib/auth';
import {Encoder} from 'bazinga64';

import type {CoreCrypto} from '@wireapp/core-crypto';
import type {Cryptobox} from '@wireapp/cryptobox';
import type {CRUDEngine} from '@wireapp/store-engine';

import {CoreCryptoWrapper} from './CoreCryptoWrapper';
import {CryptoboxWrapper} from './CryptoboxWrapper';
import {CryptoClient} from './CryptoClient.types';

import {CoreDatabase} from '../../../../storage/CoreDB';

export enum CryptoClientType {
  CORE_CRYPTO,
  CRYPTOBOX,
}

export type CryptoClientDef = [CryptoClientType.CRYPTOBOX, Cryptobox] | [CryptoClientType.CORE_CRYPTO, CoreCrypto];

type Config = {
  nbPrekeys: number;
  onNewPrekeys: (prekeys: PreKey[]) => void;
};

type InitConfig = {
  storeEngine: CRUDEngine;
  nbPrekeys: number;
  secretKey: Uint8Array;
  coreCryptoWasmFilePath?: string;
};

export async function buildCryptoClient(
  clientType: CryptoClientType,
  {storeEngine, nbPrekeys, secretKey, coreCryptoWasmFilePath}: InitConfig,
): Promise<CryptoClientDef> {
  if (clientType === CryptoClientType.CORE_CRYPTO) {
    const {CoreCrypto} = await import('@wireapp/core-crypto');
    const coreCrypto = await CoreCrypto.deferredInit(
      `corecrypto-${storeEngine.storeName}`,
      Encoder.toBase64(secretKey).asString,
      undefined, // We pass a placeholder entropy data. It will be set later on by calling `reseedRng`
      coreCryptoWasmFilePath,
    );
    return [CryptoClientType.CORE_CRYPTO, coreCrypto];
  }

  const {Cryptobox} = await import('@wireapp/cryptobox');
  return [CryptoClientType.CRYPTOBOX, new Cryptobox(storeEngine, nbPrekeys)];
}

export function wrapCryptoClient(
  [clientType, cryptoClient]: CryptoClientDef,
  db: CoreDatabase,
  config: Config,
): CryptoClient {
  return clientType === CryptoClientType.CORE_CRYPTO
    ? new CoreCryptoWrapper(cryptoClient, db, config)
    : new CryptoboxWrapper(cryptoClient, config);
}
