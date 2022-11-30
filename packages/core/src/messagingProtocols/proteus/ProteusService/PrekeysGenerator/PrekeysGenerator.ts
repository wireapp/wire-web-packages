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

import {PreKey} from '@wireapp/api-client/lib/auth';
import {CoreCrypto} from '@wireapp/core-crypto/platforms/web/corecrypto';
import {Encoder} from 'bazinga64';

import {keys as ProteusKeys} from '@wireapp/proteus';

import {PrekeysGeneratorStore} from './PrekeysGenerator.store';

import type {CoreDatabase} from '../../../../storage/CoreDB';
import {NewDevicePrekeys} from '../ProteusService.types';

type CoreCryptoPrekeyGenerator = Pick<CoreCrypto, 'proteusNewPrekey'>;

interface PrekeysGeneratorConfig {
  /**
   * the minimum number of prekeys that needs to be live at any point
   * We consuming a prekey, if this number is reached, then the `onHitThreshold` will be called
   */
  threshold: number;
  onHitThreshold: () => void;
}
export class PrekeyGenerator {
  private prekeyState: PrekeysGeneratorStore;

  constructor(
    private readonly generator: CoreCryptoPrekeyGenerator,
    db: CoreDatabase,
    private config: PrekeysGeneratorConfig,
  ) {
    this.prekeyState = new PrekeysGeneratorStore(db);
  }

  private async generatePrekey(id: number) {
    const key = await this.generator.proteusNewPrekey(id);
    return {id, key: Encoder.toBase64(key).asString};
  }

  async generatePrekeys(nbPrekeys: number): Promise<PreKey[]> {
    const prekeys: PreKey[] = [];
    const ids = await this.prekeyState.createIds(nbPrekeys);
    for (const id of ids) {
      prekeys.push(await this.generatePrekey(id));
    }
    return prekeys;
  }

  async consumePrekey() {
    const nbPrekeys = await this.prekeyState.consumePrekey();
    if (nbPrekeys <= this.config.threshold) {
      this.config.onHitThreshold();
    }
  }

  /**
   * Will generate the initial set of prekeys for a new device
   * @param nbPrekeys the number of prekeys to generate
   * @param generator the class that will be used to generate a single prekey
   */
  async generateInitialPrekeys(nbPrekeys: number): Promise<NewDevicePrekeys> {
    return {
      prekeys: await this.generatePrekeys(nbPrekeys),
      lastPrekey: await this.generatePrekey(ProteusKeys.PreKey.MAX_PREKEY_ID),
    };
  }
}
