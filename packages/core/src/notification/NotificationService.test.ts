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

import {ConsumableNotification} from '@wireapp/api-client/lib/tcp/ConsumableNotification.types';

import {MemoryEngine} from '@wireapp/store-engine';

import {ConversationService} from '../conversation';

import {NotificationService, NotificationSource} from '.';

const mockedConversationService = {} as unknown as ConversationService;

describe('NotificationService', () => {
  describe('handleEvent', () => {
    it('propagates errors to the outer calling function', async () => {
      const storeEngine = new MemoryEngine();
      await storeEngine.init('NotificationService.test');

      const notificationService = new NotificationService(storeEngine, mockedConversationService);

      jest.spyOn(notificationService as any, 'handleEvent').mockImplementation(() => {
        throw new Error('Test error');
      });

      const promise = new Promise<void>(resolve => {
        notificationService.on(NotificationService.TOPIC.NOTIFICATION_ERROR, notificationError => {
          expect(notificationError.error.message).toBe('Test error');
          resolve();
        });
      });

      const notification = {
        type: 'event',
        deliveryTag: 0,
        id: 'id-123456',
        payload: [{}],
      } as unknown as ConsumableNotification;

      const handledNotifications = notificationService.handleNotification(
        notification,
        NotificationSource.NOTIFICATION_STREAM,
      );
      await handledNotifications.next();

      return promise;
    });
  });

  describe('handleNotification', () => {
    it('does NOT update last notification ID when event processing fails', async () => {
      return new Promise<void>(async resolve => {
        const storeEngine = new MemoryEngine();
        await storeEngine.init('NotificationService.test');

        const notificationService = new NotificationService(storeEngine, mockedConversationService);
        notificationService.on(NotificationService.TOPIC.NOTIFICATION_ERROR, notificationError => {
          expect(notificationError.error.message).toBe('Test error');
          resolve();
        });

        jest.spyOn(notificationService as any, 'handleEvent').mockImplementation(() => {
          throw new Error('Test error');
        });

        const notification = {
          type: 'event',
          deliveryTag: 0,
          id: 'id-123456',
          payload: [{}],
        } as unknown as ConsumableNotification;

        const handledNotifications = notificationService.handleNotification(
          notification,
          NotificationSource.NOTIFICATION_STREAM,
        );
        await handledNotifications.next();
      });
    });
  });
});
