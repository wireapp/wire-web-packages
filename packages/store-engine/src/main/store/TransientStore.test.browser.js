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

import {LocalStorageEngine, Store} from '@wireapp/store-engine';

describe('store.TransientStore', () => {
  const STORE_NAME = 'database-name';
  const TABLE_NAME = 'table-name';

  let engine = undefined;
  let store = undefined;

  beforeEach(async () => {
    engine = new LocalStorageEngine();
    await engine.init(STORE_NAME);

    store = new Store.TransientStore(engine);
    await store.init(TABLE_NAME);
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe('"set"', () => {
    const entity = {
      access_token: 'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==',
    };
    const primaryKey = 'access-tokens';
    const ttl = 1000;

    it("saves a record together with it's expiration date.", async () => {
      const bundle = await store.set(primaryKey, entity, ttl);
      expect(bundle.expires).toEqual(jasmine.any(Number));
    });

    it("saves a record together with it's timeoutID.", async () => {
      const bundle = await store.set(primaryKey, entity, ttl);
      expect(bundle.timeoutID).toBeDefined();
    });

    it("doesn't overwrite an existing record.", async done => {
      await store.set(primaryKey, entity, ttl);
      try {
        await store.set(primaryKey, {access_token: 'ABC'}, ttl);
        done.fail();
      } catch (error) {
        expect(error).toEqual(jasmine.any(Store.RecordAlreadyExistsError));
        expect(error.code).toBe(1);
        done();
      }
    });
  });

  describe('"get"', () => {
    const entity = {
      access_token: 'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==',
    };
    const ttl = 900;

    it("returns a saved record together with it's expiration.", done => {
      const primaryKey = 'access-tokens';

      store
        .set(primaryKey, entity, ttl)
        .then(() => {
          store
            .get(primaryKey)
            .then(bundle => expect(bundle.payload).toEqual(entity))
            .then(done);
        })
        .catch(error => done.fail(error));
    });

    it('returns a saved record with an "@" in it\'s primary key.', done => {
      const primaryKey = '@access@tokens';

      store
        .set(primaryKey, entity, ttl)
        .then(() => {
          store
            .get(primaryKey)
            .then(bundle => expect(bundle.payload).toEqual(entity))
            .then(done);
        })
        .catch(error => done.fail(error));
    });

    it('returns a non-existent record as "undefined".', done => {
      const primaryKey = 'not-existing';

      store
        .get(primaryKey)
        .then(bundle => expect(bundle).toBeUndefined())
        .then(done)
        .catch(error => done.fail(error));
    });
  });

  describe('"init"', () => {
    it('initially reads data from persistent storage.', done => {
      const timeLapse = 2;

      const items = [
        {
          expires: timeLapse * Date.now(),
          payload: {token: '123'},
        },
        {
          expires: timeLapse * Date.now(),
          payload: {token: 'a2c'},
        },
        {
          expires: timeLapse * Date.now(),
          payload: {token: 'abc'},
        },
      ];

      for (const item of items) {
        window.localStorage.setItem(`${STORE_NAME}@${TABLE_NAME}@${item.payload.token}`, JSON.stringify(item));
      }

      store
        .init(TABLE_NAME)
        .then(bundles => {
          expect(bundles.length).toBe(items.length);
          done();
        })
        .catch(error => done.fail(error));
    });
  });

  describe('"deleteFromCache"', () => {
    it("doesn't fail when deleting non-existent records.", () => {
      const cacheKey = 'non-existent';
      const deletedCacheKey = store.deleteFromCache(cacheKey);
      expect(deletedCacheKey).toBe(cacheKey);
    });
  });

  describe('"startTimer"', () => {
    const entity = {
      access_token: 'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==',
    };
    const primaryKey = 'access-tokens';
    const minuteInMillis = 60000;

    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate();
    });

    afterEach(() => jasmine.clock().uninstall());

    it('publishes an event when an entity expires.', done => {
      store.on(Store.TransientStore.TOPIC.EXPIRED, expiredBundle => {
        expect(expiredBundle.payload).toBe(entity);
        expect(expiredBundle.primaryKey).toBe(primaryKey);
        done();
      });

      store
        .set(primaryKey, entity, minuteInMillis)
        .then(() => jasmine.clock().tick(minuteInMillis + 1))
        .catch(error => done.fail(error));
    });

    it('deletes expired entities.', done => {
      store
        .set(primaryKey, entity, minuteInMillis)
        .then(() => {
          jasmine.clock().tick(minuteInMillis + 1);
          return store.get(primaryKey);
        })
        .then(bundle => {
          expect(bundle).toBeUndefined();
          done();
        })
        .catch(error => done.fail(error));
    });

    it('keeps the same timer when being called multiple times.', done => {
      let timeoutID = undefined;

      store
        .set(primaryKey, entity, minuteInMillis)
        .then(bundle => {
          timeoutID = bundle.timeoutID;
          const cacheKey = store.constructCacheKey(primaryKey);
          return store.startTimer(cacheKey, minuteInMillis);
        })
        .then(bundle => {
          expect(bundle.timeoutID).toBe(timeoutID);
          done();
        })
        .catch(error => done.fail(error));
    });
  });
});
