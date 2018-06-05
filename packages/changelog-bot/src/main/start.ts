import {LoginData} from '@wireapp/api-client/dist/commonjs/auth/';
import {ChangelogBot, MessageData} from './index';

export async function start(parameters: {[index: string]: string}): Promise<ChangelogBot> {
  const {WIRE_CHANGELOG_BOT_CONVERSATION_IDS, WIRE_CHANGELOG_BOT_EMAIL, WIRE_CHANGELOG_BOT_PASSWORD} = parameters;
  const {TRAVIS_COMMIT_RANGE, TRAVIS_REPO_SLUG} = process.env;

  const loginData: LoginData = {
    email: WIRE_CHANGELOG_BOT_EMAIL,
    password: WIRE_CHANGELOG_BOT_PASSWORD,
    persist: false,
  };

  const changelog = await ChangelogBot.generateChangelog(String(TRAVIS_REPO_SLUG), String(TRAVIS_COMMIT_RANGE));

  const messageData: MessageData = {
    content: changelog,
  };

  if (WIRE_CHANGELOG_BOT_CONVERSATION_IDS) {
    messageData.conversationIds = WIRE_CHANGELOG_BOT_CONVERSATION_IDS.replace(' ', '').split(',');
  }

  const bot = new ChangelogBot(loginData, messageData);
  await bot.start();

  return bot;
}
