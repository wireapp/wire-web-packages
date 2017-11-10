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
