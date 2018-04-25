//@ts-check

process.on('uncaughtException', error =>
  console.error(`Uncaught exception "${error.constructor.name}" (${error.code}): ${error.message}`, error)
);
process.on('unhandledRejection', error =>
  console.error(`Uncaught rejection "${error.constructor.name}" (${error.code}): ${error.message}`, error)
);

const path = require('path');
require('dotenv').config({path: path.join(__dirname, 'echo1.env')});

const {Account} = require('@wireapp/core');
const APIClient = require('@wireapp/api-client');
const {Config} = require('@wireapp/api-client/dist/commonjs/Config');
const {MemoryEngine} = require('@wireapp/store-engine/dist/commonjs/engine');
const engine = new MemoryEngine();

(async () => {
  const login = {
    email: process.env.WIRE_EMAIL,
    password: process.env.WIRE_PASSWORD,
    persist: false,
  };

  await engine.init('receiver');

  const apiClient = new APIClient(new Config(engine, APIClient.BACKEND.STAGING));
  const account = new Account(apiClient);

  account.on(Account.INCOMING.TEXT_MESSAGE, async data => {
    const {conversationId, from, content, id: messageId} = data;
    console.log(`Message "${messageId}" in "${conversationId}" from "${from}":`, content);
    await account.service.conversation.sendConfirmation(conversationId, messageId);
  });

  account.on(Account.INCOMING.CONFIRMATION, async data => {
    const {conversationId, from, id: messageId} = data;
    console.log(`Confirmation "${messageId}" in "${conversationId}" from "${from}".`);
  });

  try {
    console.log('Logging in ...');
    await account.login(login);
    await account.listen();
    console.log('Listening for messages ...');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
