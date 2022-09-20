# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## Web Packages

Collection of npm modules created by Wire's web team:

**Bots**

- [@wireapp/bot-api](https://npmjs.com/package/@wireapp/bot-api)
- [@wireapp/changelog-bot](https://npmjs.com/package/@wireapp/changelog-bot)

**Commons**

- [@wireapp/commons](https://npmjs.com/package/@wireapp/commons)
- [@wireapp/priority-queue](https://npmjs.com/package/@wireapp/priority-queue)
- [@wireapp/store-engine](https://npmjs.com/package/@wireapp/store-engine)

**Configuration**

- [@wireapp/eslint-config](https://npmjs.com/package/@wireapp/eslint-config)
- [@wireapp/prettier-config](https://npmjs.com/package/@wireapp/prettier-config)

**Connectivity**

- [@wireapp/api-client](https://npmjs.com/package/@wireapp/api-client)
- [@wireapp/cli-client](https://npmjs.com/package/@wireapp/cli-client)
- [@wireapp/core](https://npmjs.com/package/@wireapp/core)

**Encoding**

- [bazinga64](https://npmjs.com/package/bazinga64)

**Internal tools**

- [@wireapp/copy-config](https://npmjs.com/package/@wireapp/copy-config)
- [@wireapp/license-collector](https://npmjs.com/package/@wireapp/license-collector)

**User interface**

- [@wireapp/react-ui-kit](https://npmjs.com/package/@wireapp/react-ui-kit)

### Getting Started

```bash
## Download dependencies and link packages
yarn

## Build all packages and test them
yarn test:all
```

### Release packages

#### Release new package

If a package gets published for the very first time, it must be released this way:

```bash
cd ./packages/new-package
yarn dist
npm publish --access public
```

**Info:** Start with version "0.0.0" in `package.json` when publishing with `lerna` or "0.1.0" when publishing with `npm`.

#### Release an existing package

This will be handled by our CI setup.
