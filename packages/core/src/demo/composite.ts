import {APIClient} from '@wireapp/api-client';
import {LoginData} from '@wireapp/api-client/dist/auth';
import {ClientType} from '@wireapp/api-client/dist/client';
import {Account} from '../main/Account';

require('dotenv').config();

const login: LoginData = {
  clientType: ClientType.TEMPORARY,
  email: process.env.WIRE_EMAIL,
  password: process.env.WIRE_PASSWORD,
};

(async () => {
  const backend = process.env.WIRE_BACKEND === 'staging' ? APIClient.BACKEND.STAGING : APIClient.BACKEND.PRODUCTION;
  const apiClient = new APIClient({urls: backend});
  const account = new Account(apiClient);
  const {clientId, userId} = await account.login(login);
  console.info(`Hello user "${userId}" with client "${clientId}" ...`);
  if (account.service) {
    const message = account.service.conversation.messageBuilder.createCompositeMessage(
      'b894b2e4-e862-4b55-a97e-56ea3690be20',
      'Are you a robot?',
      ['Yes', 'No'],
    );
    await account.service.conversation.send(message);
  }
})().catch(error => console.error(error.message));
