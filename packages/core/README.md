# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## Core

Wire for Web's communication core.

### Example

```bash
yarn add @wireapp/core@0.0.23
```

```typescript
import {Account} from '@wireapp/core';
import {PayloadBundle} from '@wireapp/core/dist/commonjs/crypto/';
import {LoginData} from '@wireapp/api-client/dist/commonjs/auth/';

const account: Account = new Account();

const login: LoginData = {
  email: 'name@email.com',
  password: 'secret',
  persist: false,
};

account.on(Account.INCOMING.TEXT_MESSAGE, (data: PayloadBundle) => {
  account.service.conversation.sendTextMessage(data.conversation, data.content);
});

account.listen(login)
.catch((error) => {
  console.error(error.stack);
  return process.exit(1);
});
```
