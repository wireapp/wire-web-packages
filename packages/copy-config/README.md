# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## CopyConfig

Wire's internal configuration copy tool.

### Installation

```
yarn add @wireapp/copy-config
```

### Setup

Create a configuration file following the [cosmiconfig standard](https://github.com/davidtheclark/cosmiconfig#cosmiconfig) (e.g. `.copyconfigrc.json`) to your project with the following parameters (optional parameters are followed by a `?`, default parameters listed):

```js
{
  externalDir?: 'config',
  files: {
    sourceFile: 'destinationFile',
    sourceDir: 'destinationDir/',
    anotherFile: ['anotherDir/', 'destinationDir/'],
  },
  gitConfigurationUrl?: 'https://github.com/wireapp/wire-web-config-default#v0.7.1',
}
```

Additionally, the following parameters can also be set via environment variables:

| parameter             | environment variable              |
| --------------------- | --------------------------------- |
| `externalDir`         | `WIRE_CONFIGURATION_EXTERNAL_DIR` |
| `files`               | `WIRE_CONFIGURATION_FILES`        |
| `gitConfigurationUrl` | `WIRE_CONFIGURATION_REPOSITORY`   |

Example for setting `files` via environment variable:

```sh
export WIRE_CONFIGURATION_FILES="sourceFile:destinationFile;sourceDir:destinationDir;anotherFile:[anotherDir/,destinationDir/]"
```

## Run

```
copy-config
```
