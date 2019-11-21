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

const {Bot} = require('@wireapp/bot-api');
const {ClientType} = require('@wireapp/api-client/dist/client/');

describe('Bot', () => {
  let bot;

  const credentials = {
    email: 'email@example.com',
    password: 'my-password',
  };

  beforeEach(() => {
    bot = new Bot(credentials);
  });

  describe('"constructor"', () => {
    it('merges the configuration correctly', () => {
      const config = {
        clientType: ClientType.PERMANENT,
      };

      const bot2 = new Bot(credentials, config);

      expect(bot.config).not.toEqual(jasmine.objectContaining(config));
      expect(bot2.config).toEqual(jasmine.objectContaining(config));
    });
  });
});
