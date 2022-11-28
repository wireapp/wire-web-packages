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

import {keys as ProteusKeys} from '@wireapp/proteus';

import {PrekeyGenerator} from './PrekeysGenerator';

import {CoreDatabase, openDB} from '../../../../storage/CoreDB';

describe('PrekeysGenerator', () => {
  let db: CoreDatabase;
  const mockPrekeyGenerator = {
    proteusNewPrekey: jest.fn().mockResolvedValue(Uint8Array.from([])),
  };

  beforeEach(async () => {
    db = await openDB('test');
  });

  afterEach(async () => {
    await db.clear('prekeys');
  });

  it('generates initial device prekeys', async () => {
    const prekeyGenerator = new PrekeyGenerator(mockPrekeyGenerator, db);
    const nbPrekeys = Math.floor(Math.random() * 100);
    const {prekeys, lastPrekey} = await prekeyGenerator.generateInitialPrekeys(nbPrekeys);
    expect(prekeys).toHaveLength(nbPrekeys);
    expect(lastPrekey.id).toBe(ProteusKeys.PreKey.MAX_PREKEY_ID);
  });

  it('keeps track of the last generated prekey ID', async () => {
    const prekeyGenerator = new PrekeyGenerator(mockPrekeyGenerator, db);
    const nbPrekeys = Math.floor(Math.random() * 100);
    const {prekeys, lastPrekey} = await prekeyGenerator.generateInitialPrekeys(nbPrekeys);
    expect(prekeys).toHaveLength(nbPrekeys);
    expect(lastPrekey.id).toBe(ProteusKeys.PreKey.MAX_PREKEY_ID);

    const newPrekeys = await prekeyGenerator.generatePrekeys(1);
    expect(newPrekeys[0].id).toBe(nbPrekeys + 1);
  });
});
