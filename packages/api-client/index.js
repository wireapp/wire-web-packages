/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
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

const argv = require('optimist')
  .alias('c', 'conversation')
  .alias('e', 'email')
  .alias('h', 'handle')
  .alias('p', 'password').argv;

const Client = require('./dist/commonjs/Client');
const path = require('path');
const {FileEngine} = require('@wireapp/store-engine/dist/commonjs/engine');
const {WebSocketClient} = require('./dist/commonjs/tcp/');

const login = {
  email: argv.email,
  handle: argv.handle,
  password: argv.password,
  persist: true,
};

const storagePath = path.join(process.cwd(), '.tmp', login.email);

const config = {
  store: new FileEngine(storagePath, {fileExtension: '.json'}),
};

const apiClient = new Client(config);

Promise.resolve()
  .then(() => {
    // Trying to login (works only if there is already a valid cookie stored in the FileEngine)
    return apiClient.init();
  })
  .catch(error => {
    console.log(`Authentication via existing authenticator (Session Cookie or Access Token) failed: ${error.message}`);
    return apiClient.login(login);
  })
  .then(context => {
    console.log(`Got self user with ID "${context.userID}".`);
    return apiClient.user.api.getUsers({handles: ['webappbot']});
  })
  .then(userData => {
    console.log(`Found user with name "${userData[0].name}" by handle "${userData[0].handle}".`);
    return apiClient.connect();
  })
  .then(webSocketClient => {
    webSocketClient.on(WebSocketClient.TOPIC.ON_MESSAGE, notification => {
      console.log('Received notification via WebSocket', notification);
    });
  })
  .catch(error => {
    console.error(error.message, error);
  });
