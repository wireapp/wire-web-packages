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

const {Bot, MessageHandler} = require('@wireapp/bot-api');
const {Account} = require('@wireapp/core');

describe('MessageHandler', () => {
  let bot;
  let mainHandler;

  beforeEach(async () => {
    bot = new Bot({
      email: 'email@example.com',
      password: 'my-secret-password',
    });

    mainHandler = new MessageHandler();
  });

  describe('"sendImage"', () => {
    it('just returns without account or service', async () => {
      bot.account = new Account();
      bot.addHandler(mainHandler);

      await bot.account.init();

      spyOn(bot.account.service.conversation, 'send');

      await mainHandler.sendImage();

      expect(bot.account.service.conversation.send).toHaveBeenCalledTimes(0);
    });
  });
});
