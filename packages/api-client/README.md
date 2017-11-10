# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## Wire API Client

Wire for Web's API client.

## Build Status

[![Greenkeeper badge](https://badges.greenkeeper.io/wireapp/wire-web-api-client.svg)](https://greenkeeper.io/)

## Development

```bash
yarn install
yarn start
```

## Installation

```bash
yarn add @wireapp/api-client
```

## Usage

**Browser**

- [index.html](index.html)

**Node.js**

- [index.js](index.js)

## Execution

**Bash**

```bash
#!/bin/bash

EMAIL="name@email.com"
PASSWORD="password"

node index.js --e="$EMAIL" --p="$PASSWORD"
```

**Node**

```bash
npm run dist
node index.js --e="name@email.com" --p="password"
```
