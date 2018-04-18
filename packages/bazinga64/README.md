# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp/wire](https://github.com/wireapp/wire).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## Build Status

[![Build Status](https://travis-ci.org/wireapp/bazinga64.svg?branch=master)](https://travis-ci.org/wireapp/bazinga64)

## Installation

### Browser

```bash
bower install bazinga64
```

```html
<script src="bower_components/bazinga64/dist/browser/bazinga64.js" />
```

```javascript
var bazinga64 = window.bazinga64;
```

### Node.js

```bash
npm install bazinga64
```

```javascript
var bazinga64 = require('bazinga64');
```

### Development

```bash
npm install
gulp default
```

### Usage

```javascript
// Encoding
var encoded = bazinga64.Encoder.toBase64('Hello');
var base64 = encoded.asString;
console.log(base64); // "SGVsbG8="

// Decoding
var decoded = bazinga64.Decoder.fromBase64('SGVsbG8=');
var text = decoded.asString;
console.log(text); // "Hello"
```

### TypeScript Usage

```typescript
import {Decoder} from 'bazinga64';
const typedArray: Uint8Array = Decoder.fromBase64('SGVsbG8=').asBytes;
```

## API

### `Decoder`

* `fromBase64`

### `Encoder`

* `toBase64`
