# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## Build Status

[![Build Status](https://travis-ci.org/wireapp/wire-webapp-lru-cache.svg?branch=master)](https://travis-ci.org/wireapp/wire-webapp-lru-cache)

## Instructions

### Installation

```bash
npm install --save wire-webapp-lru-cache
```

### Import

**TypeScript**

```typescript
import LRUCache = require('wire-webapp-lru-cache');
let cache = new LRUCache();
```

**CommonJS**

```javascript
const LRUCache = require('wire-webapp-lru-cache');
let cache = new LRUCache();
```

### Usage

**Browser**

* [index.html](./dist/index.html)

**Node.js**

* [index.js](./dist/index.js)

**Functions**

* [TypeScript Declaration File](./dist/commonjs/LRUCache.d.ts)
