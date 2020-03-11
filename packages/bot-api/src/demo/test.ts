import {Bot} from '../Bot';
import {MemoryEngine, CRUDEngine} from '@wireapp/store-engine';
import {ClientType} from '@wireapp/api-client/dist/client/';
import {BotConfig} from '../Interfaces';

import {resolve} from 'path';
import {config} from 'dotenv';
config({path: resolve(__dirname, '.env')});

const {CONVERSATION, EMAIL, PASSWORD, USER_ID} = process.env;

const botConfig: BotConfig = {
  backend: 'production',
  clientType: ClientType.TEMPORARY,
  conversations: [],
  owners: [],
};

const loginBot = async (bot: Bot, storeEngine: CRUDEngine) => {
  await bot.start(storeEngine);
  if (bot.account) {
    const userId = bot.account.userId;
    const clientId = bot.account.clientId;
    console.info(
      `Bot is running. Backend '${botConfig.backend}',`,
      `User ID '${userId}',`,
      `Client ID '${clientId}',`,
      `Client Type '${botConfig.clientType}'.`,
    );
  } else {
    throw Error('Bot does not have an account assigned which means it is not initialized properly.');
  }
};

const startBot = async (bot: Bot, storeEngine: CRUDEngine) => {
  try {
    await loginBot(bot, storeEngine);
  } catch (error) {
    console.error(error.label);
    throw error;
  }
};

(async () => {
  const email = EMAIL || '';
  const password = PASSWORD || '';
  const conversation = CONVERSATION || '';
  const userId = USER_ID || '';
  console.info('Creating bot', email, conversation);
  const bot = new Bot({email, password}, botConfig);
  const storeEngine = new MemoryEngine();
  try {
    await storeEngine.init('wire');
    await startBot(bot, storeEngine);
    await bot.sendText(conversation, `Upgrading to admin: **${userId}**`);
    await bot.setAdminRole(conversation, userId);
    console.info('Set admin role to', userId);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})().catch(error => console.error(error));
