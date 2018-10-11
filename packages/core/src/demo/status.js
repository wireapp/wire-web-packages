/* eslint-disable no-magic-numbers, no-unused-vars */
//@ts-check

process.on('uncaughtException', error =>
  console.error(`Uncaught exception "${error.constructor.name}": ${error.message}`, error)
);
process.on('unhandledRejection', error =>
  console.error(`Uncaught rejection "${error.constructor.name}": ${error.message}`, error)
);

const logdown = require('logdown');
const path = require('path');

require('dotenv').config({path: path.join(__dirname, 'status.env')});

const logger = logdown('@wireapp/core/demo/status.js', {
  logger: console,
  markdown: false,
});
logger.state.isEnabled = true;

const {Account} = require('@wireapp/core');
const {APIClient} = require('@wireapp/api-client');
const {ClientType} = require('@wireapp/api-client/dist/commonjs/client/');
const {FileEngine} = require('@wireapp/store-engine');

(async () => {
  const CONVERSATION_ID = process.env.WIRE_CONVERSATION_ID;

  const login = {
    clientType: ClientType.TEMPORARY,
    email: process.env.WIRE_EMAIL,
    password: process.env.WIRE_PASSWORD,
  };

  const backend = process.env.WIRE_BACKEND === 'staging' ? APIClient.BACKEND.STAGING : APIClient.BACKEND.PRODUCTION;
  const engine = new FileEngine(path.join(__dirname, '.tmp', 'status'));
  await engine.init(undefined, {fileExtension: '.json'});
  const apiClient = new APIClient({store: engine, urls: backend});
  const account = new Account(apiClient);
  await account.login(login);
  await account.listen();

  const name = await account.service.self.getName();

  logger.log('Name', name);
  logger.log('User ID', account.apiClient.context.userId);
  logger.log('Client ID', account.apiClient.context.clientId);

  async function sendText() {
    const payload = account.service.conversation.createText('Hello, World!').build();
    await account.service.conversation.send(CONVERSATION_ID, payload);
  }

  async function setStatus() {
    const team = await account.service.team.getTeams();
    if (team.teams[0]) {
      const teamId = team.teams[0].id;
      await account.service.user.setAvailability(teamId, 1);
    }
  }

  await setStatus();
  process.exit();
})();
