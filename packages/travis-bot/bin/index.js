#!/usr/bin/env node
/* eslint-disable no-magic-numbers */

const {TravisBot} = require('../dist/');
const requiredEnvVars = ['TRAVIS_BRANCH', 'TRAVIS_BUILD_NUMBER', 'WIRE_WEBAPP_BOT_EMAIL', 'WIRE_WEBAPP_BOT_PASSWORD'];

const usage = exitCode => {
  console.info(`Usage: ${process.argv[1]} <Author of last commit> <Summary of last commit>\n`);
  if (typeof exitCode !== 'undefined') {
    process.exit(exitCode);
  }
};

const commitAuthor = process.argv[2];
if (!commitAuthor) {
  console.error('Error: No author for last commit specified.');
  usage(1);
}

const commitMessage = process.argv[3];
if (!commitMessage) {
  console.error('Error: No summary for last commit specified.');
  usage(1);
}

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable "${envVar}" is not set.`);
    process.exit(1);
  }
});

const login = {
  email: process.env.WIRE_WEBAPP_BOT_EMAIL,
  password: process.env.WIRE_WEBAPP_BOT_PASSWORD,
  persist: false,
};

const commit = {
  author: commitAuthor,
  branch: process.env.TRAVIS_BRANCH,
  message: commitMessage,
};

const build = {
  number: process.env.TRAVIS_BUILD_NUMBER,
  url: '',
};

const content = {
  conversationId: '9fe8b359-b9e0-4624-b63c-71747664e4fa',
  message:
    `**Travis build '${build.number}' deployed on '${commit.branch}' environment.** ᕦ(￣ ³￣)ᕤ\n` +
    `- Last commit from: ${commit.author}\n` +
    `- Last commit message: ${commit.message}`,
};

const loginData = {
  build,
  commit,
  content,
};

const bot = new TravisBot(login, loginData);

bot.start().catch(error => {
  console.error(error.message, error.stack);
  process.exit(1);
});
