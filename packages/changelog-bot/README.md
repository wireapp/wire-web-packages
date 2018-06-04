# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## Changelog Bot

A bot used by Travis build scripts to post a changelog of the current project to Wire.

### Getting Started

```
yarn install
yarn start
```

### Installation

```
yarn global add @wireapp/changelog-bot
```

### Usage

- [cli.js](./src/cli.js)

### Execution

**Bash**

```bash
#!/bin/bash

export WIRE_WEBAPP_BOT_EMAIL="<email>"
export WIRE_WEBAPP_BOT_PASSWORD="<password>"

changelog-bot "<conversation id>,<conversation id>" "staging"
```

**Node**

```bash
yarn dist
node changelog-bot.js "<conversation id>,<conversation id>" "staging"
```
