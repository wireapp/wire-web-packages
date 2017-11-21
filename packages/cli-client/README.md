# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## CLI Client

Command-line interface for Wire's secure messaging platform.

### Usage

```bash
#!/bin/bash

EMAIL="yourname@email.com"
PASSWORD="secret"
CONVERSATION_ID="594f0908-b9b7-40f9-a06a-45612145e64e"

dist/commonjs/wire-cli.js -e "$EMAIL" -p "$PASSWORD" -c "$CONVERSATION_ID"
```
