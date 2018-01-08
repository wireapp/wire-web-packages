# Wire

[![Greenkeeper badge](https://badges.greenkeeper.io/wireapp/proteus.js.svg)](https://greenkeeper.io/)

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## Build Status

[![Build Status](https://travis-ci.org/wireapp/proteus.js.svg?branch=master)](https://travis-ci.org/wireapp/proteus.js)

## Installation

### Browser

```bash
bower install wire-webapp-proteus
```

### Node.js

```bash
yarn add wire-webapp-proteus
```

## Usage

### Browser

- [index.html](./dist/index.html)

### Node.js

- [index.js](./dist/index.js)

### TypeScript

```typescript
import * as Proteus from 'wire-webapp-proteus';
const identity: Proteus.keys.IdentityKeyPair = Proteus.keys.IdentityKeyPair.new();
```
