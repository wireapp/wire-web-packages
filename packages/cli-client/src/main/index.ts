#!/usr/bin/env node

const { description, version } = require('../package.json');
const {Account} = require('@wireapp/core');
const {StoreEngine} = require('@wireapp/store-engine');
const APIClient = require('@wireapp/api-client');
const program = require('commander');
const stdin = process.openStdin();
import {PayloadBundle} from '@wireapp/core/dist/commonjs/crypto/';
import * as os from 'os';

program
  .version(version)
  .description(description)
  .option('-e, --email <address>', 'Your email address')
  .option('-p, --password <password>', 'Your password')
  .option('-c, --conversation <conversationid>', 'The conversation to write in')
  .parse(process.argv);

const loginData = {
  email: program.email,
  password: program.password,
  persist: true
};

const conversationID = '887ff893-ed20-4af8-90b2-05ffa5237ee5'; // "Wire CLI Test"

const path = `${os.homedir()}/.wire-cli/${loginData.email}`;
const storeEngine = new StoreEngine.FileEngine(path, {fileExtension: '.json'});

const apiClient: APIClient = new APIClient({
  urls: APIClient.BACKEND.PRODUCTION,
  store: storeEngine,
});

const account = new Account(apiClient);

account.on(Account.INCOMING.TEXT_MESSAGE, (data: PayloadBundle) => {
  console.log(`Received message from user ID "${data.from}" in conversation ID "${data.conversation}": ${data.content}`);
});

account
  .listen(loginData)
  .then(() => console.log(`Connected to Wire — Client ID "${account.context.clientID}"`))
  .then(() => {
    stdin.addListener('data', data => {
      const message = data.toString().trim();
      account.sendTextMessage(conversationID, message);
    });
  })
  .catch((error: Error) => {
    console.error(error.message);
    process.exit(1);
  });
