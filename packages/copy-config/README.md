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
  configDirName?: 'config',
  files: {
    sourceFile: 'destinationFile',
    sourceDir: 'destinationDir/',
    anotherFile: ['anotherDir/', 'destinationDir/'],
  },
  forceDelete: false,
  gitAdditionalOptions?: '--depth 1',
  gitConfigurationUrl?: 'https://github.com/wireapp/wire-web-config-default',
  gitConfigurationVersion?: 'v0.7.1',
  ignoreFiles?: ['.DS_Store'],
  noClone?: false;
}
```

Additionally, the following parameters can also be set via environment variables:

| parameter                 | environment variable                    |
| ------------------------- | --------------------------------------- |
| `configDirName`           | `WIRE_CONFIGURATION_EXTERNAL_DIR`       |
| `forceDelete`             | `WIRE_CONFIGURATION_FORCE_DELETE`       |
| `gitAdditionalOptions`    | `WIRE_CONFIGURATION_GIT_OPTIONS`        |
| `gitConfigurationUrl`     | `WIRE_CONFIGURATION_REPOSITORY`         |
| `gitConfigurationVersion` | `WIRE_CONFIGURATION_REPOSITORY_VERSION` |
| `ignoreFiles`             | `WIRE_CONFIGURATION_IGNORE_FILES`       |
| `noClone`                 | `WIRE_CONFIGURATION_NO_CLONE`           |

When setting `ignoreFiles` via environment variables, the filenames should be separated by `,`.

## Run

```
copy-config
```
