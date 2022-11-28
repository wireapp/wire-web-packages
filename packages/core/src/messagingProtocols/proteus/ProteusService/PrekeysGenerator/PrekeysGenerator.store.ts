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

import {CoreDatabase} from '../../../../storage/CoreDB';

const STATE_PRIMARY_KEY = 'highest_id';

export class PrekeysGeneratorStore {
  constructor(private readonly db: CoreDatabase) {}

  private async getState(): Promise<number> {
    return (await this.db.get('prekeys', STATE_PRIMARY_KEY)) ?? 0;
  }

  private async saveState(state: number): Promise<void> {
    await this.db.put('prekeys', state, STATE_PRIMARY_KEY);
  }

  /**
   * will generate nbIds ids that can be used to store prekeys
   * @param nbIds the number of ids to generate
   */
  async createIds(nbIds: number): Promise<number[]> {
    const currentState = await this.getState();
    const newState = currentState + nbIds;
    this.saveState(newState);

    return Array.from(new Array(nbIds)).map((_, i) => currentState + 1 + i);
  }
}
