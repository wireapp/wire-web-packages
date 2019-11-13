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

import Dexie from 'dexie';
const UUID = require('pure-uuid');
const {NotificationService} = require('@wireapp/core/dist/notification/');
const {IndexedDBEngine} = require('@wireapp/store-engine-dexie');
const {APIClient} = require('@wireapp/api-client');

const UUIDVersion = 4;

describe('NotificationService', () => {
  const storeName = undefined;
  describe('Database "setLastEventDate"', () => {
    afterEach(done => {
      if (storeName) {
        const deleteRequest = window.indexedDB.deleteDatabase(storeName);

        deleteRequest.onerror = done.fail;
        deleteRequest.onsuccess = done;
      }
    });

    it('initializes last event date if database entry is not present', async () => {
      const db = new Dexie(new UUID(UUIDVersion).format());
      db.version(1).stores({
        amplify: '',
      });
      const engine = new IndexedDBEngine();
      await engine.initWithDb(db);

      const apiClient = new APIClient({
        urls: APIClient.BACKEND.STAGING,
      });

      const notificationService = new NotificationService(apiClient, {}, engine);
      spyOn(notificationService.database, 'getLastEventDate').and.callThrough();
      spyOn(engine, 'read').and.callThrough();
      spyOn(engine, 'update').and.callThrough();
      spyOn(engine, 'create').and.callThrough();

      const returnValue = await notificationService.setLastEventDate(new Date(0));
      expect(returnValue).toEqual(new Date(0));

      expect(notificationService.database.getLastEventDate).toHaveBeenCalledTimes(1);
      expect(engine.read).toHaveBeenCalledTimes(1);
      expect(engine.update).toHaveBeenCalledTimes(0);
      expect(engine.create).toHaveBeenCalledTimes(1);
    });

    it('updates last event date if an older database record exists', async () => {
      const db = new Dexie(new UUID(UUIDVersion).format());
      db.version(1).stores({
        amplify: '',
      });
      const engine = new IndexedDBEngine();
      await engine.initWithDb(db);

      const apiClient = new APIClient({
        urls: APIClient.BACKEND.STAGING,
      });

      const notificationService = new NotificationService(apiClient, {}, engine);
      await notificationService.setLastEventDate(new Date(0));

      spyOn(notificationService.database, 'getLastEventDate').and.callThrough();
      spyOn(engine, 'read').and.callThrough();
      spyOn(engine, 'update').and.callThrough();
      spyOn(engine, 'create').and.callThrough();

      const newDate = await notificationService.setLastEventDate(new Date(1));
      expect(newDate).toEqual(new Date(1));

      expect(notificationService.database.getLastEventDate).toHaveBeenCalledTimes(1);
      expect(engine.read).toHaveBeenCalledTimes(1);
      expect(engine.update).toHaveBeenCalledTimes(1);
      expect(engine.create).toHaveBeenCalledTimes(0);
    });
  });

  it('ignores last event date update if newer database entry exists', async () => {
    const db = new Dexie(new UUID(UUIDVersion).format());
    db.version(1).stores({
      amplify: '',
    });
    const engine = new IndexedDBEngine();
    await engine.initWithDb(db);

    const apiClient = new APIClient({
      urls: APIClient.BACKEND.STAGING,
    });

    const notificationService = new NotificationService(apiClient, {}, engine);
    const greaterDate = new Date(1);
    const lesserDate = new Date(0);

    await notificationService.setLastEventDate(greaterDate);

    spyOn(notificationService.database, 'getLastEventDate').and.callThrough();
    spyOn(engine, 'read').and.callThrough();
    spyOn(engine, 'update').and.callThrough();
    spyOn(engine, 'create').and.callThrough();

    const returnValue = await notificationService.setLastEventDate(lesserDate);
    expect(returnValue).toEqual(greaterDate);

    expect(notificationService.database.getLastEventDate).toHaveBeenCalledTimes(1);
    expect(engine.read).toHaveBeenCalledTimes(1);
    expect(engine.update).toHaveBeenCalledTimes(0);
    expect(engine.create).toHaveBeenCalledTimes(0);
    expect(await notificationService.database.getLastEventDate()).toEqual(greaterDate);
  });

  it('initializes last notification ID if database entry is not present', async () => {
    const db = new Dexie(new UUID(UUIDVersion).format());
    db.version(1).stores({
      amplify: '',
    });
    const engine = new IndexedDBEngine();
    await engine.initWithDb(db);

    const apiClient = new APIClient({
      urls: APIClient.BACKEND.STAGING,
    });

    const notificationService = new NotificationService(apiClient, {}, engine);
    spyOn(notificationService.database, 'getLastNotificationId').and.callThrough();
    spyOn(engine, 'read').and.callThrough();
    spyOn(engine, 'update').and.callThrough();
    spyOn(engine, 'create').and.callThrough();

    const lastNotificationId = await notificationService.setLastNotificationId({id: '12'});
    expect(lastNotificationId).toEqual('12');
  });

  it('updates last notification ID if database entry exists', async () => {
    const db = new Dexie(new UUID(UUIDVersion).format());
    db.version(1).stores({
      amplify: '',
    });
    const engine = new IndexedDBEngine();
    await engine.initWithDb(db);

    const apiClient = new APIClient({
      urls: APIClient.BACKEND.STAGING,
    });

    const notificationService = new NotificationService(apiClient, {}, engine);
    await notificationService.setLastNotificationId({id: '12'});

    spyOn(notificationService.database, 'getLastNotificationId').and.callThrough();
    spyOn(engine, 'read').and.callThrough();
    spyOn(engine, 'update').and.callThrough();
    spyOn(engine, 'create').and.callThrough();

    const returnValue = await notificationService.setLastNotificationId({id: '13'});
    expect(returnValue).toEqual('13');
  });
});
