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

import {CRUDEngine} from '@wireapp/store-engine';

const TABLE_NAME = 'prekeys_state';
const STATE_PRIMARY_KEY = 'highest_id';

export class PrekeysGeneratorStore {
  constructor(private readonly store: CRUDEngine) {}

  private async getState(): Promise<number> {
    try {
      const value = await this.store.read<number>(TABLE_NAME, STATE_PRIMARY_KEY);
      return value;
    } catch (e) {
      return 0;
    }
  }

  private async saveState(state: number): Promise<void> {
    await this.store.updateOrCreate(TABLE_NAME, STATE_PRIMARY_KEY, state);
  }

  async createIds(nbIds: number): Promise<number[]> {
    const currentState = await this.getState();
    const newState = currentState + nbIds;
    this.saveState(newState);

    return Array.from(new Array(nbIds)).map((_, i) => currentState + 1 + i);
  }
}
