# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## Travis Bot

A bot used by Travis build scripts which posts useful messages to Wire. Based on [`@wireapp/core`](https://www.npmjs.com/package/@wireapp/core).

### Getting Started

```
yarn install
yarn start
```

### Installation

```
yarn global add @wireapp/travis-bot
```

### Usage

```javascript
const loginData = {
  email: <email>,
  password: <password>,
  persist: false
};

const messageData = {
  build: {
    number: <build number>,
    repositoryName: <repository name>,
    url: ''
  },
  commit: {
    author: <commit author>,
    conversationIds: [<wire conversation id>],
    branch: <branch>,
    hash: <commit hash>,
    message: <commit summary>
  }
};

new TravisBot(loginData, messageData)
  .start()
  .then(() => {
    // yay
  })
  .catch(error => {
    // nay
  });
```

### Execution

**Bash**

```bash
#!/bin/bash

export WIRE_WEBAPP_BOT_EMAIL="<email>"
export WIRE_WEBAPP_BOT_PASSWORD="<password>"
export WIRE_WEBAPP_BOT_CONVERSATION_IDS="<conversation id>,<conversation id>"

# these should be set by Travis
# export TRAVIS_BRANCH= ...
# export TRAVIS_BUILD_NUMBER= ...
# export TRAVIS_COMMIT= ...
# export TRAVIS_REPO_SLUG= ...
# export TRAVIS_TAG= ...
# export TRAVIS_TAG= ...

wire-travis-bot
```

**Node**

```bash
yarn dist
bin/wire-travis-bot "<conversation id>,<conversation id>"
```
