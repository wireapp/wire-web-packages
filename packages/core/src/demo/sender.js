process.on('uncaughtException', error =>
  console.error(`Uncaught exception "${error.constructor.name}" (${error.code}): ${error.message}`, error)
);
process.on('unhandledRejection', error =>
  console.error(`Uncaught rejection "${error.constructor.name}" (${error.code}): ${error.message}`, error)
);

const path = require('path');
require('dotenv').config({path: path.join(__dirname, 'echo2.env')});

const {Account} = require('@wireapp/core');
const APIClient = require('@wireapp/api-client');
const {FileEngine} = require('@wireapp/store-engine');

(async () => {
  const CONVERSATION_ID = process.env.WIRE_CONVERSATION_ID;

  const login = {
    email: process.env.WIRE_EMAIL,
    password: process.env.WIRE_PASSWORD,
    persist: true,
  };

  const engine = new FileEngine(path.normalize('./.tmp/sender'));
  await engine.init(undefined, {fileExtension: '.json'});
  const apiClient = new APIClient({
    store: engine,
    urls: APIClient.BACKEND.PRODUCTION,
  });
  const account = new Account(apiClient);
  await account.listen(login);

  function sendMessage() {
    const timeoutInMillis = 2000;
    setTimeout(() => {
      account.service.conversation.sendTextMessage(CONVERSATION_ID, 'Hello World!').then(() => sendMessage());
    }, timeoutInMillis);
  }

  sendMessage();
})();
