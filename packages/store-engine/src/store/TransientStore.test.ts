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

import {TransientStore} from './TransientStore';

import {CRUDEngine, MemoryEngine} from '../engine';
import {RecordAlreadyExistsError} from '../engine/error';

describe('store.TransientStore', () => {
  const STORE_NAME = 'database-name';
  const TABLE_NAME = 'table-name';

  let engine: CRUDEngine;
  let store: TransientStore;

  beforeEach(async () => {
    engine = new MemoryEngine();
    await engine.init(STORE_NAME);

    store = new TransientStore(engine);
    await store.init(TABLE_NAME);
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe('set', () => {
    const entity = {
      access_token: 'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==',
    };
    const primaryKey = 'access-tokens';
    const ttl = 1000;

    it("saves a record together with it's expiration date.", async () => {
      const bundle = await store.set(primaryKey, entity, ttl);
      expect(bundle.expires).toEqual(expect.any(Number));
    });

    it("saves a record together with it's timeoutID.", async () => {
      const bundle = await store.set(primaryKey, entity, ttl);
      expect(bundle.timeoutID).toBeDefined();
    });

    it("doesn't overwrite an existing record.", async () => {
      expect.assertions(2);
      try {
        await store.set(primaryKey, entity, ttl);
        await store.set(primaryKey, {access_token: 'ABC'}, ttl);
      } catch (error) {
        expect(error).toEqual(expect.any(RecordAlreadyExistsError));
        expect((error as RecordAlreadyExistsError).code).toBe(1);
      }
    });
  });

  describe('get', () => {
    const entity = {
      access_token: 'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==',
    };
    const ttl = 900;

    it("returns a saved record together with it's expiration.", async () => {
      const primaryKey = 'access-tokens';

      await store.set(primaryKey, entity, ttl);
      const bundle = await store.get(primaryKey);

      if (bundle) {
        expect(bundle.payload).toEqual(entity);
      } else {
        throw new Error('Bundle is not defined.');
      }
    });

    it(`returns a saved record with an "@" in it's primary key.`, async () => {
      const primaryKey = '@access@tokens';

      await store.set(primaryKey, entity, ttl);
      const bundle = await store.get(primaryKey);

      if (bundle) {
        expect(bundle.payload).toEqual(entity);
      } else {
        throw new Error('Bundle is not defined.');
      }
    });

    it('returns a non-existent record as "undefined".', async () => {
      const primaryKey = 'not-existing';

      const bundle = await store.get(primaryKey);
      expect(bundle).toBeUndefined();
    });
  });

  describe('deleteFromCache', () => {
    it("doesn't fail when deleting non-existent records.", () => {
      const cacheKey = 'non-existent';
      const deletedCacheKey = store.deleteFromCache(cacheKey);
      expect(deletedCacheKey).toBe(cacheKey);
    });
  });

  describe('startTimer', () => {
    const entity = {
      access_token: 'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==',
    };
    const primaryKey = 'access-tokens';
    const minuteInMillis = 60000;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('20 Aug 2020 00:12:00 GMT').getTime());
    });

    afterEach(() => jest.useRealTimers());

    // eslint-disable-next-line jest/no-done-callback
    it('publishes an event when an entity expires.', async () => {
      expect.assertions(2);
      store.on(TransientStore.TOPIC.EXPIRED, expiredBundle => {
        expect(expiredBundle.payload).toBe(entity);
        expect(expiredBundle.primaryKey).toBe(primaryKey);
      });

      await store.set(primaryKey, entity, minuteInMillis);
      jest.advanceTimersByTime(minuteInMillis + 1);
    });

    it('deletes expired entities.', async () => {
      await store.set(primaryKey, entity, minuteInMillis);
      jest.advanceTimersByTime(minuteInMillis + 1);

      const bundle = await store.get(primaryKey);
      expect(bundle).toBeUndefined();
    });

    it('keeps the same timer when being called multiple times.', async () => {
      const bundle = await store.set(primaryKey, entity, minuteInMillis);
      const timeoutID = bundle.timeoutID as number;
      const cacheKey = store['constructCacheKey'](primaryKey);

      const newBundle = await store['startTimer'](cacheKey);
      expect(newBundle.timeoutID).toBe(timeoutID);
    });
  });
});
