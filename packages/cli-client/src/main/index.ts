const stdin = process.openStdin();
const {Account} = require('@wireapp/core');
const {StoreEngine} = require('@wireapp/store-engine');

const login = {
  email: 'me@wire.com',
  password: 'top-secret',
};

const path = `${__dirname}/temp/${login.email}`;
const engine = new StoreEngine.FileEngine(path, {fileExtension: '.json'});

const account = new Account(login, engine);

const conversationID = 'some-conversation-id';
const message = 'Bonjour!';

account.listen()
  .then(() => console.log(`Connected to Wire — Client ID "${account.context.clientID}"`))
  .then(() => {
    stdin.addListener('data', function (data) {

      service.conversation.sendTextMessage(argv.conversation, data.toString().trim());
    });
  })
  .catch((error: Error) => {
    console.error(error.message);
    process.exit(1);
  });


user
  .login(connectWebSocket)
  .then(function (service) {
    stdin.addListener("data", function (data) {
      service.conversation.sendTextMessage(argv.conversation, data.toString().trim());
    });
  })
  .catch(function (error) {
    console.log(`Error: ${error.message} (${error.stack})`);
  });
